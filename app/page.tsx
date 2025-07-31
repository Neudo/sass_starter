"use client";
import { Navigation } from "@/components/navigation";
import { HomePage } from "@/components/home-page";

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground theme-transition">
      <Navigation />
      <HomePage />
    </div>
  );
}
