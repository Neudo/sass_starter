"use client";

import { GoogleAnalyticsImport } from "@/components/imports-exports/GoogleAnalyticsImport";
import { CsvImport } from "@/components/imports-exports/CsvImport";
import { DataExport } from "@/components/imports-exports/DataExport";

interface ImportsExportsClientProps {
  siteId: string;
  domain: string;
  isGoogleConnected: boolean;
}

export function ImportsExportsClient({
  siteId,
  domain,
  isGoogleConnected,
}: ImportsExportsClientProps) {


  return (
    <div className="space-y-6">
      <GoogleAnalyticsImport
        siteId={siteId}
        domain={domain}
        isGoogleConnected={isGoogleConnected}
      />
      
      <CsvImport siteId={siteId} />
      
      <DataExport domain={domain} />
    </div>
  );
}
