"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ThemeToggle } from "./theme-toggle";
import { Mail, ArrowRight, CheckCircle, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

interface ForgotPasswordPageProps {
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

interface ForgotPasswordFormData {
  email: string;
}

export function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Reset email sent to:", data.email);
      setEmailSent(true);
    } catch (error) {
      console.error("Error sending email");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
        {/* Theme toggle in absolute position */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-0 shadow-lg text-center">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Email sent!</CardTitle>
                <CardDescription>
                  We've sent a reset link to
                  <br />
                  <strong>{getValues("email")}</strong>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    Check your inbox and click the link to reset your password.
                  </p>
                  <p>
                    If you don't receive the email in a few minutes, check your
                    spam folder.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button variant="outline" onClick={() => setEmailSent(false)}>
                    Resend email
                  </Button>

                  <Button onClick={() => onNavigate("login")}>
                    Back to login
                  </Button>
                </div>
              </CardContent>

              <CardFooter className="flex justify-center">
                <Button
                  variant="link"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => onNavigate("home")}
                >
                  ← Back to home
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

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
          {/* Logo and title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-primary-foreground rounded-lg"></div>
            </div>
            <h1 className="text-2xl font-bold mb-2">Forgot password?</h1>
            <p className="text-muted-foreground">
              No problem! Enter your email and we'll send you a reset link.
            </p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl text-center">Reset</CardTitle>
              <CardDescription className="text-center">
                Enter the email associated with your account
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email format",
                        },
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Send reset link
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="text-center">
                <Button
                  variant="link"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => onNavigate("login")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to login
                </Button>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-2">
              <div className="text-sm text-center text-muted-foreground">
                Remember your password?{" "}
                <Button
                  variant="link"
                  className="px-0 text-primary hover:text-primary/80"
                  onClick={() => onNavigate("login")}
                >
                  Sign in
                </Button>
              </div>
              <div className="text-sm text-center text-muted-foreground">
                Don't have an account yet?{" "}
                <Button
                  variant="link"
                  className="px-0 text-secondary hover:text-secondary/80"
                  onClick={() => onNavigate("signup")}
                >
                  Create account
                </Button>
              </div>
            </CardFooter>
          </Card>

          <div className="text-center mt-6">
            <Button
              variant="link"
              className="text-muted-foreground hover:text-foreground"
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
