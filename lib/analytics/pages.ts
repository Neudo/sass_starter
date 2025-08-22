export interface SessionPageData {
  visited_pages?: string[] | null;
}

export function calculatePageData(
  currentPage: string | null,
  existingSession: SessionPageData | null
): { visitedPages: string[] } {
  const currentPageNormalized = currentPage || "/";
  const visitedPages = existingSession?.visited_pages || [];
  
  // Check if this page was already visited in this session
  const isNewPageVisit = !visitedPages.includes(currentPageNormalized);
  
  // Update visited pages array (add current page if it's new)
  const updatedVisitedPages = isNewPageVisit 
    ? [...visitedPages, currentPageNormalized]
    : visitedPages;
  
  return {
    visitedPages: updatedVisitedPages,
  };
}