import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import DashboardStart from "@/components/dashboard-start";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return <DashboardStart user={{ id: data?.claims.sub }} />;
}
