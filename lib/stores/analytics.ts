import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { normalizeReferrer, getChannel } from "@/lib/referrer-helper";
import { getPreviousDateRange, DateRangeOption } from "@/components/DateFilter";

export interface Filter {
  type: FilterType;
  value: string;
  label?: string;
}

export type FilterType =
  | "country"
  | "region"
  | "city"
  | "browser"
  | "os"
  | "screen_size"
  | "channel"
  | "referrer_domain"
  | "utm_source"
  | "utm_medium"
  | "utm_campaign"
  | "utm_term"
  | "utm_content"
  | "visited_page"
  | "entry_page"
  | "exit_page";

interface PageView {
  session_id: string;
  page_path: string;
  created_at: string;
  duration_seconds?: number;
}

export interface Session {
  id: string;
  site_id: string;
  created_at: string;
  last_seen: string;
  country: string | null;
  region: string | null;
  city: string | null;
  browser: string | null;
  os: string | null;
  screen_size: string | null;
  language: string | null;
  referrer: string | null;
  referrer_domain: string | null;
  page_views?: Array<{ page_path: string; duration_seconds?: number }>;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
}

export interface AnalyticsData {
  countries: Array<{ name: string; count: number; percentage: number }>;
  regions: Array<{
    name: string;
    count: number;
    percentage: number;
    country?: string;
  }>;
  cities: Array<{
    name: string;
    count: number;
    percentage: number;
    country?: string;
  }>;
  languages: Array<{ name: string; count: number; percentage: number }>;
  devices: {
    browsers: Array<{ name: string; count: number; percentage: number }>;
    os: Array<{ name: string; count: number; percentage: number }>;
    screenSizes: Array<{ name: string; count: number; percentage: number }>;
  };
  pages: {
    topPages: Array<{ page: string; count: number; percentage: number }>;
    entryPages: Array<{ page: string; count: number; percentage: number }>;
    exitPages: Array<{ page: string; count: number; percentage: number }>;
  };
  sources: {
    channels: Array<{ name: string; count: number; percentage: number }>;
    sources: Array<{
      name: string;
      rawValue?: string;
      count: number;
      percentage: number;
    }>;
    campaigns: Array<{ name: string; count: number; percentage: number }>;
  };
  metrics: {
    visitors: number;
    totalVisits: number;
    totalPageviews: number;
    viewsPerVisit: number;
    bounceRate: number;
    avgDuration: number;
    change?: {
      visitors: number;
      totalVisits: number;
      totalPageviews: number;
      bounceRate: number;
      avgDuration: number;
    };
  };
}

interface AnalyticsStore {
  // State
  siteId: string | null;
  dateRange: { from: Date; to: Date } | null;
  dateRangeOption: string;
  allSessions: Session[];
  previousSessions: Session[];
  loading: boolean;
  error: string | null;

  // Filters
  filters: Filter[];

  // Selected metric for filtering (null means show all sessions)
  selectedMetric: string | null;

  // Cached analytics data
  cachedAnalyticsData: AnalyticsData | null;
  lastFiltersHash: string;

  // Computed data (getters)
  getFilteredSessions: () => Session[];
  getSessionsForAnalytics: () => Session[];
  getAnalyticsData: () => AnalyticsData;
  updateCache: () => void;
  calculateTrends: (
    currentMetrics: {
      visitors: number;
      totalPageviews: number;
      bounceRate: number;
      avgDuration: number;
    },
    previousMetrics: {
      visitors: number;
      totalPageviews: number;
      bounceRate: number;
      avgDuration: number;
    }
  ) => {
    visitors: number;
    totalVisits: number;
    totalPageviews: number;
    bounceRate: number;
    avgDuration: number;
  };

  // Actions
  fetchAllData: (
    siteId: string,
    dateRange: { from: Date; to: Date } | null,
    dateRangeOption: string
  ) => Promise<void>;
  addFilter: (filter: Filter) => void;
  removeFilter: (type: FilterType, value: string) => void;
  clearFilters: () => void;
  clearFiltersByType: (type: FilterType) => void;
  hasFilter: (type: FilterType, value: string) => boolean;
  setSelectedMetric: (metric: string | null) => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  // Initial state
  siteId: null,
  dateRange: null,
  dateRangeOption: "alltime",
  allSessions: [],
  previousSessions: [],
  loading: false,
  error: null,
  filters: [],
  selectedMetric: "visitors", // Default to visitors filter
  cachedAnalyticsData: null,
  lastFiltersHash: "",

  // Computed getters
  getFilteredSessions: () => {
    const { allSessions, filters } = get();

    // Apply regular filters (not metric-based filtering)
    return allSessions.filter((session) => {
      return filters.every((filter) => {
        switch (filter.type) {
          case "country":
            return session.country === filter.value;
          case "region":
            return session.region === filter.value;
          case "city":
            return session.city === filter.value;
          case "browser":
            return session.browser === filter.value;
          case "os":
            return session.os === filter.value;
          case "screen_size":
            return session.screen_size === filter.value;
          case "channel":
            // Calculate channel for this session
            const channel = getChannel(
              session.utm_medium,
              session.utm_source,
              session.referrer_domain
            );
            return channel === filter.value;
          case "referrer_domain":
            return session.referrer_domain === filter.value;
          case "utm_source":
            return session.utm_source === filter.value;
          case "utm_medium":
            return session.utm_medium === filter.value;
          case "utm_campaign":
            return session.utm_campaign === filter.value;
          case "utm_term":
            return session.utm_term === filter.value;
          case "utm_content":
            return session.utm_content === filter.value;
          case "visited_page":
            return (
              session.page_views?.some((pv) => pv.page_path === filter.value) ||
              false
            );
          case "entry_page":
            return session.page_views?.[0]?.page_path === filter.value;
          case "exit_page":
            const pageViews = session.page_views || [];
            return (
              pageViews.length > 0 &&
              pageViews[pageViews.length - 1].page_path === filter.value
            );
          default:
            return true;
        }
      });
    });
  },

  // Get sessions for analytics display - always returns all filtered sessions
  // Analytics should always show complete data regardless of metric mode
  getSessionsForAnalytics: () => {
    const state = get();
    return state.getFilteredSessions();
  },

  getAnalyticsData: () => {
    const state = get();
    const { filters, selectedMetric, cachedAnalyticsData, lastFiltersHash } =
      state;

    // Create a hash of current filters AND selected metric to check if we need to recalculate
    const currentFiltersHash = JSON.stringify({ filters, selectedMetric });

    // If we have cached data and filters haven't changed, return cached data
    if (cachedAnalyticsData && lastFiltersHash === currentFiltersHash) {
      return cachedAnalyticsData;
    }

    // Get sessions for metrics (always all filtered sessions, not affected by metric selection)
    const filteredSessions = state.getFilteredSessions();

    // Get sessions for analytics displays (affected by metric selection)
    const analyticsFilteredSessions = state.getSessionsForAnalytics();

    // Calculate all analytics data from filtered sessions
    // This is where we'll move all the computation logic

    // Countries (use analytics filtered sessions)
    const countryCounts: Record<string, number> = {};
    analyticsFilteredSessions.forEach((session) => {
      if (session.country) {
        countryCounts[session.country] =
          (countryCounts[session.country] || 0) + 1;
      }
    });

    const countryTotal = Object.values(countryCounts).reduce(
      (a, b) => a + b,
      0
    );
    const countries = Object.entries(countryCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: countryTotal > 0 ? (count / countryTotal) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Regions
    const regionCounts: Record<string, { count: number; country?: string }> =
      {};
    analyticsFilteredSessions.forEach((session) => {
      if (session.region) {
        const regionKey = session.region;
        if (!regionCounts[regionKey]) {
          regionCounts[regionKey] = {
            count: 0,
            country: session.country || undefined,
          };
        }
        regionCounts[regionKey].count += 1;
      }
    });

    const regionTotal = Object.values(regionCounts).reduce(
      (sum, region) => sum + region.count,
      0
    );
    const regions = Object.entries(regionCounts)
      .map(([name, data]) => ({
        name,
        count: data.count,
        percentage: regionTotal > 0 ? (data.count / regionTotal) * 100 : 0,
        country: data.country,
      }))
      .sort((a, b) => b.count - a.count);

    // Cities
    const cityCounts: Record<string, { count: number; country?: string }> = {};
    analyticsFilteredSessions.forEach((session) => {
      if (session.city) {
        const cityKey = session.city;
        if (!cityCounts[cityKey]) {
          cityCounts[cityKey] = {
            count: 0,
            country: session.country || undefined,
          };
        }
        cityCounts[cityKey].count += 1;
      }
    });

    const cityTotal = Object.values(cityCounts).reduce(
      (sum, city) => sum + city.count,
      0
    );
    const cities = Object.entries(cityCounts)
      .map(([name, data]) => ({
        name,
        count: data.count,
        percentage: cityTotal > 0 ? (data.count / cityTotal) * 100 : 0,
        country: data.country,
      }))
      .sort((a, b) => b.count - a.count);

    // Languages
    const languageCounts: Record<string, number> = {};
    analyticsFilteredSessions.forEach((session) => {
      if (session.language) {
        languageCounts[session.language] =
          (languageCounts[session.language] || 0) + 1;
      }
    });

    const languageTotal = Object.values(languageCounts).reduce(
      (a, b) => a + b,
      0
    );
    const languages = Object.entries(languageCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: languageTotal > 0 ? (count / languageTotal) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Pages
    const pageCounts: Record<string, number> = {};
    const entryCounts: Record<string, number> = {};
    const exitCounts: Record<string, number> = {};

    analyticsFilteredSessions.forEach((session) => {
      const pageViews = session.page_views || [];

      // Count all visited pages
      pageViews.forEach((pv) => {
        const page = pv.page_path;
        pageCounts[page] = (pageCounts[page] || 0) + 1;
      });

      // Entry pages (first page)
      if (pageViews.length > 0) {
        const entryPage = pageViews[0].page_path;
        entryCounts[entryPage] = (entryCounts[entryPage] || 0) + 1;
      }

      // Exit pages (last page)
      if (pageViews.length > 0) {
        const exitPage = pageViews[pageViews.length - 1].page_path;
        exitCounts[exitPage] = (exitCounts[exitPage] || 0) + 1;
      }
    });

    const pageTotal = Object.values(pageCounts).reduce((a, b) => a + b, 0);
    const entryTotal = Object.values(entryCounts).reduce((a, b) => a + b, 0);
    const exitTotal = Object.values(exitCounts).reduce((a, b) => a + b, 0);

    const topPages = Object.entries(pageCounts)
      .map(([page, count]) => ({
        page,
        count,
        percentage: pageTotal > 0 ? (count / pageTotal) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const entryPages = Object.entries(entryCounts)
      .map(([page, count]) => ({
        page,
        count,
        percentage: entryTotal > 0 ? (count / entryTotal) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const exitPages = Object.entries(exitCounts)
      .map(([page, count]) => ({
        page,
        count,
        percentage: exitTotal > 0 ? (count / exitTotal) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Devices
    const browserCounts: Record<string, number> = {};
    const osCounts: Record<string, number> = {};
    const screenCounts: Record<string, number> = {};

    analyticsFilteredSessions.forEach((session) => {
      if (session.browser) {
        browserCounts[session.browser] =
          (browserCounts[session.browser] || 0) + 1;
      }
      if (session.os) {
        osCounts[session.os] = (osCounts[session.os] || 0) + 1;
      }
      if (session.screen_size) {
        screenCounts[session.screen_size] =
          (screenCounts[session.screen_size] || 0) + 1;
      }
    });

    const browserTotal = Object.values(browserCounts).reduce(
      (a, b) => a + b,
      0
    );
    const osTotal = Object.values(osCounts).reduce((a, b) => a + b, 0);
    const screenTotal = Object.values(screenCounts).reduce((a, b) => a + b, 0);

    const browsers = Object.entries(browserCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: browserTotal > 0 ? (count / browserTotal) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const os = Object.entries(osCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: osTotal > 0 ? (count / osTotal) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const screenSizes = Object.entries(screenCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: screenTotal > 0 ? (count / screenTotal) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Sources
    const channelCounts: Record<string, number> = {};
    const sourceCounts: Record<string, { count: number; displayName: string }> =
      {};

    analyticsFilteredSessions.forEach((session) => {
      // Channels
      const channel = getChannel(
        session.utm_medium,
        session.utm_source,
        session.referrer_domain
      );
      channelCounts[channel] = (channelCounts[channel] || 0) + 1;

      // Sources
      let rawSource =
        session.utm_source ||
        session.referrer_domain ||
        session.referrer ||
        "direct";

      // Skip self-referrals
      if (rawSource && rawSource.toLowerCase().includes("hectoranalytics")) {
        return;
      }

      if (
        session.referrer_domain &&
        session.referrer &&
        session.referrer.includes("algolia.com")
      ) {
        rawSource = session.referrer_domain;
      }

      const sourceInfo = normalizeReferrer(rawSource, !!session.utm_source);
      const displayName = sourceInfo.displayName;

      if (!sourceCounts[rawSource]) {
        sourceCounts[rawSource] = { count: 0, displayName };
      }
      sourceCounts[rawSource].count += 1;
    });

    const channelTotal = Object.values(channelCounts).reduce(
      (a, b) => a + b,
      0
    );
    const sourceTotal = Object.values(sourceCounts).reduce(
      (sum, item) => sum + item.count,
      0
    );

    const channels = Object.entries(channelCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: channelTotal > 0 ? (count / channelTotal) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const sources = Object.entries(sourceCounts)
      .map(([rawValue, data]) => ({
        name: data.displayName,
        rawValue,
        count: data.count,
        percentage: sourceTotal > 0 ? (data.count / sourceTotal) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Plausible-style metrics calculation
    const totalVisits = filteredSessions.length; // Total sessions/visits
    
    // Following Plausible's approach: 1 session = 1 visitor
    // "If a person visits from multiple devices or on multiple days, they are counted as separate visitors"
    const visitors = totalVisits;
    
    let totalPageviews = 0;
    let totalDuration = 0;
    let bounceCount = 0;

    filteredSessions.forEach((session) => {
      // Calculate pageviews for this session
      const pageViewsCount = Array.isArray(session.page_views)
        ? session.page_views.length
        : 1;
      totalPageviews += pageViewsCount;

      // Calculate session duration
      const sessionPageViews = session.page_views || [];
      let sessionTotalDuration = 0;

      sessionPageViews.forEach((pv) => {
        const pageDuration = pv.duration_seconds || 0;
        const cappedPageDuration = Math.min(pageDuration, 1800); // 30min cap
        sessionTotalDuration += cappedPageDuration;
      });

      if (sessionTotalDuration > 0) {
        totalDuration += sessionTotalDuration;
      }

      // Count bounces (sessions with only 1 pageview)
      if (pageViewsCount === 1) {
        bounceCount++;
      }
    });

    // Plausible-style metric calculations
    const viewsPerVisit =
      totalVisits > 0
        ? parseFloat((totalPageviews / totalVisits).toFixed(2))
        : 0;

    const bounceRate =
      totalVisits > 0
        ? parseFloat(((bounceCount / totalVisits) * 100).toFixed(1))
        : 0;

    const avgDuration =
      totalVisits > 0 ? Math.round(totalDuration / totalVisits) : 0;

    // Calculate trends using previous period data
    const { previousSessions, calculateTrends, dateRangeOption } = state;
    let change;

    // Always calculate trends for supported date ranges (not realtime or alltime)
    const shouldCalculateTrends = !["realtime", "alltime"].includes(
      dateRangeOption
    );

    if (shouldCalculateTrends) {
      // Calculate metrics for previous period, even if no sessions
      const prevTotalVisits = previousSessions.length;
      const prevVisitors = prevTotalVisits; // 1 session = 1 visitor
      
      let prevTotalPageviews = 0;
      let prevBounceCount = 0;
      let prevTotalDuration = 0;

      previousSessions.forEach((session) => {
        const pageViewsCount = Array.isArray(session.page_views)
          ? session.page_views.length
          : 1;
        prevTotalPageviews += pageViewsCount;

        // Count bounces for previous period
        if (pageViewsCount === 1) {
          prevBounceCount++;
        }

        // Calculate total session duration for previous period from individual page durations
        const prevSessionPageViews = session.page_views || [];
        let prevSessionTotalDuration = 0;

        prevSessionPageViews.forEach((pv) => {
          const pageDuration = pv.duration_seconds || 0;
          // Cap individual page duration at 30 minutes to avoid unrealistic values
          const cappedPageDuration = Math.min(pageDuration, 1800);
          prevSessionTotalDuration += cappedPageDuration;
        });

        // Only count sessions with positive duration
        if (prevSessionTotalDuration > 0) {
          prevTotalDuration += prevSessionTotalDuration;
        }
      });

      const prevBounceRate =
        prevTotalVisits > 0 ? (prevBounceCount / prevTotalVisits) * 100 : 0;
      const prevAvgDuration =
        prevTotalVisits > 0
          ? Math.round(prevTotalDuration / prevTotalVisits)
          : 0;

      const previousMetrics = {
        visitors: prevVisitors,
        totalVisits: prevTotalVisits,
        totalPageviews: prevTotalPageviews,
        bounceRate: prevBounceRate,
        avgDuration: prevAvgDuration,
      };

      const currentMetrics = {
        visitors,
        totalVisits,
        totalPageviews,
        bounceRate,
        avgDuration,
      };

      change = calculateTrends(currentMetrics, previousMetrics);
    }

    const analyticsData = {
      countries,
      regions,
      cities,
      languages,
      devices: {
        browsers,
        os,
        screenSizes,
      },
      pages: {
        topPages,
        entryPages,
        exitPages,
      },
      sources: {
        channels,
        sources,
        campaigns: [], // UTM campaigns will be calculated separately when needed
      },
      metrics: {
        visitors,
        totalVisits,
        totalPageviews,
        viewsPerVisit,
        bounceRate,
        avgDuration,
        change,
      },
    };

    // Return fresh analytics data without caching during render
    return analyticsData;
  },

  updateCache: () => {
    const state = get();
    const { filters, selectedMetric } = state;

    // Create a hash of current filters and selected metric
    const currentFiltersHash = JSON.stringify({ filters, selectedMetric });

    // Only update cache if filters have actually changed
    if (state.lastFiltersHash !== currentFiltersHash) {
      const analyticsData = state.getAnalyticsData();
      set({
        cachedAnalyticsData: analyticsData,
        lastFiltersHash: currentFiltersHash,
      });
    }
  },

  calculateTrends: (
    currentMetrics: {
      visitors: number;
      totalPageviews: number;
      bounceRate: number;
      avgDuration: number;
    },
    previousMetrics: {
      visitors: number;
      totalPageviews: number;
      bounceRate: number;
      avgDuration: number;
    }
  ) => {
    const calculatePercentageChange = (
      current: number,
      previous: number
    ): number => {
      if (previous === 0) {
        return current > 0 ? 100 : 0;
      }
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      visitors: calculatePercentageChange(
        currentMetrics.visitors,
        previousMetrics.visitors
      ),
      totalVisits: calculatePercentageChange(
        currentMetrics.visitors,
        previousMetrics.visitors
      ),
      totalPageviews: calculatePercentageChange(
        currentMetrics.totalPageviews,
        previousMetrics.totalPageviews
      ),
      bounceRate: calculatePercentageChange(
        currentMetrics.bounceRate,
        previousMetrics.bounceRate
      ),
      avgDuration: calculatePercentageChange(
        currentMetrics.avgDuration,
        previousMetrics.avgDuration
      ),
    };
  },

  // Actions
  fetchAllData: async (
    siteId: string,
    dateRange: { from: Date; to: Date } | null,
    dateRangeOption: string
  ) => {
    set({ loading: true, error: null, siteId, dateRange, dateRangeOption });

    try {
      const supabase = createClient();
      const isRealtimeMode = dateRangeOption === "realtime";

      let query = supabase.from("sessions").select("*").eq("site_id", siteId);

      if (isRealtimeMode) {
        const thirtyMinutesAgo = new Date(
          Date.now() - 30 * 60 * 1000
        ).toISOString();
        query = query.gte("last_seen", thirtyMinutesAgo);
      } else if (dateRange) {
        query = query
          .gte("last_seen", dateRange.from.toISOString())
          .lte("last_seen", dateRange.to.toISOString());
      }

      const { data: sessions, error } = await query;

      if (error) {
        throw error;
      }

      // Fetch page views for all sessions
      const sessionIds = sessions?.map((s) => s.id) || [];
      let pageViewsData: PageView[] = [];

      if (sessionIds.length > 0) {
        let pageViewQuery = supabase
          .from("page_views")
          .select("session_id, page_path, created_at, duration_seconds")
          .in("session_id", sessionIds);

        // Apply same date filter as sessions for consistency
        if (isRealtimeMode) {
          const thirtyMinutesAgo = new Date(
            Date.now() - 30 * 60 * 1000
          ).toISOString();
          pageViewQuery = pageViewQuery.gte("created_at", thirtyMinutesAgo);
        } else if (dateRange) {
          pageViewQuery = pageViewQuery
            .gte("created_at", dateRange.from.toISOString())
            .lte("created_at", dateRange.to.toISOString());
        }

        const { data: pageViews } = await pageViewQuery.order("created_at", {
          ascending: true,
        });

        pageViewsData = pageViews || [];
      }

      // Group page views by session
      const pageViewsBySession = new Map<
        string,
        Array<{ page_path: string; duration_seconds?: number }>
      >();
      pageViewsData.forEach((pv) => {
        if (!pageViewsBySession.has(pv.session_id)) {
          pageViewsBySession.set(pv.session_id, []);
        }
        pageViewsBySession.get(pv.session_id)?.push({
          page_path: pv.page_path,
          duration_seconds: pv.duration_seconds,
        });
      });

      // Add page views to sessions
      const sessionsWithPageViews =
        sessions?.map((session) => ({
          ...session,
          page_views: pageViewsBySession.get(session.id) || [],
        })) || [];

      // Fetch previous period data for trends
      let previousSessions: Session[] = [];
      const previousRange = getPreviousDateRange(
        dateRangeOption as DateRangeOption
      );

      if (previousRange && !isRealtimeMode) {
        const previousQuery = supabase
          .from("sessions")
          .select("*")
          .eq("site_id", siteId)
          .gte("last_seen", previousRange.from.toISOString())
          .lte("last_seen", previousRange.to.toISOString());

        const { data: prevSessions, error: prevError } = await previousQuery;

        if (!prevError && prevSessions) {
          // Fetch page views for previous sessions
          const prevSessionIds = prevSessions?.map((s) => s.id) || [];
          let prevPageViewsData: PageView[] = [];

          if (prevSessionIds.length > 0) {
            let prevPageViewQuery = supabase
              .from("page_views")
              .select("session_id, page_path, created_at, duration_seconds")
              .in("session_id", prevSessionIds);

            // Apply date filter for previous period consistency
            if (previousRange) {
              prevPageViewQuery = prevPageViewQuery
                .gte("created_at", previousRange.from.toISOString())
                .lte("created_at", previousRange.to.toISOString());
            }

            const { data: prevPageViews } = await prevPageViewQuery.order(
              "created_at",
              { ascending: true }
            );

            prevPageViewsData = prevPageViews || [];
          }

          // Group page views by session
          const prevPageViewsBySession = new Map<
            string,
            Array<{ page_path: string; duration_seconds?: number }>
          >();
          prevPageViewsData.forEach((pv) => {
            if (!prevPageViewsBySession.has(pv.session_id)) {
              prevPageViewsBySession.set(pv.session_id, []);
            }
            prevPageViewsBySession.get(pv.session_id)?.push({
              page_path: pv.page_path,
              duration_seconds: pv.duration_seconds,
            });
          });

          // Add page views to previous sessions
          previousSessions =
            prevSessions?.map((session) => ({
              ...session,
              page_views: prevPageViewsBySession.get(session.id) || [],
            })) || [];
        }
      }

      set({
        allSessions: sessionsWithPageViews,
        previousSessions,
        loading: false,
        cachedAnalyticsData: null, // Invalidate cache when new data is loaded
        lastFiltersHash: "",
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
        allSessions: [],
        previousSessions: [],
      });
    }
  },

  addFilter: (filter: Filter) => {
    const { filters, updateCache } = get();
    const existingIndex = filters.findIndex(
      (f) => f.type === filter.type && f.value === filter.value
    );

    if (existingIndex === -1) {
      set({ filters: [...filters, filter] });
      // Update cache after filter change
      updateCache();
    }
  },

  removeFilter: (type: FilterType, value: string) => {
    const { filters, updateCache } = get();
    set({
      filters: filters.filter((f) => !(f.type === type && f.value === value)),
    });
    // Update cache after filter change
    updateCache();
  },

  clearFilters: () => {
    const { updateCache } = get();
    set({ filters: [] });
    // Update cache after clearing filters
    updateCache();
  },

  clearFiltersByType: (type: FilterType) => {
    const { filters, updateCache } = get();
    set({
      filters: filters.filter((f) => f.type !== type),
    });
    // Update cache after filter change
    updateCache();
  },

  hasFilter: (type: FilterType, value: string) => {
    const { filters } = get();
    return filters.some((f) => f.type === type && f.value === value);
  },

  setSelectedMetric: (metric: string | null) => {
    const { updateCache, selectedMetric: currentMetric } = get();

    // If clicking the same metric, toggle it off (set to null)
    // Otherwise, set the new metric
    const newMetric = currentMetric === metric ? null : metric;

    set({ selectedMetric: newMetric });
    // Update cache after metric change
    updateCache();
  },
}));
