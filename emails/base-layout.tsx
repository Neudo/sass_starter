import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface BaseLayoutProps {
  preview: string;
  children: React.ReactNode;
  footerText?: string;
}

export const BaseLayout = ({
  preview,
  children,
  footerText = "Hector Analytics - Privacy-first web analytics",
}: BaseLayoutProps) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://hectoranalytics.com/logo.png"
              width="150"
              height="50"
              alt="Hector Analytics"
              style={logo}
            />
          </Section>

          {children}

          <Section style={footer}>
            <Text style={footerTextStyle}>{footerText}</Text>
            <Text style={footerLinks}>
              <Link href="https://hectoranalytics.com" style={link}>
                Website
              </Link>
              {" • "}
              <Link href="https://hectoranalytics.com/privacy" style={link}>
                Privacy Policy
              </Link>
              {" • "}
              <Link href="https://hectoranalytics.com/terms" style={link}>
                Terms of Service
              </Link>
            </Text>
            <Text style={copyright}>
              © {new Date().getFullYear()} Hector Analytics. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  borderRadius: "8px",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
};

const header = {
  padding: "24px 32px",
  borderBottom: "1px solid #e6e6e6",
};

const logo = {
  margin: "0 auto",
};

const footer = {
  padding: "32px",
  textAlign: "center" as const,
  borderTop: "1px solid #e6e6e6",
  marginTop: "32px",
};

const footerTextStyle = {
  fontSize: "14px",
  color: "#666666",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const footerLinks = {
  fontSize: "12px",
  color: "#666666",
  lineHeight: "20px",
  margin: "0 0 8px",
};

const link = {
  color: "#3d9dbd",
  textDecoration: "none",
};

const copyright = {
  fontSize: "12px",
  color: "#999999",
  lineHeight: "20px",
  margin: "0",
};