import { createClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/admin";

export interface SubscriptionInfo {
  planTier: "free" | "hobby" | "pro" | "enterprise";
  status: string;
  eventsLimit: number;
  daysLeft: number;
  hasLimitations: boolean;
  hasPaidPlan: boolean;
}

/**
 * Check if user is within the 30-day free period
 * Uses created_at + 30 days instead of storing trial_end
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isWithinFreePeriod(subscription: any): boolean {
  if (!subscription) return false;
  if (subscription.plan_tier !== "free") return true; // Paid plans are always active

  const freeEndDate = new Date(subscription.created_at);
  freeEndDate.setDate(freeEndDate.getDate() + 30); // +30 days from account creation
  const now = new Date();

  return now < freeEndDate;
}

/**
 * Get number of free days left
 * Calculates dynamically from created_at + 30 days
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getFreeDaysLeft(subscription: any): number {
  if (!subscription) return 0;
  if (subscription.plan_tier !== "free") return Infinity; // Paid plans don't expire

  const freeEndDate = new Date(subscription.created_at);
  freeEndDate.setDate(freeEndDate.getDate() + 30); // +30 days from account creation
  const now = new Date();
  const daysLeft = Math.ceil(
    (freeEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return Math.max(0, daysLeft);
}

// Legacy function names for backward compatibility
export const isWithinFreeTrial = isWithinFreePeriod;
export const getTrialDaysLeft = getFreeDaysLeft;

/**
 * Check user's subscription status and limitations
 * New simplified logic using computed trial end from created_at
 */
export async function checkUserSubscription(
  userId: string
): Promise<SubscriptionInfo | null> {
  const adminClient = createAdminClient();

  const { data: subscription, error } = await adminClient
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !subscription) {
    console.error("Error fetching subscription:", error);
    return null;
  }

  // Check if user has paid subscription
  const hasPaidPlan =
    subscription.plan_tier !== "free" &&
    subscription.stripe_subscription_id &&
    subscription.stripe_subscription_id !== "";

  if (hasPaidPlan) {
    // User has paid plan - no limitations
    return {
      planTier: subscription.plan_tier,
      status: subscription.status,
      eventsLimit: subscription.events_limit || 0,
      daysLeft: 0,
      hasLimitations: false,
      hasPaidPlan: true,
    };
  }

  // User is on free plan - calculate days left from created_at + 30 days
  const daysLeft = getFreeDaysLeft(subscription);

  return {
    planTier: "free",
    status: subscription.status,
    eventsLimit: subscription.events_limit || 10000,
    daysLeft,
    hasLimitations: daysLeft === 0, // Limited after 30 days
    hasPaidPlan: false,
  };
}

/**
 * Check if user can access a premium feature
 */
export async function canAccessFeature(
  userId: string
  // feature: "funnels" | "goals" | "exports"
): Promise<boolean> {
  const subscriptionInfo = await checkUserSubscription(userId);

  if (!subscriptionInfo) {
    return false;
  }

  // If user has paid plan, they can access everything
  if (subscriptionInfo.hasPaidPlan) {
    return true;
  }

  // If user is on free plan but still within 30 days, they can access features
  if (!subscriptionInfo.hasLimitations) {
    return true;
  }

  // After 30 days on free plan, block premium features
  return false;
}

/**
 * Client-side version using browser client
 */
export async function checkUserSubscriptionClient(): Promise<SubscriptionInfo | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return checkUserSubscription(user.id);
}
