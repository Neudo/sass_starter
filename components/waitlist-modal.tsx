"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface WaitlistModalProps {
  triggerComponent: React.ReactNode;
}

export function WaitlistModal({ triggerComponent }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [open, setOpen] = useState(false);

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerComponent}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Coming Soon!</DialogTitle>
          <DialogDescription className="text-lg pt-2">
            Hector Analytics isn&apos;t quite ready yet.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row w-full gap-2"
          >
            <Input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 py-6 border-slate-400"
            />
            <Button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Submitting..." : "Join waitlist"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground">
            Get notified at launch and enjoy 1 month free.
          </p>
          {status === "success" && (
            <Badge variant="success" className="self-center py-2">
              You&apos;re on the list! Please check your inbox.
            </Badge>
          )}
          {status === "error" && (
            <Badge variant="destructive" className="self-center py-2">
              Something went wrong. Please try again.
            </Badge>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
