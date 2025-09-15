"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TIMEZONES } from "@/lib/constants/timezones";
import { cleanDomainName } from "@/lib/utils/domain";
import { StepIndicator } from "@/components/welcome/StepIndicator";
import { DomainInfoStep } from "@/components/welcome/DomainInfoStep";
import { InstallationStep } from "@/components/welcome/InstallationStep";
import { VerificationStep } from "@/components/welcome/VerificationStep";

interface AddSiteWizardProps {
  requireFirstSite?: boolean; // For /welcome page - ensures user has no sites
  redirectPath?: string; // Custom redirect path after completion
}

export function AddSiteWizard({ redirectPath }: AddSiteWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [domain, setDomain] = useState("");
  const [timezone, setTimezone] = useState("UTC");

  // Detect user's timezone on mount
  useEffect(() => {
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
  }, []);

  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Website Information";
      case 2:
        return "Installation";
      case 3:
        return "Verification";
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Configure your website tracking settings";
      case 2:
        return "Add the tracking script to your website";
      case 3:
        return "Verifying your installation";
      default:
        return "";
    }
  };

  return (
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
            redirectPath={redirectPath}
          />
        )}
      </CardContent>
    </Card>
  );
}
