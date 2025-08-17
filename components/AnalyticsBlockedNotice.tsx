"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AnalyticsBlockedNotice() {
  const [isBlocked, setIsBlocked] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Charger le script de détection
    const script = document.createElement("script");
    script.src = "/adblocker-detect.js";
    script.async = true;
    document.head.appendChild(script);

    // Écouter l'événement de blocage
    const handleAnalyticsBlocked = (event: CustomEvent) => {
      console.log("Analytics blocked detected:", event.detail);
      setIsBlocked(true);
    };

    window.addEventListener(
      "analyticsBlocked",
      handleAnalyticsBlocked as EventListener
    );

    // Vérifier après un délai
    const checkTimeout = setTimeout(() => {
      if (window.isAnalyticsBlocked && window.isAnalyticsBlocked()) {
        setIsBlocked(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener(
        "analyticsBlocked",
        handleAnalyticsBlocked as EventListener
      );
      clearTimeout(checkTimeout);
    };
  }, []);

  if (!isBlocked || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md z-50 animate-in slide-in-from-bottom-2">
      <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
        <ShieldAlert className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        <AlertTitle className="text-orange-900 dark:text-orange-100">
          Analytics Blocked
        </AlertTitle>
        <AlertDescription className="text-orange-800 dark:text-orange-200">
          Your ad blocker is preventing analytics from loading. Hector Analytics
          is privacy-focused and doesn&apos;t track personal data. Consider
          whitelisting our domain to help us improve your experience.
        </AlertDescription>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2"
          onClick={() => setIsDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </Alert>
    </div>
  );
}

// Hook pour utiliser dans d'autres composants
export function useAnalyticsBlocked() {
  const [isBlocked, setIsBlocked] = useState(false);
  const [status, setStatus] = useState<{
    blocked: boolean;
    scriptLoaded: boolean;
    apiAccessible: boolean | null;
    storageAvailable: boolean;
  } | null>(null);

  useEffect(() => {
    const checkStatus = () => {
      if (window.getAnalyticsStatus) {
        const analyticsStatus = window.getAnalyticsStatus();
        setStatus(analyticsStatus);
        setIsBlocked(analyticsStatus.blocked);
      }
    };

    // Vérifier immédiatement
    checkStatus();

    // Écouter les changements
    const handleAnalyticsBlocked = () => {
      setIsBlocked(true);
      checkStatus();
    };

    window.addEventListener("analyticsBlocked", handleAnalyticsBlocked);

    // Vérifier après un délai
    const timeout = setTimeout(checkStatus, 3000);

    return () => {
      window.removeEventListener("analyticsBlocked", handleAnalyticsBlocked);
      clearTimeout(timeout);
    };
  }, []);

  return { isBlocked, status };
}

// Déclarations TypeScript pour les fonctions globales
declare global {
  interface Window {
    hectorAnalyticsLoaded?: boolean;
    analyticsBlocked?: boolean;
    isAnalyticsBlocked?: () => boolean;
    getAnalyticsStatus?: () => {
      blocked: boolean;
      scriptLoaded: boolean;
      apiAccessible: boolean | null;
      storageAvailable: boolean;
    };
  }
}
