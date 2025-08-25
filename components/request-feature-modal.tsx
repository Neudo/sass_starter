"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Lightbulb, Send } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(100, "Subject must be less than 100 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be less than 1000 characters"),
});

type FormData = z.infer<typeof formSchema>;

interface RequestFeatureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestFeatureModal({
  open,
  onOpenChange,
}: RequestFeatureModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/request-feature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(
          "Feature request sent successfully! We&apos;ll review it and get back to you."
        );
        form.reset();
        onOpenChange(false);
      } else {
        const error = await response.json();
        toast.error(
          error.message || "Failed to send feature request. Please try again."
        );
      }
    } catch (error) {
      console.error("Error submitting feature request:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Request a Feature</DialogTitle>
              <DialogDescription className="text-base mt-1">
                Have an idea that could make Hector Analytics even better?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Intro */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="font-semibold mb-2">
              We&apos;d love to hear your ideas!
            </h3>
            <p className="text-sm text-muted-foreground">
              Your feedback helps us build the analytics platform you actually
              want to use. Whether it&apos;s a small improvement or a major feature,
              we value every suggestion.
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Add real-time visitor notifications"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your feature request in detail:&#10;• What problem would this solve?&#10;• How would it work?&#10;• Why would it be valuable?"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="text-xs text-muted-foreground">
                      {form.watch("message")?.length || 0}/1000 characters
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>

          {/* What happens next */}
          <div className="bg-primary/5 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-3">What happens next?</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                <span>Our team will review your request within 48 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                <span>
                  We&apos;ll evaluate its feasibility and impact on the product
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                <span>
                  If approved, we&apos;ll add it to our roadmap and notify you of
                  progress
                </span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
