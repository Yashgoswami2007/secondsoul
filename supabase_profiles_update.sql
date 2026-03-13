-- Add role column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';

-- Add constraint to ensure role is one of the allowed values
ALTER TABLE profiles ADD CONSTRAINT valid_role CHECK (role IN ('admin', 'customer'));

-- Update the handle_new_user function to set default role
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, email, phone, photo_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.email,
    NEW.phone,
    NEW.raw_user_meta_data->>'avatar_url',
    'customer'  -- Default role is customer
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;