import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN_LIMITS } from "@/lib/stripe-config";
import { BillingHistory } from "@/components/billing-history";
import { isWithinFreePeriod, getFreeDaysLeft } from "@/lib/subscription-utils";
import Link from "next/link";

export default async function BillingPage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Récupérer les sites de l'utilisateur
  const { data: userSites } = await adminClient
    .from("sites")
    .select("id")
    .eq("user_id", user?.id || "");

  const siteCount = userSites?.length || 0;

  // Récupérer le nombre total d'événements pour tous les sites de l'utilisateur
  let totalEvents = 0;

  if (userSites && userSites.length > 0) {
    const siteIds = userSites.map((site) => site.id);
    console.log("User sites IDs:", siteIds);

    // Récupérer les dates du mois en cours
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    console.log("Start of month:", startOfMonth.toISOString());

    // 1. Compter les sessions (1 session = 1 événement minimum)
    const { data: sessions, error: sessionsError } = await adminClient
      .from("sessions")
      .select("id")
      .in("site_id", siteIds)
      .gte("created_at", startOfMonth.toISOString());

    console.log("Sessions data:", sessions);
    console.log("Sessions error:", sessionsError);

    const totalPageViews = sessions?.length || 0;

    // 2. Compter les custom events triggers (essayons plusieurs noms de tables possibles)
    let totalCustomEvents = 0;
    
    // Essayer d'abord custom_event_triggers
    const { data: eventTriggers, error: eventsError } = await adminClient
      .from("custom_event_triggers")
      .select("id")
      .in("site_id", siteIds)
      .gte("triggered_at", startOfMonth.toISOString());

    if (eventsError) {
      console.log("Trying alternative table names...");
      
      // Essayer event_triggers
      const { data: altTriggers, error: altError } = await adminClient
        .from("event_triggers")
        .select("id")
        .in("site_id", siteIds)
        .gte("created_at", startOfMonth.toISOString());
        
      if (altError) {
        // Essayer events
        const { data: events, error: evError } = await adminClient
          .from("events")
          .select("id")
          .in("site_id", siteIds)
          .gte("created_at", startOfMonth.toISOString());
          
        totalCustomEvents = events?.length || 0;
        console.log("Events table data:", events);
        console.log("Events table error:", evError);
      } else {
        totalCustomEvents = altTriggers?.length || 0;
        console.log("Event triggers alt data:", altTriggers);
      }
    } else {
      totalCustomEvents = eventTriggers?.length || 0;
      console.log("Event triggers data:", eventTriggers);
    }

    console.log("Total pageviews:", totalPageViews);
    console.log("Total custom events:", totalCustomEvents);

    // Total events = pageviews + custom events
    totalEvents = totalPageViews + totalCustomEvents;
    console.log("Total events:", totalEvents);
  }
  // Récupérer les données de subscription réelles
  const { data: subscription } = await adminClient
    .from("subscriptions")
    .select("plan_tier, events_limit, status, created_at, stripe_subscription_id, billing_period")
    .eq("user_id", user?.id || "")
    .single();

  // Déterminer le plan actuel avec la nouvelle logique simplifiée
  let currentPlan = "free";
  let currentTier = "10k";
  let isInFreePeriod = false;
  let daysLeft = 0;

  if (subscription) {
    // Check if user has paid subscription
    const hasPaidPlan = subscription.plan_tier !== "free" && 
                       subscription.stripe_subscription_id && 
                       subscription.stripe_subscription_id !== "";

    if (hasPaidPlan) {
      // User has paid plan
      currentPlan = subscription.plan_tier;
      
      // Convert numeric events_limit to string format (10000 -> "10k", 100000 -> "100k", etc.)
      const eventsNum = subscription.events_limit;
      if (eventsNum >= 1000000) {
        currentTier = `${eventsNum / 1000000}m`;
      } else if (eventsNum >= 1000) {
        currentTier = `${eventsNum / 1000}k`;
      } else {
        currentTier = "10k"; // Default fallback
      }
    } else {
      // User is on free plan - use helper functions
      isInFreePeriod = isWithinFreePeriod(subscription);
      daysLeft = getFreeDaysLeft(subscription);
      currentPlan = "free";
      currentTier = "10k"; // Free plan limit
    }
  }



  const limits =
    currentPlan === "free"
      ? PLAN_LIMITS.free
      : currentPlan === "trial"
      ? PLAN_LIMITS.trial
      : PLAN_LIMITS[currentPlan as "hobby" | "professional"]?.[
          currentTier as keyof typeof PLAN_LIMITS.hobby
        ] || PLAN_LIMITS.free;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                {currentPlan === "free" && isInFreePeriod ? (
                  <>
                    You are currently on the <strong>free plan</strong>
                    <span> ({daysLeft} days remaining)</span>
                  </>
                ) : (
                  <>
                    You are currently on the {currentPlan} plan
                    {currentPlan !== "free" && ` (${currentTier} events/month)`}
                    {subscription?.billing_period && currentPlan !== "free" && (
                      <span> - {subscription.billing_period}</span>
                    )}
                  </>
                )}
              </CardDescription>
            </div>
            <Badge
              variant={
                currentPlan === "free"
                  ? isInFreePeriod ? "outline" : "secondary"
                  : "default"
              }
            >
              {currentPlan === "free" && isInFreePeriod 
                ? `Free (${daysLeft} days left)` 
                : currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Monthly Events</p>
              <p className="text-2xl font-bold">
                {totalEvents.toLocaleString()} /{" "}
                {limits.pageviews.toLocaleString()}
              </p>
              <Progress
                value={(totalEvents / limits.pageviews) * 100}
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Websites</p>
              <p className="text-2xl font-bold">
                {currentPlan === "professional" ? (
                  siteCount
                ) : (
                  <>
                    {siteCount} / {limits.websites === -1 ? "∞" : limits.websites}
                  </>
                )}
              </p>
              {currentPlan !== "professional" && limits.websites !== -1 && (
                <Progress
                  value={(siteCount / limits.websites) * 100}
                  className="h-2"
                />
              )}
              {currentPlan === "professional" && (
                <div className="text-xs text-muted-foreground">
                  Unlimited websites allowed
                </div>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Data Retention</p>
              <p className="text-2xl font-bold">{limits.retention}</p>
              <div className="h-2 bg-primary rounded" />
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button asChild className="w-full md:w-auto">
              <Link href="/settings/billing/plans">
                {currentPlan === "free"
                  ? isInFreePeriod ? "Choose Your Plan" : "Upgrade Plan"
                  : "Change Plan"}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <BillingHistory />
    </div>
  );
}
