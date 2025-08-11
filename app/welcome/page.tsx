"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TIMEZONES } from "@/lib/constants/timezones";
import {
  CheckCircle2,
  Copy,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function WelcomePageContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [domain, setDomain] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "checking" | "success" | "error"
  >("idle");
  const [verificationTimer, setVerificationTimer] = useState(20);
  const [copied, setCopied] = useState(false);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [isCheckingDomain, setIsCheckingDomain] = useState(false);
  const [isDomainAvailable, setIsDomainAvailable] = useState<boolean | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

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

  // Check domain availability with debounce
  useEffect(() => {
    if (!isAuthenticated || !domain.trim()) {
      setDomainError(null);
      setIsDomainAvailable(null);
      setIsCheckingDomain(false);
      return;
    }

    const checkDomain = async () => {
      setIsCheckingDomain(true);
      setDomainError(null);

      const supabase = createClient();
      const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");

      try {
        const { data: existingSite } = await supabase
          .from("sites")
          .select("id")
          .eq("domain", cleanDomain)
          .single();

        if (existingSite) {
          setDomainError(
            "This domain is already being tracked by another user. If you believe this is an error, please contact support@hectoranalytics.com"
          );
          setIsDomainAvailable(false);
        } else {
          setIsDomainAvailable(true);
        }
      } catch (error) {
        // If error.code is 'PGRST116', it means no rows found (domain available)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((error as any).code === "PGRST116") {
          setIsDomainAvailable(true);
        } else {
          setDomainError(
            "Error checking domain availability. Please try again."
          );
          setIsDomainAvailable(false);
        }
      }

      setIsCheckingDomain(false);
    };

    // Debounce the check
    const timeoutId = setTimeout(checkDomain, 1000);
    return () => clearTimeout(timeoutId);
  }, [domain, isAuthenticated]);

  const scriptCode = `<script defer src="https://www.hectoranalytics.com/script.js"></script>`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      // Don't proceed if domain is not available
      if (!isDomainAvailable) {
        return;
      }

      // Save domain and timezone
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Clean domain (remove protocol if present)
        const cleanDomain = domain
          .replace(/^https?:\/\//, "")
          .replace(/\/$/, "");

        const { error } = await supabase.from("sites").insert({
          domain: cleanDomain,
          timezone,
          user_id: user.id,
        });

        if (error) {
          if (error.code === "23505") {
            // Unique constraint violation
            setDomainError(
              "This domain is already being tracked by another user. If you believe this is an error, please contact support@hectoranalytics.com"
            );
          } else {
            setDomainError(
              "An error occurred while saving your domain. Please try again."
            );
          }
          return;
        }
      }

      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
      startVerification();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setVerificationStatus("idle");
      setVerificationTimer(20);
    }
  };

  const startVerification = () => {
    setVerificationStatus("checking");
    setVerificationTimer(20);

    const countdown = setInterval(() => {
      setVerificationTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          checkInstallation();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Check every 2 seconds for early detection
    const checkInterval = setInterval(() => {
      checkInstallation(true);
    }, 2000);

    setTimeout(() => {
      clearInterval(checkInterval);
      if (verificationStatus === "checking") {
        setVerificationStatus("error");
      }
    }, 20000);
  };

  const checkInstallation = async (earlyCheck = false) => {
    try {
      // Call the API to check if script is installed
      const response = await fetch("/api/verify-installation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain }),
      });

      const result = await response.json();

      if (result.installed) {
        setVerificationStatus("success");
        const cleanDomain = domain
          .replace(/^https?:\/\//, "")
          .replace(/\/$/, "");

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push(`/dashboard/${cleanDomain}`);
        }, 2000);
      } else if (!earlyCheck) {
        // If not an early check and still not installed, show error
        setVerificationStatus("error");
      } else if (result.fallbackCheck) {
        // If we couldn't fetch the website, check for tracking data as fallback
        const supabase = createClient();
        const cleanDomain = domain
          .replace(/^https?:\/\//, "")
          .replace(/\/$/, "");

        const { data } = await supabase
          .from("sessions")
          .select("id")
          .eq(
            "site_id",
            (
              await supabase
                .from("sites")
                .select("id")
                .eq("domain", cleanDomain)
                .single()
            ).data?.id
          )
          .limit(1);

        if (data && data.length > 0) {
          setVerificationStatus("success");

          setTimeout(() => {
            router.push(`/dashboard/${cleanDomain}`);
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Error checking installation:", error);
      if (!earlyCheck) {
        setVerificationStatus("error");
      }
    }
  };

  const retryVerification = () => {
    setVerificationStatus("idle");
    startVerification();
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      currentStep >= step
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={cn(
                        "w-16 h-1",
                        currentStep > step ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <CardTitle>
            {currentStep === 1 && "Website Information"}
            {currentStep === 2 && "Installation"}
            {currentStep === 3 && "Verification"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Configure your website tracking settings"}
            {currentStep === 2 && "Add the tracking script to your website"}
            {currentStep === 3 && "Verifying your installation"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Step 1: Website Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  type="text"
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => {
                    setDomain(e.target.value);
                  }}
                  className={cn("w-full", domainError && "border-red-500")}
                />
                {domainError && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <p>{domainError}</p>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Enter the URL of the website you want to track
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select a timezone" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  This ensures your analytics filters (Today, Yesterday, etc.)
                  are accurate
                </p>
              </div>

              <Button
                onClick={handleNextStep}
                disabled={!domain || isCheckingDomain || !isDomainAvailable}
                className="w-full"
              >
                {isCheckingDomain ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking domain...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Step 2: Installation */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Installation Instructions</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Copy the script below</li>
                  <li>
                    Paste it into the{" "}
                    <code className="bg-muted px-1 py-0.5 rounded">
                      &lt;head&gt;
                    </code>{" "}
                    section of your HTML
                  </li>
                  <li>Save and deploy your changes</li>
                </ol>
              </div>

              <div className="space-y-2">
                <Label>Tracking Script</Label>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto h-[80px] flex justify-start items-end">
                    <code>{scriptCode}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2"
                    onClick={handleCopyScript}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleNextStep} className="flex-1">
                  Verify Installation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Verification */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center py-8">
                {verificationStatus === "checking" && (
                  <>
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      Checking your installation...
                    </h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Please wait while we verify your installation
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Checking for {verificationTimer} more seconds...
                    </p>
                  </>
                )}

                {verificationStatus === "success" && (
                  <>
                    <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      Installation verified!
                    </h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Hector Analytics is successfully tracking your website.
                      Redirecting to your dashboard...
                    </p>
                  </>
                )}

                {verificationStatus === "error" && (
                  <>
                    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      Script not detected
                    </h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      We couldn&apos;t detect the Hector Analytics script on
                      your website. Please make sure you&apos;ve added it
                      correctly and try again.
                    </p>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handlePreviousStep}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Installation
                      </Button>
                      <Button onClick={retryVerification}>Verify Again</Button>
                    </div>
                  </>
                )}
              </div>
            </div>
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
