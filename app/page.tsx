"use client";
import { useState, useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Navigation } from "@/components/navigation";
import { HomePage } from "@/components/home-page";
import { PricingPage } from "@/components/pricing-page";
import { LoginPage } from "@/components/login-page";
import { SignupPage } from "@/components/signup-page";
import { ForgotPasswordPage } from "@/components/forgot-password-page";
import { DemoPage } from "@/components/demo-page";
import { Dashboard } from "@/components/dashboard";
import { Logo } from "@/components/logo";

export default function App() {
  const [currentPage, setCurrentPage] = useState<
    | "home"
    | "pricing"
    | "login"
    | "signup"
    | "forgot-password"
    | "demo"
    | "dashboard"
  >("home");
  const [isThemeReady, setIsThemeReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleNavigate = (
    page:
      | "home"
      | "pricing"
      | "login"
      | "signup"
      | "forgot-password"
      | "demo"
      | "dashboard"
  ) => {
    setCurrentPage(page);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage("home");
  };

  // Ensure theme is ready before rendering the app
  useEffect(() => {
    // Small delay to let the theme script execute
    const timer = setTimeout(() => {
      setIsThemeReady(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  // Simulate automatic login for development
  useEffect(() => {
    // Auto-login for demo
    const timer = setTimeout(() => {
      setIsLoggedIn(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Loading screen with the new Dana Analytics logo
  if (!isThemeReady) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-pulse">
          <Logo size="lg" showText={true} />
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground theme-transition">
        {/* Navigation hidden on auth pages but visible on dashboard */}
        {!["login", "signup", "forgot-password"].includes(currentPage) && (
          <Navigation
            currentPage={currentPage}
            onNavigate={handleNavigate}
            isLoggedIn={isLoggedIn}
            onLogout={handleLogout}
          />
        )}

        {currentPage === "home" && (
          <HomePage
            onNavigateToPricing={() => handleNavigate("pricing")}
            onNavigateToDemo={() => handleNavigate("demo")}
          />
        )}

        {currentPage === "pricing" && <PricingPage />}

        {currentPage === "demo" && <DemoPage onNavigate={handleNavigate} />}

        {currentPage === "dashboard" && (
          <Dashboard onNavigate={handleNavigate} onLogout={handleLogout} />
        )}

        {currentPage === "login" && (
          <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />
        )}

        {currentPage === "signup" && (
          <SignupPage onNavigate={handleNavigate} onLogin={handleLogin} />
        )}

        {currentPage === "forgot-password" && (
          <ForgotPasswordPage onNavigate={handleNavigate} />
        )}
      </div>
    </ThemeProvider>
  );
}
