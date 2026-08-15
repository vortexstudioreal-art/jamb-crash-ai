-- Fix premium/ultimate naming mismatch between frontend and database.
-- 
-- Problem: Frontend uses 'premium' everywhere but the DB constraint
-- only allows 'basic', 'pro', 'ultimate'. The translation only exists
-- in PaymentModal.tsx, creating a risk for any other code path.
--
-- Fix: Add 'premium' as an allowed value in the constraint, and
-- update existing 'ultimate' records to 'premium' going forward.

-- First drop the existing constraint
ALTER TABLE payments 
DROP CONSTRAINT IF EXISTS payments_package_check;

-- Re-add with 'premium' as an allowed value
ALTER TABLE payments 
ADD CONSTRAINT payments_package_check 
CHECK (package = ANY (ARRAY['basic', 'pro', 'ultimate', 'premium']));
