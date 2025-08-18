import { createAdminClient } from "@/lib/supabase/admin";
import { getGA4BasicData } from "@/lib/google-analytics";

interface ImportJob {
  id: string;
  site_id: string;
  user_id: string;
  ga_property_id: string;
  start_date: string;
  end_date: string;
}

interface GA4Row {
  dimensionValues: Array<{ value: string }>;
  metricValues: Array<{ value: string }>;
}

interface HectorSession {
  id: string; // Added ID field
  site_id: string;
  created_at: string;
  last_seen: string;
  page_views: number;
  country?: string;
  region?: string;
  city?: string;
  browser?: string;
  os?: string;
  referrer?: string;
  // user_agent?: string; // Removed as not in sessions table
}

// Mapping des pays GA vers codes ISO
const countryMapping: { [key: string]: string } = {
  "United States": "US",
  France: "FR",
  China: "CN",
  Germany: "DE",
  "United Kingdom": "GB",
  // Add more mappings as needed
};

// Mapping des OS GA vers noms standardisés
const osMapping: { [key: string]: string } = {
  Macintosh: "macOS",
  "Mac OS": "macOS",
  "Mac OS X": "macOS",
  Windows: "Windows",
  Android: "Android",
  iOS: "iOS",
  "Chrome OS": "Chrome OS",
  Linux: "Linux",
  // Add more mappings as needed
};

// Mapping des sources GA vers referrers Hector
function mapReferrer(source: string, medium: string): string | null {
  if (source === "(direct)" || medium === "(none)") {
    return null;
  }

  if (medium === "organic") {
    return `https://${source}.com`; // Approximation for search engines
  }

  if (medium === "social") {
    const socialMappings: { [key: string]: string } = {
      facebook: "https://facebook.com",
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com",
      instagram: "https://instagram.com",
    };
    return socialMappings[source.toLowerCase()] || `https://${source}.com`;
  }

  if (medium === "referral") {
    return source.startsWith("http") ? source : `https://${source}`;
  }

  return source;
}

// Fonction principale d'import des données GA4
export async function importGA4DataToHector(
  job: ImportJob,
  accessToken: string,
  refreshToken: string
) {
  const adminClient = createAdminClient();

  try {
    // Update progress
    await updateJobProgress(
      job.id,
      10,
      "Fetching data from Google Analytics..."
    );

    // Fetch data from GA4
    const gaData = await getGA4BasicData(
      accessToken,
      refreshToken,
      job.ga_property_id,
      job.start_date,
      job.end_date
    );

    if (!gaData.rows || gaData.rows.length === 0) {
      throw new Error("No data found in the specified date range");
    }

    await updateJobProgress(job.id, 30, "Processing data...");

    // Group sessions by date and characteristics
    const sessionGroups = groupSessionData(gaData.rows);

    await updateJobProgress(job.id, 50, "Creating sessions...");

    // Convert to Hector sessions and insert
    let importedSessions = 0;
    let skippedDuplicates = 0;
    const totalSessions = Object.keys(sessionGroups).length;
    let sessionIndex = 0;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [sessionKey, sessionData] of Object.entries(sessionGroups)) {
      try {
        const hectorSession = mapToHectorSession(
          sessionData,
          job.site_id,
          sessionIndex++
        );

        // Check for existing sessions to avoid duplicates
        const { data: existingSessions } = await adminClient
          .from("sessions")
          .select("id")
          .eq("site_id", hectorSession.site_id)
          .eq("created_at", hectorSession.created_at)
          .eq("country", hectorSession.country || "")
          .eq("city", hectorSession.city || "")
          .eq("browser", hectorSession.browser || "")
          .eq("os", hectorSession.os || "")
          .limit(1);

        if (existingSessions && existingSessions.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          skippedDuplicates++;
          continue;
        }

        // Insert session into Hector database
        const { error } = await adminClient
          .from("sessions")
          .insert(hectorSession);

        if (error) {
          console.error("Error inserting session:", error);
        } else {
          importedSessions++;
        }

        // Update progress periodically
        if (importedSessions % 100 === 0) {
          const progress =
            50 + Math.floor((importedSessions / totalSessions) * 40);
          await updateJobProgress(
            job.id,
            progress,
            `Imported ${importedSessions}/${totalSessions} sessions`
          );
        }
      } catch (error) {
        console.error("Error processing session:", error);
      }
    }

    // Final update
    await updateJobProgress(job.id, 95, "Finalizing import...");

    // Update job with final counts
    await adminClient
      .from("ga_import_jobs")
      .update({
        total_sessions: totalSessions,
        imported_sessions: importedSessions,
        progress: 100,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id);
  } catch (error) {
    console.error("Error in importGA4DataToHector:", error);

    await adminClient
      .from("ga_import_jobs")
      .update({
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error",
      })
      .eq("id", job.id);

    throw error;
  }
}

// Group GA4 rows into logical sessions
function groupSessionData(rows: GA4Row[]): { [key: string]: GA4SessionGroup } {
  const sessionGroups: { [key: string]: GA4SessionGroup } = {};

  for (const row of rows) {
    // Extract dimensions (9 max allowed by GA4 API)
    const date = row.dimensionValues[0]?.value || "";
    const country = row.dimensionValues[1]?.value || "";
    const region = row.dimensionValues[2]?.value || "";
    const city = row.dimensionValues[3]?.value || "";
    const source = row.dimensionValues[4]?.value || "";
    const medium = row.dimensionValues[5]?.value || "";
    const deviceCategory = row.dimensionValues[6]?.value || "";
    const operatingSystem = row.dimensionValues[7]?.value || "";
    const browser = row.dimensionValues[8]?.value || "";

    // Extract metrics
    const sessions = parseInt(row.metricValues[0]?.value || "0");
    // const users = parseInt(row.metricValues[1]?.value || "0");
    const pageViews = parseInt(row.metricValues[2]?.value || "0");
    const engagementDuration = parseFloat(row.metricValues[3]?.value || "0");

    // Create a session key (group similar sessions)
    const sessionKey = `${date}_${country}_${region}_${city}_${source}_${medium}_${deviceCategory}_${operatingSystem}_${browser}`;

    if (!sessionGroups[sessionKey]) {
      sessionGroups[sessionKey] = {
        date,
        country,
        region,
        city,
        source,
        medium,
        deviceCategory,
        operatingSystem,
        browser,
        totalSessions: 0,
        totalPageViews: 0,
        totalEngagementDuration: 0,
        pages: new Set(),
      };
    }

    const group = sessionGroups[sessionKey];
    group.totalSessions += sessions;
    group.totalPageViews += pageViews;
    group.totalEngagementDuration += engagementDuration;
    // Note: pagePath removed due to GA4 API 9-dimension limit
  }

  return sessionGroups;
}

// Convert grouped GA4 data to Hector session format
function mapToHectorSession(
  sessionData: GA4SessionGroup,
  siteId: string,
  sessionIndex: number
): HectorSession {
  const date = new Date(
    parseInt(sessionData.date.substring(0, 4)), // year
    parseInt(sessionData.date.substring(4, 6)) - 1, // month (0-indexed)
    parseInt(sessionData.date.substring(6, 8)) // day
  );

  // Calculate session duration (approximate)
  const avgDuration =
    sessionData.totalEngagementDuration / sessionData.totalSessions;
  const lastSeen = new Date(date.getTime() + avgDuration * 1000);

  // Generate a unique ID for the session (similar to Hector's format)
  const sessionId = `ga4_import_${date.getTime()}_${sessionIndex}_${Math.random()
    .toString(36)
    .substring(2, 9)}`;

  return {
    id: sessionId,
    site_id: siteId,
    created_at: date.toISOString(),
    last_seen: lastSeen.toISOString(),
    page_views: Math.max(
      1,
      Math.floor(sessionData.totalPageViews / sessionData.totalSessions)
    ),
    country:
      countryMapping[sessionData.country] || sessionData.country || undefined,
    region: sessionData.region || undefined,
    city: sessionData.city || undefined,
    browser: sessionData.browser || undefined,
    os:
      osMapping[sessionData.operatingSystem] ||
      sessionData.operatingSystem ||
      undefined,
    referrer: mapReferrer(sessionData.source, sessionData.medium) || undefined,
    // user_agent removed as not in sessions table
  };
}

// Helper function to update job progress
async function updateJobProgress(
  jobId: string,
  progress: number,
  message?: string
) {
  const adminClient = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = { progress };
  if (message) {
    updateData.error_message = message; // Using error_message field for status messages
  }

  await adminClient.from("ga_import_jobs").update(updateData).eq("id", jobId);
}

// Type for grouped session data
interface GA4SessionGroup {
  date: string;
  country: string;
  region: string;
  city: string;
  source: string;
  medium: string;
  deviceCategory: string;
  operatingSystem: string;
  browser: string;
  totalSessions: number;
  totalPageViews: number;
  totalEngagementDuration: number;
  pages: Set<string>;
}
