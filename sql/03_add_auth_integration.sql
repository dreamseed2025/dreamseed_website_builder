-- Add Supabase Auth integration to existing users table
-- This connects your existing users table to Supabase authentication

-- 1. Add auth_user_id column to link to Supabase auth.users
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Add account_type for role-based access control  
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'customer' CHECK (account_type IN ('customer', 'admin'));

-- 3. Add email verification status
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT FALSE;

-- 4. Create unique index on auth_user_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);

-- 5. Create index on account_type for role queries
CREATE INDEX IF NOT EXISTS idx_users_account_type ON users(account_type);

-- 6. Update RLS policies for proper auth integration
DROP POLICY IF EXISTS "Allow all operations on users" ON users;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (
    auth.uid() = auth_user_id OR 
    auth.jwt() ->> 'user_metadata' ->> 'account_type' = 'admin'
  );

-- Policy: Users can update their own profile  
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- Policy: Allow inserts for new user registration
CREATE POLICY "Allow user registration" ON users
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Policy: Admins can do anything
CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING (auth.jwt() ->> 'user_metadata' ->> 'account_type' = 'admin');

-- 7. Create function to automatically create user profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    auth_user_id, 
    customer_email, 
    customer_name,
    account_type,
    email_confirmed
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'customer'),
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Create function to handle email confirmation updates
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

-- 10. Create trigger for email confirmation
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_email_confirmed();