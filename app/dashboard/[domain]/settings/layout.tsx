import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  Settings, 
  Globe, 
  Target, 
  TrendingUp, 
  Download, 
  AlertTriangle,
  ArrowLeft 
} from "lucide-react";
import { Button } from "@/components/ui/button";

const siteSettingsNavItems = [
  {
    title: "General",
    href: "/dashboard/[domain]/settings",
    icon: Settings,
  },
  {
    title: "Public dashboard",
    href: "/dashboard/[domain]/settings/public",
    icon: Globe,
  },
  {
    title: "Goals",
    href: "/dashboard/[domain]/settings/goals",
    icon: Target,
  },
  {
    title: "Funnels",
    href: "/dashboard/[domain]/settings/funnels",
    icon: TrendingUp,
  },
  {
    title: "Imports & exports",
    href: "/dashboard/[domain]/settings/imports",
    icon: Download,
  },
  {
    title: "Danger zone",
    href: "/dashboard/[domain]/settings/danger",
    icon: AlertTriangle,
  },
];

export default async function SiteSettingsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/auth/login");
  }

  // Get site data and verify ownership
  const { data: siteData, error } = await adminClient
    .from("sites")
    .select("id, domain")
    .eq("domain", domain)
    .eq("user_id", user.id)
    .single();

  if (error || !siteData) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <Link href={`/dashboard/${domain}`}>
          <Button variant="ghost" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{domain}</h1>
        <p className="text-muted-foreground mt-2">
          Manage your website settings and preferences
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 space-y-1">
          {siteSettingsNavItems.map((item) => {
            const Icon = item.icon;
            const href = item.href.replace('[domain]', domain);
            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  "group"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 group-hover:text-accent-foreground",
                  item.title === "Danger zone" 
                    ? "text-destructive group-hover:text-destructive" 
                    : "text-muted-foreground"
                )} />
                <span className={cn(
                  item.title === "Danger zone" && "text-destructive"
                )}>{item.title}</span>
              </Link>
            );
          })}
        </aside>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}