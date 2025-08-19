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

  // Récupérer le nombre total de pageviews pour tous les sites de l'utilisateur
  let totalPageViews = 0;

  if (userSites && userSites.length > 0) {
    const siteIds = userSites.map((site) => site.id);

    // Récupérer les pageviews du mois en cours
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: sessions } = await adminClient
      .from("sessions")
      .select("page_views")
      .in("site_id", siteIds)
      .gte("created_at", startOfMonth.toISOString());

    totalPageViews =
      sessions?.reduce((sum, session) => sum + (session.page_views || 0), 0) ||
      0;
  }
  // TODO: Fetch actual subscription data from Stripe/database
  const currentPlan = "free"; // This should come from your subscription data
  const currentTier = "10k"; // This should come from your subscription data

  // TODO: Fetch actual goals and custom events count from database
  const goalsCount = 0; // This should come from your database
  const customEventsCount = 0; // This should come from your database

  // Define limits based on plan
  const planLimits = {
    free: {
      pageviews: 10000,
      websites: 1,
      retention: "30 days",
      goals: 0,
      customEvents: 0,
    },
    hobby: {
      "10k": {
        pageviews: 10000,
        websites: 2,
        retention: "3 years",
        goals: 1,
        customEvents: 10,
      },
      "100k": {
        pageviews: 100000,
        websites: 2,
        retention: "3 years",
        goals: 1,
        customEvents: 10,
      },
      "250k": {
        pageviews: 250000,
        websites: 2,
        retention: "3 years",
        goals: 1,
        customEvents: 10,
      },
      "500k": {
        pageviews: 500000,
        websites: 2,
        retention: "3 years",
        goals: 1,
        customEvents: 10,
      },
      "1m": {
        pageviews: 1000000,
        websites: 2,
        retention: "3 years",
        goals: 1,
        customEvents: 10,
      },
      "2m": {
        pageviews: 2000000,
        websites: 2,
        retention: "3 years",
        goals: 1,
        customEvents: 10,
      },
      "5m": {
        pageviews: 5000000,
        websites: 2,
        retention: "3 years",
        goals: 1,
        customEvents: 10,
      },
      "10m": {
        pageviews: 10000000,
        websites: 2,
        retention: "3 years",
        goals: 1,
        customEvents: 10,
      },
    },
    professional: {
      "10k": {
        pageviews: 10000,
        websites: -1,
        retention: "5 years",
        goals: -1,
        customEvents: -1,
      }, // -1 means unlimited
      "100k": {
        pageviews: 100000,
        websites: -1,
        retention: "5 years",
        goals: -1,
        customEvents: -1,
      },
      "250k": {
        pageviews: 250000,
        websites: -1,
        retention: "5 years",
        goals: -1,
        customEvents: -1,
      },
      "500k": {
        pageviews: 500000,
        websites: -1,
        retention: "5 years",
        goals: -1,
        customEvents: -1,
      },
      "1m": {
        pageviews: 1000000,
        websites: -1,
        retention: "5 years",
        goals: -1,
        customEvents: -1,
      },
      "2m": {
        pageviews: 2000000,
        websites: -1,
        retention: "5 years",
        goals: -1,
        customEvents: -1,
      },
      "5m": {
        pageviews: 5000000,
        websites: -1,
        retention: "5 years",
        goals: -1,
        customEvents: -1,
      },
      "10m": {
        pageviews: 10000000,
        websites: -1,
        retention: "5 years",
        goals: -1,
        customEvents: -1,
      },
    },
  };

  const limits =
    currentPlan === "free"
      ? planLimits.free
      : planLimits[currentPlan as "hobby" | "professional"]?.[
          currentTier as keyof typeof planLimits.hobby
        ] || planLimits.free;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                You are currently on the {currentPlan} plan
                {currentPlan !== "free" && ` (${currentTier} events/month)`}
              </CardDescription>
            </div>
            <Badge variant={currentPlan === "free" ? "secondary" : "default"}>
              {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Monthly Events</p>
              <p className="text-2xl font-bold">
                {totalPageViews.toLocaleString()} /{" "}
                {limits.pageviews.toLocaleString()}
              </p>
              <Progress
                value={(totalPageViews / limits.pageviews) * 100}
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Websites</p>
              <p className="text-2xl font-bold">
                {siteCount} / {limits.websites === -1 ? "∞" : limits.websites}
              </p>
              {limits.websites !== -1 && (
                <Progress
                  value={(siteCount / limits.websites) * 100}
                  className="h-2"
                />
              )}
              {limits.websites === -1 && (
                <div className="h-2 bg-primary rounded" />
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Goals</p>
              <p className="text-2xl font-bold">
                {goalsCount} / {limits.goals === -1 ? "∞" : limits.goals}
              </p>
              {limits.goals !== -1 && limits.goals > 0 && (
                <Progress
                  value={(goalsCount / limits.goals) * 100}
                  className="h-2"
                />
              )}
              {(limits.goals === -1 || limits.goals === 0) && (
                <div
                  className={`h-2 rounded ${
                    limits.goals === 0 ? "bg-gray-200" : "bg-primary"
                  }`}
                />
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Custom Events</p>
              <p className="text-2xl font-bold">
                {customEventsCount} /{" "}
                {limits.customEvents === -1 ? "∞" : limits.customEvents}
              </p>
              {limits.customEvents !== -1 && limits.customEvents > 0 && (
                <Progress
                  value={(customEventsCount / limits.customEvents) * 100}
                  className="h-2"
                />
              )}
              {(limits.customEvents === -1 || limits.customEvents === 0) && (
                <div
                  className={`h-2 rounded ${
                    limits.customEvents === 0 ? "bg-gray-200" : "bg-primary"
                  }`}
                />
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
                {currentPlan === "free" ? "Upgrade Plan" : "Change Plan"}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View and download your past invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No billing history available</p>
            <p className="text-sm mt-1">
              Invoices will appear here once you upgrade
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
