"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { getDayBoundsInTimezone } from "@/lib/constants/timezones";

export type DateRangeOption =
  | "today"
  | "yesterday"
  | "last7days"
  | "last30days"
  | "last90days"
  | "alltime"
  | "realtime";

interface DateFilterProps {
  selectedRange: DateRangeOption;
  onRangeChange: (range: DateRangeOption) => void;
}

export function DateFilter({ selectedRange, onRangeChange }: DateFilterProps) {
  const options: { value: DateRangeOption; label: string }[] = [
    { value: "alltime", label: "All time" },
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last7days", label: "Last 7 days" },
    { value: "last30days", label: "Last 30 days" },
    { value: "last90days", label: "Last 90 days" },
    { value: "realtime", label: "Realtime" },
  ];

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedRange} onValueChange={onRangeChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function getDateRange(
  option: DateRangeOption,
  timezone: string = "UTC"
): { from: Date; to: Date } | null {
  const now = new Date();

  // Get today's boundaries in the specified timezone
  const todayBounds = getDayBoundsInTimezone(timezone, now);
  const todayStart = todayBounds.start;
  const todayEnd = todayBounds.end;

  switch (option) {
    case "today":
      return {
        from: todayStart,
        to: todayEnd,
      };
    case "yesterday":
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const yesterdayBounds = getDayBoundsInTimezone(timezone, yesterday);
      return {
        from: yesterdayBounds.start,
        to: yesterdayBounds.end,
      };
    case "last7days":
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const sevenDaysAgoBounds = getDayBoundsInTimezone(timezone, sevenDaysAgo);
      return {
        from: sevenDaysAgoBounds.start,
        to: todayEnd,
      };
    case "last30days":
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgoBounds = getDayBoundsInTimezone(
        timezone,
        thirtyDaysAgo
      );
      return {
        from: thirtyDaysAgoBounds.start,
        to: todayEnd,
      };
    case "last90days":
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgoBounds = getDayBoundsInTimezone(
        timezone,
        ninetyDaysAgo
      );
      return {
        from: ninetyDaysAgoBounds.start,
        to: todayEnd,
      };
    case "alltime":
      return null; // No date filter
    case "realtime":
      // Last 30 minutes for realtime data
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
      return {
        from: thirtyMinutesAgo,
        to: now,
      };
  }
}

export function getPreviousDateRange(
  option: DateRangeOption,
  timezone: string = "UTC"
): { from: Date; to: Date } | null {
  const now = new Date();

  switch (option) {
    case "today":
      // Previous period: yesterday
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const yesterdayBounds = getDayBoundsInTimezone(timezone, yesterday);
      return {
        from: yesterdayBounds.start,
        to: yesterdayBounds.end,
      };
    case "yesterday":
      // Previous period: day before yesterday
      const dayBeforeYesterday = new Date(
        now.getTime() - 2 * 24 * 60 * 60 * 1000
      );
      const dayBeforeYesterdayBounds = getDayBoundsInTimezone(
        timezone,
        dayBeforeYesterday
      );
      return {
        from: dayBeforeYesterdayBounds.start,
        to: dayBeforeYesterdayBounds.end,
      };
    case "last7days":
      // Previous period: 7 days before the last 7 days (14 days ago to 7 days ago)
      const fourteenDaysAgo = new Date(
        now.getTime() - 14 * 24 * 60 * 60 * 1000
      );
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgoBounds = getDayBoundsInTimezone(
        timezone,
        fourteenDaysAgo
      );
      const sevenDaysAgoBounds = getDayBoundsInTimezone(timezone, sevenDaysAgo);
      return {
        from: fourteenDaysAgoBounds.start,
        to: sevenDaysAgoBounds.end,
      };
    case "last30days":
      // Previous period: 30 days before the last 30 days (60 days ago to 30 days ago)
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgoBounds = getDayBoundsInTimezone(timezone, sixtyDaysAgo);
      const thirtyDaysAgoBounds = getDayBoundsInTimezone(
        timezone,
        thirtyDaysAgo
      );
      return {
        from: sixtyDaysAgoBounds.start,
        to: thirtyDaysAgoBounds.end,
      };
    case "last90days":
      // Previous period: 90 days before the last 90 days (180 days ago to 90 days ago)
      const oneEightyDaysAgo = new Date(
        now.getTime() - 180 * 24 * 60 * 60 * 1000
      );
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      const oneEightyDaysAgoBounds = getDayBoundsInTimezone(
        timezone,
        oneEightyDaysAgo
      );
      const ninetyDaysAgoBounds = getDayBoundsInTimezone(
        timezone,
        ninetyDaysAgo
      );
      return {
        from: oneEightyDaysAgoBounds.start,
        to: ninetyDaysAgoBounds.end,
      };
    case "alltime":
      return null; // No comparison for all time
    case "realtime":
      // Previous period: 30 minutes before the current 30 minutes
      const sixtyMinutesAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
      return {
        from: sixtyMinutesAgo,
        to: thirtyMinutesAgo,
      };
  }
}
