import { Filter } from "@/lib/contexts/FilterContext";

export function applyFiltersToQuery(query: any, filters: Filter[]) {
  filters.forEach((filter) => {
    if (filter.type === "country") {
      query = query.eq("country", filter.value);
    } else if (filter.type === "region") {
      query = query.eq("region", filter.value);
    } else if (filter.type === "city") {
      query = query.eq("city", filter.value);
    } else if (filter.type === "browser") {
      query = query.eq("browser", filter.value);
    } else if (filter.type === "os") {
      query = query.eq("os", filter.value);
    } else if (filter.type === "screen_size") {
      query = query.eq("screen_size", filter.value);
    } else if (filter.type === "referrer_domain") {
      query = query.eq("referrer_domain", filter.value);
    } else if (filter.type === "utm_source") {
      query = query.eq("utm_source", filter.value);
    } else if (filter.type === "utm_medium") {
      query = query.eq("utm_medium", filter.value);
    } else if (filter.type === "utm_campaign") {
      query = query.eq("utm_campaign", filter.value);
    } else if (filter.type === "visited_page") {
      // Check if page exists in visited_pages array
      query = query.contains("visited_pages", [filter.value]);
    } else if (filter.type === "entry_page") {
      // Check if page is the first element in visited_pages array (JSON index 0)
      query = query.eq("visited_pages->>0", filter.value);
    } else if (filter.type === "exit_page") {
      // For exit page, we'll use a PostgreSQL function to get the last element
      // Since Supabase doesn't support complex functions easily, let's use a workaround
      query = query.contains("visited_pages", [filter.value]);
    }
  });
  
  return query;
}

// Client-side filtering for complex cases like exit pages
export function applyClientSideFilters(data: any[], filters: Filter[]) {
  return data.filter((item) => {
    return filters.every((filter) => {
      if (filter.type === "exit_page") {
        // Check if the filter value is the last element in visited_pages
        const visitedPages = item.visited_pages || [];
        if (visitedPages.length === 0) return false;
        return visitedPages[visitedPages.length - 1] === filter.value;
      }
      // For other filter types, they should already be handled by the query
      return true;
    });
  });
}