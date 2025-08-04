"use client";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { LoginForm } from "@/components/login-form";
import Link from "next/link";
import { motion } from "motion/react";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="xl" showText={false} />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-primary">
              Welcome back to Dana!
            </h1>
            <p className="text-muted-foreground">
              Sign in to your Hector Analytics dashboard
            </p>
          </div>
          <LoginForm />
          <div className="text-center mt-6">
            <Link
              href="/"
              className="text-muted-foreground hover:text-primary text-sm"
            >
              ← Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
