import React from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashboardClient } from "@/components/DashboardClient";
import { notFound } from "next/navigation";

export default async function PublicDashboardPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;

  const getSiteData = async (domain: string) => {
    const { data, error } = await createAdminClient()
      .from("sites")
      .select("id, public_enabled")
      .eq("domain", domain)
      .single();
    
    if (error || !data) {
      throw new Error("Site not found");
    }
    
    return data;
  };

  try {
    const siteData = await getSiteData(domain);
    
    // Check if public dashboard is enabled
    if (!siteData.public_enabled) {
      return notFound();
    }

    // Create a mock userSites array for the public view
    const publicSite = {
      id: siteData.id,
      domain: domain
    };

    return (
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">{domain}</h1>
              <div className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                Public Dashboard
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-6">
          <DashboardClient
            siteId={siteData.id}
            domain={domain}
            userSites={[publicSite]}
            isPublic={true}
          />
        </div>
      </div>
    );
  } catch (error) {
    return notFound();
  }
}