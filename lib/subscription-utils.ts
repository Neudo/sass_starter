import { createClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN_LIMITS } from "./stripe-config";

export interface SubscriptionInfo {
  planTier: "hobby" | "professional";
  status: string;
  eventsLimit: number;
  websitesLimit: number;
  dataRetention: string;
  hasLimitations: boolean;
  hasPaidPlan: boolean;
}

/**
 * Check if user has a paid plan
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hasPaidPlan(subscription: any): boolean {
  if (!subscription) return false;
  return (
    subscription.plan_tier === "professional" &&
    subscription.stripe_subscription_id &&
    subscription.stripe_subscription_id !== ""
  );
}

/**
 * Get plan limits based on plan tier
 */
function getPlanLimits(planTier: "hobby" | "professional", eventsTier?: string) {
  if (planTier === "hobby") {
    return {
      pageviews: PLAN_LIMITS.hobby.pageviews,
      websites: PLAN_LIMITS.hobby.websites,
      retention: PLAN_LIMITS.hobby.retention,
      customEvents: PLAN_LIMITS.hobby.customEvents,
    };
  } else {
    // Professional plan - get limits based on events tier
    const tier = eventsTier as keyof typeof PLAN_LIMITS.professional || "10k";
    const tierLimits = PLAN_LIMITS.professional[tier];
    return {
      pageviews: tierLimits?.pageviews || 10000,
      websites: tierLimits?.websites || -1, // -1 = unlimited
      retention: tierLimits?.retention || "5 years",
      customEvents: tierLimits?.customEvents || -1,
    };
  }
}

/**
 * Check user's subscription status and limitations
 * Simplified logic: Hobby = free with limits, Professional = paid
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

  const isPaid = hasPaidPlan(subscription);
  const planTier = isPaid ? "professional" : "hobby";
  const limits = getPlanLimits(planTier, subscription.events_tier);

  return {
    planTier,
    status: subscription.status || "active",
    eventsLimit: limits.pageviews,
    websitesLimit: limits.websites,
    dataRetention: limits.retention,
    hasLimitations: planTier === "hobby", // Hobby always has limitations
    hasPaidPlan: isPaid,
  };
}

/**
 * Check if user can access a premium feature
 * Hobby plan: limited features, Professional plan: all features
 */
export async function canAccessFeature(
  userId: string,
  feature: "funnels" | "goals" | "unlimited_websites" | "long_retention" | "unlimited_events" | "imports" | "teams"
): Promise<boolean> {
  const subscriptionInfo = await checkUserSubscription(userId);

  if (!subscriptionInfo) {
    return false;
  }

  // Professional plan: access to everything
  if (subscriptionInfo.hasPaidPlan) {
    return true;
  }

  // Hobby plan: limited access to premium features
  switch (feature) {
    case "goals":
      return true; // Basic goals allowed on Hobby
    case "funnels":
    case "unlimited_websites":
    case "long_retention":
    case "unlimited_events":
    case "imports":
    case "teams":
      return false; // These require Professional plan
    default:
      return true;
  }
}

/**
 * Check if user can add a new website (based on website limit)
 */
export async function canAddWebsite(userId: string, currentWebsiteCount: number): Promise<boolean> {
  const subscriptionInfo = await checkUserSubscription(userId);

  if (!subscriptionInfo) {
    return false;
  }

  // Professional plan: unlimited websites
  if (subscriptionInfo.hasPaidPlan || subscriptionInfo.websitesLimit === -1) {
    return true;
  }

  // Hobby plan: check against limit
  return currentWebsiteCount < subscriptionInfo.websitesLimit;
}

/**
 * Check if user has reached their monthly events limit
 */
export async function hasReachedEventsLimit(userId: string, currentEventsThisMonth: number): Promise<boolean> {
  const subscriptionInfo = await checkUserSubscription(userId);

  if (!subscriptionInfo) {
    return true; // Block if no subscription info
  }

  // Professional plan: no events limit (or very high limit)
  if (subscriptionInfo.hasPaidPlan) {
    return false;
  }

  // Hobby plan: check against monthly limit
  return currentEventsThisMonth >= subscriptionInfo.eventsLimit;
}

/**
 * Get user's current plan limits
 */
export async function getUserLimits(userId: string): Promise<{
  eventsLimit: number;
  websitesLimit: number;
  dataRetention: string;
  planTier: "hobby" | "professional";
} | null> {
  const subscriptionInfo = await checkUserSubscription(userId);

  if (!subscriptionInfo) {
    return null;
  }

  return {
    eventsLimit: subscriptionInfo.eventsLimit,
    websitesLimit: subscriptionInfo.websitesLimit,
    dataRetention: subscriptionInfo.dataRetention,
    planTier: subscriptionInfo.planTier,
  };
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
