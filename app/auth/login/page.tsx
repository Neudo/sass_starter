"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "motion/react";
import { LoginForm } from "@/components/login-form";

interface LoginPageProps {
  onNavigate: (
    page:
      | "home"
      | "pricing"
      | "login"
      | "signup"
      | "forgot-password"
      | "demo"
      | "dashboard"
  ) => void;
}

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setLoginError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate successful login for demo
      if (data.email === "demo@dana.ai" && data.password === "dana2025") {
        console.log("Login successful! Redirecting to dashboard...", data);
        onNavigate("dashboard");
      } else {
        setLoginError("Invalid email or password. Use demo@dana.ai / dana2025");
      }
    } catch (error) {
      setLoginError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      {/* Theme toggle in absolute position */}

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo and title with new Dana brand */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="xl" showText={false} />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-primary">
              Welcome back to Dana!
            </h1>
            <p className="text-muted-foreground">
              Sign in to your Dana Analytics dashboard
            </p>
          </div>
          <LoginForm />

          <div className="text-center mt-6">
            <Button
              variant="link"
              className="text-muted-foreground hover:text-primary"
              onClick={() => onNavigate("home")}
            >
              ← Back to home
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
