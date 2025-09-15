/**
 * Clean and normalize a domain name
 * Removes protocol, www prefix, and trailing slashes
 */
export function cleanDomainName(rawDomain: string): string {
  return rawDomain
    .trim() // Remove whitespace
    .toLowerCase() // Normalize case
    .replace(/^https?:\/\//, "") // Remove protocol
    .replace(/^www\./, "") // Remove www.
    .replace(/\/+$/, "") // Remove trailing slashes
    .replace(/\/$/, ""); // Final cleanup
}