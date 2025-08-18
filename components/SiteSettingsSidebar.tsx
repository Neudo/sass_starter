"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Globe,
  Target,
  TrendingUp,
  Download,
  AlertTriangle,
} from "lucide-react";

interface SiteSettingsSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  domain: string;
}

const tabs = [
  {
    id: "general",
    label: "General",
    icon: Settings,
    description: "Basic site settings",
  },
  {
    id: "public-dashboard",
    label: "Public Dashboard",
    icon: Globe,
    description: "Share your analytics publicly",
  },
  {
    id: "goals",
    label: "Goals",
    icon: Target,
    description: "Track conversion goals",
  },
  {
    id: "funnels",
    label: "Funnels",
    icon: TrendingUp,
    description: "Analyze user journeys",
  },
  {
    id: "imports-exports",
    label: "Imports & Exports",
    icon: Download,
    description: "Data management",
  },
  {
    id: "danger-zone",
    label: "Danger Zone",
    icon: AlertTriangle,
    description: "Delete site or reset data",
  },
];

export function SiteSettingsSidebar({
  activeTab,
  onTabChange,
  domain,
}: SiteSettingsSidebarProps) {
  return (
    <div className="w-64 border-r bg-muted/10 p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">{domain}</h2>
        <p className="text-sm text-muted-foreground">Site Settings</p>
      </div>

      <nav className="space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isDangerZone = tab.id === "danger-zone";

          return (
            <Button
              key={tab.id}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-auto p-3",
                isActive && "bg-secondary",
                isDangerZone && "text-destructive hover:text-destructive"
              )}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium">{tab.label}</div>
                <div className="text-xs text-muted-foreground">
                  {tab.description}
                </div>
              </div>
            </Button>
          );
        })}
      </nav>
    </div>
  );
}
