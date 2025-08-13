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
  | "alltime";

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
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (option) {
    case "today":
      return {
        from: today,
        to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
      };
    case "yesterday":
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        from: yesterday,
        to: new Date(today.getTime() - 1),
      };
    case "last7days":
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        from: sevenDaysAgo,
        to: now,
      };
    case "last30days":
      const thirtyDaysAgo = new Date(
        today.getTime() - 30 * 24 * 60 * 60 * 1000
      );
      return {
        from: thirtyDaysAgo,
        to: now,
      };
    case "last90days":
      const ninetyDaysAgo = new Date(
        today.getTime() - 90 * 24 * 60 * 60 * 1000
      );
      return {
        from: ninetyDaysAgo,
        to: now,
      };
    case "alltime":
      return null; // No date filter
  }
}
