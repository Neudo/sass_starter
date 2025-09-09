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
    title: "What if I exceed my plan's limits?",
    description:
      "We'll inform you when you will be at 80% of the limit of your current plan. If you exceed the event limit two times in a row, we'll contact you to upgrade to a higher plan.",
  },
  {
    title: "Can I integrate Hector Analytics with other tools?",
    description:
      "Yes, we provide a simple API and integrations for popular frameworks to send data wherever you need it.",
  },
  {
    title: "Is there a free trial available?",
    description: "No. But, you car start with Hobby plan for free.",
  },
  {
    title: "How often are analytics updated?",
    description:
      "Metrics are updated in real time, letting you react instantly to changes in traffic.",
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
