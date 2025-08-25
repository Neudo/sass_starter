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
import {
  Plus,
  TrendingUp,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Lock,
} from "lucide-react";
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
  const [expandedFunnels, setExpandedFunnels] = useState<Set<string>>(
    new Set()
  );

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

  const toggleFunnelExpansion = (funnelId: string) => {
    const newExpanded = new Set(expandedFunnels);
    if (newExpanded.has(funnelId)) {
      newExpanded.delete(funnelId);
    } else {
      newExpanded.add(funnelId);
    }
    setExpandedFunnels(newExpanded);
  };

  const renderFunnelStep = (step: FunnelStep) => {
    return (
      <div
        key={step.id}
        className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg"
      >
        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
          {step.step_number}
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm">{step.name}</div>
          <div className="text-xs text-muted-foreground">
            {step.url_pattern}
          </div>
        </div>
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
            funnels.map((funnel) => {
              const isExpanded = expandedFunnels.has(funnel.id);
              return (
                <div key={funnel.id} className="border rounded-lg">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20 transition-colors"
                    onClick={() => toggleFunnelExpansion(funnel.id)}
                  >
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
                      <Badge
                        variant={funnel.is_active ? "default" : "secondary"}
                      >
                        {funnel.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {funnel.steps.length} step
                        {funnel.steps.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFunnelExpansion(funnel.id);
                        }}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          href={`/dashboard/${domain}/settings/funnels/${funnel.id}/edit`}
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFunnel(funnel.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t px-4 pb-4">
                      <div className="space-y-2 mt-4">
                        {funnel.steps.length === 0 ? (
                          <div className="text-center py-6 text-muted-foreground">
                            No steps configured for this funnel
                          </div>
                        ) : (
                          funnel.steps.map((step) => renderFunnelStep(step))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
