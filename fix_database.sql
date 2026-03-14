-- ══════════════════════════════════════════════════════════════
-- FIX FOR: "Database error saving new user"
-- Run this in Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════

-- 1. Add missing 'role' column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. Drop the old trigger function and recreate it properly
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- 3. Create improved trigger function
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (
    id, 
    display_name, 
    email, 
    phone, 
    photo_url,
    role
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.email->>0
    ),
    NEW.email,
    NEW.phone,
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    ),
    'user'  -- Default role
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 5. Ensure profiles table has proper defaults
ALTER TABLE profiles 
ALTER COLUMN email_notifications SET DEFAULT true,
ALTER COLUMN sms_alerts SET DEFAULT true,
ALTER COLUMN newsletter SET DEFAULT false;

-- 6. Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON addresses TO authenticated;
GRANT ALL ON cart_items TO authenticated;
GRANT ALL ON wishlist_items TO authenticated;

-- Verification query
DO $$
BEGIN
  RAISE NOTICE 'Schema fix applied successfully!';
  RAISE NOTICE 'Profiles table columns:';
  RAISE NOTICE '%', (
    SELECT string_agg(column_name, ', ')
    FROM information_schema.columns
    WHERE table_name = 'profiles' AND table_schema = 'public'
  );
END $$;
