import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { combinedHomeSchema } from "@/lib/schema";
import "./globals.css";
import Script from "next/script";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "https://www.hectoranalytics.com";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Hector Analytics | Privacy-first alternative to Google Analytics",
  description:
    "Get actionable insights with Hector Analytics, a lightweight, privacy-first alternative to Google Analytics. No cookies, easy setup, full data control.",
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: defaultUrl,
  },
  openGraph: {
    title: "Hector Analytics | Privacy-First Web Analytics",
    description:
      "Cookie-free, GDPR compliant analytics that respects user privacy while delivering powerful insights.",
    url: defaultUrl,
    siteName: "Hector Analytics",
    type: "website",
    images: [
      {
        url: "/images/twitter-card.jpg",
        width: 1200,
        height: 630,
        alt: "Hector Analytics - Privacy-First Web Analytics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hector Analytics | Privacy-First Web Analytics",
    description:
      "Cookie-free, GDPR compliant analytics that respects user privacy while delivering powerful insights.",
    images: ["/images/twitter-card.jpg"],
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en" className={geistSans.variable}>
      <body suppressHydrationWarning className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
        <Script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(combinedHomeSchema),
          }}
        />
        <Script src="/script.js" />
      </body>
    </html>
  );
}
