-- Simplify subscription system - remove trial complexity
-- Users start with "free" plan, not "trialing"

-- First, check if there's an existing constraint on plan_tier and modify it
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'subscriptions_plan_tier_check' 
        AND table_name = 'subscriptions'
    ) THEN
        ALTER TABLE public.subscriptions DROP CONSTRAINT subscriptions_plan_tier_check;
    END IF;
    
    -- Add new constraint that includes 'free'
    ALTER TABLE public.subscriptions 
    ADD CONSTRAINT subscriptions_plan_tier_check 
    CHECK (plan_tier IN ('free', 'hobby', 'pro', 'enterprise'));
END $$;

-- Now update existing trialing subscriptions to free
UPDATE public.subscriptions 
SET 
  plan_tier = 'free',
  status = 'active',
  events_limit = 10000, -- Free plan limit
  billing_period = 'monthly'
WHERE status = 'trialing';

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create simplified function for new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
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
    '', -- Will be filled when customer actually subscribes to paid plan
    'free', -- Start with free plan
    'active', -- Active from day 1
    10000, -- Free plan events limit
    'monthly',
    NOW(), -- Trial start = account creation (for 30-day limit tracking)
    NOW() + INTERVAL '30 days', -- After 30 days, features get limited
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add comment to clarify the new logic
COMMENT ON TABLE public.subscriptions IS 'Subscription system: Users start with free plan (active status). trial_end is used to limit features after 30 days if no paid subscription. When user subscribes to paid plan, status remains active but plan_tier changes.';

-- Add index for efficient queries on trial_end for feature limiting
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end_status 
ON public.subscriptions(trial_end, status) 
WHERE plan_tier = 'free';