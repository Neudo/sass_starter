import { useState, useEffect } from "react";
import { DateRangeOption } from "@/components/DateFilter";

interface PersistedFilters {
  dateRange: DateRangeOption;
}

const DEFAULT_FILTERS: PersistedFilters = {
  dateRange: "last7days",
};

/**
 * Hook pour persister les filtres de dashboard dans localStorage
 */
export function usePersistedFilters(domain: string) {
  const [filters, setFilters] = useState<PersistedFilters>(DEFAULT_FILTERS);
  const [isLoaded, setIsLoaded] = useState(false);

  const periodKey = `period__${domain}`;

  // Charger les filtres depuis localStorage au montage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedDateRange = localStorage.getItem(periodKey) as DateRangeOption;

      if (savedDateRange && isValidDateRange(savedDateRange)) {
        setFilters((prev) => ({
          ...prev,
          dateRange: savedDateRange,
        }));
      }
    } catch (error) {
      console.warn("Failed to load persisted filters:", error);
    } finally {
      setIsLoaded(true);
    }
  }, [periodKey]);

  // Sauvegarder la période sélectionnée
  const setDateRange = (dateRange: DateRangeOption) => {
    setFilters((prev) => ({
      ...prev,
      dateRange,
    }));

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(periodKey, dateRange);
      } catch (error) {
        console.warn("Failed to save date range to localStorage:", error);
      }
    }
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(periodKey);
      } catch (error) {
        console.warn("Failed to clear filters from localStorage:", error);
      }
    }
  };

  return {
    filters,
    setDateRange,
    resetFilters,
    isLoaded, // Pour éviter les hydration mismatches
  };
}

// Validation des options de date valides
function isValidDateRange(value: string): value is DateRangeOption {
  const validRanges: DateRangeOption[] = [
    "today",
    "yesterday",
    "last7days",
    "last30days",
    "last90days",
    "alltime",
    "realtime",
  ];

  return validRanges.includes(value as DateRangeOption);
}
