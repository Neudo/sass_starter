import { google } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/analytics",
];

// Configuration OAuth2
export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    }api/auth/google/callback`
  );
}

// Générer l'URL d'autorisation
export function getAuthUrl() {
  const oauth2Client = getOAuth2Client();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent", // Force consent to get refresh token
  });

  return authUrl;
}

// Types pour les données Google Analytics
export interface GAProperty {
  name: string;
  displayName: string;
  propertyType:
    | "PROPERTY_TYPE_ORDINARY"
    | "PROPERTY_TYPE_SUBPROPERTY"
    | "PROPERTY_TYPE_ROLLUP";
  createTime: string;
  updateTime: string;
  parent: string;
  currencyCode: string;
  timeZone: string;
  account: string;
  industryCategory: string;
  serviceLevel: string;
}

export interface GADimension {
  name: string;
}

export interface GAMetric {
  name: string;
}

export interface GADateRange {
  startDate: string;
  endDate: string;
}

export interface GAReportRow {
  dimensionValues: Array<{ value: string }>;
  metricValues: Array<{ value: string }>;
}

export interface GAReportData {
  rows?: GAReportRow[];
  totals?: Array<{ metricValues: Array<{ value: string }> }>;
  maximums?: Array<{ metricValues: Array<{ value: string }> }>;
  minimums?: Array<{ metricValues: Array<{ value: string }> }>;
  rowCount?: number;
}

// Client Google Analytics configuré
export async function getAnalyticsClient(
  accessToken: string,
  refreshToken: string
) {
  const oauth2Client = getOAuth2Client();

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return google.analyticsdata({ version: "v1beta", auth: oauth2Client });
}

// Client Google Analytics Admin pour lister les propriétés
export async function getAnalyticsAdminClient(
  accessToken: string,
  refreshToken: string
) {
  const oauth2Client = getOAuth2Client();

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return google.analyticsadmin({ version: "v1beta", auth: oauth2Client });
}

// Récupérer les propriétés GA4 disponibles
export async function getGA4Properties(
  accessToken: string,
  refreshToken: string
) {
  try {
    const adminClient = await getAnalyticsAdminClient(
      accessToken,
      refreshToken
    );

    const response = await adminClient.accounts.list();
    const accounts = response.data.accounts || [];

    const allProperties: GAProperty[] = [];

    for (const account of accounts) {
      if (account.name) {
        try {
          const propertiesResponse = await adminClient.properties.list({
            filter: `parent:${account.name}`,
          });

          if (propertiesResponse.data.properties) {
            allProperties.push(
              ...(propertiesResponse.data.properties as GAProperty[])
            );
          }
        } catch (error) {
          console.error(
            `Error fetching properties for account ${account.name}:`,
            error
          );
        }
      }
    }

    return allProperties;
  } catch (error) {
    console.error("Error fetching GA4 properties:", error);
    throw error;
  }
}

// Récupérer les données de base d'une propriété GA4
export async function getGA4BasicData(
  accessToken: string,
  refreshToken: string,
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<GAReportData> {
  try {
    const analyticsClient = await getAnalyticsClient(accessToken, refreshToken);

    const response = await analyticsClient.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [
          { name: "date" },
          { name: "pagePath" },
          { name: "country" },
          { name: "city" },
          { name: "sessionSource" },
          { name: "sessionMedium" },
          { name: "deviceCategory" },
        ],
        metrics: [
          { name: "sessions" },
          { name: "totalUsers" },
          { name: "screenPageViews" },
          { name: "userEngagementDuration" },
          { name: "bounceRate" },
        ],
        limit: 100000, // Limite élevée pour récupérer toutes les données
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    return response.data as GAReportData;
  } catch (error) {
    console.error("Error fetching GA4 data:", error);
    throw error;
  }
}
