"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { DetailsModal } from "@/components/ui/details-modal";

interface PageData {
  page: string;
  count: number;
  percentage: number;
}

export function TopPagesCard({
  siteId,
  dateRange,
}: {
  siteId: string;
  dateRange?: { from: Date; to: Date } | null;
}) {
  const [topPages, setTopPages] = useState<PageData[]>([]);
  const [entryPages, setEntryPages] = useState<PageData[]>([]);
  const [exitPages, setExitPages] = useState<PageData[]>([]);
  const [allTopPages, setAllTopPages] = useState<PageData[]>([]);
  const [allEntryPages, setAllEntryPages] = useState<PageData[]>([]);
  const [allExitPages, setAllExitPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPageData = async () => {
      const supabase = createClient();

      // Fetch all sessions with entry_page, exit_page and page_views
      let query = supabase
        .from("sessions")
        .select("entry_page, exit_page, page_views")
        .eq("site_id", siteId);

      if (dateRange) {
        query = query
          .gte("created_at", dateRange.from.toISOString())
          .lte("created_at", dateRange.to.toISOString());
      }

      const { data: sessionsData } = await query;

      // Process top pages by counting all pages
      if (sessionsData) {
        const pageCounts: Record<string, number> = {};

        // Count each page - both entry and exit pages represent visited pages
        sessionsData.forEach((session) => {
          // Count entry page
          if (session.entry_page) {
            pageCounts[session.entry_page] =
              (pageCounts[session.entry_page] || 0) + 1;
          }

          // Count exit page (it's a separate page view if different from entry)
          if (session.exit_page) {
            // If it's the same as entry_page and page_views > 1, or if it's different, count it
            if (session.exit_page !== session.entry_page) {
              pageCounts[session.exit_page] =
                (pageCounts[session.exit_page] || 0) + 1;
            } else if (session.page_views && session.page_views > 1) {
              // Same page but multiple views
              pageCounts[session.exit_page] =
                (pageCounts[session.exit_page] || 0) + (session.page_views - 1);
            }
          }
        });

        const total = Object.values(pageCounts).reduce((a, b) => a + b, 0);
        const processedPages = Object.entries(pageCounts)
          .map(([page, count]) => ({
            page,
            count,
            percentage: (count / total) * 100,
          }))
          .sort((a, b) => b.count - a.count);

        setAllTopPages(processedPages);
        setTopPages(processedPages.slice(0, 7));

        // Process entry pages
        const entryCounts = sessionsData.reduce(
          (acc: Record<string, number>, item) => {
            const page = item.entry_page || "/";
            acc[page] = (acc[page] || 0) + 1;
            return acc;
          },
          {}
        );

        const entryTotal = Object.values(entryCounts).reduce(
          (a, b) => a + b,
          0
        );
        const processedEntryPages = Object.entries(entryCounts)
          .map(([page, count]) => ({
            page,
            count,
            percentage: (count / entryTotal) * 100,
          }))
          .sort((a, b) => b.count - a.count);

        setAllEntryPages(processedEntryPages);
        setEntryPages(processedEntryPages.slice(0, 7));

        // Process exit pages
        const exitCounts = sessionsData.reduce(
          (acc: Record<string, number>, item) => {
            const page = item.exit_page || "/";
            acc[page] = (acc[page] || 0) + 1;
            return acc;
          },
          {}
        );

        const exitTotal = Object.values(exitCounts).reduce((a, b) => a + b, 0);
        const processedExitPages = Object.entries(exitCounts)
          .map(([page, count]) => ({
            page,
            count,
            percentage: (count / exitTotal) * 100,
          }))
          .sort((a, b) => b.count - a.count);

        setAllExitPages(processedExitPages);
        setExitPages(processedExitPages.slice(0, 7));
      }

      setLoading(false);
    };

    fetchPageData();
  }, [siteId, dateRange]);

  const renderList = (
    data: PageData[],
    allData?: PageData[],
    title?: string
  ) => {
    if (loading) {
      return <div className="text-muted-foreground">Loading...</div>;
    }

    if (data.length === 0) {
      return <div className="text-muted-foreground">No data available</div>;
    }

    const renderItems = (items: PageData[]) => (
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between items-center text-sm relative">
              <div
                className="absolute top-0 bottom-0 left-0 dark:bg-gray-500 bg-slate-500 opacity-15 transition-all"
                style={{ width: `${item.percentage}%` }}
              />
              <span
                className="truncate max-w-[200px] p-2 text-sm"
                title={item.page}
              >
                {item.page}
              </span>
              <span className="text-muted-foreground ml-2">
                {item.count} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    );

    return (
      <>
        {renderItems(data)}
        {allData && allData.length > 7 && (
          <DetailsModal
            title={title || "All pages"}
            description={`Showing ${allData.length} pages total`}
            itemCount={allData.length}
          >
            {renderItems(allData)}
          </DetailsModal>
        )}
      </>
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
        {renderList(topPages, allTopPages, "All visited pages")}
      </TabsContent>
      <TabsContent value="entry-pages" className="mt-4">
        {renderList(entryPages, allEntryPages, "All entry pages")}
      </TabsContent>
      <TabsContent value="exit-pages" className="mt-4">
        {renderList(exitPages, allExitPages, "All exit pages")}
      </TabsContent>
    </Tabs>
  );
}
