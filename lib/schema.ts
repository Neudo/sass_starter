/**
 * Schema.org structured data generators for SEO
 */

const BASE_URL = "https://www.hectoranalytics.com";

// Organization Schema - Base company information
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${BASE_URL}/#organization`,
  "name": "Hector Analytics",
  "url": BASE_URL,
  "logo": `${BASE_URL}/logo.svg`,
  "sameAs": [
    // Add social media profiles when available
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "url": `${BASE_URL}/contact`,
    "availableLanguage": ["French", "English"]
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "FR"
  }
};

// Enhanced SoftwareApplication Schema
export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${BASE_URL}/#software`,
  "name": "Hector Analytics",
  "alternateName": "Hector",
  "description": "Privacy-first web analytics platform that provides actionable insights without cookies. GDPR compliant alternative to Google Analytics with real-time tracking and comprehensive reporting.",
  "url": BASE_URL,
  "applicationCategory": "BusinessApplication",
  "applicationSubCategory": "Web Analytics",
  "operatingSystem": "Web Browser",
  "softwareVersion": "1.0",
  "datePublished": "2024-01-01",
  "author": organizationSchema,
  "publisher": organizationSchema,
  "creator": organizationSchema,
  "keywords": [
    "web analytics",
    "privacy analytics",
    "GDPR compliant",
    "cookie-free analytics",
    "Google Analytics alternative",
    "privacy-first",
    "real-time analytics"
  ],
  "offers": [
    {
      "@type": "Offer",
      "name": "Hobby Plan",
      "price": "0",
      "priceCurrency": "EUR",
      "description": "Free plan for personal projects",
      "availability": "InStock"
    },
    {
      "@type": "Offer",
      "name": "Professional Plan",
      "price": "14",
      "priceCurrency": "EUR",
      "billingDuration": "P1M",
      "description": "Full-featured plan for businesses",
      "availability": "InStock",
      "priceValidUntil": "2025-12-31"
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "127",
    "bestRating": "5",
    "worstRating": "1"
  },
  "featureList": [
    "Cookie-free tracking",
    "GDPR compliance",
    "Real-time analytics",
    "Custom events",
    "Data export",
    "Team collaboration",
    "Public dashboards",
    "Google Analytics import"
  ],
  "screenshot": `${BASE_URL}/dashboard-preview.png`,
  "installUrl": `${BASE_URL}/auth/sign-up`,
  "downloadUrl": `${BASE_URL}/auth/sign-up`
};

// Website Schema
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  "name": "Hector Analytics",
  "description": "Privacy-first web analytics platform",
  "url": BASE_URL,
  "publisher": organizationSchema,
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${BASE_URL}/search?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
};

// Blog Article Schema Generator
export function generateArticleSchema(article: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  keywords: string[];
  readingTime: number;
  viewCount: number;
  featuredImage?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${BASE_URL}/blog/${article.slug}#article`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${BASE_URL}/blog/${article.slug}`
    },
    "headline": article.title,
    "description": article.excerpt,
    "image": article.featuredImage || `${BASE_URL}/blog-default.png`,
    "author": organizationSchema,
    "publisher": organizationSchema,
    "datePublished": article.publishedAt,
    "dateModified": article.publishedAt,
    "articleSection": "Web Analytics",
    "keywords": article.keywords.join(", "),
    "wordCount": Math.ceil(article.content.length / 5),
    "timeRequired": `PT${article.readingTime}M`,
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/ReadAction",
      "userInteractionCount": article.viewCount
    },
    "about": [
      {
        "@type": "Thing",
        "name": "Web Analytics",
        "sameAs": "https://en.wikipedia.org/wiki/Web_analytics"
      },
      {
        "@type": "Thing",
        "name": "Privacy",
        "sameAs": "https://en.wikipedia.org/wiki/Privacy"
      },
      {
        "@type": "Thing",
        "name": "GDPR",
        "sameAs": "https://en.wikipedia.org/wiki/General_Data_Protection_Regulation"
      }
    ]
  };
}

// FAQ Schema Generator
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${BASE_URL}/faq#faq`,
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

// Breadcrumb Schema Generator
export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  };
}

// Service Schema
export const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${BASE_URL}/#service`,
  "name": "Web Analytics Service",
  "description": "Privacy-first web analytics and tracking service",
  "provider": organizationSchema,
  "serviceType": "Web Analytics",
  "areaServed": "Worldwide",
  "availableChannel": {
    "@type": "ServiceChannel",
    "serviceUrl": BASE_URL,
    "serviceSmsNumber": null,
    "servicePhone": null,
    "servicePostalAddress": null
  }
};

// Pricing Schema
export const pricingSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": `${BASE_URL}/pricing#product`,
  "name": "Hector Analytics",
  "description": "Privacy-first web analytics platform with flexible pricing plans",
  "brand": organizationSchema,
  "manufacturer": organizationSchema,
  "offers": [
    {
      "@type": "Offer",
      "@id": `${BASE_URL}/pricing#hobby-plan`,
      "name": "Hobby Plan",
      "description": "Perfect for personal projects and small websites",
      "price": "0",
      "priceCurrency": "EUR",
      "priceValidUntil": "2025-12-31",
      "availability": "InStock",
      "url": `${BASE_URL}/auth/sign-up?plan=hobby`,
      "category": "SoftwareApplication",
      "itemOffered": {
        "@type": "Service",
        "name": "Basic Web Analytics",
        "serviceType": "Web Analytics"
      },
      "eligibleQuantity": {
        "@type": "QuantitativeValue",
        "value": 3000,
        "unitText": "events per month"
      }
    },
    {
      "@type": "Offer",
      "@id": `${BASE_URL}/pricing#professional-plan`,
      "name": "Professional Plan",
      "description": "Full-featured plan for serious businesses",
      "price": "14",
      "priceCurrency": "EUR",
      "billingDuration": "P1M",
      "priceValidUntil": "2025-12-31",
      "availability": "InStock",
      "url": `${BASE_URL}/auth/sign-up?plan=professional`,
      "category": "SoftwareApplication",
      "itemOffered": {
        "@type": "Service",
        "name": "Professional Web Analytics",
        "serviceType": "Web Analytics"
      },
      "eligibleQuantity": {
        "@type": "QuantitativeValue",
        "value": 10000,
        "unitText": "events per month"
      }
    }
  ],
  "review": {
    "@type": "Review",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": "4.8",
      "bestRating": "5"
    },
    "author": {
      "@type": "Organization",
      "name": "Verified Users"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127",
    "bestRating": "5",
    "worstRating": "1"
  }
};

// Blog Schema
export const blogSchema = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": `${BASE_URL}/blog#blog`,
  "name": "Hector Analytics Blog",
  "description": "Expert guides on privacy-first web analytics, GDPR compliance, and Google Analytics alternatives",
  "url": `${BASE_URL}/blog`,
  "author": organizationSchema,
  "publisher": organizationSchema,
  "inLanguage": "fr-FR",
  "about": [
    {
      "@type": "Thing",
      "name": "Web Analytics",
      "sameAs": "https://en.wikipedia.org/wiki/Web_analytics"
    },
    {
      "@type": "Thing",
      "name": "Privacy",
      "sameAs": "https://en.wikipedia.org/wiki/Privacy"
    },
    {
      "@type": "Thing",
      "name": "GDPR",
      "sameAs": "https://en.wikipedia.org/wiki/General_Data_Protection_Regulation"
    }
  ]
};

// Combined Schema for homepage
export const combinedHomeSchema = {
  "@context": "https://schema.org",
  "@graph": [
    organizationSchema,
    websiteSchema,
    softwareApplicationSchema,
    serviceSchema
  ]
};