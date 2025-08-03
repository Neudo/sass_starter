import { Navigation } from "@/components/navigation";
import Hero from "@/components/hero";
import { WaitlistForm } from "@/components/waitlist-form";

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-background text-foreground theme-transition">
      <Navigation />
      <Hero cta={<WaitlistForm />} />
    </div>
  );
}
