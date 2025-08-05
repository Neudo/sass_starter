import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import DashboardStart from "@/components/dashboard-start";

export default async function ProtectedPage() {
  const supabase = await createAdminClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <DashboardStart user={{ id: data?.claims.sub }} />
    </div>
  );
}
