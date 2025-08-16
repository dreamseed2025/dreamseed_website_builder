-- Fix RLS policies for user registration
-- The issue is that our trigger function can't insert because of RLS policies

-- 1. Update the trigger function to use SECURITY DEFINER and bypass RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert with elevated privileges to bypass RLS
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Alternative: Update the insert policy to allow system inserts
-- This allows inserts when there's no auth context (for triggers)
DROP POLICY IF EXISTS "Allow user registration" ON users;

CREATE POLICY "Allow user registration" ON users
  FOR INSERT WITH CHECK (
    auth.uid() = auth_user_id OR 
    auth.uid() IS NULL  -- Allow system/trigger inserts
  );

-- 3. Grant necessary permissions to the function
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL ON TABLE public.users TO postgres;

-- 4. Alternative approach: Temporarily disable RLS for inserts from triggers
-- We can create a specific policy for system operations
CREATE POLICY "Allow system user creation" ON users
  FOR INSERT WITH CHECK (
    auth_user_id IS NOT NULL AND  -- Must have auth_user_id
    (auth.uid() = auth_user_id OR auth.uid() IS NULL)  -- Either user match or system insert
  );