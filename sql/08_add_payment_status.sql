-- Add payment status and billing information to users table
-- This integrates with your existing payment tracking system

-- 1. Add payment-related columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid' 
  CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'failed', 'refunded', 'trial'));

ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_type TEXT 
  CHECK (subscription_type IN ('basic', 'premium', 'enterprise', 'one-time'));

ALTER TABLE users ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_payment_attempt TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_notes TEXT;

-- 2. Create indexes for payment queries
CREATE INDEX IF NOT EXISTS idx_users_payment_status ON users(payment_status);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_expires_at ON users(subscription_expires_at);

-- 3. Update the trigger function to handle payment defaults
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create user profile with payment defaults
  BEGIN
    INSERT INTO public.users (
      auth_user_id,
      customer_email,
      customer_name,
      account_type,
      status,
      payment_status,
      subscription_type
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      COALESCE(NEW.raw_user_meta_data->>'account_type', 'customer'),
      'in_progress',
      CASE 
        WHEN NEW.raw_user_meta_data->>'account_type' = 'admin' THEN 'paid'
        ELSE 'unpaid'
      END,
      COALESCE(NEW.raw_user_meta_data->>'subscription_type', 'basic')
    );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Failed to create user profile: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

-- 4. Create payment status update function
CREATE OR REPLACE FUNCTION public.update_payment_status(
  user_auth_id UUID,
  new_payment_status TEXT,
  paid_amount DECIMAL DEFAULT NULL,
  payment_method_used TEXT DEFAULT NULL,
  stripe_customer TEXT DEFAULT NULL,
  subscription_type_used TEXT DEFAULT 'basic',
  notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.users 
  SET 
    payment_status = new_payment_status,
    amount_paid = COALESCE(paid_amount, amount_paid),
    payment_method = COALESCE(payment_method_used, payment_method),
    payment_date = CASE WHEN new_payment_status = 'paid' THEN NOW() ELSE payment_date END,
    stripe_customer_id = COALESCE(stripe_customer, stripe_customer_id),
    subscription_type = subscription_type_used,
    subscription_expires_at = CASE 
      WHEN new_payment_status = 'paid' AND subscription_type_used != 'one-time' 
      THEN NOW() + INTERVAL '1 year'
      ELSE subscription_expires_at 
    END,
    last_payment_attempt = NOW(),
    payment_notes = COALESCE(notes, payment_notes),
    updated_at = NOW()
  WHERE auth_user_id = user_auth_id;
  
  RETURN FOUND;
END;
$$;

-- 5. Create function to check payment status
CREATE OR REPLACE FUNCTION public.check_payment_status(user_auth_id UUID)
RETURNS TABLE(
  payment_status TEXT,
  subscription_type TEXT,
  amount_paid DECIMAL,
  payment_date TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  days_remaining INTEGER
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.payment_status,
    u.subscription_type,
    u.amount_paid,
    u.payment_date,
    u.subscription_expires_at,
    CASE 
      WHEN u.subscription_expires_at IS NOT NULL 
      THEN EXTRACT(DAY FROM (u.subscription_expires_at - NOW()))::INTEGER
      ELSE NULL
    END as days_remaining
  FROM users u
  WHERE u.auth_user_id = user_auth_id;
END;
$$;

-- 6. Create view for payment dashboard
CREATE OR REPLACE VIEW payment_dashboard AS
SELECT 
  customer_name,
  customer_email,
  payment_status,
  subscription_type,
  amount_paid,
  payment_date,
  subscription_expires_at,
  CASE 
    WHEN subscription_expires_at IS NOT NULL AND subscription_expires_at < NOW() 
    THEN true 
    ELSE false 
  END as is_expired,
  CASE 
    WHEN subscription_expires_at IS NOT NULL 
    THEN EXTRACT(DAY FROM (subscription_expires_at - NOW()))::INTEGER
    ELSE NULL
  END as days_remaining,
  created_at,
  status as formation_status
FROM users
WHERE account_type = 'customer'
ORDER BY created_at DESC;

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION public.update_payment_status TO service_role;
GRANT EXECUTE ON FUNCTION public.check_payment_status TO service_role;
GRANT SELECT ON payment_dashboard TO service_role;