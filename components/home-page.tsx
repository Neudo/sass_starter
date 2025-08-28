"use client";
import Hero from "./hero";
import { faqs } from "@/data/faq";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

// Import new sections
import { HowItWorks } from "./sections/how-it-works";
import { WhyPrivacyMatters } from "./sections/why-privacy-matters";
import { UseCases } from "./sections/use-cases";
import { MigrationGuide } from "./sections/migration-guide";
import { FinalCTA } from "./sections/final-cta";

export function HomePage() {
  return (
    <div className="min-h-screen theme-transition">
      <Hero />

      {/* New sections */}
      <HowItWorks />
      {/* <FeaturesDeepDive /> */}
      <WhyPrivacyMatters />
      <UseCases />
      <MigrationGuide />
      {/* <Integrations /> */}
      {/* <CustomerSuccess /> */}
      {/* <ResourcesLearning /> */}

      {/* FAQ Preview */}
      <section className="py-24 bg-muted dark:bg-muted/40">
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
                Answers to common questions about Hector Analytics.
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
              {faqs.slice(0, 5).map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.description}
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
            <Link
              href="/faq"
              className="inline-flex items-center text-primary hover:underline"
            >
              Show more FAQ
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <FinalCTA />
    </div>
  );
}
