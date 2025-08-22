"use client";

import React, { useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DetailsModal } from "@/components/ui/details-modal";
import { useAnalyticsStore } from "@/lib/stores/analytics";

interface PageData {
  page: string;
  count: number;
  percentage: number;
}

export function TopPagesCard() {
  const { addFilter, hasFilter, removeFilter, getAnalyticsData, loading } = useAnalyticsStore();
  const analyticsData = getAnalyticsData();

  // Convert analytics data to PageData format using useMemo
  const { topPages, entryPages, exitPages, allTopPages, allEntryPages, allExitPages } = useMemo(() => {
    return {
      topPages: analyticsData.pages.topPages.slice(0, 7),
      entryPages: analyticsData.pages.entryPages.slice(0, 7),
      exitPages: analyticsData.pages.exitPages.slice(0, 7),
      allTopPages: analyticsData.pages.topPages,
      allEntryPages: analyticsData.pages.entryPages,
      allExitPages: analyticsData.pages.exitPages,
    };
  }, [analyticsData.pages]);

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
