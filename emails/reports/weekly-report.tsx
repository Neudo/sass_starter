import {
  Button,
  Heading,
  Hr,
  Section,
  Text,
  Link,
} from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "../base-layout";

interface WeeklyReportEmailProps {
  userName?: string;
  siteName: string;
  dashboardUrl?: string;
  weekStartDate: string;
  weekEndDate: string;
  stats: {
    totalVisitors: number;
    totalPageViews: number;
    avgSessionDuration: string;
    bounceRate: number;
    visitorsChange: number;
    pageViewsChange: number;
  };
  topPages: Array<{
    path: string;
    views: number;
    percentage: number;
  }>;
  topReferrers: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
  topCountries: Array<{
    country: string;
    visitors: number;
    percentage: number;
  }>;
}

export const WeeklyReportEmail = ({
  userName = "there",
  siteName,
  dashboardUrl = "https://app.hectoranalytics.com/dashboard",
  weekStartDate,
  weekEndDate,
  stats,
  topPages = [],
  topReferrers = [],
  topCountries = [],
}: WeeklyReportEmailProps) => {
  const preview = `Weekly analytics report for ${siteName}`;

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    const color = change >= 0 ? "#10b981" : "#ef4444";
    return { sign, color, value: Math.abs(change) };
  };

  return (
    <BaseLayout preview={preview}>
      <Section style={content}>
        <Heading style={heading}>
          Weekly Analytics Report 📊
        </Heading>

        <Text style={siteNameText}>{siteName}</Text>
        <Text style={dateRange}>
          {weekStartDate} - {weekEndDate}
        </Text>

        <Text style={paragraph}>Hi {userName},</Text>

        <Text style={paragraph}>
          Here's your weekly analytics summary for {siteName}. 
          Your website's performance at a glance:
        </Text>

        <Section style={statsGrid}>
          <div style={statCard}>
            <Text style={statLabel}>Total Visitors</Text>
            <Text style={statValue}>
              {stats.totalVisitors.toLocaleString()}
            </Text>
            {stats.visitorsChange !== 0 && (
              <Text style={{ ...statChange, color: formatChange(stats.visitorsChange).color }}>
                {formatChange(stats.visitorsChange).sign}
                {formatChange(stats.visitorsChange).value}% from last week
              </Text>
            )}
          </div>

          <div style={statCard}>
            <Text style={statLabel}>Page Views</Text>
            <Text style={statValue}>
              {stats.totalPageViews.toLocaleString()}
            </Text>
            {stats.pageViewsChange !== 0 && (
              <Text style={{ ...statChange, color: formatChange(stats.pageViewsChange).color }}>
                {formatChange(stats.pageViewsChange).sign}
                {formatChange(stats.pageViewsChange).value}% from last week
              </Text>
            )}
          </div>

          <div style={statCard}>
            <Text style={statLabel}>Avg. Session</Text>
            <Text style={statValue}>{stats.avgSessionDuration}</Text>
          </div>

          <div style={statCard}>
            <Text style={statLabel}>Bounce Rate</Text>
            <Text style={statValue}>{stats.bounceRate}%</Text>
          </div>
        </Section>

        <Hr style={divider} />

        {topPages.length > 0 && (
          <>
            <Section style={tableSection}>
              <Heading as="h2" style={sectionHeading}>
                Top Pages This Week
              </Heading>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={tableHeader}>Page</th>
                    <th style={tableHeaderRight}>Views</th>
                    <th style={tableHeaderRight}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {topPages.slice(0, 5).map((page, index) => (
                    <tr key={index}>
                      <td style={tableCell}>
                        <Text style={pagePath}>{page.path}</Text>
                      </td>
                      <td style={tableCellRight}>
                        {page.views.toLocaleString()}
                      </td>
                      <td style={tableCellRight}>
                        {page.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
            <Hr style={divider} />
          </>
        )}

        {topReferrers.length > 0 && (
          <>
            <Section style={tableSection}>
              <Heading as="h2" style={sectionHeading}>
                Top Traffic Sources
              </Heading>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={tableHeader}>Source</th>
                    <th style={tableHeaderRight}>Visitors</th>
                    <th style={tableHeaderRight}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {topReferrers.slice(0, 5).map((referrer, index) => (
                    <tr key={index}>
                      <td style={tableCell}>
                        {referrer.source}
                      </td>
                      <td style={tableCellRight}>
                        {referrer.visitors.toLocaleString()}
                      </td>
                      <td style={tableCellRight}>
                        {referrer.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
            <Hr style={divider} />
          </>
        )}

        {topCountries.length > 0 && (
          <>
            <Section style={tableSection}>
              <Heading as="h2" style={sectionHeading}>
                Top Countries
              </Heading>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={tableHeader}>Country</th>
                    <th style={tableHeaderRight}>Visitors</th>
                    <th style={tableHeaderRight}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {topCountries.slice(0, 5).map((country, index) => (
                    <tr key={index}>
                      <td style={tableCell}>
                        {country.country}
                      </td>
                      <td style={tableCellRight}>
                        {country.visitors.toLocaleString()}
                      </td>
                      <td style={tableCellRight}>
                        {country.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
            <Hr style={divider} />
          </>
        )}

        <Section style={ctaSection}>
          <Button style={button} href={dashboardUrl}>
            View Full Dashboard
          </Button>
        </Section>

        <Text style={footerText}>
          Want to dive deeper into your analytics? Visit your{" "}
          <Link href={dashboardUrl} style={link}>
            dashboard
          </Link>{" "}
          for detailed insights, real-time data, and custom reports.
        </Text>

        <Text style={settingsText}>
          You're receiving this because you have weekly reports enabled. 
          <Link href={`${dashboardUrl}/settings/notifications`} style={link}>
            {" "}Manage your email preferences
          </Link>
        </Text>
      </Section>
    </BaseLayout>
  );
};

WeeklyReportEmail.PreviewProps = {
  userName: "John",
  siteName: "example.com",
  weekStartDate: "Jan 1",
  weekEndDate: "Jan 7",
  stats: {
    totalVisitors: 1234,
    totalPageViews: 5678,
    avgSessionDuration: "2m 34s",
    bounceRate: 42,
    visitorsChange: 15,
    pageViewsChange: -5,
  },
  topPages: [
    { path: "/", views: 1234, percentage: 35 },
    { path: "/blog", views: 890, percentage: 25 },
    { path: "/about", views: 567, percentage: 16 },
    { path: "/contact", views: 345, percentage: 10 },
    { path: "/pricing", views: 234, percentage: 7 },
  ],
  topReferrers: [
    { source: "Google", visitors: 567, percentage: 45 },
    { source: "Direct", visitors: 345, percentage: 28 },
    { source: "Twitter", visitors: 234, percentage: 19 },
    { source: "LinkedIn", visitors: 123, percentage: 10 },
  ],
  topCountries: [
    { country: "United States", visitors: 678, percentage: 55 },
    { country: "United Kingdom", visitors: 234, percentage: 19 },
    { country: "Germany", visitors: 123, percentage: 10 },
    { country: "France", visitors: 89, percentage: 7 },
  ],
} as WeeklyReportEmailProps;

export default WeeklyReportEmail;

const content = {
  padding: "32px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 8px",
};

const siteNameText = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#3d9dbd",
  margin: "0 0 4px",
};

const dateRange = {
  fontSize: "14px",
  color: "#666666",
  margin: "0 0 24px",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#3c3c3c",
  margin: "0 0 16px",
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
  margin: "24px 0",
};

const statCard = {
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  padding: "16px",
  textAlign: "center" as const,
};

const statLabel = {
  fontSize: "12px",
  color: "#666666",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 8px",
};

const statValue = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0",
};

const statChange = {
  fontSize: "12px",
  fontWeight: "500",
  margin: "4px 0 0",
};

const divider = {
  borderColor: "#e6e6e6",
  margin: "32px 0",
};

const tableSection = {
  margin: "24px 0",
};

const sectionHeading = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 16px",
};

const table = {
  width: "100%",
  borderCollapse: "collapse" as const,
  fontSize: "14px",
};

const tableHeader = {
  padding: "8px 12px",
  textAlign: "left" as const,
  borderBottom: "2px solid #e6e6e6",
  color: "#666666",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const tableHeaderRight = {
  ...tableHeader,
  textAlign: "right" as const,
};

const tableCell = {
  padding: "12px",
  borderBottom: "1px solid #f0f0f0",
  color: "#3c3c3c",
};

const tableCellRight = {
  ...tableCell,
  textAlign: "right" as const,
};

const pagePath = {
  margin: "0",
  fontFamily: "monospace",
  fontSize: "13px",
};

const ctaSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#3d9dbd",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
};

const footerText = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#666666",
  margin: "16px 0",
};

const settingsText = {
  fontSize: "12px",
  lineHeight: "20px",
  color: "#999999",
  margin: "24px 0 0",
  paddingTop: "16px",
  borderTop: "1px solid #f0f0f0",
};

const link = {
  color: "#3d9dbd",
  textDecoration: "underline",
};