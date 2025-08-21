"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Edit, Trash2, ArrowDown, Lock } from "lucide-react";
import Link from "next/link";

interface FunnelStep {
  id: string;
  step_number: number;
  name: string;
  url_pattern: string;
  match_type: string;
  visitors?: number;
  conversion_rate?: number;
}

interface Funnel {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  steps: FunnelStep[];
  total_visitors?: number;
  conversion_rate?: number;
}

interface FunnelsClientProps {
  siteId: string;
  domain: string;
  hasFunnelAccess: boolean;
  currentPlan: string;
}

export function FunnelsClient({
  siteId,
  domain,
  hasFunnelAccess,
  currentPlan,
}: FunnelsClientProps) {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasFunnelAccess) {
      fetchFunnels();
    } else {
      setLoading(false);
    }
  }, [hasFunnelAccess]);

  const fetchFunnels = async () => {
    try {
      const response = await fetch(`/api/funnels?siteId=${siteId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch funnels");
      }
      const data = await response.json();
      setFunnels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const deleteFunnel = async (funnelId: string) => {
    if (!confirm("Are you sure you want to delete this funnel?")) {
      return;
    }

    try {
      const response = await fetch(`/api/funnels/${funnelId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete funnel");
      }

      setFunnels(funnels.filter((f) => f.id !== funnelId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete funnel");
    }
  };

  const renderFunnelStep = (
    step: FunnelStep,
    index: number,
    isLast: boolean
  ) => {
    const isCompleted = step.visitors && step.visitors > 0;
    const bgOpacity = 50 - index * 10; // Decreasing opacity for each step

    return (
      <div key={step.id}>
        <div
          className={`flex items-center justify-between p-4 rounded-lg ${
            index === 0
              ? "bg-muted/50"
              : isLast && isCompleted
              ? "bg-green-50 border border-green-200"
              : `bg-muted/${Math.max(bgOpacity, 20)}`
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isLast && isCompleted
                  ? "bg-green-600 text-white"
                  : index === 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted-foreground text-white"
              }`}
            >
              {step.step_number}
            </div>
            <div>
              <div className="font-medium">{step.name}</div>
              <div className="text-sm text-muted-foreground">
                {step.url_pattern}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">
              {step.visitors?.toLocaleString() || "0"} visitors
            </div>
            <div
              className={`text-sm ${
                isLast && isCompleted
                  ? "text-green-600"
                  : "text-muted-foreground"
              }`}
            >
              {step.conversion_rate
                ? `${step.conversion_rate.toFixed(1)}%`
                : "0%"}
            </div>
          </div>
        </div>
        {!isLast && (
          <div className="flex justify-center py-2">
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
    );
  };

  if (!hasFunnelAccess) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Funnels
              </CardTitle>
              <CardDescription>
                Track user journeys through multi-step processes like checkouts
                or signups
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                Funnels Not Available
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Funnel tracking is available in Professional and Enterprise
                plans. Upgrade to start analyzing your conversion funnels.
              </p>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Current plan:{" "}
                  <span className="font-medium capitalize">{currentPlan}</span>
                </div>
                <Button asChild>
                  <Link href="/settings/billing/plans">
                    Upgrade to Professional
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div>
            <CardTitle>Funnels</CardTitle>
            <CardDescription>
              Track user journeys through multi-step processes like checkouts or
              signups
            </CardDescription>
          </div>
          <Button className="gap-2" asChild>
            <Link href={`/dashboard/${domain}/settings/funnels/create`}>
              <Plus className="h-4 w-4" />
              Create Funnel
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {funnels.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Funnels Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first funnel to start tracking user conversion
                journeys.
              </p>
              <Button asChild>
                <Link href={`/dashboard/${domain}/settings/funnels/create`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Funnel
                </Link>
              </Button>
            </div>
          ) : (
            funnels.map((funnel) => (
              <div key={funnel.id} className="border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">{funnel.name}</div>
                      {funnel.description && (
                        <div className="text-sm text-muted-foreground">
                          {funnel.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {funnel.conversion_rate && (
                      <Badge variant="secondary">
                        {funnel.conversion_rate.toFixed(1)}% conversion rate
                      </Badge>
                    )}
                    <Button variant="outline" size="icon" asChild>
                      <Link
                        href={`/dashboard/${domain}/settings/funnels/${funnel.id}/edit`}
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteFunnel(funnel.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {funnel.steps.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      No steps configured for this funnel
                    </div>
                  ) : (
                    funnel.steps.map((step, index) =>
                      renderFunnelStep(
                        step,
                        index,
                        index === funnel.steps.length - 1
                      )
                    )
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
