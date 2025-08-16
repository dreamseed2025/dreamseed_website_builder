-- Add individual VAPI assistant support
-- This enables personalized assistants for premium customers

-- 1. Add assistant_id column to store individual VAPI assistant IDs
ALTER TABLE users ADD COLUMN IF NOT EXISTS individual_assistant_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS assistant_created_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS assistant_type TEXT DEFAULT 'shared' CHECK (assistant_type IN ('shared', 'individual', 'admin'));

-- 2. Create index for assistant queries
CREATE INDEX IF NOT EXISTS idx_users_individual_assistant_id ON users(individual_assistant_id);
CREATE INDEX IF NOT EXISTS idx_users_assistant_type ON users(assistant_type);

-- 3. Create function to determine assistant eligibility
CREATE OR REPLACE FUNCTION public.get_assistant_type(user_auth_id UUID)
RETURNS TEXT
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_record RECORD;
  assistant_type_result TEXT;
BEGIN
  SELECT account_type, payment_status, subscription_type
  INTO user_record
  FROM users 
  WHERE auth_user_id = user_auth_id;
  
  IF NOT FOUND THEN
    RETURN 'shared';
  END IF;
  
  -- Admin users get admin assistant
  IF user_record.account_type = 'admin' THEN
    RETURN 'admin';
  END IF;
  
  -- Premium/Enterprise paid customers get individual assistants
  IF user_record.payment_status = 'paid' AND 
     user_record.subscription_type IN ('premium', 'enterprise') THEN
    RETURN 'individual';
  END IF;
  
  -- Everyone else gets shared assistant
  RETURN 'shared';
END;
$$;

-- 4. Create function to manage individual assistant creation
CREATE OR REPLACE FUNCTION public.assign_assistant_type(
  user_auth_id UUID,
  force_update BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(
  assistant_type TEXT,
  individual_assistant_id TEXT,
  needs_creation BOOLEAN
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  current_type TEXT;
  required_type TEXT;
  current_assistant_id TEXT;
  needs_creation_result BOOLEAN := FALSE;
BEGIN
  -- Get current and required assistant types
  SELECT u.assistant_type, u.individual_assistant_id
  INTO current_type, current_assistant_id
  FROM users u
  WHERE u.auth_user_id = user_auth_id;
  
  required_type := public.get_assistant_type(user_auth_id);
  
  -- Check if we need to create or update assistant
  IF required_type = 'individual' AND 
     (current_assistant_id IS NULL OR current_type != 'individual' OR force_update) THEN
    needs_creation_result := TRUE;
  END IF;
  
  -- Update assistant type if changed
  IF current_type != required_type OR force_update THEN
    UPDATE users 
    SET assistant_type = required_type,
        updated_at = NOW()
    WHERE auth_user_id = user_auth_id;
  END IF;
  
  RETURN QUERY
  SELECT 
    required_type as assistant_type,
    current_assistant_id as individual_assistant_id,
    needs_creation_result as needs_creation;
END;
$$;

-- 5. Create function to save individual assistant ID
CREATE OR REPLACE FUNCTION public.save_individual_assistant(
  user_auth_id UUID,
  assistant_id TEXT,
  assistant_name TEXT DEFAULT NULL
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE users 
  SET individual_assistant_id = assistant_id,
      assistant_created_at = NOW(),
      assistant_type = 'individual',
      updated_at = NOW()
  WHERE auth_user_id = user_auth_id;
  
  RETURN FOUND;
END;
$$;

-- 6. Create assistant configuration view
CREATE OR REPLACE VIEW assistant_assignments AS
SELECT 
  u.id,
  u.customer_name,
  u.customer_email,
  u.account_type,
  u.payment_status,
  u.subscription_type,
  u.assistant_type,
  u.individual_assistant_id,
  u.assistant_created_at,
  CASE 
    WHEN u.assistant_type = 'admin' THEN 'admin-assistant-id'
    WHEN u.assistant_type = 'individual' THEN COALESCE(u.individual_assistant_id, 'needs-creation')
    ELSE 'af397e88-c286-416f-9f74-e7665401bdb7'  -- Shared assistant ID
  END as effective_assistant_id,
  public.get_assistant_type(u.auth_user_id) as required_assistant_type
FROM users u
WHERE u.account_type IS NOT NULL
ORDER BY u.created_at DESC;

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_assistant_type TO service_role;
GRANT EXECUTE ON FUNCTION public.assign_assistant_type TO service_role;
GRANT EXECUTE ON FUNCTION public.save_individual_assistant TO service_role;
GRANT SELECT ON assistant_assignments TO service_role;

-- 8. Add helpful comments
COMMENT ON COLUMN users.individual_assistant_id IS 'VAPI assistant ID for personalized premium customers';
COMMENT ON COLUMN users.assistant_type IS 'Type of assistant: shared (default), individual (premium), admin (staff)';
COMMENT ON FUNCTION public.get_assistant_type IS 'Determines what type of assistant a user should have based on their account';
COMMENT ON FUNCTION public.assign_assistant_type IS 'Assigns appropriate assistant type and checks if creation is needed';
COMMENT ON VIEW assistant_assignments IS 'Shows all users and their assistant assignments for management';