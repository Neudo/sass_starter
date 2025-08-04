"use client";
import { Navigation } from "@/components/navigation";
import { HomePage } from "@/components/home-page";
import Footer from "@/components/footer";

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground theme-transition">
      <Navigation />
      <HomePage />
      <Footer />
    </div>
  );
}
