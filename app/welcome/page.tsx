"use client";

import { useState, useEffect, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AddSiteWizard } from "@/components/add-site/AddSiteWizard";

function WelcomePageContent() {
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
      <AddSiteWizard requireFirstSite={true} />
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