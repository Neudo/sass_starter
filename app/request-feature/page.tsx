"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export default function RequestFeaturePage() {
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
          "Feature request sent successfully! We'll review it and get back to you."
        );
        form.reset();
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
    <div className="container max-w-2xl mx-auto py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <Lightbulb className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Request a Feature
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Have an idea that could make Hector Analytics even better?
            </p>
          </div>
        </div>

        {/* Intro text */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              We&apos;d love to hear your ideas!
            </CardTitle>
            <CardDescription className="text-base">
              Your feedback helps us build the analytics platform you actually
              want to use. Whether it&apos;s a small improvement or a major
              feature, we value every suggestion. Our team reviews all requests
              and prioritizes them based on user needs and impact.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Tell us about your idea</CardTitle>
            <CardDescription>
              Please provide as much detail as possible to help us understand
              your request.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject *</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                          placeholder="Describe your feature request in detail. Include:&#10;• What problem would this solve?&#10;• How would it work?&#10;• Why would it be valuable?&#10;• Any specific requirements or examples?"
                          className="min-h-[150px]"
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

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Feature Request
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Additional info */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h3 className="font-semibold">What happens next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Our team will review your request within 48 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>
                    We&apos;ll evaluate its feasibility and impact on the
                    product
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>
                    If approved, we&apos;ll add it to our roadmap and notify you
                    of progress
                  </span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
