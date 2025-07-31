"use client";
import { PricingSection } from "@/components/pricing-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight, HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Navigation } from "@/components/navigation";

export default function Page() {
  const comparisonFeatures = [
    {
      category: "Basic Analytics",
      features: [
        { name: "Page views", starter: true, pro: true, enterprise: true },
        { name: "Unique visitors", starter: true, pro: true, enterprise: true },
        { name: "Sessions", starter: true, pro: true, enterprise: true },
        { name: "Bounce rate", starter: true, pro: true, enterprise: true },
        {
          name: "Session duration",
          starter: true,
          pro: true,
          enterprise: true,
        },
      ],
    },
    {
      category: "Traffic Sources",
      features: [
        { name: "Referrers", starter: true, pro: true, enterprise: true },
        { name: "Search engines", starter: true, pro: true, enterprise: true },
        { name: "Social networks", starter: true, pro: true, enterprise: true },
        { name: "UTM campaigns", starter: false, pro: true, enterprise: true },
        {
          name: "Keyword analysis",
          starter: false,
          pro: true,
          enterprise: true,
        },
      ],
    },
    {
      category: "Technology",
      features: [
        { name: "Devices", starter: true, pro: true, enterprise: true },
        { name: "Browsers", starter: true, pro: true, enterprise: true },
        {
          name: "Operating systems",
          starter: true,
          pro: true,
          enterprise: true,
        },
        {
          name: "Screen resolutions",
          starter: false,
          pro: true,
          enterprise: true,
        },
        { name: "Languages", starter: false, pro: true, enterprise: true },
      ],
    },
    {
      category: "Advanced Features",
      features: [
        { name: "Custom alerts", starter: false, pro: true, enterprise: true },
        {
          name: "Custom dashboards",
          starter: false,
          pro: true,
          enterprise: true,
        },
        { name: "Data export", starter: false, pro: true, enterprise: true },
        { name: "API access", starter: false, pro: false, enterprise: true },
        {
          name: "Third-party integrations",
          starter: false,
          pro: false,
          enterprise: true,
        },
      ],
    },
    {
      category: "Support",
      features: [
        { name: "Email support", starter: true, pro: true, enterprise: true },
        {
          name: "Priority support",
          starter: false,
          pro: true,
          enterprise: true,
        },
        { name: "Phone support", starter: false, pro: false, enterprise: true },
        {
          name: "Dedicated manager",
          starter: false,
          pro: false,
          enterprise: true,
        },
        {
          name: "Custom training",
          starter: false,
          pro: false,
          enterprise: true,
        },
      ],
    },
  ];

  const faqs = [
    {
      question: "Can I change my plan anytime?",
      answer:
        "Yes, you can upgrade or downgrade your plan at any time. Changes are applied immediately and billed pro-rata.",
    },
    {
      question: "What happens if I exceed my limits?",
      answer:
        "You'll receive a notification before reaching 80% of your limit. If you exceed it, we'll automatically offer to upgrade you to the next plan.",
    },
    {
      question: "Is my data really private?",
      answer:
        "Absolutely. We don't collect any personal data, no cookies, and all data is anonymized. We are GDPR compliant by default.",
    },
    {
      question: "How does the free trial work?",
      answer:
        "The 30-day free trial gives you access to all features of the chosen plan. No credit card required to start.",
    },
    {
      question: "Can I import my data from Google Analytics?",
      answer:
        "Yes, we provide a free migration tool to import your historical data from Google Analytics, Universal Analytics or GA4.",
    },
    {
      question: "How does support work?",
      answer:
        "All plans include email support. Pro and Enterprise plans benefit from priority support with guaranteed response times.",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-4">
              Pricing
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Simple and transparent pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Choose the plan that fits your needs. All plans include a 30-day
              free trial, no commitment or credit card required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                <span>30 days free</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                <span>No hidden fees</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <PricingSection showFullPage={true} />

      {/* Detailed comparison */}
      <section className="py-24 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Detailed plan comparison
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Discover in detail what&apos;s included in each plan to make the best
                choice.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardHeader>
                <div className="grid grid-cols-4 gap-4 items-center">
                  <div></div>
                  <div className="text-center">
                    <CardTitle className="text-lg">Starter</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      To get started
                    </p>
                  </div>
                  <div className="text-center">
                    <CardTitle className="text-lg">Pro</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Most popular
                    </p>
                  </div>
                  <div className="text-center">
                    <CardTitle className="text-lg">Enterprise</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Complete features
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-8">
                {comparisonFeatures.map((category) => (
                  <div key={category.category}>
                    <h3 className="font-semibold text-lg mb-4 text-primary">
                      {category.category}
                    </h3>
                    <div className="space-y-3">
                      {category.features.map((feature, featureIndex) => (
                        <motion.div
                          key={feature.name}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: featureIndex * 0.05,
                          }}
                          viewport={{ once: true }}
                          className="grid grid-cols-4 gap-4 items-center py-2 border-b border-border/50"
                        >
                          <div className="text-sm">{feature.name}</div>
                          <div className="text-center">
                            {feature.starter ? (
                              <Check className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-muted-foreground mx-auto" />
                            )}
                          </div>
                          <div className="text-center">
                            {feature.pro ? (
                              <Check className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-muted-foreground mx-auto" />
                            )}
                          </div>
                          <div className="text-center">
                            {feature.enterprise ? (
                              <Check className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-muted-foreground mx-auto" />
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Badge variant="secondary" className="mb-4">
                <HelpCircle className="w-4 h-4 mr-2" />
                FAQ
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-muted-foreground">
                Quickly find answers to your questions about our pricing and
                features.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-4">
                  Have other questions?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Our team is here to help you choose the plan that best fits
                  your needs.
                </p>
                <Button>
                  Talk to an expert
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
      </div>
    </div>
  );
}
