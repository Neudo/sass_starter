import FaqPageClient from "@/components/faq-page-client";

export const metadata = {
  title: "FAQ - Hector Analytics | Privacy-First Web Analytics Questions",
  description: "Find answers to frequently asked questions about Hector Analytics, the privacy-first alternative to Google Analytics. GDPR compliance, setup, and pricing info.",
  openGraph: {
    title: "Hector Analytics FAQ - Privacy Analytics Questions Answered",
    description: "Get answers about cookie-free web analytics, GDPR compliance, and privacy-first tracking solutions.",
  },
};

export default function Page() {
  return <FaqPageClient />;
}
