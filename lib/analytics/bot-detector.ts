/**
 * Bot detection and blocking utilities
 */

// Common bot user agent patterns
const BOT_USER_AGENTS = [
  "bot",
  "crawler",
  "spider",
  "scraper",
  "headless",
  "puppeteer",
  "playwright",
  "selenium",
  "phantomjs",
  "chrome-lighthouse",
  "pingdom",
  "uptimerobot",
  "slackbot",
  "twitterbot",
  "facebookbot",
  "linkedinbot",
  "whatsapp",
  "telegram",
  "discord",
  "curl",
  "wget",
  "python",
  "java",
  "ruby",
  "perl",
  "php",
  "go-http",
  "axios",
  "node-fetch",
  "okhttp",
  "apache-httpclient",
  "googlebot",
  "bingbot",
  "yandexbot",
  "duckduckbot",
  "baiduspider",
  "ahrefsbot",
  "semrushbot",
  "dotbot",
  "mj12bot",
  "seznambot",
  "chrome headless",
  "headlesschrome",
  // Additional SEO and monitoring bots
  "screaming frog",
  "sitebulb",
  "deepcrawl",
  "oncrawl",
  "contentking",
  "lumar",
  "botify",
  "sistrix",
  "majestic",
  "moz.com",
  "rogerbot",
  "searchmetrics",
  "seobility",
  "woorank",
  "nibbler",
  "gtmetrix",
  "dareboost",
  "statuscake",
  "freshping",
  "hetrixtools",
  "site24x7",
  "pulseway",
  "datadoghq",
  "newrelic",
  "appdynamics",
  "dynatrace",
  "solarwinds",
  // Security scanners
  "nessus",
  "nikto",
  "openvas",
  "qualys",
  "acunetix",
  "burp",
  "zap",
  "w3af",
  // Email crawlers
  "emailharvest",
  "emailsiphon",
  "emailwolf",
  // Academic/Research
  "ccbot",
  "academicbot",
  "ia_archiver",
  "alexa",
  "sogou",
];

// Common hosting/cloud provider IP ranges that are often used by bots
// const CLOUD_PROVIDER_KEYWORDS = [
//   "amazonaws",
//   "digitalocean",
//   "linode",
//   "vultr",
//   "ovh",
//   "hetzner",
//   "google-proxy",
//   "cloudflare",
// ];

/**
 * Check if the user agent belongs to a bot
 */
export function isBot(userAgent: string | null): boolean {
  if (!userAgent) return true; // No user agent is suspicious

  const ua = userAgent.toLowerCase();

  // Check for common bot patterns
  for (const pattern of BOT_USER_AGENTS) {
    if (ua.includes(pattern)) {
      return true;
    }
  }

  // Check for missing browser identifiers (real browsers always have these)
  const hasNormalBrowser =
    ua.includes("mozilla") &&
    (ua.includes("chrome") ||
      ua.includes("safari") ||
      ua.includes("firefox") ||
      ua.includes("edge")) &&
    !ua.includes("headless") &&
    !ua.includes("phantomjs");

  if (!hasNormalBrowser) {
    return true;
  }

  return false;
}

/**
 * Check if a browser identification indicates a bot
 */
export function isBotBrowser(browser: string | null): boolean {
  if (!browser) return false;

  const browserLower = browser.toLowerCase();

  // Known bot browsers
  const botBrowsers = [
    "chrome headless",
    "headlesschrome",
    "phantomjs",
    "slimerjs",
    "zombie",
    "scrapy",
    "httpclient",
    "urllib",
    "libwww",
    "lwp",
    "mechanize",
    "requests",
  ];

  for (const bot of botBrowsers) {
    if (browserLower.includes(bot)) {
      return true;
    }
  }

  return false;
}

/**
 * Check for suspicious behavioral patterns
 */
export function hasSuspiciousBehavior(
  ip: string,
  recentSessions: Array<{ created_at: string; ip?: string }>
): boolean {
  // Check for multiple sessions from same IP in short time (bot pattern)
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const sessionsFromSameIp = recentSessions.filter(
    s => s.ip === ip && new Date(s.created_at) > oneMinuteAgo
  );
  
  // More than 3 sessions in 1 minute from same IP is suspicious
  if (sessionsFromSameIp.length > 3) {
    return true;
  }
  
  return false;
}

/**
 * Comprehensive bot detection (without IP blocking)
 */
export async function shouldBlockRequest(
  userAgent: string | null,
  browser: string | null,
  ip?: string,
  recentSessions?: Array<{ created_at: string; ip?: string }>
): Promise<{ blocked: boolean; reason?: string }> {
  // Check user agent
  if (isBot(userAgent)) {
    return { blocked: true, reason: "bot_user_agent" };
  }

  // Check browser identification
  if (isBotBrowser(browser)) {
    return { blocked: true, reason: "bot_browser" };
  }

  // Additional checks for suspicious patterns
  if (userAgent) {
    const ua = userAgent.toLowerCase();

    // Check for automation tools
    if (ua.includes("automation") || ua.includes("webdriver")) {
      return { blocked: true, reason: "automation_tool" };
    }
    
    // Check for monitoring/SEO tools that might not identify as bots
    if (ua.includes("monitor") || ua.includes("seo") || ua.includes("audit")) {
      return { blocked: true, reason: "monitoring_tool" };
    }

    // Check for missing required headers that real browsers send
    // This would need to be checked in the actual request headers
  }
  
  // Check behavioral patterns if IP and recent sessions provided
  if (ip && recentSessions && hasSuspiciousBehavior(ip, recentSessions)) {
    return { blocked: true, reason: "suspicious_behavior" };
  }

  return { blocked: false };
}

// IP blocking functions removed - to be implemented later
