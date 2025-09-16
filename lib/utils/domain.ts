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

/**
 * Check if a domain is a localhost/development domain
 */
export function isLocalhostDomain(domain: string): boolean {
  const cleanDomain = cleanDomainName(domain);
  
  return (
    cleanDomain === 'localhost' || 
    cleanDomain === '127.0.0.1' || 
    cleanDomain.includes('localhost:') ||
    cleanDomain.includes('127.0.0.1:') ||
    cleanDomain.endsWith('.local') ||
    cleanDomain.includes('.localhost') ||
    cleanDomain.startsWith('192.168.') ||
    cleanDomain.startsWith('10.') ||
    (cleanDomain.startsWith('172.') && /^172\.(1[6-9]|2[0-9]|3[01])\./.test(cleanDomain))
  );
}

/**
 * Validate domain for public use
 */
export function validatePublicDomain(domain: string): { 
  isValid: boolean; 
  error?: string; 
} {
  if (!domain.trim()) {
    return { isValid: false, error: "Domain is required" };
  }

  if (isLocalhostDomain(domain)) {
    return { 
      isValid: false, 
      error: "Local development domains are not supported. Please use a public domain name (e.g., yoursite.com)." 
    };
  }

  // Add more validations if needed
  const cleanDomain = cleanDomainName(domain);
  if (cleanDomain.length < 3) {
    return { isValid: false, error: "Domain name is too short" };
  }

  if (!cleanDomain.includes('.')) {
    return { isValid: false, error: "Please enter a valid domain name (e.g., yoursite.com)" };
  }

  return { isValid: true };
}