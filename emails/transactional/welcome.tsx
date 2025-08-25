import {
  Button,
  Heading,
  Hr,
  Link,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "../base-layout";

interface WelcomeEmailProps {
  userEmail: string;
  userName?: string;
  dashboardUrl?: string;
}

export const WelcomeEmail = ({
  userEmail,
  userName = "there",
  dashboardUrl = "https://app.hectoranalytics.com/dashboard",
}: WelcomeEmailProps) => {
  const preview = `Welcome to Hector Analytics - Let's get started`;

  return (
    <BaseLayout preview={preview}>
      <Section style={content}>
        <Heading style={heading}>Welcome to Hector Analytics! 🎉</Heading>
        
        <Text style={paragraph}>
          Hi {userName},
        </Text>

        <Text style={paragraph}>
          Thank you for choosing Hector Analytics for your privacy-first web analytics needs. 
          We're excited to help you understand your website traffic while respecting your 
          visitors' privacy.
        </Text>

        <Section style={ctaSection}>
          <Button style={button} href={dashboardUrl}>
            Go to Dashboard
          </Button>
        </Section>

        <Hr style={divider} />

        <Heading as="h2" style={subheading}>
          Getting Started in 3 Simple Steps:
        </Heading>

        <Section style={stepSection}>
          <Text style={stepNumber}>1</Text>
          <Text style={stepText}>
            <strong>Add your website</strong>
            <br />
            Register your domain in the dashboard to start tracking
          </Text>
        </Section>

        <Section style={stepSection}>
          <Text style={stepNumber}>2</Text>
          <Text style={stepText}>
            <strong>Install the tracking script</strong>
            <br />
            Add our lightweight, cookie-free script to your website
          </Text>
        </Section>

        <Section style={stepSection}>
          <Text style={stepNumber}>3</Text>
          <Text style={stepText}>
            <strong>View your analytics</strong>
            <br />
            Watch real-time data flow in without compromising privacy
          </Text>
        </Section>

        <Hr style={divider} />

        <Text style={paragraph}>
          <strong>Why Hector Analytics?</strong>
        </Text>

        <Text style={listItem}>
          ✓ <strong>100% Cookie-free</strong> - No annoying cookie banners needed
        </Text>
        <Text style={listItem}>
          ✓ <strong>GDPR Compliant</strong> - Privacy-first by design
        </Text>
        <Text style={listItem}>
          ✓ <strong>Simple & Clean</strong> - Focus on metrics that matter
        </Text>
        <Text style={listItem}>
          ✓ <strong>Lightweight</strong> - Less than 1KB tracking script
        </Text>

        <Hr style={divider} />

        <Text style={paragraph}>
          Need help getting started? Check out our{" "}
          <Link href="https://docs.hectoranalytics.com" style={link}>
            documentation
          </Link>{" "}
          or reply to this email - we're here to help!
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

WelcomeEmail.PreviewProps = {
  userEmail: "user@example.com",
  userName: "John",
  dashboardUrl: "https://app.hectoranalytics.com/dashboard",
} as WelcomeEmailProps;

export default WelcomeEmail;

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
  padding: "12px 24px",
};

const divider = {
  borderColor: "#e6e6e6",
  margin: "32px 0",
};

const stepSection = {
  display: "flex",
  alignItems: "flex-start",
  marginBottom: "20px",
};

const stepNumber = {
  backgroundColor: "#3d9dbd",
  color: "#ffffff",
  width: "28px",
  height: "28px",
  borderRadius: "50%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "14px",
  fontWeight: "600",
  marginRight: "12px",
  flexShrink: 0,
};

const stepText = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#3c3c3c",
  margin: "0",
  flex: 1,
};

const listItem = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#3c3c3c",
  margin: "0 0 8px",
  paddingLeft: "8px",
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