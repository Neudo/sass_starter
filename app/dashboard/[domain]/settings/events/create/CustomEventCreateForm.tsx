"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  MousePointer,
  FileText,
  Eye,
  ScrollText,
  Activity,
} from "lucide-react";
import Link from "next/link";

interface TriggerConfig {
  page_pattern?: string;
  scroll_percentage?: number;
  custom_event_name?: string;
}

interface CustomEventCreateFormProps {
  siteId: string;
  domain: string;
}

export function CustomEventCreateForm({
  siteId,
  domain,
}: CustomEventCreateFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    event_type: "",
    event_selector: "",
    trigger_config: {} as TriggerConfig,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const eventTypes = [
    {
      value: "click",
      label: "Click Event",
      description: "Track clicks on buttons, links, or any element",
      icon: <MousePointer className="h-4 w-4" />,
    },
    {
      value: "form_submit",
      label: "Form Submission",
      description: "Track form submissions",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      value: "page_view",
      label: "Page View",
      description: "Track views of specific pages",
      icon: <Eye className="h-4 w-4" />,
    },
    {
      value: "scroll",
      label: "Scroll Event",
      description: "Track when users scroll to a certain point",
      icon: <ScrollText className="h-4 w-4" />,
    },
    {
      value: "custom",
      label: "Custom Event",
      description: "Custom JavaScript-triggered event",
      icon: <Activity className="h-4 w-4" />,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/custom-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          site_id: siteId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create custom event");
      }

      router.push(`/dashboard/${domain}/settings/events`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderEventTypeSpecificFields = () => {
    switch (formData.event_type) {
      case "click":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="event_selector">CSS Selector *</Label>
              <Input
                id="event_selector"
                placeholder="e.g., .buy-button, #submit-btn, [data-event='purchase']"
                value={formData.event_selector}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    event_selector: e.target.value,
                  }))
                }
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Use CSS selectors to target the element(s) you want to track
              </p>
            </div>
          </div>
        );

      case "form_submit":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="event_selector">Form Selector</Label>
              <Input
                id="event_selector"
                placeholder="e.g., #contact-form, .newsletter-form"
                value={formData.event_selector}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    event_selector: e.target.value,
                  }))
                }
              />
              <p className="text-sm text-muted-foreground mt-1">
                Leave empty to track all form submissions, or specify a form
                selector
              </p>
            </div>
          </div>
        );

      case "page_view":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="page_pattern">Page URL Pattern</Label>
              <Input
                id="page_pattern"
                placeholder="e.g., /thank-you, /product/*, /blog/post-*"
                value={formData.trigger_config.page_pattern || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    trigger_config: {
                      ...prev.trigger_config,
                      page_pattern: e.target.value,
                    },
                  }))
                }
              />
              <p className="text-sm text-muted-foreground mt-1">
                Use * as wildcard. Leave empty to track all page views.
              </p>
            </div>
          </div>
        );

      case "scroll":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="scroll_percentage">Scroll Percentage</Label>
              <Input
                id="scroll_percentage"
                type="number"
                min="1"
                max="100"
                placeholder="50"
                value={formData.trigger_config.scroll_percentage || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    trigger_config: {
                      ...prev.trigger_config,
                      scroll_percentage: parseInt(e.target.value),
                    },
                  }))
                }
              />
              <p className="text-sm text-muted-foreground mt-1">
                Trigger when user scrolls to this percentage of the page (1-100)
              </p>
            </div>
          </div>
        );

      case "custom":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="event_name">Custom Event Name</Label>
              <Input
                id="event_name"
                placeholder="e.g., video_play, download_pdf"
                value={formData.trigger_config.custom_event_name || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    trigger_config: {
                      ...prev.trigger_config,
                      custom_event_name: e.target.value,
                    },
                  }))
                }
              />
              <p className="text-sm text-muted-foreground mt-1">
                This event will be triggered via JavaScript:
                hector(&apos;track&apos;, &apos;your_event_name&apos;)
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const selectedEventType = eventTypes.find(
    (type) => type.value === formData.event_type
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/${domain}/settings/events`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Create Custom Event</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Configuration</CardTitle>
          <CardDescription>
            Set up a custom event to track specific user interactions on your
            website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Event Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Purchase Button Click, Newsletter Signup"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this event tracks..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label>Event Type *</Label>
                <Select
                  value={formData.event_type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      event_type: value,
                      event_selector: "",
                      trigger_config: {},
                    }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {type.icon}
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {type.description}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedEventType && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {selectedEventType.icon}
                    <span className="font-medium">
                      {selectedEventType.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedEventType.description}
                  </p>
                  {renderEventTypeSpecificFields()}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Event"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/dashboard/${domain}/settings/events`}>
                  Cancel
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
