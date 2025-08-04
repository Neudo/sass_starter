"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Request failed");
      setEmail("");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="flex flex-col items-center gap-4 mb-12 w-full"
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row w-full max-w-md gap-2"
      >
        <Input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 py-6 border-slate-400"
        />
        <Button type="submit" disabled={status === "loading"} size="xl">
          {status === "loading" ? "Submitting..." : "Join waitlist"}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        Get notified at launch and enjoy 1 month free.
      </p>
      {status === "success" && (
        <p className="text-sm text-green-500 text-center">
          You&apos;re on the list! Please check your inbox.
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-500 text-center">
          Something went wrong. Please try again.
        </p>
      )}
    </motion.div>
  );
}
