"use client";
import Hero from "./hero";
import { Features } from "@/components/features";
import { PricingSection } from "./pricing-section";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Logo } from "./logo";
import { ArrowRight, Star, Quote } from "lucide-react";
import { motion } from "motion/react";

interface HomePageProps {
  onNavigateToPricing: () => void;
  onNavigateToDemo: () => void;
}

export function HomePage({
  onNavigateToPricing,
  onNavigateToDemo,
}: HomePageProps) {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CEO, TechVision",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      content:
        "Dana Analytics revolutionized our customer understanding. The integrated AI gives us insights impossible to obtain elsewhere.",
      rating: 5,
    },
    {
      name: "Marc Dubois",
      role: "CMO, GrowthLab",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content:
        "Transition from GA4 to Dana in 3 minutes. AI predictions boosted our ROI by 340%. Incredible!",
      rating: 5,
    },
    {
      name: "Emma Rodriguez",
      role: "Data Scientist, InnovateCorp",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      content:
        "Dana's privacy + AI combination is unique. My teams love the depth of predictive analytics.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen theme-transition">
      <Hero onNavigateToDemo={onNavigateToDemo} />
      <Features />

      {/* Testimonials */}
      {/* <section className="py-24 bg-muted/10 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Badge
                variant="secondary"
                className="mb-4 bg-primary/10 text-primary border-primary/20"
              >
                Success Stories
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
                They grow with Dana
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Over 15,000 companies use Dana Analytics to transform their data
                into winning strategies with AI.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-card border-border theme-transition hover:shadow-lg hover:border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <Quote className="w-8 h-8 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-3">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-foreground">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      <PricingSection onNavigateToPricing={onNavigateToPricing} />

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-r from-primary/5 to-primary/10 theme-transition">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-foreground">
              Ready for the Dana revolution?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of companies who chose Dana Analytics for
              privacy-respectful AI insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Start with Dana AI
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={onNavigateToDemo}
              >
                Explore the demo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              AI setup in 3 minutes • 30 days free trial • No commitment
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-16 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <Logo size="md" showText={true} />
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Next-generation analytics with integrated artificial
                intelligence. Privacy-respectful, GDPR compliant, and
                revolutionary.
              </p>
              <p className="text-sm text-muted-foreground">
                © 2025 Dana Analytics. Powered by AI. All rights reserved.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-foreground">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    AI Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <button
                    onClick={onNavigateToDemo}
                    className="hover:text-primary transition-colors text-left"
                  >
                    Live Demo
                  </button>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    API & Integrations
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-foreground">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    AI Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Expert Guides
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Contact Team
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
