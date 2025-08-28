/**
 * Utilities for generating canonical URLs for SEO
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://www.hectoranalytics.com";

/**
 * Generate a canonical URL for a given path
 */
export function getCanonicalUrl(path: string): string {
  // Remove leading slash if present and ensure we have a clean path
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // For homepage, return just the base URL
  if (!cleanPath || cleanPath === "") {
    return BASE_URL;
  }

  return `${BASE_URL}/${cleanPath}`;
}

/**
 * Generate metadata with canonical URL for pages
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateCanonicalMetadata(
  path: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additionalMetadata: any = {}
) {
  const canonicalUrl = getCanonicalUrl(path);

  return {
    ...additionalMetadata,
    alternates: {
      canonical: canonicalUrl,
      ...additionalMetadata.alternates,
    },
    openGraph: {
      url: canonicalUrl,
      ...additionalMetadata.openGraph,
    },
  };
}
