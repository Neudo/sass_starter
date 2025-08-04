"use client";

import { Navigation } from "@/components/navigation";
import { faqs } from "@/data/faq";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import Footer from "@/components/footer";

export default function Page() {
  return (
    <>
      <div className="min-h-screen bg-background text-foreground theme-transition">
        <Navigation />
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
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                  Frequently Asked Questions
                </h1>
                <p className="text-xl text-muted-foreground">
                  Everything you need to know about Hector Analytics.
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
                      {faq.title}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.description}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
