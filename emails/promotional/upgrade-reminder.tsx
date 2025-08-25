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

interface UpgradeReminderEmailProps {
  userName?: string;
  currentPlan?: string;
  upgradeUrl?: string;
  featuresUnlocked?: string[];
}

export const UpgradeReminderEmail = ({
  userName = "there",
  currentPlan = "Free",
  upgradeUrl = "https://app.hectoranalytics.com/settings/billing",
  featuresUnlocked = [
    "Unlimited websites",
    "Advanced analytics & insights",
    "Custom event tracking",
    "API access",
    "Priority support",
    "Data export capabilities",
  ],
}: UpgradeReminderEmailProps) => {
  const preview = "Unlock the full power of Hector Analytics";

  return (
    <BaseLayout preview={preview}>
      <Section style={content}>
        <Heading style={heading}>
          Take Your Analytics to the Next Level 🚀
        </Heading>

        <Text style={paragraph}>Hi {userName},</Text>

        <Text style={paragraph}>
          We hope you're enjoying Hector Analytics on the {currentPlan} plan! 
          We wanted to let you know about some powerful features that could 
          help you get even more insights from your website data.
        </Text>

        <Section style={featureSection}>
          <Heading as="h2" style={subheading}>
            What You'll Unlock with Pro:
          </Heading>

          {featuresUnlocked.map((feature, index) => (
            <Text key={index} style={featureItem}>
              ✓ {feature}
            </Text>
          ))}
        </Section>

        <Section style={ctaSection}>
          <Button style={button} href={upgradeUrl}>
            Upgrade to Pro
          </Button>
        </Section>

        <Section style={testimonialSection}>
          <Text style={testimonialQuote}>
            "Switching to Hector Analytics Pro gave us the detailed insights 
            we needed while keeping our visitors' privacy intact. The advanced 
            features paid for themselves in the first month!"
          </Text>
          <Text style={testimonialAuthor}>
            - Sarah Chen, Marketing Director
          </Text>
        </Section>

        <Hr style={divider} />

        <Section style={comparisonSection}>
          <Heading as="h3" style={comparisonHeading}>
            Pro vs Free at a Glance:
          </Heading>

          <table style={comparisonTable}>
            <thead>
              <tr>
                <th style={tableHeader}>Feature</th>
                <th style={tableHeader}>Free</th>
                <th style={tableHeaderHighlight}>Pro</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={tableCell}>Websites</td>
                <td style={tableCellCenter}>1</td>
                <td style={tableCellHighlight}>Unlimited</td>
              </tr>
              <tr>
                <td style={tableCell}>Page views/month</td>
                <td style={tableCellCenter}>10,000</td>
                <td style={tableCellHighlight}>Unlimited</td>
              </tr>
              <tr>
                <td style={tableCell}>Data retention</td>
                <td style={tableCellCenter}>30 days</td>
                <td style={tableCellHighlight}>Forever</td>
              </tr>
              <tr>
                <td style={tableCell}>Custom events</td>
                <td style={tableCellCenter}>❌</td>
                <td style={tableCellHighlight}>✓</td>
              </tr>
              <tr>
                <td style={tableCell}>API access</td>
                <td style={tableCellCenter}>❌</td>
                <td style={tableCellHighlight}>✓</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Hr style={divider} />

        <Text style={paragraph}>
          <strong>Special Offer:</strong> Upgrade today and get 20% off your 
          first 3 months with code <span style={promoCode}>PRIVACY20</span>
        </Text>

        <Text style={footerText}>
          Questions about upgrading? Reply to this email or check out our{" "}
          <Link href="https://hectoranalytics.com/pricing" style={link}>
            pricing page
          </Link>{" "}
          for more details.
        </Text>

        <Text style={signature}>
          Best regards,
          <br />
          The Hector Analytics Team
        </Text>
      </Section>
    </BaseLayout>
  );
};

UpgradeReminderEmail.PreviewProps = {
  userName: "John",
  currentPlan: "Free",
  upgradeUrl: "https://app.hectoranalytics.com/settings/billing",
} as UpgradeReminderEmailProps;

export default UpgradeReminderEmail;

const content = {
  padding: "32px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 24px",
};

const subheading = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "24px 0 16px",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#3c3c3c",
  margin: "0 0 16px",
};

const featureSection = {
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
};

const featureItem = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#3c3c3c",
  margin: "0 0 12px",
  paddingLeft: "8px",
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
  padding: "14px 32px",
};

const testimonialSection = {
  backgroundColor: "#fff9f0",
  borderLeft: "4px solid #3d9dbd",
  padding: "20px",
  margin: "32px 0",
};

const testimonialQuote = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#3c3c3c",
  fontStyle: "italic",
  margin: "0 0 12px",
};

const testimonialAuthor = {
  fontSize: "13px",
  color: "#666666",
  margin: "0",
};

const divider = {
  borderColor: "#e6e6e6",
  margin: "32px 0",
};

const comparisonSection = {
  margin: "24px 0",
};

const comparisonHeading = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 16px",
};

const comparisonTable = {
  width: "100%",
  borderCollapse: "collapse" as const,
  fontSize: "14px",
};

const tableHeader = {
  backgroundColor: "#f8f9fa",
  padding: "12px",
  textAlign: "left" as const,
  borderBottom: "2px solid #e6e6e6",
  fontWeight: "600",
  color: "#666666",
};

const tableHeaderHighlight = {
  ...tableHeader,
  backgroundColor: "#e8f4f7",
  color: "#3d9dbd",
};

const tableCell = {
  padding: "12px",
  borderBottom: "1px solid #e6e6e6",
  color: "#3c3c3c",
};

const tableCellCenter = {
  ...tableCell,
  textAlign: "center" as const,
  color: "#999999",
};

const tableCellHighlight = {
  ...tableCell,
  textAlign: "center" as const,
  backgroundColor: "#f8fdff",
  color: "#3d9dbd",
  fontWeight: "600",
};

const promoCode = {
  backgroundColor: "#fff3cd",
  padding: "2px 8px",
  borderRadius: "4px",
  fontFamily: "monospace",
  fontSize: "14px",
  color: "#856404",
  fontWeight: "600",
};

const footerText = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#666666",
  margin: "16px 0",
};

const link = {
  color: "#3d9dbd",
  textDecoration: "underline",
};

const signature = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#3c3c3c",
  margin: "24px 0 0",
};