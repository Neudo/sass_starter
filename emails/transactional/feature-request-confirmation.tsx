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

interface FeatureRequestConfirmationEmailProps {
  userEmail: string;
  userName?: string;
  subject: string;
  message: string;
}

export const FeatureRequestConfirmationEmail = ({
  userEmail,
  userName,
  subject,
  message,
}: FeatureRequestConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>
      We've received your feature request for Hector Analytics
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
        <Text style={heading}>Feature Request Received</Text>
        <Text style={paragraph}>
          Hi {userName || userEmail.split('@')[0]},
        </Text>
        <Text style={paragraph}>
          Thank you for taking the time to share your idea with us! We&apos;ve successfully 
          received your feature request and our team will review it carefully.
        </Text>
        
        <Section style={requestSection}>
          <Text style={requestTitle}>Your Request:</Text>
          <Text style={requestSubject}><strong>Subject:</strong> {subject}</Text>
          <Text style={requestMessage}><strong>Description:</strong></Text>
          <Text style={requestMessage}>{message}</Text>
        </Section>

        <Text style={paragraph}>
          <strong>What happens next?</strong>
        </Text>
        <Text style={paragraph}>
          • Our product team will review your request within 48 hours<br />
          • We&apos;ll evaluate its feasibility and potential impact<br />
          • If approved, we&apos;ll add it to our development roadmap<br />
          • You&apos;ll receive updates on the progress
        </Text>

        <Text style={paragraph}>
          Your feedback is invaluable in helping us build a better analytics platform. 
          We appreciate you being part of our community!
        </Text>

        <Text style={paragraph}>
          Best regards,<br />
          The Hector Analytics Team
        </Text>

        <Hr style={hr} />
        <Text style={footer}>
          This email was sent to {userEmail}. If you have any questions, 
          feel free to <Link href="mailto:support@hectoranalytics.com" style={link}>
            contact our support team
          </Link>.
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

const link = {
  color: "#067df7",
  textDecoration: "underline",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "1.4",
};