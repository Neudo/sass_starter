import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Target,
  FileText,
  ShoppingCart,
  Briefcase,
  Newspaper,
  GraduationCap,
  Heart,
  Code,
  ArrowRight,
  Users,
  Shield,
  Zap,
  Globe,
  CheckCircle,
} from "lucide-react";
import Footer from "@/components/footer";
import { Navigation } from "@/components/navigation";

export const metadata: Metadata = {
  title: "Use Cases - Hector Analytics for Every Industry",
  description:
    "Discover how different industries use Hector Analytics for privacy-first web analytics. From e-commerce to SaaS, blogs to non-profits - find your use case.",
  keywords: [
    "web analytics use cases",
    "e-commerce analytics",
    "SaaS analytics",
    "blog analytics",
    "privacy analytics",
    "B2B web analytics",
    "nonprofit analytics",
    "educational analytics",
  ],
};

export default function UseCasesPage() {
  const useCases = [
    {
      icon: FileText,
      title: "Bloggers & Content Creators",
      description:
        "Track which content resonates with your audience, understand reading patterns, and grow your subscriber base while respecting reader privacy.",
      longDescription:
        "Content creators need to understand what engages their audience without invading privacy. Hector Analytics provides detailed insights into content performance, reader behavior, and traffic sources while maintaining complete anonymity.",
      features: [
        "Content performance tracking",
        "Reading time analytics",
        "Social media traffic sources",
        "Popular posts identification",
        "Audience engagement metrics",
        "Subscriber conversion tracking",
      ],
      benefits: [
        "Identify your best-performing content",
        "Understand your audience preferences",
        "Optimize content for better engagement",
        "Track social media effectiveness",
        "Monitor subscriber growth",
      ],
      metrics: [
        "Page views",
        "Time on page",
        "Bounce rate",
        "Social shares",
        "Return visitors",
      ],
      challenges: [
        "Privacy concerns with traditional analytics",
        "Complex setup and configuration",
        "Cookie consent requirements",
        "Data ownership issues",
      ],
      solutions: [
        "No cookies or personal data collection",
        "Simple one-line setup",
        "GDPR compliant by default",
        "Full data ownership",
      ],
      link: "/use-cases/bloggers",
      color: "blue",
    },
    {
      icon: ShoppingCart,
      title: "E-commerce Stores",
      description:
        "Monitor product performance, conversion funnels, and customer behavior without compromising shopper privacy or requiring cookie consent.",
      longDescription:
        "E-commerce businesses need detailed analytics to optimize conversions and understand customer behavior. With increasing privacy regulations, traditional analytics create compliance challenges that Hector Analytics solves.",
      features: [
        "Product page analytics",
        "Conversion funnel tracking",
        "Cart abandonment insights",
        "Payment flow optimization",
        "Customer journey mapping",
        "A/B testing support",
      ],
      benefits: [
        "Increase conversion rates",
        "Reduce cart abandonment",
        "Optimize product pages",
        "Understand customer journey",
        "Improve checkout experience",
      ],
      metrics: [
        "Conversion rate",
        "Average order value",
        "Product views",
        "Cart additions",
        "Checkout completion",
      ],
      challenges: [
        "Cookie consent reducing data quality",
        "Privacy regulations compliance",
        "Customer privacy concerns",
        "Complex analytics setup",
      ],
      solutions: [
        "Cookie-free tracking",
        "Automatic GDPR compliance",
        "Privacy-first approach",
        "Simple integration",
      ],
      link: "/use-cases/ecommerce",
      color: "green",
    },
    {
      icon: Briefcase,
      title: "B2B & SaaS Companies",
      description:
        "Track marketing funnels, measure campaign ROI, and understand user behavior throughout the customer journey with enterprise-grade privacy.",
      longDescription:
        "B2B and SaaS companies need sophisticated analytics to optimize marketing spend, understand customer acquisition, and measure product usage while maintaining enterprise-level privacy standards.",
      features: [
        "Marketing funnel analytics",
        "Campaign attribution",
        "Lead source tracking",
        "Feature usage analytics",
        "Customer journey mapping",
        "ROI measurement",
      ],
      benefits: [
        "Optimize marketing spend",
        "Improve lead quality",
        "Track customer acquisition cost",
        "Measure feature adoption",
        "Understand user behavior",
      ],
      metrics: [
        "Lead conversion",
        "Customer acquisition cost",
        "Lifetime value",
        "Feature usage",
        "Trial conversion",
      ],
      challenges: [
        "Complex B2B customer journeys",
        "Multiple touchpoints tracking",
        "Privacy compliance requirements",
        "Data silos between tools",
      ],
      solutions: [
        "Multi-touch attribution",
        "Unified analytics dashboard",
        "Enterprise privacy compliance",
        "API integrations",
      ],
      link: "/use-cases/b2b",
      color: "purple",
    },
    {
      icon: Newspaper,
      title: "News & Media Sites",
      description:
        "Real-time audience tracking, article performance measurement, and reader engagement analytics without invasive tracking or cookie requirements.",
      longDescription:
        "Media organizations need real-time insights into content performance and reader behavior while maintaining editorial integrity and respecting audience privacy in an era of increasing privacy awareness.",
      features: [
        "Real-time visitor tracking",
        "Article performance metrics",
        "Reader engagement analytics",
        "Traffic source analysis",
        "Social media integration",
        "Breaking news monitoring",
      ],
      benefits: [
        "Understand reader preferences",
        "Optimize content timing",
        "Track viral content",
        "Measure social media impact",
        "Monitor breaking news traffic",
      ],
      metrics: [
        "Page views",
        "Reading time",
        "Social engagement",
        "Comment rate",
        "Subscriber growth",
      ],
      challenges: [
        "Ad blocker impact on analytics",
        "Privacy-conscious readers",
        "Real-time reporting needs",
        "Multiple content formats",
      ],
      solutions: [
        "Ad blocker resistant tracking",
        "Privacy-first analytics",
        "Real-time dashboards",
        "Multi-format content tracking",
      ],
      link: "/use-cases/media",
      color: "red",
    },
    {
      icon: GraduationCap,
      title: "Educational Platforms",
      description:
        "Track course engagement, student progress, and learning outcomes while maintaining strict student privacy and FERPA compliance.",
      longDescription:
        "Educational institutions and e-learning platforms need to balance learning analytics with student privacy rights, requiring specialized analytics that comply with educational privacy regulations.",
      features: [
        "Course completion tracking",
        "Learning resource analytics",
        "Student engagement metrics",
        "Assignment performance",
        "Video content analytics",
        "Discussion forum insights",
      ],
      benefits: [
        "Improve course completion rates",
        "Identify learning bottlenecks",
        "Optimize educational content",
        "Enhance student experience",
        "Measure learning outcomes",
      ],
      metrics: [
        "Course completion",
        "Time spent learning",
        "Resource usage",
        "Assessment scores",
        "Engagement rate",
      ],
      challenges: [
        "Student privacy requirements",
        "FERPA compliance needs",
        "Multiple learning platforms",
        "Diverse content types",
      ],
      solutions: [
        "Educational privacy compliance",
        "Anonymous learning analytics",
        "Multi-platform integration",
        "Content-agnostic tracking",
      ],
      link: "/use-cases/education",
      color: "yellow",
    },
    {
      icon: Heart,
      title: "Non-Profits & NGOs",
      description:
        "Measure campaign impact, track donation funnels, and understand supporter engagement while maintaining ethical data practices.",
      longDescription:
        "Non-profit organizations need to demonstrate impact and optimize fundraising efforts while upholding the highest ethical standards and respecting donor privacy preferences.",
      features: [
        "Campaign impact measurement",
        "Donation funnel analytics",
        "Volunteer engagement tracking",
        "Event participation metrics",
        "Newsletter effectiveness",
        "Social cause awareness",
      ],
      benefits: [
        "Increase donation conversions",
        "Measure campaign effectiveness",
        "Optimize fundraising efforts",
        "Understand supporter behavior",
        "Demonstrate impact to stakeholders",
      ],
      metrics: [
        "Donation conversion",
        "Campaign reach",
        "Volunteer signups",
        "Event attendance",
        "Email engagement",
      ],
      challenges: [
        "Limited technical resources",
        "Ethical data collection",
        "Donor privacy concerns",
        "Multiple campaign channels",
      ],
      solutions: [
        "Easy setup and management",
        "Ethical analytics by design",
        "Privacy-respectful tracking",
        "Multi-channel attribution",
      ],
      link: "/use-cases/nonprofit",
      color: "pink",
    },
    {
      icon: Code,
      title: "Developer Tools & APIs",
      description:
        "Track API usage, documentation engagement, and developer adoption metrics without compromising developer privacy or workflow.",
      longDescription:
        "Developer-focused companies need specialized analytics to understand how developers interact with their tools, documentation, and APIs while respecting the privacy-conscious developer community.",
      features: [
        "API usage analytics",
        "Documentation engagement",
        "SDK download tracking",
        "Developer onboarding flow",
        "Error rate monitoring",
        "Feature adoption metrics",
      ],
      benefits: [
        "Improve developer experience",
        "Optimize documentation",
        "Track API adoption",
        "Reduce integration friction",
        "Measure developer satisfaction",
      ],
      metrics: [
        "API calls",
        "Documentation views",
        "SDK downloads",
        "Integration time",
        "Error rates",
      ],
      challenges: [
        "Privacy-conscious developers",
        "Technical audience skepticism",
        "Multiple integration points",
        "Developer tool complexity",
      ],
      solutions: [
        "Transparent privacy practices",
        "Developer-friendly analytics",
        "Technical integration support",
        "Comprehensive API tracking",
      ],
      link: "/use-cases/developers",
      color: "indigo",
    },
  ];

  const whyPrivacyFirst = [
    {
      icon: Shield,
      title: "GDPR Compliant by Design",
      description:
        "No cookies, no personal data collection, automatic compliance with privacy regulations.",
    },
    {
      icon: Zap,
      title: "Lightweight & Fast",
      description:
        "Minimal script that doesn\t slow down your website or impact user experience.",
    },
    {
      icon: Users,
      title: "No Data Loss",
      description:
        "Track all visitors without cookie consent banners affecting data collection.",
    },
    {
      icon: Globe,
      title: "Works Everywhere",
      description:
        "Compatible with all websites, frameworks, and hosting platforms.",
    },
  ];

  interface UseCase {
    icon: React.ElementType;
    title: string;
    description: string;
    features: string[];
    metrics: string[];
    link: string;
  }

  const UseCaseCard = ({ useCase }: { useCase: UseCase }) => (
    <Card className="h-full hover:shadow-lg transition-all duration-300 border-border bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
            <useCase.icon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold mb-2">
              {useCase.title}
            </CardTitle>
            <p className="text-muted-foreground">{useCase.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide">
              Key Features
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {useCase.features
                .slice(0, 4)
                .map((feature: string, idx: number) => (
                  <div key={idx} className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide">
              Key Metrics
            </h4>
            <div className="flex flex-wrap gap-2">
              {useCase.metrics.map((metric: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {metric}
                </Badge>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Link href={useCase.link}>
              <Button variant="outline" size="sm" className="w-full group">
                Learn More
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-24 bg-gradient-to-b from-background to-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge
              variant="secondary"
              className="mb-6 bg-primary/10 text-primary border-primary/20"
            >
              <Target className="w-4 h-4 mr-2" />
              Use Cases & Industries
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              Analytics for Every Industry
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
              Discover how businesses across different industries use Hector
              Analytics to gain insights while maintaining privacy. From
              e-commerce to education, find the perfect analytics solution for
              your sector.
            </p>
          </div>
        </section>

        {/* Why Privacy-First */}
        <section className="py-20 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-foreground">
                Why choose Privacy-First Analytics?
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Traditional analytics create compliance challenges and data
                quality issues. Hector Analytics solves these problems across
                all industries.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {whyPrivacyFirst.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                Trusted by Every Industry
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Whether you\re running a blog, an online store, or a SaaS
                platform, Hector Analytics provides the insights you need while
                respecting user privacy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {useCases.map((useCase, index) => (
                <UseCaseCard key={index} useCase={useCase} />
              ))}
            </div>
          </div>
        </section>

        {/* Custom Use Case CTA */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg p-8 sm:p-12 border border-border/50 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                Don\t See Your Industry?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Hector Analytics is flexible and adapts to any business model.
                Whether you\re in healthcare, finance, retail, or any other
                sector, we can help you implement privacy-first analytics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button size="lg">
                    Discuss Your Use Case
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button variant="outline" size="lg">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Getting Started CTA */}
        <section className="py-20 bg-muted/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of businesses using Hector Analytics for
              privacy-first web analytics. Set up takes less than 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/features">
                <Button variant="outline" size="lg">
                  View All Features
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
