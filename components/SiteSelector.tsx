"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { SiteFavicon } from "./dashboard-start";

interface Site {
  id: string;
  domain: string;
}

interface SiteSelectorProps {
  sites: Site[];
  currentDomain: string;
}

export function SiteSelector({ sites, currentDomain }: SiteSelectorProps) {
  const router = useRouter();

  const handleSiteChange = (domain: string) => {
    router.push(`/dashboard/${domain === "all" ? "" : domain}`);
  };

  const handleSiteSettings = () => {
    if (currentDomain !== "all") {
      router.push(`/dashboard/${currentDomain}/settings`);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4 justify-between">
      <div className="flex items-center gap-2">
        <Select value={currentDomain} onValueChange={handleSiteChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a site" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem className=" mb-2" value="all">
              All sites
            </SelectItem>
            <Separator />
            {sites.map((site) => (
              <SelectItem key={site.id} value={site.domain}>
                <SiteFavicon domain={site.domain} />
                {site.domain}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {currentDomain !== "all" && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleSiteSettings}
            className="h-10 w-10"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
