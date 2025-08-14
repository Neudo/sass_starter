"use client";
import React, { useState } from "react";
import { useUserSites } from "@/hooks/useUserSites";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Globe, Users } from "lucide-react";
import Image from "next/image";

export function SiteFavicon({ domain }: { domain: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <Globe className="w-4 h-4 text-muted-foreground" />;
  }

  return (
    <Image
      src={`https://www.google.com/s2/favicons?domain=${domain}`}
      alt={`${domain} favicon`}
      className="w-5 h-5"
      onError={() => setHasError(true)}
      width={16}
      height={16}
    />
  );
}

export default function DashboardStart({ user }: { user: { id: string } }) {
  const { data: sites, isLoading, error } = useUserSites(user.id);

  if (isLoading) return <div>Loading…</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Show empty state if no sites
  if (!sites || sites.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-muted rounded-full w-fit">
              <Globe className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle>No websites yet</CardTitle>
            <CardDescription>
              Get started by adding your first website to track with Hector
              Analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild className="w-full">
              <Link href="/welcome">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Site
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My sites</h1>
        <Button asChild variant="outline">
          <Link href="/dashboard/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Site
          </Link>
        </Button>
      </div>
      <div className="sites grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sites.map(
          (site: { id: string; domain: string; visitors24h: number }) => (
            <Link key={site.id} href={`/dashboard/${site.domain}`}>
              <Card className="hover:shadow-md transition-all duration-200 border-muted-foreground/20 hover:border-muted-foreground/40 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3 pt-4">
                    <div className="w-8 h-8 rounded-md bg-white dark:bg-slate-700 border border-muted-foreground/20 flex items-center justify-center overflow-hidden">
                      <SiteFavicon domain={site.domain} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {site.domain}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>
                      {site.visitors24h} visitor
                      {site.visitors24h !== 1 ? "s" : ""} in last 24h
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        )}
      </div>
    </>
  );
}
