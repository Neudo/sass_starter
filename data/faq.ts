export interface FAQItem {
  title: string;
  description: string;
}

export const faqs: FAQItem[] = [
  {
    title: "What is Hector Analytics?",
    description:
      "Hector Analytics is a privacy-first analytics platform that turns visitor data into actionable insights without using cookies.",
  },
  {
    title: "Do I need any coding skills to use the dashboard?",
    description:
      "No, the interface is designed for non-technical users. You can start tracking metrics immediately after installing the snippet.",
  },
  {
    title: "How is my data protected?",
    description:
      "All data is stored in the EU and processed according to GDPR guidelines. We never sell or share your information.",
  },
  {
    title: "Can I integrate Hector Analytics with other tools?",
    description:
      "Yes, we provide a simple API and integrations for popular frameworks to send data wherever you need it.",
  },
  {
    title: "Is there a free trial available?",
    description:
      "Every new account includes a 30-day free trial with full access to all features.",
  },
  {
    title: "How often are analytics updated?",
    description:
      "Metrics are updated in real time, letting you react instantly to changes in traffic.",
  },
  {
    title: "Can I export my data?",
    description:
      "Data can be exported as CSV or accessed programmatically through our API at any time.",
  },
  {
    title: "Do you support GDPR compliance?",
    description:
      "Yes, Hector Analytics is fully compliant and provides tools to help you meet your own regulatory obligations.",
  },
  {
    title: "What happens if I exceed my plan's limits?",
    description:
      "We'll notify you when you're close to the limit and you can upgrade or talk to us about a custom plan.",
  },
  {
    title: "How can I contact support?",
    description:
      "You can reach our support team via the in-app chat or by emailing support@hectoranalytics.com.",
  },
];
