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
      {sites?.map((site: { id: string; domain: string }) => (
        <Link key={site.id} href={`/dashboard/${site.domain}`}>
          {site.domain}
        </Link>
      ))}
    </div>
  );
}
