import {
  Button,
  Heading,
  Hr,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "../base-layout";

interface ChangeEmailProps {
  confirmationUrl: string;
  userName?: string;
  oldEmail: string;
  newEmail: string;
}

export const ChangeEmailEmail = ({
  confirmationUrl,
  userName = "there",
  oldEmail,
  newEmail,
}: ChangeEmailProps) => {
  return (
    <BaseLayout preview="Confirm your email address change">
      <Section style={content}>
        <Heading style={heading}>Confirm Email Address Change</Heading>
        
        <Text style={paragraph}>
          Hi {userName},
        </Text>
        
        <Text style={paragraph}>
          We received a request to change the email address associated with your Hector Analytics account.
        </Text>
        
        <Section style={emailChangeBox}>
          <Text style={emailChangeLabel}>Current email:</Text>
          <Text style={emailChangeValue}>{oldEmail}</Text>
          
          <Text style={emailChangeLabel}>New email:</Text>
          <Text style={emailChangeValue}>{newEmail}</Text>
        </Section>
        
        <Text style={paragraph}>
          To confirm this change, please click the button below:
        </Text>
        
        <Section style={buttonContainer}>
          <Button style={button} href={confirmationUrl}>
            Confirm Email Change
          </Button>
        </Section>
        
        <Text style={paragraph}>
          Or copy and paste this URL into your browser:
        </Text>
        
        <Text style={codeBlock}>
          {confirmationUrl}
        </Text>
        
        <Hr style={hr} />
        
        <Text style={warningNote}>
          <strong>⚠️ Important:</strong> After confirming this change, you'll need to use your new email address ({newEmail}) to log in to your account.
        </Text>
        
        <Text style={note}>
          This link will expire in 24 hours. If you didn't request this email change, please contact our support team immediately as your account may be compromised.
        </Text>
      </Section>
    </BaseLayout>
  );
};

ChangeEmailEmail.PreviewProps = {
  confirmationUrl: "https://hectoranalytics.com/auth/confirm-email-change?token=example-token",
  userName: "John",
  oldEmail: "john.old@example.com",
  newEmail: "john.new@example.com",
} as ChangeEmailProps;

export default ChangeEmailEmail;

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

const emailChangeBox = {
  backgroundColor: "#f8f9fa",
  borderRadius: "6px",
  padding: "16px",
  margin: "24px 0",
  border: "1px solid #e6e6e6",
};

const emailChangeLabel = {
  fontSize: "14px",
  color: "#666666",
  margin: "0 0 4px",
  fontWeight: "600",
};

const emailChangeValue = {
  fontSize: "16px",
  color: "#1a1a1a",
  margin: "0 0 12px",
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

const warningNote = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#d73502",
  backgroundColor: "#fff5f5",
  padding: "12px",
  borderRadius: "4px",
  border: "1px solid #ff9999",
  margin: "0 0 16px",
};

const note = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#666666",
  margin: "0",
};