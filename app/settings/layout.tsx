import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Settings, CreditCard, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const settingsNavItems = [
  {
    title: "Account settings",
    href: "/settings/account",
    icon: Settings,
  },
  {
    title: "Billing & usage",
    href: "/settings/billing",
    icon: CreditCard,
  },
  {
    title: "Danger zone",
    href: "/settings/danger",
    icon: AlertTriangle,
  },
];

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 space-y-1">
          {settingsNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  "group"
                )}
              >
                <Icon className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </aside>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}