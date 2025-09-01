"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";

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
  option: DateRangeOption
): { from: Date; to: Date } | null {
  const now = new Date();
  // Use UTC for consistent timezone handling
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  switch (option) {
    case "today":
      return {
        from: todayUTC,
        to: new Date(todayUTC.getTime() + 24 * 60 * 60 * 1000 - 1),
      };
    case "yesterday":
      const yesterdayUTC = new Date(todayUTC.getTime() - 24 * 60 * 60 * 1000);
      return {
        from: yesterdayUTC,
        to: new Date(todayUTC.getTime() - 1),
      };
    case "last7days":
      const sevenDaysAgoUTC = new Date(todayUTC.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        from: sevenDaysAgoUTC,
        to: now,
      };
    case "last30days":
      const thirtyDaysAgoUTC = new Date(
        todayUTC.getTime() - 30 * 24 * 60 * 60 * 1000
      );
      return {
        from: thirtyDaysAgoUTC,
        to: now,
      };
    case "last90days":
      const ninetyDaysAgoUTC = new Date(
        todayUTC.getTime() - 90 * 24 * 60 * 60 * 1000
      );
      return {
        from: ninetyDaysAgoUTC,
        to: now,
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
  option: DateRangeOption
): { from: Date; to: Date } | null {
  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  switch (option) {
    case "today":
      // Previous period: yesterday
      const yesterdayUTC = new Date(todayUTC.getTime() - 24 * 60 * 60 * 1000);
      return {
        from: yesterdayUTC,
        to: new Date(todayUTC.getTime() - 1),
      };
    case "yesterday":
      // Previous period: day before yesterday
      const dayBeforeYesterdayUTC = new Date(todayUTC.getTime() - 2 * 24 * 60 * 60 * 1000);
      const yesterdayStartUTC = new Date(todayUTC.getTime() - 24 * 60 * 60 * 1000);
      return {
        from: dayBeforeYesterdayUTC,
        to: new Date(yesterdayStartUTC.getTime() - 1),
      };
    case "last7days":
      // Previous period: 7 days before the last 7 days (14 days ago to 7 days ago)
      const fourteenDaysAgoUTC = new Date(todayUTC.getTime() - 14 * 24 * 60 * 60 * 1000);
      const sevenDaysAgoUTC = new Date(todayUTC.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        from: fourteenDaysAgoUTC,
        to: sevenDaysAgoUTC,
      };
    case "last30days":
      // Previous period: 30 days before the last 30 days (60 days ago to 30 days ago)
      const sixtyDaysAgoUTC = new Date(todayUTC.getTime() - 60 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgoUTC = new Date(todayUTC.getTime() - 30 * 24 * 60 * 60 * 1000);
      return {
        from: sixtyDaysAgoUTC,
        to: thirtyDaysAgoUTC,
      };
    case "last90days":
      // Previous period: 90 days before the last 90 days (180 days ago to 90 days ago)
      const oneEightyDaysAgoUTC = new Date(todayUTC.getTime() - 180 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgoUTC = new Date(todayUTC.getTime() - 90 * 24 * 60 * 60 * 1000);
      return {
        from: oneEightyDaysAgoUTC,
        to: ninetyDaysAgoUTC,
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
