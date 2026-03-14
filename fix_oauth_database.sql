-- ══════════════════════════════════════════════════════════════
-- SECOND SOUL — Database Fix for OAuth Login Issue
-- Run this in: https://supabase.com/dashboard/project/hmteesodbdvdursgdfox/sql/new
-- ══════════════════════════════════════════════════════════════

-- Step 1: Add role column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';
  END IF;
END $$;

-- Step 2: Drop old trigger function
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Step 3: Create new trigger function that handles all auth providers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    display_name,
    email,
    phone,
    photo_url,
    role,
    email_notifications,
    sms_alerts,
    newsletter
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    NULL,
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    ),
    'user',
    true,
    true,
    false
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Verify the fix
SELECT 'Fix applied successfully!' as status, 
       COUNT(*) as profile_count 
FROM profiles;

-- Check if role column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'role';
