-- Update subscriptions table to add trial management
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS trial_created_at timestamp with time zone DEFAULT NOW();

-- Create or update the subscription record when a user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create a subscription record with trial status for new users
  INSERT INTO public.subscriptions (
    user_id,
    stripe_customer_id,
    plan_tier,
    status,
    trial_start,
    trial_end,
    created_at
  ) VALUES (
    NEW.id,
    '', -- Will be filled when customer actually subscribes
    'hobby', -- Default to hobby tier for trial
    'trialing',
    NOW(),
    NOW() + INTERVAL '30 days',
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove any existing triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to create subscription on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();