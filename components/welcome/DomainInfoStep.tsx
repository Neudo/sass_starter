"use client";

import { useState, useEffect } from "react";
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
import { TIMEZONES } from "@/lib/constants/timezones";
import { ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface DomainInfoStepProps {
  domain: string;
  setDomain: (domain: string) => void;
  timezone: string;
  setTimezone: (timezone: string) => void;
  onNext: () => void;
  cleanDomainName: (domain: string) => string;
}

export function DomainInfoStep({
  domain,
  setDomain,
  timezone,
  setTimezone,
  onNext,
  cleanDomainName,
}: DomainInfoStepProps) {
  const [domainError, setDomainError] = useState<string | null>(null);
  const [isCheckingDomain, setIsCheckingDomain] = useState(false);
  const [isDomainAvailable, setIsDomainAvailable] = useState<boolean | null>(null);

  // Check domain availability with debounce
  useEffect(() => {
    if (!domain.trim()) {
      setDomainError(null);
      setIsDomainAvailable(null);
      setIsCheckingDomain(false);
      return;
    }

    const checkDomain = async () => {
      setIsCheckingDomain(true);
      setDomainError(null);

      const supabase = createClient();
      const cleanDomain = cleanDomainName(domain);

      console.log("🔍 Domain check - Original:", domain);
      console.log("🔍 Domain check - Cleaned:", cleanDomain);

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
  }, [domain, cleanDomainName]);

  const handleNext = () => {
    if (!isDomainAvailable) return;
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="domain">Domain</Label>
        <Input
          id="domain"
          type="text"
          placeholder="example.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
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
          This ensures your analytics filters (Today, Yesterday, etc.) are accurate
        </p>
      </div>

      <Button
        onClick={handleNext}
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
  );
}