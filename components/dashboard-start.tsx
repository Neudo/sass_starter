"use client";
import React from "react";
import { useUserSites } from "@/hooks/useUserSites";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Globe } from "lucide-react";

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
              Get started by adding your first website to track with Hector Analytics
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
          <Link href="/welcome">
            <Plus className="mr-2 h-4 w-4" />
            Add Site
          </Link>
        </Button>
      </div>
      <div className="sites flex flex-row flex-wrap gap-2 justify-center">
        {sites.map((site: { id: string; domain: string }) => (
          <Link
            key={site.id}
            href={`/dashboard/${site.domain}`}
            className="p-2 bg-primary w-full text-center max-w-[300px] text-primary-foreground hover:bg-primary/80 transition-colors cursor-pointer rounded-lg"
          >
            {site.domain}
          </Link>
        ))}
      </div>
    </>
  );
}
