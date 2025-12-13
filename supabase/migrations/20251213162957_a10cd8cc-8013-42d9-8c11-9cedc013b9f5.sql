-- First drop the existing function
DROP FUNCTION IF EXISTS public.validate_coupon(text);

-- Then recreate with new return type
CREATE OR REPLACE FUNCTION public.validate_coupon(coupon_code text)
RETURNS TABLE(valid boolean, discount integer, coupon_id uuid, creator text, coupon_type_val text, discount_pct integer, commission_pct integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    true AS valid,
    cc.discount_amount AS discount,
    cc.id AS coupon_id,
    cc.creator_email AS creator,
    cc.coupon_type AS coupon_type_val,
    cc.discount_percentage AS discount_pct,
    CASE 
      WHEN cc.coupon_type = 'admin_referral' THEN 10
      ELSE 0
    END AS commission_pct
  FROM coupon_codes cc
  WHERE cc.code = UPPER(coupon_code)
    AND cc.is_active = true
    AND (cc.expiry_date IS NULL OR cc.expiry_date > now())
    AND (cc.usage_limit IS NULL OR cc.times_used < cc.usage_limit);
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, NULL::UUID, NULL::TEXT, NULL::TEXT, 0, 0;
  END IF;
END;
$function$;

-- Function to increment coupon usage count
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(p_coupon_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE coupon_codes
  SET times_used = COALESCE(times_used, 0) + 1
  WHERE id = p_coupon_id;
END;
$function$;

-- Update handle_new_user function with new owner and collaborators
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  -- If this is the owner email, assign owner role
  IF NEW.email = 'vortexstudio.real@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'owner')
    ON CONFLICT DO NOTHING;
  -- If these are collaborator emails, assign collaborator role  
  ELSIF NEW.email IN ('muzzyothmam@gmail.com', 'saeedabdulbasit933@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'collaborator')
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;