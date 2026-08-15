-- ==========================================
-- B2B Activation Pin System
-- Migration: 20260806000000_b2b_activation_pins
-- ==========================================

-- 1. ENUM TYPES
-- ==========================================

DO $$ BEGIN
  CREATE TYPE public.b2b_buyer_type AS ENUM (
    'school',
    'teacher',
    'reseller'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.pin_status AS ENUM (
    'available',
    'redeemed',
    'expired',
    'revoked'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.bulk_order_status AS ENUM (
    'pending_payment',
    'paid',
    'generating',
    'ready',
    'partially_redeemed',
    'completed',
    'cancelled',
    'refunded'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. TABLES
-- ==========================================

-- 2.1 B2B Buyers
CREATE TABLE IF NOT EXISTS public.b2b_buyers (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id    UUID NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  full_name       TEXT NOT NULL,
  organization    TEXT,
  buyer_type      public.b2b_buyer_type NOT NULL DEFAULT 'reseller',
  phone           TEXT,
  is_active       BOOLEAN DEFAULT true NOT NULL,
  total_purchased INT DEFAULT 0 NOT NULL,
  total_redeemed  INT DEFAULT 0 NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_b2b_buyers_email ON public.b2b_buyers (email);
CREATE INDEX IF NOT EXISTS idx_b2b_buyers_auth_user_id ON public.b2b_buyers (auth_user_id);

-- 2.2 Bulk Orders
CREATE TABLE IF NOT EXISTS public.b2b_bulk_orders (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id           UUID NOT NULL REFERENCES public.b2b_buyers(id) ON DELETE CASCADE,
  plan_type          TEXT NOT NULL,
  quantity           INT NOT NULL,
  unit_price         INT NOT NULL,
  discount_percent   INT DEFAULT 0 NOT NULL,
  total_amount       INT NOT NULL,
  status             public.bulk_order_status DEFAULT 'pending_payment' NOT NULL,
  paystack_reference TEXT,
  notes              TEXT,
  created_at         TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at         TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT bulk_order_quantity_check CHECK (quantity > 0),
  CONSTRAINT bulk_order_plan_check CHECK (plan_type IN ('basic', 'pro', 'premium'))
);

CREATE INDEX IF NOT EXISTS idx_bulk_orders_buyer_id ON public.b2b_bulk_orders (buyer_id);
CREATE INDEX IF NOT EXISTS idx_bulk_orders_status ON public.b2b_bulk_orders (status);
CREATE INDEX IF NOT EXISTS idx_bulk_orders_paystack_reference ON public.b2b_bulk_orders (paystack_reference);

-- 2.3 Activation Pins
CREATE TABLE IF NOT EXISTS public.b2b_activation_pins (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pin_code         TEXT NOT NULL UNIQUE,
  order_id         UUID NOT NULL REFERENCES public.b2b_bulk_orders(id) ON DELETE CASCADE,
  buyer_id         UUID NOT NULL REFERENCES public.b2b_buyers(id) ON DELETE CASCADE,
  plan_type        TEXT NOT NULL,
  status           public.pin_status DEFAULT 'available' NOT NULL,
  redeemed_by_email TEXT,
  redeemed_at      TIMESTAMPTZ,
  access_expires_at TIMESTAMPTZ,
  expires_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT pin_plan_check CHECK (plan_type IN ('basic', 'pro', 'premium'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pins_pin_code ON public.b2b_activation_pins (pin_code);
CREATE INDEX IF NOT EXISTS idx_pins_order_id ON public.b2b_activation_pins (order_id);
CREATE INDEX IF NOT EXISTS idx_pins_buyer_id ON public.b2b_activation_pins (buyer_id);
CREATE INDEX IF NOT EXISTS idx_pins_status ON public.b2b_activation_pins (status);
CREATE INDEX IF NOT EXISTS idx_pins_redeemed_by ON public.b2b_activation_pins (redeemed_by_email);

-- 2.4 Redemption Log (audit trail)
CREATE TABLE IF NOT EXISTS public.b2b_pin_redemption_log (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pin_code           TEXT NOT NULL,
  attempted_by_email TEXT NOT NULL,
  was_successful     BOOLEAN NOT NULL,
  failure_reason     TEXT,
  access_expires_at  TIMESTAMPTZ,
  ip_address         TEXT,
  user_agent         TEXT,
  created_at         TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pin_redemption_log_pin_code ON public.b2b_pin_redemption_log (pin_code);
CREATE INDEX IF NOT EXISTS idx_pin_redemption_log_email ON public.b2b_pin_redemption_log (attempted_by_email);

-- 2.5 Bulk Pricing Tiers (configurable by admin)
CREATE TABLE IF NOT EXISTS public.b2b_pin_bulk_prices (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_type        TEXT NOT NULL,
  min_quantity     INT NOT NULL,
  discount_percent INT NOT NULL DEFAULT 0,
  unit_price       INT NOT NULL,
  is_active        BOOLEAN DEFAULT true NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT bulk_price_plan_check CHECK (plan_type IN ('basic', 'pro', 'premium')),
  CONSTRAINT bulk_price_unique UNIQUE (plan_type, min_quantity)
);

-- 3. SEED DEFAULT PRICING TIERS
-- ==========================================

INSERT INTO public.b2b_pin_bulk_prices (plan_type, min_quantity, discount_percent, unit_price)
SELECT * FROM (VALUES
  ('basic',    1,   0,  5000),
  ('basic',   10,  10,  4500),
  ('basic',   50,  20,  4000),
  ('basic',  100,  30,  3500),
  ('pro',      1,   0, 10000),
  ('pro',     10,  10,  9000),
  ('pro',     50,  20,  8000),
  ('pro',    100,  30,  7000),
  ('premium',  1,   0, 15000),
  ('premium', 10,  10, 13500),
  ('premium', 50,  20, 12000),
  ('premium',100,  30, 10500)
) AS v(plan_type, min_quantity, discount_percent, unit_price)
WHERE NOT EXISTS (
  SELECT 1 FROM public.b2b_pin_bulk_prices
);

-- 4. DATABASE FUNCTIONS
-- ==========================================

-- 4.1 Calculate bulk discount (server-side pricing)
CREATE OR REPLACE FUNCTION public.calculate_bulk_discount(
  p_plan_type TEXT,
  p_quantity INT
)
RETURNS TABLE(
  unit_price INT,
  discount_percent INT,
  total_amount INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_best_tier RECORD;
BEGIN
  SELECT bp.unit_price, bp.discount_percent
  INTO v_best_tier
  FROM b2b_pin_bulk_prices bp
  WHERE bp.plan_type = p_plan_type
    AND bp.is_active = true
    AND p_quantity >= bp.min_quantity
  ORDER BY bp.min_quantity DESC
  LIMIT 1;

  IF v_best_tier IS NULL THEN
    RAISE EXCEPTION 'No pricing tier found for plan %, quantity %', p_plan_type, p_quantity;
  END IF;

  unit_price := v_best_tier.unit_price;
  discount_percent := v_best_tier.discount_percent;
  total_amount := v_best_tier.unit_price * p_quantity;

  RETURN NEXT;
END;
$$;

-- 4.2 Generate activation pins for an order
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
    WHEN 'basic' THEN
      v_prefix := 'JCB';
      v_access_days := 365;
    WHEN 'pro' THEN
      v_prefix := 'JCP';
      v_access_days := 365;
    WHEN 'premium' THEN
      v_prefix := 'JCS';
      v_access_days := 36500;
  END CASE;

  WHILE v_counter < v_quantity LOOP
    v_pin := v_prefix || '-' ||
             upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 4)) || '-' ||
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

-- 4.3 Redeem an activation pin
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
    INSERT INTO b2b_pin_redemption_log (pin_code, attempted_by_email, was_successful, failure_reason, ip_address, p_user_agent)
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

  CASE v_pin.plan_type
    WHEN 'basic' THEN v_access_days := 365;
    WHEN 'pro' THEN v_access_days := 365;
    WHEN 'premium' THEN v_access_days := 36500;
    ELSE v_access_days := 365;
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

  INSERT INTO payments (email, package, amount, currency, status, access_expires_at)
  VALUES (p_user_email, v_pin.plan_type, 0, 'NGN', 'success', v_expires_at);

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

-- 4.4 Get reseller dashboard stats
CREATE OR REPLACE FUNCTION public.get_reseller_dashboard_stats(
  p_buyer_email TEXT
)
RETURNS TABLE(
  total_pins_purchased BIGINT,
  total_pins_redeemed BIGINT,
  total_pins_available BIGINT,
  total_spent BIGINT,
  active_orders BIGINT,
  recent_redemptions JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_buyer_id UUID;
BEGIN
  SELECT id INTO v_buyer_id FROM b2b_buyers WHERE email = p_buyer_email;

  IF v_buyer_id IS NULL THEN
    RETURN QUERY SELECT 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, '[]'::JSONB;
    RETURN;
  END IF;

  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'redeemed'),
    COUNT(*) FILTER (WHERE status = 'available'),
    COALESCE((SELECT SUM(bo.total_amount) FROM b2b_bulk_orders bo WHERE bo.buyer_id = v_buyer_id), 0),
    (SELECT COUNT(*) FROM b2b_bulk_orders WHERE buyer_id = v_buyer_id AND status IN ('paid', 'generating', 'ready')),
    COALESCE(
      (SELECT jsonb_agg(row_to_json(r))
       FROM (
         SELECT ap.pin_code, ap.plan_type, ap.redeemed_by_email, ap.redeemed_at, ap.status
         FROM b2b_activation_pins ap
         WHERE ap.buyer_id = v_buyer_id
         ORDER BY ap.created_at DESC
         LIMIT 10
       ) r
      ), '[]'::JSONB
    )
  INTO
    total_pins_purchased,
    total_pins_redeemed,
    total_pins_available,
    total_spent,
    active_orders,
    recent_redemptions
  FROM b2b_activation_pins
  WHERE buyer_id = v_buyer_id;

  RETURN NEXT;
END;
$$;

-- 4.5 Get admin B2B overview
CREATE OR REPLACE FUNCTION public.get_admin_b2b_overview()
RETURNS TABLE(
  total_buyers BIGINT,
  total_pins_generated BIGINT,
  total_pins_redeemed BIGINT,
  total_revenue BIGINT,
  pins_by_plan JSONB,
  recent_orders JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  SELECT
    (SELECT COUNT(*) FROM b2b_buyers WHERE is_active = true),
    (SELECT COUNT(*) FROM b2b_activation_pins),
    (SELECT COUNT(*) FROM b2b_activation_pins WHERE status = 'redeemed'),
    (SELECT COALESCE(SUM(total_amount), 0) FROM b2b_bulk_orders WHERE status IN ('paid', 'ready', 'partially_redeemed', 'completed')),
    COALESCE(
      (SELECT jsonb_object_agg(plan_type, cnt)
       FROM (SELECT plan_type, COUNT(*) as cnt FROM b2b_activation_pins GROUP BY plan_type) sub
      ), '{}'::JSONB
    ),
    COALESCE(
      (SELECT jsonb_agg(row_to_json(r))
       FROM (
         SELECT bo.id, bo.plan_type, bo.quantity, bo.total_amount, bo.status, bo.created_at,
                bb.full_name, bb.organization, bb.buyer_type
         FROM b2b_bulk_orders bo
         JOIN b2b_buyers bb ON bb.id = bo.buyer_id
         ORDER BY bo.created_at DESC
         LIMIT 20
       ) r
      ), '[]'::JSONB
    )
  INTO
    total_buyers,
    total_pins_generated,
    total_pins_redeemed,
    total_revenue,
    pins_by_plan,
    recent_orders;

  RETURN NEXT;
END;
$$;

-- 5. RLS POLICIES
-- ==========================================

-- 5.1 b2b_buyers
ALTER TABLE public.b2b_buyers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "B2B buyers can view own profile"
    ON public.b2b_buyers FOR SELECT
    TO authenticated
    USING (email = public.get_auth_email());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "B2B buyers can update own profile"
    ON public.b2b_buyers FOR UPDATE
    TO authenticated
    USING (email = public.get_auth_email())
    WITH CHECK (email = public.get_auth_email());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can create buyer profile"
    ON public.b2b_buyers FOR INSERT
    TO authenticated
    WITH CHECK (email = public.get_auth_email());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can view all buyers"
    ON public.b2b_buyers FOR SELECT
    TO authenticated
    USING (public.is_admin_or_owner(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage all buyers"
    ON public.b2b_buyers FOR ALL
    TO authenticated
    USING (public.is_admin_or_owner(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5.2 b2b_bulk_orders
ALTER TABLE public.b2b_bulk_orders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "B2B buyers can view own orders"
    ON public.b2b_bulk_orders FOR SELECT
    TO authenticated
    USING (buyer_id IN (SELECT id FROM b2b_buyers WHERE email = public.get_auth_email()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "B2B buyers can create orders"
    ON public.b2b_bulk_orders FOR INSERT
    TO authenticated
    WITH CHECK (buyer_id IN (SELECT id FROM b2b_buyers WHERE email = public.get_auth_email()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can view all orders"
    ON public.b2b_bulk_orders FOR SELECT
    TO authenticated
    USING (public.is_admin_or_owner(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage all orders"
    ON public.b2b_bulk_orders FOR ALL
    TO authenticated
    USING (public.is_admin_or_owner(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5.3 b2b_activation_pins
ALTER TABLE public.b2b_activation_pins ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "B2B buyers can view own pins"
    ON public.b2b_activation_pins FOR SELECT
    TO authenticated
    USING (buyer_id IN (SELECT id FROM b2b_buyers WHERE email = public.get_auth_email()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can view all pins"
    ON public.b2b_activation_pins FOR SELECT
    TO authenticated
    USING (public.is_admin_or_owner(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage all pins"
    ON public.b2b_activation_pins FOR ALL
    TO authenticated
    USING (public.is_admin_or_owner(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5.4 b2b_pin_redemption_log
ALTER TABLE public.b2b_pin_redemption_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "B2B buyers can view own redemption logs"
    ON public.b2b_pin_redemption_log FOR SELECT
    TO authenticated
    USING (pin_code IN (
      SELECT pin_code FROM b2b_activation_pins
      WHERE buyer_id IN (SELECT id FROM b2b_buyers WHERE email = public.get_auth_email())
    ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can view all redemption logs"
    ON public.b2b_pin_redemption_log FOR SELECT
    TO authenticated
    USING (public.is_admin_or_owner(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5.5 b2b_pin_bulk_prices
ALTER TABLE public.b2b_pin_bulk_prices ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view bulk prices"
    ON public.b2b_pin_bulk_prices FOR SELECT
    TO authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Owner can manage bulk prices"
    ON public.b2b_pin_bulk_prices FOR ALL
    TO authenticated
    USING (public.is_owner(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 6. UPDATED AT TRIGGERS
-- ==========================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER update_b2b_buyers_updated_at
    BEFORE UPDATE ON public.b2b_buyers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_bulk_orders_updated_at
    BEFORE UPDATE ON public.b2b_bulk_orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_pins_updated_at
    BEFORE UPDATE ON public.b2b_activation_pins
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_bulk_prices_updated_at
    BEFORE UPDATE ON public.b2b_pin_bulk_prices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
