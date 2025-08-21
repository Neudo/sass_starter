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
import { Plus, Activity, Edit, Trash2, Lock } from "lucide-react";
import Link from "next/link";

interface CustomEvent {
  id: string;
  name: string;
  description: string;
  event_type: "click" | "form_submit" | "page_view" | "scroll" | "custom";
  event_selector?: string;
  trigger_config?: {
    scroll_percentage?: number;
    custom_event_name?: string;
  };
  is_active: boolean;
  created_at: string;
  total_triggers?: number;
}

interface CustomEventsClientProps {
  siteId: string;
  domain: string;
  hasCustomEventsAccess: boolean;
  currentPlan: string;
}

export function CustomEventsClient({
  siteId,
  domain,
  hasCustomEventsAccess,
  currentPlan,
}: CustomEventsClientProps) {
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasCustomEventsAccess) {
      fetchCustomEvents();
    } else {
      setLoading(false);
    }
  }, [hasCustomEventsAccess]);

  const fetchCustomEvents = async () => {
    try {
      const response = await fetch(`/api/custom-events?siteId=${siteId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch custom events");
      }
      const data = await response.json();
      setCustomEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this custom event?")) {
      return;
    }

    try {
      const response = await fetch(`/api/custom-events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete custom event");
      }

      setCustomEvents(customEvents.filter((e) => e.id !== eventId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete custom event"
      );
    }
  };

  const toggleEventStatus = async (eventId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/custom-events/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update custom event");
      }

      setCustomEvents(
        customEvents.map((e) =>
          e.id === eventId ? { ...e, is_active: !isActive } : e
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update custom event"
      );
    }
  };

  if (!hasCustomEventsAccess) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Custom Events
              </CardTitle>
              <CardDescription>
                Track custom user interactions like button clicks, form
                submissions, and more
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                Custom Events Not Available
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Custom event tracking is available starting with the Hobby plan.
                Upgrade to start tracking custom interactions on your website.
              </p>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Current plan:{" "}
                  <span className="font-medium capitalize">{currentPlan}</span>
                </div>
                <Button asChild>
                  <Link href="/settings/billing/plans">
                    Upgrade to Hobby Plan
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
            <CardTitle>Custom Events</CardTitle>
            <CardDescription>
              Track custom user interactions like button clicks, form
              submissions, and more
            </CardDescription>
          </div>
          <Button className="gap-2" asChild>
            <Link href={`/dashboard/${domain}/settings/events/create`}>
              <Plus className="h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {customEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Custom Events Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first custom event to start tracking user
                interactions beyond page views.
              </p>
              <Button asChild>
                <Link href={`/dashboard/${domain}/settings/events/create`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Event
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {customEvents.map((event) => (
                <div key={event.id} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {event.name}
                        {!event.is_active && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      {event.description && (
                        <div className="text-sm text-muted-foreground">
                          {event.description}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {event.event_type.replace("_", " ")}
                      </Badge>
                      {event.total_triggers !== undefined && (
                        <Badge variant="secondary">
                          {event.total_triggers} triggers
                        </Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toggleEventStatus(event.id, event.is_active)
                        }
                      >
                        {event.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <Link
                          href={`/dashboard/${domain}/settings/events/${event.id}/edit`}
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteCustomEvent(event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
