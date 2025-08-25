import {
  Button,
  Heading,
  Hr,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "../base-layout";

interface ResetPasswordEmailProps {
  resetUrl: string;
  userName?: string;
  userEmail?: string;
}

export const ResetPasswordEmail = ({
  resetUrl,
  userName = "there",
  userEmail,
}: ResetPasswordEmailProps) => {
  return (
    <BaseLayout preview="Reset your Hector Analytics password">
      <Section style={content}>
        <Heading style={heading}>Reset Your Password</Heading>
        
        <Text style={paragraph}>
          Hi {userName},
        </Text>
        
        <Text style={paragraph}>
          We received a request to reset the password for your Hector Analytics account
          {userEmail && <> associated with {userEmail}</>}.
        </Text>
        
        <Text style={paragraph}>
          Click the button below to reset your password:
        </Text>
        
        <Section style={buttonContainer}>
          <Button style={button} href={resetUrl}>
            Reset Password
          </Button>
        </Section>
        
        <Text style={paragraph}>
          Or copy and paste this URL into your browser:
        </Text>
        
        <Text style={codeBlock}>
          {resetUrl}
        </Text>
        
        <Hr style={hr} />
        
        <Text style={note}>
          This link will expire in 1 hour for security reasons. If you didn't request a password reset, you can safely ignore this email. Your password won't be changed until you create a new one.
        </Text>
        
        <Text style={securityNote}>
          <strong>Security tip:</strong> Never share your password or this reset link with anyone. Hector Analytics staff will never ask for your password.
        </Text>
      </Section>
    </BaseLayout>
  );
};

ResetPasswordEmail.PreviewProps = {
  resetUrl: "https://hectoranalytics.com/auth/reset-password?token=example-token",
  userName: "John",
  userEmail: "john@example.com",
} as ResetPasswordEmailProps;

export default ResetPasswordEmail;

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
  margin: "0 0 16px",
};

const securityNote = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#666666",
  backgroundColor: "#fff9e6",
  padding: "12px",
  borderRadius: "4px",
  border: "1px solid #ffd966",
  margin: "16px 0 0",
};