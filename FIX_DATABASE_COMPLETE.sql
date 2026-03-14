-- ══════════════════════════════════════════════════════════════
-- COMPREHENSIVE FIX FOR GOOGLE OAUTH LOGIN ISSUE
-- Run this ENTIRE script in: https://supabase.com/dashboard/project/hmteesodbdvdursgdfox/sql/new
-- This will: 1) Add missing role column, 2) Fix trigger, 3) Verify everything
-- ══════════════════════════════════════════════════════════════

-- STEP 1: Add role column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'customer';
    RAISE NOTICE 'Added role column to profiles table';
  ELSE
    RAISE NOTICE 'Role column already exists in profiles table';
  END IF;
END $$;

-- STEP 2: Add check constraint for role values (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'valid_role'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT valid_role CHECK (role IN ('admin', 'customer'));
    RAISE NOTICE 'Added role constraint';
  ELSE
    RAISE NOTICE 'Role constraint already exists';
  END IF;
END $$;

-- STEP 3: Drop old trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- STEP 4: Create improved trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER -- Important: allows function to bypass RLS
LANGUAGE plpgsql AS $$
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
    newsletter,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'name', ''),
      NULLIF(split_part(NEW.email, '@', 1), 'undefined'),
      'User'
    ),
    NEW.email,
    COALESCE(NEW.phone, NULL),
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
      NULLIF(NEW.raw_user_meta_data->>'picture', ''),
      NULL
    ),
    'customer',  -- Default role
    true,        -- email_notifications
    true,        -- sms_alerts
    false,       -- newsletter
    NOW(),       -- created_at
    NOW()        -- updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- STEP 5: Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- STEP 6: Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- STEP 7: Ensure basic policies exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- STEP 8: Verification - Run these checks
DO $$
DECLARE
  v_count INTEGER;
  v_has_role BOOLEAN;
  v_has_trigger BOOLEAN;
BEGIN
  -- Check if role column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role'
  ) INTO v_has_role;
  
  -- Check if trigger exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created'
  ) INTO v_has_trigger;
  
  -- Count profiles
  SELECT COUNT(*) INTO v_count FROM public.profiles;
  
  RAISE NOTICE '=== VERIFICATION RESULTS ===';
  RAISE NOTICE '✓ Role column exists: %', v_has_role;
  RAISE NOTICE '✓ Trigger exists: %', v_has_trigger;
  RAISE NOTICE '✓ Total profiles: %', v_count;
  RAISE NOTICE '';
  RAISE NOTICE 'If all checks passed, the fix is complete!';
  RAISE NOTICE 'Try logging in with Google again.';
END $$;

-- STEP 9: Show current trigger function definition
SELECT 
  proname AS function_name,
  pg_get_functiondef(oid) AS function_definition
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- STEP 10: Show all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
