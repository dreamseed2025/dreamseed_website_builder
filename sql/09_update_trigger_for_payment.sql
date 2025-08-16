-- Update trigger function to handle payment plan information
-- This includes the payment plan data in user profile creation

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create user profile with payment plan information
  BEGIN
    INSERT INTO public.users (
      auth_user_id,
      customer_email,
      customer_name,
      customer_phone,
      account_type,
      status,
      payment_status,
      subscription_type,
      business_name,
      business_type,
      state_of_operation
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      NEW.raw_user_meta_data->>'phone',
      COALESCE(NEW.raw_user_meta_data->>'account_type', 'customer'),
      'in_progress',
      CASE 
        WHEN NEW.raw_user_meta_data->>'account_type' = 'admin' THEN 'paid'
        ELSE 'unpaid'
      END,
      COALESCE(NEW.raw_user_meta_data->>'subscription_type', 'basic'),
      NEW.raw_user_meta_data->>'business_name',
      NEW.raw_user_meta_data->>'business_type',
      NEW.raw_user_meta_data->>'state_of_operation'
    );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Failed to create user profile: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;