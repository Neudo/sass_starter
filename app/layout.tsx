import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import Script from "next/script";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Hector Analytics | Privacy-first alternative to Google Analytics",
  description:
    "Get actionable insights with Hector Analytics, a lightweight, privacy-first alternative to Google Analytics. No cookies, easy setup, full data control.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Hector Analytics | Privacy-First Web Analytics",
    description: "Cookie-free, GDPR compliant analytics that respects user privacy while delivering powerful insights.",
    url: "https://hectoranalytics.com",
    siteName: "Hector Analytics",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hector Analytics | Privacy-First Web Analytics",
    description: "Cookie-free, GDPR compliant analytics that respects user privacy while delivering powerful insights.",
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
      <body className="antialiased">
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
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Hector Analytics",
              "applicationCategory": "BusinessApplication",
              "description": "Privacy-first web analytics platform that provides actionable insights without cookies. GDPR compliant alternative to Google Analytics.",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "9",
                "priceCurrency": "EUR",
                "priceValidUntil": "2025-12-31"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "127"
              },
              "developer": {
                "@type": "Organization",
                "name": "Hector Analytics",
                "url": "https://hectoranalytics.com"
              }
            })
          }}
        />
        <Script src="/script.js" />
      </body>
    </html>
  );
}
