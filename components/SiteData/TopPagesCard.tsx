"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DetailsModal } from "@/components/ui/details-modal";
import { useFilters } from "@/lib/contexts/FilterContext";
import { applyFiltersToQuery, applyClientSideFilters } from "@/lib/filter-utils";

interface PageData {
  page: string;
  count: number;
  percentage: number;
}

export function TopPagesCard({
  siteId,
  dateRange,
  dateRangeOption = "today",
}: {
  siteId: string;
  dateRange?: { from: Date; to: Date } | null;
  dateRangeOption?: string;
}) {
  const [topPages, setTopPages] = useState<PageData[]>([]);
  const [entryPages, setEntryPages] = useState<PageData[]>([]);
  const [exitPages, setExitPages] = useState<PageData[]>([]);
  const [allTopPages, setAllTopPages] = useState<PageData[]>([]);
  const [allEntryPages, setAllEntryPages] = useState<PageData[]>([]);
  const [allExitPages, setAllExitPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);
  const { filters, addFilter, hasFilter, removeFilter } = useFilters();

  useEffect(() => {
    const fetchPageData = async () => {
      const supabase = createClient();

      const isRealtimeMode = dateRangeOption === "realtime";

      // Fetch all sessions with visited_pages
      let query = supabase
        .from("sessions")
        .select("visited_pages")
        .eq("site_id", siteId);

      if (isRealtimeMode) {
        // For realtime: get sessions active in last 30 minutes (based on last_seen)
        const thirtyMinutesAgo = new Date(
          Date.now() - 30 * 60 * 1000
        ).toISOString();
        query = query.gte("last_seen", thirtyMinutesAgo);
      } else if (dateRange) {
        // For other modes: filter by creation date
        query = query
          .gte("created_at", dateRange.from.toISOString())
          .lte("created_at", dateRange.to.toISOString());
      }

      // Apply active filters
      query = applyFiltersToQuery(query, filters);

      let { data: sessionsData } = await query;

      // Apply client-side filters for complex cases like exit pages
      if (sessionsData) {
        sessionsData = applyClientSideFilters(sessionsData, filters);
      }

      // Process top pages by counting all pages
      if (sessionsData) {
        const pageCounts: Record<string, number> = {};

        // Count each unique page visited per session using visited_pages array
        sessionsData.forEach((session) => {
          // Parse visited_pages array and count each page
          const visitedPages = Array.isArray(session.visited_pages)
            ? session.visited_pages
            : [];

          visitedPages.forEach((page: string) => {
            pageCounts[page] = (pageCounts[page] || 0) + 1;
          });
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

        // Process entry pages (first page in visited_pages)
        const entryCounts = sessionsData.reduce(
          (acc: Record<string, number>, item) => {
            const visitedPages = Array.isArray(item.visited_pages)
              ? item.visited_pages
              : [];
            if (visitedPages.length > 0) {
              const firstPage = visitedPages[0];
              acc[firstPage] = (acc[firstPage] || 0) + 1;
            }
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

        // Process exit pages (last page in visited_pages)
        const exitCounts = sessionsData.reduce(
          (acc: Record<string, number>, item) => {
            const visitedPages = Array.isArray(item.visited_pages)
              ? item.visited_pages
              : [];
            if (visitedPages.length > 0) {
              const lastPage = visitedPages[visitedPages.length - 1];
              acc[lastPage] = (acc[lastPage] || 0) + 1;
            }
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
  }, [siteId, dateRange, dateRangeOption, filters]);

  const handlePageClick = (type: "visited_page" | "entry_page" | "exit_page", value: string) => {
    if (hasFilter(type, value)) {
      removeFilter(type, value);
    } else {
      addFilter({ type, value, label: value });
    }
  };

  const renderList = (
    data: PageData[],
    allData?: PageData[],
    title?: string,
    clickType?: "visited_page" | "entry_page" | "exit_page"
  ) => {
    if (loading) {
      return <div className="text-muted-foreground">Loading...</div>;
    }

    if (data.length === 0) {
      return <div className="text-muted-foreground">No data available</div>;
    }

    const renderItems = (items: PageData[]) => (
      <div className="space-y-1">
        {items.map((item, index) => {
          const isActive = clickType && hasFilter(clickType, item.page);
          
          return (
            <div key={index} className="space-y-1">
              <div 
                className={`flex justify-between items-center text-sm relative ${
                  clickType ? "cursor-pointer hover:bg-muted/50 rounded transition-all" : ""
                } ${isActive ? "ring-2 ring-primary" : ""}`}
                onClick={() => clickType && handlePageClick(clickType, item.page)}
              >
                <div
                  className="absolute top-0 bottom-0 left-0 dark:bg-gray-500 bg-primary opacity-15 transition-all rounded-l"
                  style={{ width: `${item.percentage}%` }}
                />
                <span
                  className="truncate max-w-[200px] p-2 text-sm"
                  title={item.page}
                >
                  {item.page}
                </span>
                <span className="text-muted-foreground ml-2 pr-4">
                  {item.count} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          );
        })}
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
        {renderList(topPages, allTopPages, "All visited pages", "visited_page")}
      </TabsContent>
      <TabsContent value="entry-pages" className="mt-4">
        {renderList(entryPages, allEntryPages, "All entry pages", "entry_page")}
      </TabsContent>
      <TabsContent value="exit-pages" className="mt-4">
        {renderList(exitPages, allExitPages, "All exit pages", "exit_page")}
      </TabsContent>
    </Tabs>
  );
}
