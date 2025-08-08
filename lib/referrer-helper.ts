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
  for (const [, info] of Object.entries(referrerMappings)) {
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
    return normalized.name;
  }

  // Otherwise use the referrer domain
  if (referrerDomain) {
    const normalized = normalizeReferrer(referrerDomain, false);
    return normalized.name;
  }

  return "direct";
}

/**
 * Determines the marketing channel based on utm_medium, utm_source, and referrer
 * Following Google Analytics 4 default channel grouping rules
 */
export function getChannel(
  utmMedium: string | null,
  utmSource: string | null,
  referrerDomain: string | null
): string {
  // Priority 1: Check utm_medium first (most reliable)
  if (utmMedium) {
    const medium = utmMedium.toLowerCase().trim();

    // Paid channels
    if (["cpc", "ppc", "paidsearch"].includes(medium)) {
      return "Paid Search";
    }
    if (["cpv", "cpa", "cpp", "content-text"].includes(medium)) {
      return "Other Advertising";
    }
    if (["display", "cpm", "banner"].includes(medium)) {
      return "Display";
    }
    if (
      [
        "social",
        "social-network",
        "social-media",
        "sm",
        "social network",
        "social media",
      ].includes(medium)
    ) {
      return "Paid Social";
    }
    if (["video"].includes(medium)) {
      return "Video";
    }

    // Organic channels
    if (["organic", "referral", "none"].includes(medium)) {
      // If medium is organic but source is social, classify as organic social
      if (utmSource) {
        const sourceInfo = normalizeReferrer(utmSource, true);
        if (sourceInfo.category === "social") {
          return "Organic Social";
        }
        if (sourceInfo.category === "search") {
          return "Organic Search";
        }
      }
      return "Referral";
    }

    if (["email", "e-mail", "e_mail", "e mail", "mail"].includes(medium)) {
      return "Email";
    }

    if (["affiliate"].includes(medium)) {
      return "Affiliates";
    }
  }

  // Priority 2: Check utm_source if no utm_medium
  if (utmSource) {
    const sourceInfo = normalizeReferrer(utmSource, true);

    switch (sourceInfo.category) {
      case "search":
        return "Organic Search";
      case "social":
        return "Organic Social";
      case "news":
        return "Referral";
      default:
        return "Referral";
    }
  }

  // Priority 3: Check referrer domain
  if (referrerDomain) {
    const referrerInfo = normalizeReferrer(referrerDomain, false);

    switch (referrerInfo.category) {
      case "search":
        return "Organic Search";
      case "social":
        return "Organic Social";
      case "news":
        return "Referral";
      default:
        return "Referral";
    }
  }

  // Default: Direct traffic
  return "Direct";
}

/**
 * Get all possible channel values for UI
 */
export function getAllChannels(): string[] {
  return [
    "Direct",
    "Organic Search",
    "Referral",
    "Organic Social",
    "Email",
    "Paid Search",
    "Paid Social",
    "Display",
    "Video",
    "Other Advertising",
    "Affiliates",
  ];
}
