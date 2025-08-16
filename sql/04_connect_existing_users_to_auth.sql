-- Connect existing users table to Supabase Authentication
-- This script works with your existing schema

-- 1. Add auth integration columns to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'customer' CHECK (account_type IN ('customer', 'admin'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT FALSE;

-- 2. Create indexes for better performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_account_type ON users(account_type);
CREATE INDEX IF NOT EXISTS idx_users_customer_email ON users(customer_email);

-- 3. Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. Drop any existing policies
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- 5. Create RLS policies for auth integration
-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (
    auth.uid() = auth_user_id OR 
    (auth.jwt() -> 'user_metadata' ->> 'account_type') = 'admin'
  );

-- Policy: Users can update their own profile  
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- Policy: Allow inserts for new user registration
CREATE POLICY "Allow user registration" ON users
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Policy: Admins can do anything
CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'account_type') = 'admin');

-- 6. Create function to automatically create user profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    auth_user_id, 
    customer_email, 
    customer_name,
    account_type,
    email_confirmed,
    status
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'firstName' || ' ' || NEW.raw_user_meta_data->>'lastName', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'customer'),
    NEW.email_confirmed_at IS NOT NULL,
    'in_progress'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Create function to handle email confirmation updates
CREATE OR REPLACE FUNCTION public.handle_user_email_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    UPDATE public.users 
    SET email_confirmed = TRUE 
    WHERE auth_user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create trigger for email confirmation
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_email_confirmed();

-- 10. Optional: Create a test admin user
-- This will create an admin user that you can use for testing
-- Change the email to your email address
-- Uncomment the lines below if you want to create a test admin

-- INSERT INTO auth.users (
--   instance_id,
--   id,
--   aud,
--   role,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   raw_user_meta_data,
--   created_at,
--   updated_at,
--   confirmation_token,
--   recovery_token
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   gen_random_uuid(),
--   'authenticated',
--   'authenticated',
--   'admin@dreamseed.com', -- Change this to your email
--   crypt('AdminPassword123!', gen_salt('bf')), -- Change this password
--   NOW(),
--   '{"account_type": "admin", "full_name": "System Admin"}',
--   NOW(),
--   NOW(),
--   '',
--   ''
-- );