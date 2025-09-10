"use client";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { BookOpen, ChevronDown, Lightbulb, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { RequestFeatureModal } from "@/components/request-feature-modal";
import Link from "next/link";
import { useShowUserInfos } from "@/hooks/useLoggedUser";
import { useState } from "react";

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

  const [requestFeatureOpen, setRequestFeatureOpen] = useState(false);

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
                  </div>

                  {/* User section + Theme toggle */}
                  <div className="flex items-center gap-4">
                    <ThemeToggle />

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
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
                            className="before:absolute before:content-[''] before:-inset-0 flex items-center gap-2"
                            href="/settings"
                          >
                            <Settings className="h-4 w-4" />
                            Settings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="p-4 cursor-pointer"
                          onClick={() => setRequestFeatureOpen(true)}
                        >
                          <div className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            Request a Feature
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="p-4 relative">
                          <BookOpen className="h-4 w-4" />
                          <Link
                            href="/docs"
                            className="before:absolute before:content-[''] before:-inset-0 flex items-center gap-2"
                            target="_blank"
                          >
                            Documentation
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

        <RequestFeatureModal
          open={requestFeatureOpen}
          onOpenChange={setRequestFeatureOpen}
        />
      </main>
    </QueryClientProvider>
  );
}
