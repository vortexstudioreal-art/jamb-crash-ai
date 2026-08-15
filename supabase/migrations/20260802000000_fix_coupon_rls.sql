-- Fix RLS for coupon_codes and coupon_usage
-- These tables were created without RLS policies, causing 401 errors
-- when collaborators access the Settings page

-- Enable RLS (should already be enabled, but ensure it)
ALTER TABLE coupon_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read coupon_codes
CREATE POLICY "Authenticated users can view coupon codes"
  ON coupon_codes FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to read coupon_usage
CREATE POLICY "Authenticated users can view coupon usage"
  ON coupon_usage FOR SELECT
  TO authenticated
  USING (true);

-- Allow owners to manage coupon_codes
CREATE POLICY "Owners can manage coupon codes"
  ON coupon_codes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (auth.jwt() ->> 'email')
      AND admin_users.role = 'owner'
    )
  );

-- Allow owners to manage coupon_usage
CREATE POLICY "Owners can manage coupon usage"
  ON coupon_usage FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (auth.jwt() ->> 'email')
      AND admin_users.role = 'owner'
    )
  );
