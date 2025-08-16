-- Temporarily disable RLS to test user creation
-- This will help us isolate the issue

-- 1. Temporarily disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Or alternatively, create a very permissive policy for testing
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Allow all for testing" ON users;
-- CREATE POLICY "Allow all for testing" ON users FOR ALL USING (true) WITH CHECK (true);

-- 3. Check if the trigger function exists
SELECT proname, prosrc FROM pg_proc WHERE proname = 'handle_new_user';

-- 4. Check if the trigger exists
SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'on_auth_user_created';