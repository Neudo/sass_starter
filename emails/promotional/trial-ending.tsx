import {
  Button,
  Heading,
  Hr,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "../base-layout";

interface TrialEndingEmailProps {
  userName?: string;
  daysRemaining: number;
  upgradeUrl: string;
  currentUsage?: {
    pageViews: number;
    uniqueVisitors: number;
    sites: number;
  };
}

export const TrialEndingEmail = ({
  userName = "there",
  daysRemaining,
  upgradeUrl,
  currentUsage,
}: TrialEndingEmailProps) => {
  return (
    <BaseLayout preview={`Your free trial ends in ${daysRemaining} days`}>
      <Section style={content}>
        <Section style={alertBanner}>
          <Text style={alertText}>
            ⏰ Your free trial ends in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
          </Text>
        </Section>

        <Heading style={heading}>Don't Lose Your Analytics Data!</Heading>
        
        <Text style={paragraph}>
          Hi {userName},
        </Text>
        
        <Text style={paragraph}>
          Your Hector Analytics free trial is coming to an end soon. We hope you've enjoyed using our privacy-first analytics platform!
        </Text>

        {currentUsage && (
          <Section style={statsBox}>
            <Text style={statsTitle}>Your Analytics This Month:</Text>
            <Section style={statsGrid}>
              <Section style={statItem}>
                <Text style={statValue}>{currentUsage.pageViews.toLocaleString()}</Text>
                <Text style={statLabel}>Page Views</Text>
              </Section>
              <Section style={statItem}>
                <Text style={statValue}>{currentUsage.uniqueVisitors.toLocaleString()}</Text>
                <Text style={statLabel}>Unique Visitors</Text>
              </Section>
              <Section style={statItem}>
                <Text style={statValue}>{currentUsage.sites}</Text>
                <Text style={statLabel}>Site{currentUsage.sites !== 1 ? 's' : ''} Tracked</Text>
              </Section>
            </Section>
          </Section>
        )}
        
        <Text style={paragraph}>
          <strong>What happens when your trial ends?</strong>
        </Text>
        
        <Section style={featureList}>
          <Text style={listItem}>❌ Analytics tracking will stop</Text>
          <Text style={listItem}>❌ Dashboard access will be restricted</Text>
          <Text style={listItem}>❌ Historical data may be archived</Text>
        </Section>
        
        <Section style={buttonContainer}>
          <Button style={button} href={upgradeUrl}>
            Upgrade Now & Save 20%
          </Button>
        </Section>
        
        <Text style={centerText}>
          Use code <strong style={promoCode}>TRIAL20</strong> at checkout
        </Text>
        
        <Hr style={hr} />
        
        <Heading style={subheading}>Why Choose Hector Analytics?</Heading>
        
        <Section style={benefitsList}>
          <Text style={benefitItem}>
            ✅ <strong>No cookies required</strong> - 100% GDPR compliant
          </Text>
          <Text style={benefitItem}>
            ✅ <strong>Lightning fast</strong> - Under 1KB script size
          </Text>
          <Text style={benefitItem}>
            ✅ <strong>Real-time data</strong> - See visitor activity instantly
          </Text>
          <Text style={benefitItem}>
            ✅ <strong>Privacy-first</strong> - Your visitors' data stays private
          </Text>
        </Section>
        
        <Text style={note}>
          Questions? Reply to this email or visit our support center. We're here to help!
        </Text>
      </Section>
    </BaseLayout>
  );
};

TrialEndingEmail.PreviewProps = {
  userName: "John",
  daysRemaining: 7,
  upgradeUrl: "https://hectoranalytics.com/upgrade",
  currentUsage: {
    pageViews: 45230,
    uniqueVisitors: 3421,
    sites: 2,
  },
} as TrialEndingEmailProps;

export default TrialEndingEmail;

const content = {
  padding: "0 32px 32px",
};

const alertBanner = {
  backgroundColor: "#fff3cd",
  borderRadius: "6px 6px 0 0",
  padding: "16px",
  margin: "0 -32px 24px",
  borderBottom: "2px solid #ffc107",
};

const alertText = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#856404",
  textAlign: "center" as const,
  margin: "0",
};

const heading = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 24px",
  textAlign: "center" as const,
};

const subheading = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 16px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#333333",
  margin: "0 0 16px",
};

const statsBox = {
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  border: "1px solid #e6e6e6",
};

const statsTitle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#666666",
  margin: "0 0 16px",
  textAlign: "center" as const,
};

const statsGrid = {
  display: "flex",
  justifyContent: "space-around",
};

const statItem = {
  textAlign: "center" as const,
};

const statValue = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#3d9dbd",
  margin: "0",
};

const statLabel = {
  fontSize: "12px",
  color: "#666666",
  margin: "4px 0 0",
  textTransform: "uppercase" as const,
};

const featureList = {
  backgroundColor: "#fff5f5",
  borderRadius: "6px",
  padding: "16px",
  margin: "16px 0 24px",
  border: "1px solid #ffcccc",
};

const listItem = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#333333",
  margin: "0 0 8px",
};

const benefitsList = {
  margin: "16px 0 24px",
};

const benefitItem = {
  fontSize: "15px",
  lineHeight: "28px",
  color: "#333333",
  margin: "0 0 8px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0 16px",
};

const button = {
  backgroundColor: "#3d9dbd",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "18px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 40px",
};

const centerText = {
  fontSize: "14px",
  color: "#666666",
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const promoCode = {
  backgroundColor: "#e7f5f8",
  padding: "4px 8px",
  borderRadius: "4px",
  color: "#3d9dbd",
  fontSize: "16px",
};

const hr = {
  borderColor: "#e6e6e6",
  margin: "32px 0",
};

const note = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#666666",
  margin: "0",
  textAlign: "center" as const,
};