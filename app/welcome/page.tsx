"use client";

import { useState, useEffect, Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TIMEZONES } from "@/lib/constants/timezones";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { StepIndicator } from "@/components/welcome/StepIndicator";
import { DomainInfoStep } from "@/components/welcome/DomainInfoStep";
import { InstallationStep } from "@/components/welcome/InstallationStep";
import { VerificationStep } from "@/components/welcome/VerificationStep";

function WelcomePageContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [domain, setDomain] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Function to clean domain consistently
  const cleanDomainName = (rawDomain: string): string => {
    return rawDomain
      .trim() // Remove whitespace
      .toLowerCase() // Normalize case
      .replace(/^https?:\/\//, "") // Remove protocol
      .replace(/^www\./, "") // Remove www.
      .replace(/\/+$/, "") // Remove trailing slashes
      .replace(/\/$/, ""); // Final cleanup
  };

  // Check access permissions
  useEffect(() => {
    const checkAccess = async () => {
      const supabase = createClient();

      // Handle email confirmation code if present
      const code = searchParams.get("code");
      if (code) {
        try {
          await supabase.auth.exchangeCodeForSession(code);
        } catch (exchangeError) {
          console.error("Error exchanging code:", exchangeError);
        }
      }

      // Check if user is authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Not authenticated -> redirect to home
        router.push("/");
        return;
      }

      // User is authenticated, check if they have any sites
      const { data: sites } = await supabase
        .from("sites")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (sites && sites.length > 0) {
        // User already has sites -> redirect to home (or their dashboard)
        router.push("/");
        return;
      }

      // User is authenticated but has no sites -> allow access to welcome
      setIsAuthenticated(true);
      setIsLoading(false);

      // Clean URL if there was a code
      if (code) {
        const url = new URL(window.location.href);
        url.searchParams.delete("code");
        window.history.replaceState({}, "", url.pathname);
      }
    };

    checkAccess();
  }, [router, searchParams]);

  // Detect user's timezone on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // Check if the detected timezone exists in our list
      if (TIMEZONES.some((tz) => tz.value === userTimezone)) {
        setTimezone(userTimezone);
      }
    } catch (error) {
      console.error("Could not detect timezone:", error);
      // Keep default UTC if detection fails
    }
  }, [isAuthenticated]);

  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render the form if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Website Information";
      case 2: return "Installation";
      case 3: return "Verification";
      default: return "";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return "Configure your website tracking settings";
      case 2: return "Add the tracking script to your website";
      case 3: return "Verifying your installation";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <StepIndicator currentStep={currentStep} totalSteps={3} />
          <CardTitle>{getStepTitle()}</CardTitle>
          <CardDescription>{getStepDescription()}</CardDescription>
        </CardHeader>

        <CardContent>
          {currentStep === 1 && (
            <DomainInfoStep
              domain={domain}
              setDomain={setDomain}
              timezone={timezone}
              setTimezone={setTimezone}
              onNext={handleNextStep}
              cleanDomainName={cleanDomainName}
            />
          )}

          {currentStep === 2 && (
            <InstallationStep
              onNext={handleNextStep}
              onPrevious={handlePreviousStep}
            />
          )}

          {currentStep === 3 && (
            <VerificationStep
              domain={domain}
              timezone={timezone}
              onPrevious={handlePreviousStep}
              cleanDomainName={cleanDomainName}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <WelcomePageContent />
    </Suspense>
  );
}
