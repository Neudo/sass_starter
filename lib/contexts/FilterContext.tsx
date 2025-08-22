"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type FilterType = 
  | "country"
  | "region"
  | "city"
  | "browser"
  | "os"
  | "screen_size"
  | "referrer_domain"
  | "utm_source"
  | "utm_medium"
  | "utm_campaign"
  | "visited_page"
  | "entry_page"
  | "exit_page";

export interface Filter {
  type: FilterType;
  value: string;
  label?: string;
}

interface FilterContextType {
  filters: Filter[];
  addFilter: (filter: Filter) => void;
  removeFilter: (type: FilterType, value: string) => void;
  clearFilters: () => void;
  clearFiltersByType: (type: FilterType) => void;
  hasFilter: (type: FilterType, value: string) => boolean;
  getFiltersByType: (type: FilterType) => Filter[];
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Filter[]>([]);

  const addFilter = (filter: Filter) => {
    setFilters((prev) => {
      // Remove existing filter of same type and value to avoid duplicates
      const filtered = prev.filter(
        (f) => !(f.type === filter.type && f.value === filter.value)
      );
      return [...filtered, filter];
    });
  };

  const removeFilter = (type: FilterType, value: string) => {
    setFilters((prev) =>
      prev.filter((f) => !(f.type === type && f.value === value))
    );
  };

  const clearFilters = () => {
    setFilters([]);
  };

  const clearFiltersByType = (type: FilterType) => {
    setFilters((prev) => prev.filter((f) => f.type !== type));
  };

  const hasFilter = (type: FilterType, value: string) => {
    return filters.some((f) => f.type === type && f.value === value);
  };

  const getFiltersByType = (type: FilterType) => {
    return filters.filter((f) => f.type === type);
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        addFilter,
        removeFilter,
        clearFilters,
        clearFiltersByType,
        hasFilter,
        getFiltersByType,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}