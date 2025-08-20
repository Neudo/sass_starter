"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, GripVertical, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface FunnelStep {
  id?: string;
  name: string;
  step_type: "page_view" | "custom_event";
  // For page_view
  url_pattern?: string;
  match_type?: "exact" | "contains" | "starts_with" | "regex";
  // For custom_event
  event_type?: "click" | "scroll" | "click_link";
  event_config?: {
    selector?: string; // For click events
    scroll_percentage?: number; // For scroll events
    page_pattern?: string; // Which page for the event
    url_pattern?: string; // For click_link events
    link_text?: string; // For click_link events
    exact_match?: boolean; // For click_link events
  };
}

interface FunnelData {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  funnel_steps: Array<{
    id: string;
    step_number: number;
    name: string;
    step_type?: string;
    url_pattern?: string;
    match_type?: string;
    event_type?: string;
    event_config?: {
      selector?: string;
      scroll_percentage?: number;
      page_pattern?: string;
      url_pattern?: string;
      link_text?: string;
      exact_match?: boolean;
    };
  }>;
}

interface FunnelEditFormProps {
  siteId: string;
  domain: string;
  userId: string;
  funnel: FunnelData;
}

export function FunnelEditForm({ domain, userId, funnel }: FunnelEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(funnel.name);
  const [description, setDescription] = useState(funnel.description || "");
  const [isActive, setIsActive] = useState(funnel.is_active);
  const [steps, setSteps] = useState<FunnelStep[]>(
    funnel.funnel_steps
      .sort((a, b) => a.step_number - b.step_number)
      .map((step) => ({
        id: step.id,
        name: step.name,
        step_type:
          (step.step_type as "page_view" | "custom_event") || "page_view",
        // Page view fields
        url_pattern: step.url_pattern || undefined,
        match_type:
          (step.match_type as "exact" | "contains" | "starts_with" | "regex") ||
          undefined,
        // Custom event fields
        event_type: (step.event_type as "click" | "scroll" | "click_link") || undefined,
        event_config: step.event_config || undefined,
      }))
  );

  const addStep = () => {
    setSteps([
      ...steps,
      {
        name: "",
        step_type: "page_view",
        url_pattern: "",
        match_type: "exact",
      },
    ]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 2) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const updateStep = (
    index: number,
    field: keyof FunnelStep,
    value: string
  ) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === steps.length - 1)
    ) {
      return;
    }

    const newSteps = [...steps];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newSteps[index], newSteps[newIndex]] = [
      newSteps[newIndex],
      newSteps[index],
    ];
    setSteps(newSteps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation based on step type
    const isValid = steps.every((step) => {
      if (!step.name) return false;

      if (step.step_type === "page_view") {
        return step.url_pattern && step.url_pattern.trim() !== "";
      } else if (step.step_type === "custom_event") {
        if (!step.event_type) return false;

        if (step.event_type === "click") {
          return (
            step.event_config?.selector &&
            step.event_config.selector.trim() !== ""
          );
        } else if (step.event_type === "scroll") {
          // Scroll events are valid even without a specific percentage
          return true;
        } else if (step.event_type === "click_link") {
          return (
            step.event_config?.url_pattern &&
            step.event_config.url_pattern.trim() !== ""
          );
        }
      }

      return false;
    });

    if (!name || !isValid) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // Update the funnel
      const { error: funnelError } = await supabase
        .from("funnels")
        .update({
          name,
          description,
          is_active: isActive,
        })
        .eq("id", funnel.id)
        .eq("user_id", userId);

      if (funnelError) throw funnelError;

      // Delete existing steps
      const { error: deleteError } = await supabase
        .from("funnel_steps")
        .delete()
        .eq("funnel_id", funnel.id);

      if (deleteError) throw deleteError;

      // Insert new steps
      const stepsToInsert = steps.map((step, index) => ({
        funnel_id: funnel.id,
        step_number: index + 1,
        name: step.name,
        step_type: step.step_type,
        // Page view fields
        url_pattern: step.step_type === "page_view" ? step.url_pattern : null,
        match_type: step.step_type === "page_view" ? step.match_type : null,
        // Custom event fields
        event_type: step.step_type === "custom_event" ? step.event_type : null,
        event_config:
          step.step_type === "custom_event" ? step.event_config : null,
      }));

      const { error: stepsError } = await supabase
        .from("funnel_steps")
        .insert(stepsToInsert);

      if (stepsError) throw stepsError;

      router.push(`/dashboard/${domain}/settings/funnels`);
    } catch (error) {
      console.error("Error updating funnel:", error);
      alert("Failed to update funnel. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Funnel Details</CardTitle>
          <CardDescription>
            Update your funnel name, description, and status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Funnel Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Signup Flow, Purchase Journey"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this funnel tracks..."
              rows={3}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="is_active">Active (tracking enabled)</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Funnel Steps</CardTitle>
          <CardDescription>
            Update the pages visitors should navigate through. Minimum 2 steps
            required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index > 0 && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
                </div>
              )}

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveStep(index, "up")}
                        disabled={index === 0}
                      >
                        <GripVertical className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex-1 space-y-4">
                      {/* Step name */}
                      <div>
                        <Label>Step {index + 1} Name *</Label>
                        <Input
                          value={step.name}
                          onChange={(e) =>
                            updateStep(index, "name", e.target.value)
                          }
                          placeholder="e.g., View Pricing, Click CTA Button"
                          required
                        />
                      </div>

                      {/* Step type selector */}
                      <div>
                        <Label>Step Type</Label>
                        <Select
                          value={step.step_type}
                          onValueChange={(
                            value: "page_view" | "custom_event"
                          ) => {
                            const newSteps = [...steps];
                            const currentStep = newSteps[index];
                            newSteps[index] = {
                              ...currentStep,
                              step_type: value,
                              // Reset fields based on type only if changing type
                              url_pattern:
                                value === "page_view"
                                  ? currentStep.url_pattern || ""
                                  : undefined,
                              match_type:
                                value === "page_view"
                                  ? currentStep.match_type || "exact"
                                  : undefined,
                              event_type:
                                value === "custom_event"
                                  ? currentStep.event_type || "click"
                                  : undefined,
                              event_config:
                                value === "custom_event"
                                  ? currentStep.event_config || { selector: "" }
                                  : undefined,
                            };
                            setSteps(newSteps);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="page_view">Page View</SelectItem>
                            <SelectItem value="custom_event">
                              Custom Event
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Page View Configuration */}
                      {step.step_type === "page_view" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>URL Pattern *</Label>
                            <Input
                              value={step.url_pattern || ""}
                              onChange={(e) =>
                                updateStep(index, "url_pattern", e.target.value)
                              }
                              placeholder="/pricing"
                              required
                            />
                          </div>
                          <div>
                            <Label>Match Type</Label>
                            <Select
                              value={step.match_type || "exact"}
                              onValueChange={(value) =>
                                updateStep(
                                  index,
                                  "match_type",
                                  value as
                                    | "exact"
                                    | "contains"
                                    | "starts_with"
                                    | "regex"
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="exact">
                                  Exact Match
                                </SelectItem>
                                <SelectItem value="contains">
                                  Contains
                                </SelectItem>
                                <SelectItem value="starts_with">
                                  Starts With
                                </SelectItem>
                                <SelectItem value="regex">Regex</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {/* Custom Event Configuration */}
                      {step.step_type === "custom_event" && (
                        <div className="space-y-4">
                          <div>
                            <Label>Event Type</Label>
                            <Select
                              value={step.event_type || "click"}
                              onValueChange={(
                                value: "click" | "scroll" | "click_link"
                              ) => {
                                const newSteps = [...steps];
                                const currentStep = newSteps[index];
                                newSteps[index] = {
                                  ...currentStep,
                                  event_type: value,
                                  event_config:
                                    value === "click"
                                      ? currentStep.event_config?.selector
                                        ? currentStep.event_config
                                        : { selector: "" }
                                      : value === "scroll"
                                      ? currentStep.event_config
                                          ?.page_pattern !== undefined
                                        ? currentStep.event_config
                                        : { page_pattern: "" }
                                      : currentStep.event_config?.url_pattern
                                      ? currentStep.event_config
                                      : {
                                          url_pattern: "",
                                          link_text: "",
                                          exact_match: false,
                                        },
                                };
                                setSteps(newSteps);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="click">
                                  Click Element
                                </SelectItem>
                                <SelectItem value="scroll">Scroll</SelectItem>
                                <SelectItem value="click_link">
                                  Click Link
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Click Event Config */}
                          {step.event_type === "click" && (
                            <div>
                              <Label>Element Selector *</Label>
                              <Input
                                value={step.event_config?.selector || ""}
                                onChange={(e) => {
                                  const newSteps = [...steps];
                                  newSteps[index] = {
                                    ...newSteps[index],
                                    event_config: {
                                      ...newSteps[index].event_config,
                                      selector: e.target.value,
                                    },
                                  };
                                  setSteps(newSteps);
                                }}
                                placeholder="#show-more, .btn-cta, [data-action='submit']"
                                required
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                CSS selector: ID (#my-button), class (.btn-cta),
                                or attribute ([data-id=&apos;value&apos;])
                              </p>
                            </div>
                          )}

                          {/* Scroll Event Config */}
                          {step.event_type === "scroll" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Scroll Percentage (optional)</Label>
                                <Select
                                  value={
                                    step.event_config?.scroll_percentage?.toString() ||
                                    "any"
                                  }
                                  onValueChange={(value) => {
                                    const newSteps = [...steps];
                                    newSteps[index] = {
                                      ...newSteps[index],
                                      event_config: {
                                        ...newSteps[index].event_config,
                                        scroll_percentage:
                                          value === "any"
                                            ? undefined
                                            : parseInt(value),
                                      },
                                    };
                                    setSteps(newSteps);
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Any scroll (leave empty)" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="any">
                                      Any scroll
                                    </SelectItem>
                                    <SelectItem value="25">25%</SelectItem>
                                    <SelectItem value="50">50%</SelectItem>
                                    <SelectItem value="75">75%</SelectItem>
                                    <SelectItem value="90">90%</SelectItem>
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Leave empty to trigger on any scroll movement
                                </p>
                              </div>
                              <div>
                                <Label>Page Pattern (optional)</Label>
                                <Input
                                  value={step.event_config?.page_pattern || ""}
                                  onChange={(e) => {
                                    const newSteps = [...steps];
                                    newSteps[index] = {
                                      ...newSteps[index],
                                      event_config: {
                                        ...newSteps[index].event_config,
                                        page_pattern: e.target.value,
                                      },
                                    };
                                    setSteps(newSteps);
                                  }}
                                  placeholder="/pricing (leave empty for any page)"
                                />
                              </div>
                            </div>
                          )}

                          {/* Click Link Event Config */}
                          {step.event_type === "click_link" && (
                            <div className="space-y-4">
                              <div>
                                <Label>Target URL Pattern *</Label>
                                <Input
                                  value={step.event_config?.url_pattern || ""}
                                  onChange={(e) => {
                                    const newSteps = [...steps];
                                    newSteps[index] = {
                                      ...newSteps[index],
                                      event_config: {
                                        ...newSteps[index].event_config,
                                        url_pattern: e.target.value,
                                      },
                                    };
                                    setSteps(newSteps);
                                  }}
                                  placeholder="/checkout, /pricing, /signup"
                                  required
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  URL pattern that the link must point to
                                </p>
                              </div>
                              <div>
                                <Label>Link Text (optional)</Label>
                                <Input
                                  value={step.event_config?.link_text || ""}
                                  onChange={(e) => {
                                    const newSteps = [...steps];
                                    newSteps[index] = {
                                      ...newSteps[index],
                                      event_config: {
                                        ...newSteps[index].event_config,
                                        link_text: e.target.value,
                                      },
                                    };
                                    setSteps(newSteps);
                                  }}
                                  placeholder="Buy Now, Get Started, Learn More"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Text content of the link (leave empty to match
                                  any text)
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`exact-match-${index}`}
                                  checked={
                                    step.event_config?.exact_match || false
                                  }
                                  onChange={(e) => {
                                    const newSteps = [...steps];
                                    newSteps[index] = {
                                      ...newSteps[index],
                                      event_config: {
                                        ...newSteps[index].event_config,
                                        exact_match: e.target.checked,
                                      },
                                    };
                                    setSteps(newSteps);
                                  }}
                                />
                                <Label htmlFor={`exact-match-${index}`}>
                                  Exact URL match (unchecked = contains match)
                                </Label>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {steps.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeStep(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground">
                    {step.step_type === "page_view" && (
                      <>
                        {step.match_type === "exact" &&
                          "URL must match exactly"}
                        {step.match_type === "contains" &&
                          "URL must contain this text"}
                        {step.match_type === "starts_with" &&
                          "URL must start with this text"}
                        {step.match_type === "regex" &&
                          "URL must match this regex pattern"}
                      </>
                    )}
                    {step.step_type === "custom_event" && (
                      <>
                        {step.event_type === "click" &&
                          "Triggers when user clicks on the specified element"}
                        {step.event_type === "scroll" &&
                          `Triggers when user scrolls${
                            step.event_config?.scroll_percentage
                              ? ` to ${step.event_config.scroll_percentage}%`
                              : " (any amount)"
                          } of the page`}
                        {step.event_type === "click_link" &&
                          `Triggers when user clicks on a link pointing to ${
                            step.event_config?.url_pattern || "specified URL"
                          }${
                            step.event_config?.link_text
                              ? ` with text "${step.event_config.link_text}"`
                              : ""
                          }`}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={addStep}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/dashboard/${domain}/settings/funnels`)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Funnel"}
        </Button>
      </div>
    </form>
  );
}
