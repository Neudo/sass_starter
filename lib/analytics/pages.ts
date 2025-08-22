export interface PageData {
  entryPage: string;
  exitPage: string;
}

export interface SessionPageData {
  entry_page: string | null;
  visited_pages?: string[] | null;
}

export function calculatePageData(
  currentPage: string | null,
  existingSession: SessionPageData | null
): PageData & { visitedPages: string[] } {
  const isNewSession = !existingSession;
  const currentPageNormalized = currentPage || "/";
  const visitedPages = existingSession?.visited_pages || [];
  
  // Check if this page was already visited in this session
  const isNewPageVisit = !visitedPages.includes(currentPageNormalized);
  
  // Update visited pages array (add current page if it's new)
  const updatedVisitedPages = isNewPageVisit 
    ? [...visitedPages, currentPageNormalized]
    : visitedPages;
  
  return {
    entryPage: isNewSession ? currentPageNormalized : (existingSession?.entry_page || "/"),
    exitPage: currentPageNormalized,
    visitedPages: updatedVisitedPages,
  };
}