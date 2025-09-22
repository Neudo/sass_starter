/**
 * Analytics utility functions for formatting and processing data
 */

import { countryFlags } from "@/data/country-flags";

/**
 * Format duration from seconds to human-readable format
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
};

/**
 * Check if a session is a first visit
 * @param createdAt - Session creation date
 * @param lastSeen - Last seen date
 * @returns True if it's a first visit
 */
export const isFirstVisit = (
  createdAt: string | Date,
  lastSeen: string | Date
): boolean => {
  const created = new Date(createdAt);
  const last = new Date(lastSeen);
  const diffInMinutes = (last.getTime() - created.getTime()) / (1000 * 60);

  // Consider it a first visit if created_at and last_seen are within 30 minutes
  return diffInMinutes < 30;
};

/**
 * Get flag emoji for a country code or name
 * Supports both 2-letter country codes and full country names
 * @param countryCode - Country code (e.g., "US") or name (e.g., "United States")
 * @returns Flag emoji or default world emoji
 */
export const getFlagEmoji = (countryCode: string): string => {
  if (!countryCode || countryCode === "Unknown") return "🌍";

  // First check if it's a full country name in our mapping
  const flagFromName = countryFlags[countryCode];
  if (flagFromName) return flagFromName;

  // Check uppercase version
  const flagFromUppercase = countryFlags[countryCode.toUpperCase()];
  if (flagFromUppercase) return flagFromUppercase;

  // If it's a 2-letter country code, try to convert to flag emoji
  if (countryCode.length === 2) {
    try {
      const codePoints = countryCode
        .toUpperCase()
        .split("")
        .map((char) => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    } catch {
      return "🌍";
    }
  }

  // Fallback to world emoji
  return "🌍";
};

/**
 * Truncate text to a maximum length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Format a number with commas for thousands
 * @param num - Number to format
 * @returns Formatted number string
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

/**
 * Get percentage from count and total
 * @param count - Count value
 * @param total - Total value
 * @param decimals - Number of decimal places (default: 1)
 * @returns Percentage string
 */
export const getPercentage = (
  count: number,
  total: number,
  decimals = 1
): string => {
  if (total === 0) return "0";
  return ((count / total) * 100).toFixed(decimals);
};

/**
 * Parse UTM parameters from a URL
 * @param url - URL string
 * @returns Object with UTM parameters
 */
export const parseUTMParams = (url: string): Record<string, string | null> => {
  try {
    const urlObj = new URL(url);
    return {
      utm_source: urlObj.searchParams.get("utm_source"),
      utm_medium: urlObj.searchParams.get("utm_medium"),
      utm_campaign: urlObj.searchParams.get("utm_campaign"),
      utm_term: urlObj.searchParams.get("utm_term"),
      utm_content: urlObj.searchParams.get("utm_content"),
    };
  } catch {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_term: null,
      utm_content: null,
    };
  }
};

/**
 * Clean domain from URL
 * @param url - URL string
 * @returns Clean domain
 */
export const cleanDomain = (url: string): string => {
  if (!url) return "";

  return url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];
};
