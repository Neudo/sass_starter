import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navigation } from "@/components/navigation";
import { HomePage } from "@/components/home-page";
import Footer from "@/components/footer";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background text-foreground theme-transition">
      <Navigation />
      <HomePage />
      <Footer />
    </div>
  );
}
