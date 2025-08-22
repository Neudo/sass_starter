import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Data pools for realistic variation
const browsers = [
  { name: "Chrome", versions: ["120.0", "119.0", "118.0", "117.0"] },
  { name: "Safari", versions: ["17.0", "16.6", "16.5", "16.4"] },
  { name: "Firefox", versions: ["121.0", "120.0", "119.0", "118.0"] },
  { name: "Edge", versions: ["120.0", "119.0", "118.0"] },
  { name: "Opera", versions: ["105.0", "104.0", "103.0"] },
];

const operatingSystems = [
  { name: "Windows", versions: ["11", "10"] },
  { name: "macOS", versions: ["14.0", "13.6", "13.5", "12.7"] },
  { name: "Linux", versions: ["Ubuntu 22.04", "Ubuntu 20.04", "Fedora 39"] },
  { name: "Android", versions: ["14", "13", "12", "11"] },
  { name: "iOS", versions: ["17.0", "16.6", "16.5", "15.7"] },
];

const countries = [
  { code: "US", name: "United States", cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "San Francisco", "Seattle", "Boston", "Miami", "Denver"] },
  { code: "GB", name: "United Kingdom", cities: ["London", "Manchester", "Birmingham", "Liverpool", "Bristol", "Edinburgh", "Glasgow", "Leeds"] },
  { code: "FR", name: "France", cities: ["Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", "Strasbourg", "Bordeaux"] },
  { code: "DE", name: "Germany", cities: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Düsseldorf"] },
  { code: "CA", name: "Canada", cities: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton"] },
  { code: "AU", name: "Australia", cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"] },
  { code: "JP", name: "Japan", cities: ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Nagoya"] },
  { code: "BR", name: "Brazil", cities: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza"] },
  { code: "IN", name: "India", cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata"] },
  { code: "ES", name: "Spain", cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Bilbao"] },
];

const screenSizes = ["1920x1080", "1366x768", "1440x900", "1536x864", "1280x720", "2560x1440", "3840x2160", "414x896", "390x844", "412x915"];

const referrerDomains = [
  "google.com", "facebook.com", "twitter.com", "linkedin.com", "reddit.com", 
  "youtube.com", "instagram.com", "pinterest.com", "duckduckgo.com", "bing.com",
  null, null, null // Direct traffic
];

const utmSources = ["google", "facebook", "twitter", "newsletter", "email", "linkedin", null, null];
const utmMediums = ["cpc", "organic", "social", "email", "referral", null, null];
const utmCampaigns = ["summer_sale", "black_friday", "new_launch", "brand_awareness", null, null];

const pages = [
  "/", "/about", "/products", "/services", "/blog", "/contact", "/pricing",
  "/features", "/docs", "/api", "/dashboard", "/login", "/signup", "/blog/article-1",
  "/blog/article-2", "/products/item-1", "/products/item-2", "/help", "/faq"
];

// Helper functions
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

function generateVisitorId(): string {
  return `visitor_${Math.random().toString(36).substring(2, 15)}`;
}

// Generate realistic session duration (in seconds)
function generateSessionDuration(): number {
  // 70% short sessions (0-60 seconds)
  // 20% medium sessions (1-5 minutes)
  // 10% long sessions (5-30 minutes)
  const rand = Math.random();
  if (rand < 0.7) {
    return getRandomInt(0, 60);
  } else if (rand < 0.9) {
    return getRandomInt(60, 300);
  } else {
    return getRandomInt(300, 1800);
  }
}

// Generate pageviews based on session duration
function generatePageviews(duration: number): number {
  if (duration < 10) return 1; // Bounce
  if (duration < 60) return getRandomInt(1, 3);
  if (duration < 300) return getRandomInt(2, 8);
  return getRandomInt(5, 20);
}

// Generate fake sessions with realistic patterns
async function generateFakeSessions() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase environment variables");
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  // Get a real site_id from the database
  const { data: sites, error: siteError } = await supabase
    .from("sites")
    .select("id")
    .limit(1);
  
  if (siteError || !sites || sites.length === 0) {
    console.error("No sites found in database. Please create a site first.");
    return;
  }
  
  const siteId = sites[0].id;
  console.log("Using site_id:", siteId);
  
  // Create a pool of unique visitors (30% of sessions will be returning visitors)
  const uniqueVisitors = [];
  const numUniqueVisitors = Math.floor(500 * 0.7); // 70% unique visitors
  for (let i = 0; i < numUniqueVisitors; i++) {
    uniqueVisitors.push(generateVisitorId());
  }
  
  const sessions = [];
  const now = new Date();
  
  // Distribute sessions over the last 90 days
  for (let i = 0; i < 500; i++) {
    // Random date in the last 90 days
    const daysAgo = Math.random() * 90;
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    // Add some hourly variation (more traffic during business hours)
    const hour = Math.random() < 0.7 ? getRandomInt(9, 18) : getRandomInt(0, 23);
    createdAt.setHours(hour, getRandomInt(0, 59), getRandomInt(0, 59));
    
    // Session duration
    const duration = generateSessionDuration();
    const lastSeen = new Date(createdAt.getTime() + duration * 1000);
    
    // Assign visitor ID: 70% get unique visitor, 30% are returning visitors
    let visitorId;
    if (Math.random() < 0.3 && uniqueVisitors.length > 0) {
      // Returning visitor - pick from existing pool
      visitorId = getRandomElement(uniqueVisitors);
    } else {
      // New unique visitor
      visitorId = generateVisitorId();
      uniqueVisitors.push(visitorId);
    }
    
    // Get random location
    const country = getRandomElement(countries);
    const city = getRandomElement(country.cities);
    
    // Get random browser and OS
    const browser = getRandomElement(browsers);
    const browserVersion = getRandomElement(browser.versions);
    const os = getRandomElement(operatingSystems);
    const osVersion = getRandomElement(os.versions);
    
    // Generate session data (only include fields that exist in the sessions table)
    // We'll store the visitor_id in a custom field for identification
    const session = {
      id: generateSessionId(),
      site_id: siteId,
      created_at: createdAt.toISOString(),
      last_seen: lastSeen.toISOString(),
      country: country.code,
      city: city,
      region: `${city} Region`,
      browser: browser.name,
      browser_version: browserVersion,
      os: os.name,
      os_version: osVersion,
      screen_size: getRandomElement(screenSizes),
      referrer: Math.random() < 0.4 ? `https://${getRandomElement(referrerDomains)}` : null,
      referrer_domain: getRandomElement(referrerDomains),
      utm_source: getRandomElement(utmSources),
      utm_medium: getRandomElement(utmMediums),
      utm_campaign: getRandomElement(utmCampaigns),
      utm_term: Math.random() < 0.1 ? getRandomElement(["analytics", "tracking", "metrics"]) : null,
      utm_content: Math.random() < 0.1 ? getRandomElement(["banner", "sidebar", "footer"]) : null,
      visited_pages: [getRandomElement(pages)],
      page_views: generatePageviews(duration),
    };
    
    sessions.push(session);
  }
  
  // Sort by created_at to ensure chronological order
  sessions.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  
  console.log("Generated", sessions.length, "fake sessions");
  console.log("Sample session:", sessions[0]);
  
  // Insert in batches of 50 to avoid timeout
  const batchSize = 50;
  for (let i = 0; i < sessions.length; i += batchSize) {
    const batch = sessions.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from("sessions")
      .insert(batch);
    
    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
    } else {
      console.log(`Inserted batch ${i / batchSize + 1} (${batch.length} sessions)`);
    }
  }
  
  console.log("✅ Fake data generation complete!");
}

// Run the script
generateFakeSessions().catch(console.error);