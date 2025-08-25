import { Button, Heading, Hr, Section, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "../base-layout";

interface ConfirmSignupEmailProps {
  confirmationUrl: string;
  userName?: string;
}

export const ConfirmSignupEmail = ({
  confirmationUrl,
  userName = "there",
}: ConfirmSignupEmailProps) => {
  return (
    <BaseLayout preview="Confirm your Hector Analytics account">
      <Section style={content}>
        <Heading style={heading}>Welcome to Hector Analytics!</Heading>

        <Text style={paragraph}>Hi {userName},</Text>

        <Text style={paragraph}>
          Thanks for signing up for Hector Analytics. We&apos;re excited to help
          you understand your website visitors while respecting their privacy.
        </Text>

        <Text style={paragraph}>
          Please confirm your email address by clicking the button below:
        </Text>

        <Section style={buttonContainer}>
          <Button style={button} href={confirmationUrl}>
            Confirm Email Address
          </Button>
        </Section>

        <Text style={paragraph}>
          Or copy and paste this URL into your browser:
        </Text>

        <Text style={codeBlock}>{confirmationUrl}</Text>

        <Hr style={hr} />

        <Text style={note}>
          This link will expire in 24 hours. If you didn&apos;t create an
          account with Hector Analytics, you can safely ignore this email.
        </Text>
      </Section>
    </BaseLayout>
  );
};

ConfirmSignupEmail.PreviewProps = {
  confirmationUrl:
    "https://hectoranalytics.com/auth/confirm?token=example-token",
  userName: "John",
} as ConfirmSignupEmailProps;

export default ConfirmSignupEmail;

const content = {
  padding: "32px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 24px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#333333",
  margin: "0 0 16px",
};

const buttonContainer = {
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
  padding: "12px 32px",
};

const codeBlock = {
  backgroundColor: "#f4f4f4",
  borderRadius: "4px",
  color: "#666666",
  fontSize: "14px",
  lineHeight: "20px",
  padding: "12px",
  margin: "16px 0",
  wordBreak: "break-all" as const,
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
};
