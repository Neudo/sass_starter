export interface ReferrerInfo {
  name: string;
  displayName: string;
  icon?: string; // Pour plus tard quand vous aurez les icônes
  category: "social" | "search" | "news" | "direct" | "other";
}

const referrerMappings: Record<string, ReferrerInfo> = {
  // Social Media
  "t.co": {
    name: "twitter",
    displayName: "X (Twitter)",
    category: "social",
  },
  "twitter.com": {
    name: "twitter",
    displayName: "X (Twitter)",
    category: "social",
  },
  "x.com": {
    name: "twitter",
    displayName: "X (Twitter)",
    category: "social",
  },
  "facebook.com": {
    name: "facebook",
    displayName: "Facebook",
    category: "social",
  },
  "m.facebook.com": {
    name: "facebook",
    displayName: "Facebook",
    category: "social",
  },
  "l.facebook.com": {
    name: "facebook",
    displayName: "Facebook",
    category: "social",
  },
  "linkedin.com": {
    name: "linkedin",
    displayName: "LinkedIn",
    category: "social",
  },
  "instagram.com": {
    name: "instagram",
    displayName: "Instagram",
    category: "social",
  },
  "youtube.com": {
    name: "youtube",
    displayName: "YouTube",
    category: "social",
  },
  "reddit.com": {
    name: "reddit",
    displayName: "Reddit",
    category: "social",
  },
  "tiktok.com": {
    name: "tiktok",
    displayName: "TikTok",
    category: "social",
  },

  // Search Engines
  "google.com": {
    name: "google",
    displayName: "Google",
    category: "search",
  },
  "www.google.com": {
    name: "google",
    displayName: "Google",
    category: "search",
  },
  "google.fr": {
    name: "google",
    displayName: "Google",
    category: "search",
  },
  "bing.com": {
    name: "bing",
    displayName: "Bing",
    category: "search",
  },
  "duckduckgo.com": {
    name: "duckduckgo",
    displayName: "DuckDuckGo",
    category: "search",
  },
  "yahoo.com": {
    name: "yahoo",
    displayName: "Yahoo",
    category: "search",
  },
  "baidu.com": {
    name: "baidu",
    displayName: "Baidu",
    category: "search",
  },
  "yandex.ru": {
    name: "yandex",
    displayName: "Yandex",
    category: "search",
  },

  // News & Tech Sites
  "news.ycombinator.com": {
    name: "hackernews",
    displayName: "Hacker News",
    category: "news",
  },
  "producthunt.com": {
    name: "producthunt",
    displayName: "Product Hunt",
    category: "news",
  },
  "medium.com": {
    name: "medium",
    displayName: "Medium",
    category: "news",
  },
  "dev.to": {
    name: "devto",
    displayName: "Dev.to",
    category: "news",
  },
  "techcrunch.com": {
    name: "techcrunch",
    displayName: "TechCrunch",
    category: "news",
  },

  // Email providers (when referrer shows)
  "mail.google.com": {
    name: "gmail",
    displayName: "Gmail",
    category: "other",
  },
  "outlook.live.com": {
    name: "outlook",
    displayName: "Outlook",
    category: "other",
  },

  // Messaging
  "slack.com": {
    name: "slack",
    displayName: "Slack",
    category: "other",
  },
  "discord.com": {
    name: "discord",
    displayName: "Discord",
    category: "other",
  },
  "telegram.org": {
    name: "telegram",
    displayName: "Telegram",
    category: "other",
  },
};

// Special handling for ref parameters (not domains)
const refParameterMappings: Record<string, ReferrerInfo> = {
  producthunt: {
    name: "producthunt",
    displayName: "Product Hunt",
    category: "news",
  },
  hackernews: {
    name: "hackernews",
    displayName: "Hacker News",
    category: "news",
  },
  twitter: {
    name: "twitter",
    displayName: "X (Twitter)",
    category: "social",
  },
  facebook: {
    name: "facebook",
    displayName: "Facebook",
    category: "social",
  },
  linkedin: {
    name: "linkedin",
    displayName: "LinkedIn",
    category: "social",
  },
  reddit: {
    name: "reddit",
    displayName: "Reddit",
    category: "social",
  },
};

/**
 * Normalizes a referrer domain or ref parameter to a consistent format
 * @param referrer - The referrer domain (e.g., "t.co") or ref parameter (e.g., "producthunt")
 * @param isRefParameter - Whether this is a ref parameter vs a domain
 * @returns Normalized referrer info with display name and category
 */
export function normalizeReferrer(
  referrer: string | null | undefined,
  isRefParameter = false
): ReferrerInfo {
  if (!referrer) {
    return {
      name: "direct",
      displayName: "Direct",
      category: "direct",
    };
  }

  // Clean up the referrer
  const cleaned = referrer.toLowerCase().trim();

  // If it's a ref parameter, check the ref mappings first
  if (isRefParameter && refParameterMappings[cleaned]) {
    return refParameterMappings[cleaned];
  }

  // Check domain mappings
  if (referrerMappings[cleaned]) {
    return referrerMappings[cleaned];
  }

  // Try to match partial domains (e.g., "google.co.uk" -> "google")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const [domain, info] of Object.entries(referrerMappings)) {
    if (cleaned.includes(info.name)) {
      return info;
    }
  }

  // Return the original with some cleanup
  return {
    name: cleaned,
    displayName: formatDomainName(cleaned),
    category: "other",
  };
}

/**
 * Formats a domain name to be more readable
 * @param domain - The domain to format
 * @returns Formatted domain name
 */
function formatDomainName(domain: string): string {
  // Remove www. prefix
  let formatted = domain.replace(/^www\./, "");

  // Remove common TLDs for cleaner display
  formatted = formatted.replace(/\.(com|org|net|io|co|app|dev)$/, "");

  // Capitalize first letter
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Helper for use in the tracking API
 * @param source - The utm_source or ref parameter
 * @param referrerDomain - The referrer domain
 * @returns Normalized source name for storage
 */
export function getNormalizedSource(
  source: string | null,
  referrerDomain: string | null
): string {
  // If we have a utm_source or ref parameter, use it
  if (source) {
    const normalized = normalizeReferrer(source, true);
    console.log("normalized 1", normalized);

    return normalized.name;
  }

  // Otherwise use the referrer domain
  if (referrerDomain) {
    const normalized = normalizeReferrer(referrerDomain, false);
    console.log("normalized 2", normalized);
    return normalized.name;
  }

  return "direct";
}
