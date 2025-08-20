"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  name: string;
  url_pattern: string;
  match_type: "exact" | "contains" | "starts_with" | "regex";
}

interface FunnelCreateFormProps {
  siteId: string;
  domain: string;
  userId: string;
}

export function FunnelCreateForm({
  siteId,
  domain,
  userId,
}: FunnelCreateFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<FunnelStep[]>([
    { name: "", url_pattern: "", match_type: "exact" },
    { name: "", url_pattern: "", match_type: "exact" },
  ]);

  const addStep = () => {
    setSteps([...steps, { name: "", url_pattern: "", match_type: "exact" }]);
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

    if (!name || steps.some((s) => !s.name || !s.url_pattern)) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // Create the funnel
      const { data: funnel, error: funnelError } = await supabase
        .from("funnels")
        .insert({
          user_id: userId,
          site_id: siteId,
          name,
          description,
          is_active: true,
        })
        .select()
        .single();

      if (funnelError) throw funnelError;

      // Create the funnel steps
      const stepsToInsert = steps.map((step, index) => ({
        funnel_id: funnel.id,
        step_number: index + 1,
        name: step.name,
        url_pattern: step.url_pattern,
        match_type: step.match_type,
      }));

      const { error: stepsError } = await supabase
        .from("funnel_steps")
        .insert(stepsToInsert);

      if (stepsError) throw stepsError;

      router.push(`/dashboard/${domain}/settings/funnels`);
    } catch (error) {
      console.error("Error creating funnel:", error);
      alert("Failed to create funnel. Please try again.");
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
            Give your funnel a name and description
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Funnel Steps</CardTitle>
          <CardDescription>
            Define the pages visitors should navigate through. Minimum 2 steps
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

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Step {index + 1} Name *</Label>
                        <Input
                          value={step.name}
                          onChange={(e) =>
                            updateStep(index, "name", e.target.value)
                          }
                          placeholder="e.g., View Pricing"
                          required
                        />
                      </div>

                      <div>
                        <Label>URL Pattern *</Label>
                        <Input
                          value={step.url_pattern}
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
                          value={step.match_type}
                          onValueChange={(value) =>
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            updateStep(index, "match_type", value as any)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="exact">Exact Match</SelectItem>
                            <SelectItem value="contains">Contains</SelectItem>
                            <SelectItem value="starts_with">
                              Starts With
                            </SelectItem>
                            <SelectItem value="regex">Regex</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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
                    {step.match_type === "exact" && "URL must match exactly"}
                    {step.match_type === "contains" &&
                      "URL must contain this text"}
                    {step.match_type === "starts_with" &&
                      "URL must start with this text"}
                    {step.match_type === "regex" &&
                      "URL must match this regex pattern"}
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
          {loading ? "Creating..." : "Create Funnel"}
        </Button>
      </div>
    </form>
  );
}
