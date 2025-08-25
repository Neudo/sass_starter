import * as React from "react";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface FeatureRequestNotificationEmailProps {
  userEmail: string;
  userName?: string;
  subject: string;
  message: string;
}

export const FeatureRequestNotificationEmail = ({
  userEmail,
  userName,
  subject,
  message,
}: FeatureRequestNotificationEmailProps) => (
  <Html>
    <Head />
    <Preview>
      New feature request: {subject}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src="https://hectoranalytics.com/logo.png"
          width="40"
          height="40"
          alt="Hector Analytics"
          style={logo}
        />
        <Text style={heading}>New Feature Request</Text>
        <Text style={paragraph}>
          A new feature request has been submitted by a user.
        </Text>
        
        <Section style={userSection}>
          <Text style={userTitle}>User Information:</Text>
          <Text style={userInfo}><strong>Name:</strong> {userName || "Not provided"}</Text>
          <Text style={userInfo}><strong>Email:</strong> {userEmail}</Text>
        </Section>

        <Section style={requestSection}>
          <Text style={requestTitle}>Feature Request:</Text>
          <Text style={requestSubject}><strong>Subject:</strong> {subject}</Text>
          <Text style={requestMessage}><strong>Description:</strong></Text>
          <Text style={requestMessage}>{message}</Text>
        </Section>

        <Text style={paragraph}>
          Please review this request and consider adding it to the product roadmap 
          if it aligns with our goals and user needs.
        </Text>

        <Hr style={hr} />
        <Text style={footer}>
          This notification was sent from the Hector Analytics feature request system.
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const logo = {
  margin: "0 auto",
};

const heading = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "400",
  color: "#484848",
  padding: "17px 0 0",
};

const paragraph = {
  margin: "0 0 15px",
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#3c4149",
};

const userSection = {
  backgroundColor: "#f0f9ff",
  borderRadius: "4px",
  padding: "24px",
  margin: "24px 0",
};

const userTitle = {
  margin: "0 0 12px",
  fontSize: "16px",
  fontWeight: "600",
  color: "#1f2937",
};

const userInfo = {
  margin: "0 0 8px",
  fontSize: "14px",
  color: "#374151",
};

const requestSection = {
  backgroundColor: "#f6f9fc",
  borderRadius: "4px",
  padding: "24px",
  margin: "24px 0",
};

const requestTitle = {
  margin: "0 0 12px",
  fontSize: "16px",
  fontWeight: "600",
  color: "#1f2937",
};

const requestSubject = {
  margin: "0 0 12px",
  fontSize: "14px",
  color: "#374151",
};

const requestMessage = {
  margin: "0 0 8px",
  fontSize: "14px",
  lineHeight: "1.5",
  color: "#374151",
  whiteSpace: "pre-wrap" as const,
};

const hr = {
  borderColor: "#dfe1e4",
  margin: "42px 0 26px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "1.4",
};