export interface PageData {
  entryPage: string;
  exitPage: string;
  pageViews: number;
}

export interface SessionPageData {
  entry_page: string | null;
  page_views: number;
}

export function calculatePageData(
  currentPage: string | null,
  existingSession: SessionPageData | null
): PageData {
  const isNewSession = !existingSession;
  const currentPageViews = existingSession?.page_views || 0;
  
  return {
    entryPage: isNewSession ? (currentPage || "/") : (existingSession?.entry_page || "/"),
    exitPage: currentPage || "/",
    pageViews: currentPageViews + 1,
  };
}