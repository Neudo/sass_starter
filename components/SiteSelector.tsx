"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    router.push(`/dashboard/${domain}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 justify-between w-full">
      <Select value={currentDomain} onValueChange={handleSiteChange}>
        <SelectTrigger className="w-[180px] md:w-[280]">
          <SelectValue placeholder="Select a site" />
        </SelectTrigger>
        <SelectContent>
          {sites.map((site) => (
            <SelectItem key={site.id} value={site.domain}>
              {site.domain}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={() => router.push("/dashboard")}>
        View all sites
      </Button>
    </div>
  );
}
