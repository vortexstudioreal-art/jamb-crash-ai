-- B2B Plan Type Migration: basic/pro/premium → ace_30/ace_90/scholar_365
--
-- This migration:
-- 1. Migrates existing data from old plan types to new
-- 2. Updates constraints on B2B tables
-- 3. Updates seeded pricing tiers
-- 4. Updates generate_activation_pins (new prefixes and access days)
-- 5. Updates redeem_activation_pin (maps B2B license → consumer plan)
--
-- Consumer access (payments table, check_user_access) is UNCHANGED.
-- payments.package still uses basic/pro/premium.

-- ==========================================
-- 1. MIGRATE EXISTING DATA
-- ==========================================

-- Drop old constraints first so we can update data
ALTER TABLE b2b_bulk_orders
  DROP CONSTRAINT IF EXISTS b2b_bulk_orders_plan_type_check;
ALTER TABLE b2b_activation_pins
  DROP CONSTRAINT IF EXISTS b2b_activation_pins_plan_type_check;
ALTER TABLE b2b_pin_bulk_prices
  DROP CONSTRAINT IF EXISTS bulk_price_plan_check;

UPDATE b2b_bulk_orders SET plan_type = 'ace_30' WHERE plan_type = 'basic';
UPDATE b2b_bulk_orders SET plan_type = 'ace_90' WHERE plan_type = 'pro';
UPDATE b2b_bulk_orders SET plan_type = 'scholar_365' WHERE plan_type = 'premium';

UPDATE b2b_activation_pins SET plan_type = 'ace_30' WHERE plan_type = 'basic';
UPDATE b2b_activation_pins SET plan_type = 'ace_90' WHERE plan_type = 'pro';
UPDATE b2b_activation_pins SET plan_type = 'scholar_365' WHERE plan_type = 'premium';

UPDATE b2b_pin_bulk_prices SET plan_type = 'ace_30' WHERE plan_type = 'basic';
UPDATE b2b_pin_bulk_prices SET plan_type = 'ace_90' WHERE plan_type = 'pro';
UPDATE b2b_pin_bulk_prices SET plan_type = 'scholar_365' WHERE plan_type = 'premium';

-- ==========================================
-- 2. ADD NEW CONSTRAINTS
-- ==========================================

-- b2b_bulk_orders
ALTER TABLE b2b_bulk_orders
  ADD CONSTRAINT b2b_bulk_orders_plan_type_check
  CHECK (plan_type IN ('ace_30', 'ace_90', 'scholar_365'));

-- b2b_activation_pins
ALTER TABLE b2b_activation_pins
  ADD CONSTRAINT b2b_activation_pins_plan_type_check
  CHECK (plan_type IN ('ace_30', 'ace_90', 'scholar_365'));

-- b2b_pin_bulk_prices
ALTER TABLE b2b_pin_bulk_prices
  ADD CONSTRAINT bulk_price_plan_check
  CHECK (plan_type IN ('ace_30', 'ace_90', 'scholar_365'));

-- ==========================================
-- 3. UPDATE SEED PRICING TIERS
-- ==========================================

DELETE FROM b2b_pin_bulk_prices;

INSERT INTO b2b_pin_bulk_prices (plan_type, min_quantity, discount_percent, unit_price) VALUES
  ('ace_30',      1,   0,  5000),
  ('ace_30',     10,  10,  4500),
  ('ace_30',     50,  20,  4000),
  ('ace_30',    100,  30,  3500),
  ('ace_90',      1,   0, 10000),
  ('ace_90',     10,  10,  9000),
  ('ace_90',     50,  20,  8000),
  ('ace_90',    100,  30,  7000),
  ('scholar_365',  1,   0, 15000),
  ('scholar_365', 10,  10, 13500),
  ('scholar_365', 50,  20, 12000),
  ('scholar_365',100,  30, 10500);

-- ==========================================
-- 4. UPDATE generate_activation_pins
-- ==========================================

CREATE OR REPLACE FUNCTION public.generate_activation_pins(
  p_order_id UUID
)
RETURNS TABLE(pin_code TEXT, plan_type TEXT, id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_plan TEXT;
  v_quantity INT;
  v_buyer_id UUID;
  v_prefix TEXT;
  v_pin TEXT;
  v_counter INT := 0;
  v_access_days INT;
  v_new_pin_id UUID;
BEGIN
  SELECT bo.plan_type, bo.quantity, bo.buyer_id
  INTO v_plan, v_quantity, v_buyer_id
  FROM b2b_bulk_orders bo
  WHERE bo.id = p_order_id AND bo.status IN ('paid', 'generating');

  IF v_plan IS NULL THEN
    RAISE EXCEPTION 'Order not found or not in valid state';
  END IF;

  CASE v_plan
    WHEN 'ace_30' THEN
      v_prefix := 'JCA';
      v_access_days := 30;
    WHEN 'ace_90' THEN
      v_prefix := 'JCA';
      v_access_days := 90;
    WHEN 'scholar_365' THEN
      v_prefix := 'JCS';
      v_access_days := 365;
    ELSE
      RAISE EXCEPTION 'Unknown plan type: %', v_plan;
  END CASE;

  WHILE v_counter < v_quantity LOOP
    v_pin := v_prefix || '-' ||
             upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 4)) || '-' ||
             lpad((floor(random() * 9999) + 1)::text, 4, '0') || '-' ||
             lpad((floor(random() * 9999) + 1)::text, 4, '0');

    IF NOT EXISTS (SELECT 1 FROM b2b_activation_pins WHERE pin_code = v_pin) THEN
      INSERT INTO b2b_activation_pins (pin_code, order_id, buyer_id, plan_type)
      VALUES (v_pin, p_order_id, v_buyer_id, v_plan)
      RETURNING b2b_activation_pins.id INTO v_new_pin_id;

      pin_code := v_pin;
      plan_type := v_plan;
      id := v_new_pin_id;
      RETURN NEXT;

      v_counter := v_counter + 1;
    END IF;
  END LOOP;

  UPDATE b2b_bulk_orders
  SET status = 'ready', updated_at = now()
  WHERE id = p_order_id;
END;
$$;

-- ==========================================
-- 6. Helper: increment buyer purchased count
-- ==========================================

CREATE OR REPLACE FUNCTION public.increment_buyer_purchased(
  p_buyer_id UUID,
  p_quantity INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE b2b_buyers
  SET total_purchased = total_purchased + p_quantity,
      updated_at = now()
  WHERE id = p_buyer_id;
END;
$$;

-- ==========================================
-- 5. UPDATE redeem_activation_pin
-- ==========================================

CREATE OR REPLACE FUNCTION public.redeem_activation_pin(
  p_pin_code TEXT,
  p_user_email TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  plan_type TEXT,
  access_expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_pin RECORD;
  v_access_days INT;
  v_expires_at TIMESTAMPTZ;
  v_pin_upper TEXT;
  v_consumer_plan TEXT;
BEGIN
  v_pin_upper := upper(trim(p_pin_code));

  SELECT ap.id, ap.pin_code, ap.status, ap.plan_type, ap.expires_at, ap.buyer_id, ap.order_id
  INTO v_pin
  FROM b2b_activation_pins ap
  WHERE ap.pin_code = v_pin_upper;

  IF v_pin IS NULL THEN
    INSERT INTO b2b_pin_redemption_log (pin_code, attempted_by_email, was_successful, failure_reason, ip_address, user_agent)
    VALUES (v_pin_upper, p_user_email, false, 'invalid_pin', p_ip_address, p_user_agent);
    RETURN QUERY SELECT false, 'Invalid PIN. Please check and try again.'::TEXT, NULL::TEXT, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  IF v_pin.status = 'redeemed' THEN
    INSERT INTO b2b_pin_redemption_log (pin_code, attempted_by_email, was_successful, failure_reason, ip_address, user_agent)
    VALUES (v_pin_upper, p_user_email, false, 'already_redeemed', p_ip_address, p_user_agent);
    RETURN QUERY SELECT false, 'This PIN has already been used.'::TEXT, NULL::TEXT, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  IF v_pin.status = 'revoked' THEN
    INSERT INTO b2b_pin_redemption_log (pin_code, attempted_by_email, was_successful, failure_reason, ip_address, user_agent)
    VALUES (v_pin_upper, p_user_email, false, 'revoked', p_ip_address, p_user_agent);
    RETURN QUERY SELECT false, 'This PIN has been revoked.'::TEXT, NULL::TEXT, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  IF v_pin.expires_at IS NOT NULL AND v_pin.expires_at < now() THEN
    INSERT INTO b2b_pin_redemption_log (pin_code, attempted_by_email, was_successful, failure_reason, ip_address, user_agent)
    VALUES (v_pin_upper, p_user_email, false, 'expired', p_ip_address, p_user_agent);
    RETURN QUERY SELECT false, 'This PIN has expired.'::TEXT, NULL::TEXT, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- Map B2B license to consumer plan and access duration
  CASE v_pin.plan_type
    WHEN 'ace_30' THEN
      v_consumer_plan := 'basic';
      v_access_days := 30;
    WHEN 'ace_90' THEN
      v_consumer_plan := 'pro';
      v_access_days := 90;
    WHEN 'scholar_365' THEN
      v_consumer_plan := 'premium';
      v_access_days := 365;
    ELSE
      v_consumer_plan := 'basic';
      v_access_days := 30;
  END CASE;

  v_expires_at := now() + (v_access_days || ' days')::INTERVAL;

  UPDATE b2b_activation_pins
  SET
    status = 'redeemed',
    redeemed_by_email = p_user_email,
    redeemed_at = now(),
    access_expires_at = v_expires_at,
    updated_at = now()
  WHERE id = v_pin.id;

  -- Write consumer plan to payments table (NOT the B2B plan type)
  INSERT INTO payments (email, package, amount, currency, status, access_expires_at)
  VALUES (p_user_email, v_consumer_plan, 0, 'NGN', 'success', v_expires_at);

  INSERT INTO b2b_pin_redemption_log (pin_code, attempted_by_email, was_successful, access_expires_at, ip_address, user_agent)
  VALUES (v_pin_upper, p_user_email, true, v_expires_at, p_ip_address, p_user_agent);

  UPDATE b2b_buyers
  SET total_redeemed = total_redeemed + 1, updated_at = now()
  WHERE id = v_pin.buyer_id;

  UPDATE b2b_bulk_orders
  SET status = 'completed', updated_at = now()
  WHERE id = v_pin.order_id
    AND NOT EXISTS (
      SELECT 1 FROM b2b_activation_pins
      WHERE order_id = v_pin.order_id AND status = 'available'
    );

  RETURN QUERY SELECT true, 'PIN redeemed successfully!'::TEXT, v_pin.plan_type, v_expires_at;
END;
$$;
