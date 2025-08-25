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

interface MonthlyReportEmailProps {
  userName?: string;
  siteName: string;
  dashboardUrl?: string;
  monthName: string;
  year: number;
  stats: {
    totalVisitors: number;
    totalPageViews: number;
    avgSessionDuration: string;
    bounceRate: number;
    visitorsChange: number;
    pageViewsChange: number;
    uniqueVisitors: number;
    returningVisitors: number;
  };
  growthTrend: Array<{
    week: string;
    visitors: number;
    pageViews: number;
  }>;
  topPages: Array<{
    path: string;
    views: number;
    uniqueVisitors: number;
    avgTime: string;
  }>;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  browserBreakdown: Array<{
    browser: string;
    percentage: number;
  }>;
  insights?: string[];
}

export const MonthlyReportEmail = ({
  userName = "there",
  siteName,
  dashboardUrl = "https://app.hectoranalytics.com/dashboard",
  monthName,
  year,
  stats,
  growthTrend = [],
  topPages = [],
  deviceBreakdown,
  browserBreakdown = [],
  insights = [],
}: MonthlyReportEmailProps) => {
  const preview = `${monthName} ${year} analytics report for ${siteName}`;

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    const color = change >= 0 ? "#10b981" : "#ef4444";
    return { sign, color, value: Math.abs(change) };
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "desktop": return "💻";
      case "mobile": return "📱";
      case "tablet": return "📋";
      default: return "📊";
    }
  };

  return (
    <BaseLayout preview={preview}>
      <Section style={content}>
        <Heading style={heading}>
          Monthly Analytics Report 📈
        </Heading>

        <Text style={siteNameText}>{siteName}</Text>
        <Text style={dateRange}>
          {monthName} {year}
        </Text>

        <Text style={paragraph}>Hi {userName},</Text>

        <Text style={paragraph}>
          Here's your comprehensive monthly analytics report for {siteName}. 
          Let's dive into how your website performed in {monthName}.
        </Text>

        <Section style={highlightSection}>
          <Heading as="h2" style={sectionHeading}>
            🎯 Key Metrics
          </Heading>
          
          <Section style={metricsGrid}>
            <div style={metricCard}>
              <Text style={metricLabel}>Total Visitors</Text>
              <Text style={metricValue}>
                {stats.totalVisitors.toLocaleString()}
              </Text>
              {stats.visitorsChange !== 0 && (
                <Text style={{ ...metricChange, color: formatChange(stats.visitorsChange).color }}>
                  {formatChange(stats.visitorsChange).sign}
                  {formatChange(stats.visitorsChange).value}% vs last month
                </Text>
              )}
            </div>

            <div style={metricCard}>
              <Text style={metricLabel}>Page Views</Text>
              <Text style={metricValue}>
                {stats.totalPageViews.toLocaleString()}
              </Text>
              {stats.pageViewsChange !== 0 && (
                <Text style={{ ...metricChange, color: formatChange(stats.pageViewsChange).color }}>
                  {formatChange(stats.pageViewsChange).sign}
                  {formatChange(stats.pageViewsChange).value}% vs last month
                </Text>
              )}
            </div>

            <div style={metricCard}>
              <Text style={metricLabel}>Unique Visitors</Text>
              <Text style={metricValue}>
                {stats.uniqueVisitors.toLocaleString()}
              </Text>
              <Text style={metricSubtext}>
                {((stats.uniqueVisitors / stats.totalVisitors) * 100).toFixed(1)}% of total
              </Text>
            </div>

            <div style={metricCard}>
              <Text style={metricLabel}>Returning Visitors</Text>
              <Text style={metricValue}>
                {stats.returningVisitors.toLocaleString()}
              </Text>
              <Text style={metricSubtext}>
                {((stats.returningVisitors / stats.totalVisitors) * 100).toFixed(1)}% retention
              </Text>
            </div>

            <div style={metricCard}>
              <Text style={metricLabel}>Avg. Session</Text>
              <Text style={metricValue}>{stats.avgSessionDuration}</Text>
            </div>

            <div style={metricCard}>
              <Text style={metricLabel}>Bounce Rate</Text>
              <Text style={metricValue}>{stats.bounceRate}%</Text>
            </div>
          </Section>
        </Section>

        <Hr style={divider} />

        {growthTrend.length > 0 && (
          <>
            <Section style={tableSection}>
              <Heading as="h2" style={sectionHeading}>
                📊 Weekly Growth Trend
              </Heading>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={tableHeader}>Week</th>
                    <th style={tableHeaderRight}>Visitors</th>
                    <th style={tableHeaderRight}>Page Views</th>
                  </tr>
                </thead>
                <tbody>
                  {growthTrend.map((week, index) => (
                    <tr key={index}>
                      <td style={tableCell}>{week.week}</td>
                      <td style={tableCellRight}>
                        {week.visitors.toLocaleString()}
                      </td>
                      <td style={tableCellRight}>
                        {week.pageViews.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
            <Hr style={divider} />
          </>
        )}

        {topPages.length > 0 && (
          <>
            <Section style={tableSection}>
              <Heading as="h2" style={sectionHeading}>
                🏆 Top Performing Pages
              </Heading>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={tableHeader}>Page</th>
                    <th style={tableHeaderRight}>Views</th>
                    <th style={tableHeaderRight}>Unique</th>
                    <th style={tableHeaderRight}>Avg. Time</th>
                  </tr>
                </thead>
                <tbody>
                  {topPages.slice(0, 10).map((page, index) => (
                    <tr key={index}>
                      <td style={tableCell}>
                        <Text style={pagePath}>{page.path}</Text>
                      </td>
                      <td style={tableCellRight}>
                        {page.views.toLocaleString()}
                      </td>
                      <td style={tableCellRight}>
                        {page.uniqueVisitors.toLocaleString()}
                      </td>
                      <td style={tableCellRight}>
                        {page.avgTime}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
            <Hr style={divider} />
          </>
        )}

        <Section style={deviceSection}>
          <Heading as="h2" style={sectionHeading}>
            📱 Device & Browser Analytics
          </Heading>
          
          <div style={deviceGrid}>
            <div style={deviceCard}>
              <Text style={deviceIcon}>{getDeviceIcon("desktop")}</Text>
              <Text style={deviceName}>Desktop</Text>
              <Text style={devicePercentage}>{deviceBreakdown.desktop}%</Text>
            </div>
            <div style={deviceCard}>
              <Text style={deviceIcon}>{getDeviceIcon("mobile")}</Text>
              <Text style={deviceName}>Mobile</Text>
              <Text style={devicePercentage}>{deviceBreakdown.mobile}%</Text>
            </div>
            <div style={deviceCard}>
              <Text style={deviceIcon}>{getDeviceIcon("tablet")}</Text>
              <Text style={deviceName}>Tablet</Text>
              <Text style={devicePercentage}>{deviceBreakdown.tablet}%</Text>
            </div>
          </div>

          {browserBreakdown.length > 0 && (
            <div style={browserSection}>
              <Text style={browserTitle}>Top Browsers:</Text>
              {browserBreakdown.slice(0, 3).map((browser, index) => (
                <Text key={index} style={browserItem}>
                  • {browser.browser}: {browser.percentage}%
                </Text>
              ))}
            </div>
          )}
        </Section>

        <Hr style={divider} />

        {insights && insights.length > 0 && (
          <>
            <Section style={insightsSection}>
              <Heading as="h2" style={sectionHeading}>
                💡 Key Insights & Recommendations
              </Heading>
              {insights.map((insight, index) => (
                <Text key={index} style={insightItem}>
                  • {insight}
                </Text>
              ))}
            </Section>
            <Hr style={divider} />
          </>
        )}

        <Section style={ctaSection}>
          <Button style={button} href={dashboardUrl}>
            View Detailed Analytics
          </Button>
        </Section>

        <Section style={additionalActions}>
          <Text style={actionText}>
            📥 <Link href={`${dashboardUrl}/export`} style={link}>
              Export Full Report
            </Link>
            {"  "}•{"  "}
            🎯 <Link href={`${dashboardUrl}/goals`} style={link}>
              Set Goals for Next Month
            </Link>
            {"  "}•{"  "}
            📊 <Link href={`${dashboardUrl}/compare`} style={link}>
              Compare Periods
            </Link>
          </Text>
        </Section>

        <Text style={footerText}>
          Thank you for choosing Hector Analytics for your privacy-first 
          analytics needs. We're committed to helping you understand your 
          audience while respecting their privacy.
        </Text>

        <Text style={settingsText}>
          You're receiving this monthly report because you have it enabled in your settings. 
          <Link href={`${dashboardUrl}/settings/notifications`} style={link}>
            {" "}Manage your email preferences
          </Link>
        </Text>
      </Section>
    </BaseLayout>
  );
};

MonthlyReportEmail.PreviewProps = {
  userName: "John",
  siteName: "example.com",
  monthName: "January",
  year: 2024,
  stats: {
    totalVisitors: 15234,
    totalPageViews: 45678,
    avgSessionDuration: "3m 12s",
    bounceRate: 38,
    visitorsChange: 23,
    pageViewsChange: 18,
    uniqueVisitors: 12890,
    returningVisitors: 2344,
  },
  growthTrend: [
    { week: "Week 1", visitors: 3234, pageViews: 9876 },
    { week: "Week 2", visitors: 3567, pageViews: 10234 },
    { week: "Week 3", visitors: 3890, pageViews: 11567 },
    { week: "Week 4", visitors: 4543, pageViews: 14001 },
  ],
  topPages: [
    { path: "/", views: 12345, uniqueVisitors: 8901, avgTime: "2m 34s" },
    { path: "/blog", views: 8901, uniqueVisitors: 6234, avgTime: "4m 12s" },
    { path: "/about", views: 5678, uniqueVisitors: 4567, avgTime: "1m 45s" },
  ],
  deviceBreakdown: {
    desktop: 62,
    mobile: 33,
    tablet: 5,
  },
  browserBreakdown: [
    { browser: "Chrome", percentage: 65 },
    { browser: "Safari", percentage: 20 },
    { browser: "Firefox", percentage: 10 },
  ],
  insights: [
    "Mobile traffic increased by 15% this month - ensure your site is mobile-optimized",
    "Your blog posts are driving 35% of total traffic - consider publishing more content",
    "Bounce rate improved by 5% compared to last month",
  ],
} as MonthlyReportEmailProps;

export default MonthlyReportEmail;

const content = {
  padding: "32px",
};

const heading = {
  fontSize: "28px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 8px",
};

const siteNameText = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#3d9dbd",
  margin: "0 0 4px",
};

const dateRange = {
  fontSize: "16px",
  color: "#666666",
  margin: "0 0 24px",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#3c3c3c",
  margin: "0 0 16px",
};

const highlightSection = {
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
};

const sectionHeading = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 20px",
};

const metricsGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "16px",
};

const metricCard = {
  backgroundColor: "#ffffff",
  borderRadius: "6px",
  padding: "16px",
  textAlign: "center" as const,
  border: "1px solid #e6e6e6",
};

const metricLabel = {
  fontSize: "11px",
  color: "#666666",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 8px",
  fontWeight: "600",
};

const metricValue = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#1a1a1a",
  margin: "0",
};

const metricChange = {
  fontSize: "12px",
  fontWeight: "500",
  margin: "4px 0 0",
};

const metricSubtext = {
  fontSize: "12px",
  color: "#999999",
  margin: "4px 0 0",
};

const divider = {
  borderColor: "#e6e6e6",
  margin: "32px 0",
};

const tableSection = {
  margin: "24px 0",
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

const deviceSection = {
  margin: "24px 0",
};

const deviceGrid = {
  display: "flex",
  justifyContent: "space-around",
  margin: "20px 0",
};

const deviceCard = {
  textAlign: "center" as const,
  padding: "16px",
};

const deviceIcon = {
  fontSize: "32px",
  margin: "0 0 8px",
};

const deviceName = {
  fontSize: "14px",
  color: "#666666",
  margin: "0 0 4px",
};

const devicePercentage = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#3d9dbd",
  margin: "0",
};

const browserSection = {
  backgroundColor: "#f8f9fa",
  borderRadius: "6px",
  padding: "16px",
  marginTop: "20px",
};

const browserTitle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 12px",
};

const browserItem = {
  fontSize: "13px",
  color: "#3c3c3c",
  margin: "0 0 6px",
};

const insightsSection = {
  backgroundColor: "#fff9f0",
  borderLeft: "4px solid #f59e0b",
  padding: "20px",
  margin: "24px 0",
};

const insightItem = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#3c3c3c",
  margin: "0 0 12px",
};

const ctaSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#3d9dbd",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 40px",
};

const additionalActions = {
  textAlign: "center" as const,
  margin: "20px 0",
};

const actionText = {
  fontSize: "14px",
  color: "#666666",
  margin: "0",
};

const footerText = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#666666",
  margin: "24px 0 16px",
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