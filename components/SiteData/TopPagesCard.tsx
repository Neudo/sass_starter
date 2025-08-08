"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface PageData {
  page: string;
  count: number;
  percentage: number;
}

export function TopPagesCard({ siteId }: { siteId: string }) {
  const [topPages, setTopPages] = useState<PageData[]>([]);
  const [entryPages, setEntryPages] = useState<PageData[]>([]);
  const [exitPages, setExitPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPageData = async () => {
      const supabase = createClient();

      // Fetch all pages
      const { data: allPagesData } = await supabase
        .from("sessions")
        .select("page")
        .eq("site_id", siteId);

      // Fetch entry pages (first page of each session)
      const { data: entryPagesData } = await supabase
        .from("sessions")
        .select("entry_page")
        .eq("site_id", siteId);

      // Fetch exit pages
      const { data: exitPagesData } = await supabase
        .from("sessions")
        .select("exit_page")
        .eq("site_id", siteId);

      // Process top pages
      if (allPagesData) {
        const pageCounts = allPagesData.reduce(
          (acc: Record<string, number>, item) => {
            const page = item.page || "/";
            acc[page] = (acc[page] || 0) + 1;
            return acc;
          },
          {}
        );

        const total = Object.values(pageCounts).reduce((a, b) => a + b, 0);
        const processedPages = Object.entries(pageCounts)
          .map(([page, count]) => ({
            page,
            count,
            percentage: (count / total) * 100,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setTopPages(processedPages);
      }

      // Process entry pages
      if (entryPagesData) {
        const entryCounts = entryPagesData.reduce(
          (acc: Record<string, number>, item) => {
            const page = item.entry_page || "/";
            acc[page] = (acc[page] || 0) + 1;
            return acc;
          },
          {}
        );

        const total = Object.values(entryCounts).reduce((a, b) => a + b, 0);
        const processedEntryPages = Object.entries(entryCounts)
          .map(([page, count]) => ({
            page,
            count,
            percentage: (count / total) * 100,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setEntryPages(processedEntryPages);
      }

      // Process exit pages
      if (exitPagesData) {
        const exitCounts = exitPagesData.reduce(
          (acc: Record<string, number>, item) => {
            const page = item.exit_page || "/";
            acc[page] = (acc[page] || 0) + 1;
            return acc;
          },
          {}
        );

        const total = Object.values(exitCounts).reduce((a, b) => a + b, 0);
        const processedExitPages = Object.entries(exitCounts)
          .map(([page, count]) => ({
            page,
            count,
            percentage: (count / total) * 100,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setExitPages(processedExitPages);
      }

      setLoading(false);
    };

    fetchPageData();
  }, [siteId]);

  const renderList = (data: PageData[]) => {
    if (loading) {
      return <div className="text-muted-foreground">Loading...</div>;
    }

    if (data.length === 0) {
      return <div className="text-muted-foreground">No data available</div>;
    }

    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="truncate max-w-[200px]" title={item.page}>
                {item.page}
              </span>
              <span className="text-muted-foreground ml-2">
                {item.count} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
            <Progress value={item.percentage} className="h-2" />
          </div>
        ))}
      </div>
    );
  };

  return (
    <Tabs defaultValue="top-pages" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="top-pages">Top Pages</TabsTrigger>
        <TabsTrigger value="entry-pages">Entry Pages</TabsTrigger>
        <TabsTrigger value="exit-pages">Exit Pages</TabsTrigger>
      </TabsList>
      <TabsContent value="top-pages" className="mt-4">
        {renderList(topPages)}
      </TabsContent>
      <TabsContent value="entry-pages" className="mt-4">
        {renderList(entryPages)}
      </TabsContent>
      <TabsContent value="exit-pages" className="mt-4">
        {renderList(exitPages)}
      </TabsContent>
    </Tabs>
  );
}
