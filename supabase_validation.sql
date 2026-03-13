-- Supabase validation script
-- Run this in Supabase SQL editor to verify the schema + RLS + policies are configured as expected.

-- 1) Check profiles.role column + default
SELECT
  c.table_name,
  c.column_name,
  c.data_type,
  c.column_default,
  CASE WHEN c.is_nullable = 'NO' THEN 'NOT NULL' ELSE 'NULLABLE' END AS nullability
FROM information_schema.columns c
WHERE c.table_name = 'profiles' AND c.column_name = 'role';

-- 2) Check the "valid_role" check constraint exists on profiles
SELECT
  tc.constraint_name,
  tc.constraint_type,
  pg_get_constraintdef(con.oid) AS definition
FROM information_schema.table_constraints tc
JOIN pg_constraint con ON con.conname = tc.constraint_name
WHERE tc.table_name = 'profiles'
  AND tc.constraint_type = 'CHECK'
  AND tc.constraint_name = 'valid_role';

-- 3) Check handle_new_user function exists and includes role insertion
SELECT
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS definition,
  (strpos(pg_get_functiondef(p.oid), 'role') > 0) AS contains_role,
  (strpos(pg_get_functiondef(p.oid), 'SECURITY DEFINER') > 0) AS has_security_definer
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname = 'handle_new_user';

-- 4) Ensure RLS is enabled on expected tables
SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled
FROM pg_class c
WHERE c.relname IN ('profiles','addresses','cart_items','wishlist_items','orders','order_items','products');

-- 5) Verify expected policies exist (missing rows indicate missing policies)
WITH expected_policies AS (
  SELECT 'profiles' AS table_name, 'Users can view own profile' AS policy_name UNION ALL
  SELECT 'profiles', 'Users can update own profile' UNION ALL
  SELECT 'addresses', 'Users manage own addresses' UNION ALL
  SELECT 'cart_items', 'Users manage own cart' UNION ALL
  SELECT 'wishlist_items', 'Users manage own wishlist' UNION ALL
  SELECT 'orders', 'Users can view own orders' UNION ALL
  SELECT 'orders', 'Authenticated users can create orders' UNION ALL
  SELECT 'order_items', 'Users can view own order items' UNION ALL
  SELECT 'products', 'Products are publicly readable' UNION ALL
  SELECT 'products', 'Admins can manage products' UNION ALL
  SELECT 'orders', 'Admins can manage all orders' UNION ALL
  SELECT 'order_items', 'Admins can view all order items'
)
SELECT
  e.table_name,
  e.policy_name,
  CASE WHEN p.policyname IS NOT NULL THEN 'FOUND' ELSE 'MISSING' END AS status
FROM expected_policies e
LEFT JOIN pg_policies p
  ON p.tablename = e.table_name
  AND p.policyname = e.policy_name
ORDER BY e.table_name, e.policy_name;

-- 6) Quick sanity check: can we see any policies for products, orders, order_items, profiles?
SELECT * FROM pg_policies WHERE tablename IN ('profiles','products','orders','order_items');
