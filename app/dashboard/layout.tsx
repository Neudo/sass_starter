"use client";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChevronDown, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";
import { useShowUserInfos } from "@/hooks/useLoggedUser";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();
  const router = useRouter();
  const { userInfo: userEmail, loading: emailLoading } =
    useShowUserInfos("email");
  const { userInfo: userName, loading: nameLoading } = useShowUserInfos("name");
  
  const [trialInfo, setTrialInfo] = useState<{
    daysLeft: number;
    isActive: boolean;
    hasActiveSubscription: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchTrialStatus = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("trial_end, status, stripe_subscription_id")
        .eq("user_id", user.id)
        .single();

      if (subscription) {
        const hasActiveSubscription = subscription.status === "active" && 
                                    subscription.stripe_subscription_id && 
                                    subscription.stripe_subscription_id !== "";
        
        if (hasActiveSubscription) {
          setTrialInfo({
            daysLeft: 0,
            isActive: false,
            hasActiveSubscription: true
          });
        } else if (subscription.trial_end) {
          const trialEndDate = new Date(subscription.trial_end);
          const now = new Date();
          const diffTime = trialEndDate.getTime() - now.getTime();
          const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
          
          setTrialInfo({
            daysLeft,
            isActive: daysLeft > 0,
            hasActiveSubscription: false
          });
        }
      }
    };

    fetchTrialStatus();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen flex flex-col items-center">
        <div className="flex-1 w-full flex flex-col gap-20 items-center py-8">
          <nav className="w-full flex justify-center border-b border-b-foreground/10 h-20">
            <header className="bg-background border-b border-border max-w-7xl mx-auto w-full">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  {/* Logo + Trial badge */}
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => router.push("/")}
                      className="flex items-center hover:opacity-80 transition-opacity"
                    >
                      <Logo size="md" showText={true} />
                    </button>

                    {/* Show trial badge only if user is in trial and doesn't have active subscription */}
                    {trialInfo && trialInfo.isActive && !trialInfo.hasActiveSubscription && (
                      <Badge
                        variant="outline"
                        className={`border-ring/30 text-ring bg-ring/5 px-3 py-1 hidden sm:block ${
                          trialInfo.daysLeft <= 3 ? 'border-destructive/30 text-destructive bg-destructive/5' : ''
                        }`}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        <Link href="/pricing">
                          {trialInfo.daysLeft} trial day{trialInfo.daysLeft !== 1 ? 's' : ''} left
                        </Link>
                      </Badge>
                    )}
                  </div>

                  {/* User section + Theme toggle */}
                  <div className="flex items-center gap-4">
                    <ThemeToggle />

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                          <Avatar className="w-8 h-8">
                            <AvatarImage
                              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                              alt="User"
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {userName
                                ? userName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)
                                : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="hidden sm:block">
                            <div className="text-sm font-medium text-foreground">
                              {nameLoading ? "Loading..." : userName || "User"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {emailLoading ? "Loading..." : userEmail}
                            </div>
                          </div>
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="p-4 relative">
                          <Link
                            className="before:absolute before:content-[''] before:-inset-0"
                            href="/settings"
                          >
                            Settings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <LogoutButton />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </header>
          </nav>
          <div className="flex-1 flex flex-col gap-20 max-w-6xl w-full p-5">
            {children}
          </div>
        </div>
      </main>
    </QueryClientProvider>
  );
}
