-- Fix the subscription signup constraint violation issue
-- 1. Update existing empty string stripe_customer_id values to NULL
UPDATE subscriptions 
SET stripe_customer_id = NULL 
WHERE stripe_customer_id = '';

-- 2. Fix the handle_new_user function to use NULL instead of empty string
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a subscription record with free plan for new users
  INSERT INTO public.subscriptions (
    user_id,
    stripe_customer_id,
    plan_tier,
    status,
    events_limit,
    billing_period,
    trial_start,
    trial_end,
    created_at
  ) VALUES (
    NEW.id,
    NULL, -- Use NULL instead of empty string to avoid unique constraint violation
    'free', -- Start with free plan
    'active', -- Active from day 1
    '10000', -- Free plan events limit
    'monthly',
    NOW(), -- Trial start = account creation (for 30-day limit tracking)
    NOW() + INTERVAL '30 days', -- After 30 days, features get limited
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;