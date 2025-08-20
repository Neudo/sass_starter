"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface VerificationStepProps {
  domain: string;
  timezone: string;
  onPrevious: () => void;
  cleanDomainName: (domain: string) => string;
}

export function VerificationStep({
  domain,
  timezone,
  onPrevious,
  cleanDomainName,
}: VerificationStepProps) {
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "checking" | "success" | "error"
  >("idle");
  const [verificationTimer, setVerificationTimer] = useState(20);
  const [isVerified, setIsVerified] = useState(false);
  
  const router = useRouter();
  const intervalsRef = useRef<{ countdown?: NodeJS.Timeout; check?: NodeJS.Timeout }>({});

  const startVerification = () => {
    if (isVerified) {
      console.log("✅ Already verified, skipping verification");
      return;
    }

    setVerificationStatus("checking");
    setVerificationTimer(20);
    setIsVerified(false);

    // Clear any existing intervals
    if (intervalsRef.current.countdown) clearInterval(intervalsRef.current.countdown);
    if (intervalsRef.current.check) clearInterval(intervalsRef.current.check);

    const countdown = setInterval(() => {
      setVerificationTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          if (!isVerified) {
            checkInstallation();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    intervalsRef.current.countdown = countdown;

    // Check every 2 seconds for early detection
    const checkInterval = setInterval(() => {
      if (!isVerified) {
        checkInstallation(true);
      }
    }, 2000);
    intervalsRef.current.check = checkInterval;

    // Stop everything after 20 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      clearInterval(countdown);
      if (verificationStatus === "checking" && !isVerified) {
        setVerificationStatus("error");
      }
    }, 20000);
  };

  const checkInstallation = async (earlyCheck = false) => {
    // Don't check if already verified
    if (isVerified) {
      console.log("✅ Already verified, skipping check");
      return;
    }

    try {
      const cleanDomainForCheck = cleanDomainName(domain);

      console.log("🔍 Installation check - Original domain:", domain);
      console.log("🔍 Installation check - Cleaned domain:", cleanDomainForCheck);

      // Call the API to check if script is installed
      const response = await fetch("/api/verify-installation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain: cleanDomainForCheck }),
      });

      const result = await response.json();
      console.log("🔍 Installation check result:", result);

      if (result.installed) {
        console.log("🎉 Script detected! Stopping intervals and saving site...");
        
        // Mark as verified to prevent multiple checks
        setIsVerified(true);
        
        // Clear intervals
        if (intervalsRef.current.countdown) clearInterval(intervalsRef.current.countdown);
        if (intervalsRef.current.check) clearInterval(intervalsRef.current.check);

        // Site is verified, now save it to database
        const supabase = createClient();
        const cleanDomain = cleanDomainName(domain);

        console.log("💾 Saving site with domain:", cleanDomain);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          console.log("👤 User found:", user.id);
          console.log("💾 Attempting to insert site:", { 
            domain: cleanDomain, 
            timezone, 
            user_id: user.id 
          });
          
          const { error } = await supabase.from("sites").insert({
            domain: cleanDomain,
            timezone,
            user_id: user.id,
          });

          if (error) {
            console.error("❌ Error saving site:", error);
            if (error.code === "23505") {
              console.log("ℹ️  Site already exists (duplicate key), continuing...");
            } else {
              setVerificationStatus("error");
              return;
            }
          } else {
            console.log("✅ Site saved successfully!");
          }
        } else {
          console.error("❌ No user found!");
        }

        setVerificationStatus("success");

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push(`/dashboard/${cleanDomain}`);
        }, 2000);
      } else if (!earlyCheck) {
        // If not an early check and still not installed, show error
        setVerificationStatus("error");
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
    setIsVerified(false);
    startVerification();
  };

  // Start verification automatically when component mounts
  useEffect(() => {
    startVerification();
    
    // Cleanup intervals on unmount
    return () => {
      if (intervalsRef.current.countdown) clearInterval(intervalsRef.current.countdown);
      if (intervalsRef.current.check) clearInterval(intervalsRef.current.check);
    };
  }, []);

  return (
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
            <h3 className="text-lg font-medium mb-2">Installation verified!</h3>
            <p className="text-sm text-muted-foreground text-center">
              Hector Analytics is successfully tracking your website.
              Redirecting to your dashboard...
            </p>
          </>
        )}

        {verificationStatus === "error" && (
          <>
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Script not detected</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              We couldn&apos;t detect the Hector Analytics script on your
              website. Please make sure you&apos;ve added it correctly and try
              again.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onPrevious}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Installation
              </Button>
              <Button onClick={retryVerification}>Verify Again</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}