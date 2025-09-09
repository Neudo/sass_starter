import Script from "next/script";
import FaqPageClient from "@/components/faq-page-client";
import { generateFAQSchema } from "@/lib/schema";
import { faqs } from "@/data/faq";

const faqSchema = generateFAQSchema(
  faqs.map(faq => ({
    question: faq.title,
    answer: faq.description
  }))
);

export const metadata = {
  title: "FAQ - Hector Analytics | Privacy-First Web Analytics Questions",
  description: "Find answers to frequently asked questions about Hector Analytics, the privacy-first alternative to Google Analytics. GDPR compliance, setup, and pricing info.",
  alternates: {
    canonical: "https://www.hectoranalytics.com/faq",
  },
  openGraph: {
    title: "Hector Analytics FAQ - Privacy Analytics Questions Answered",
    description: "Get answers about cookie-free web analytics, GDPR compliance, and privacy-first tracking solutions.",
    url: "https://www.hectoranalytics.com/faq",
  },
};

export default function Page() {
  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema)
        }}
      />
      <FaqPageClient />
    </>
  );
}
