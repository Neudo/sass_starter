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

  return (
    <div className="flex flex-wrap items-center gap-4 justify-between">
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
    </div>
  );
}
