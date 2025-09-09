import Script from "next/script";
import PricingPageClient from "@/components/pricing-page-client";
import { pricingSchema } from "@/lib/schema";

export const metadata = {
  title: "Pricing - Hector Analytics | Privacy-First Web Analytics Plans",
  description:
    "Choose the perfect privacy-first analytics plan for your website. Cookie-free tracking from $9/month. GDPR compliant Google Analytics alternative with real-time insights.",
  keywords: [
    "privacy analytics pricing",
    "cookie-free analytics cost",
    "Google Analytics alternative pricing",
    "GDPR compliant analytics plans",
  ],
  alternates: {
    canonical: "https://www.hectoranalytics.com/pricing",
  },
  openGraph: {
    url: "https://www.hectoranalytics.com/pricing",
  },
};

export default function Page() {
  return (
    <>
      <Script
        id="pricing-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pricingSchema)
        }}
      />
      <PricingPageClient />
    </>
  );
}
