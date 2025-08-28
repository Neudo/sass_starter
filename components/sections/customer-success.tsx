"use client";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Users,
  Quote,
  Star,
  TrendingUp,
  ArrowRight,
  Building2,
} from "lucide-react";

export function CustomerSuccess() {
  const testimonials = [
    {
      quote:
        "Switching to Hector Analytics was the best decision we made. Our page load times improved by 40% and we finally have reliable data without privacy concerns.",
      author: "Sarah Chen",
      role: "Marketing Director",
      company: "TechStart",
      industry: "SaaS",
      results: [
        { metric: "Page Load", improvement: "+40%" },
        { metric: "Data Accuracy", improvement: "+95%" },
      ],
    },
    {
      quote:
        "As a blogger, I was tired of cookie banners and unreliable data. Hector gives me everything I need to understand my audience without the privacy headache.",
      author: "Mike Rodriguez",
      role: "Content Creator",
      company: "Digital Nomad Blog",
      industry: "Media",
      results: [
        { metric: "Visitor Tracking", improvement: "+100%" },
        { metric: "Bounce Rate", improvement: "-25%" },
      ],
    },
    {
      quote:
        "Our e-commerce conversion tracking is now more accurate than ever. No more lost data from ad blockers or cookie rejections.",
      author: "Emma Thompson",
      role: "E-commerce Manager",
      company: "GreenGadgets",
      industry: "Retail",
      results: [
        { metric: "Conversion Tracking", improvement: "+60%" },
        { metric: "Customer Insights", improvement: "+80%" },
      ],
    },
  ];

  const stats = [
    { number: "1,000+", label: "Happy Customers" },
    { number: "50M+", label: "Page Views Tracked" },
    { number: "99.9%", label: "Uptime" },
    { number: "< 2min", label: "Setup Time" },
  ];

  const companies = [
    { name: "TechStart", logo: "💻" },
    { name: "GreenGadgets", logo: "🌱" },
    { name: "CreativeAgency", logo: "🎨" },
    { name: "DataLabs", logo: "📊" },
    { name: "CloudCorp", logo: "☁️" },
    { name: "InnovateCo", logo: "🚀" },
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="mb-4">
              <Users className="w-4 h-4 mr-2" />
              Customer Stories
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Loved by Teams Worldwide
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See how businesses of all sizes use Hector Analytics to grow while
              respecting user privacy.
            </p>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-card rounded-lg border p-6"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              <Quote className="w-6 h-6 text-muted-foreground mb-3" />

              <blockquote className="text-muted-foreground mb-4">
                &quot;{testimonial.quote}&quot;
              </blockquote>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                {testimonial.results.map((result, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-lg font-bold text-primary">
                      {result.improvement}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {result.metric}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Company Logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-muted-foreground mb-8">
            Trusted by innovative companies worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {companies.map((company, index) => (
              <div
                key={index}
                className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity"
              >
                <span className="text-2xl">{company.logo}</span>
                <span className="font-medium">{company.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border p-8 text-center"
        >
          <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-4">
            Join Thousands of Satisfied Customers
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Start your privacy-first analytics journey today. See why teams
            choose Hector Analytics for accurate, compliant, and fast web
            analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg">
                Start Free Today
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/customers">
              <Button variant="outline" size="lg">
                Read More Stories
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
