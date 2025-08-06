"use client";
import React from "react";
import { useUserSites } from "@/hooks/useUserSites";
import Link from "next/link";

export default function DashboardStart({ user }: { user: { id: string } }) {
  const { data: sites, isLoading, error } = useUserSites(user.id);
  
  if (isLoading) return <div>Loading…</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold">My sites</h1>
      {sites?.map((site: { id: string; domain: string }) => (
        <Link
          key={site.id}
          href={`/dashboard/${site.domain}`}
          className="p-6 bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors cursor-pointer rounded-lg"
        >
          {site.domain}
        </Link>
      ))}
    </div>
  );
}
