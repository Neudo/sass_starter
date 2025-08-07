"use client";
import React from "react";
import { useUserSites } from "@/hooks/useUserSites";
import Link from "next/link";

export default function DashboardStart({ user }: { user: { id: string } }) {
  const { data: sites, isLoading, error } = useUserSites(user.id);

  if (isLoading) return <div>Loading…</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <h1 className="text-2xl font-bold">My sites</h1>
      <div className="sites flex flex-row flex-wrap gap-2 justify-center">
        {sites?.map((site: { id: string; domain: string }) => (
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
