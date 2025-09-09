import Link from "next/link";
import Script from "next/script";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";
import { blogSchema } from "@/lib/schema";
import { Calendar } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";
import Image from "next/image";
import { BlogPost } from "@/types";

export default async function BlogPage() {
  const supabase = createAdminClient();

  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(12);

  if (error) {
    console.error("Error fetching blog posts:", error);
  }

  const blogPosts: BlogPost[] = posts || [];

  return (
    <>
      <Script
        id="blog-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogSchema),
        }}
      />

      {/* Blog Posts Grid */}
      <div className="container mx-auto px-4 py-16">
        <Breadcrumb 
          items={[{ label: "Blog" }]}
          className="mb-8"
        />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-xl text-gray-600">
            Expert insights on privacy-respecting web analytics and GDPR compliance
          </p>
        </div>

        {blogPosts.length === 0 ? (
          <div className="max-w-md mx-auto text-center">
            <div className="rounded-lg p-8 shadow-sm mb-16">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Bientôt disponible !
              </h3>
              <p className="text-gray-600 mb-6">
                Nous préparons des articles de qualité sur l&apos;analytics
                privacy-first. Revenez bientôt pour découvrir nos guides et
                conseils.
              </p>
              <Link
                href="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 mb-16 max-w-[660px] mx-auto">
            {blogPosts.map((post) => (
              <Card
                key={post.id}
                className="hover:shadow-lg transition-shadow relative group"
              >
                {post.featured_image && (
                  <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                    <Image
                      src={post.featured_image}
                      alt={post.title}
                      width={1000}
                      height={600}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Calendar className="h-4 w-4" />
                    {post.published_at && new Date(post.published_at).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
                    <h2 className="text-xl group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="font-medium text-sm inline-flex items-center after:content-[''] after:inset-0 after:absolute"
                  >
                    Read more →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export async function generateMetadata() {
  return {
    title: "Blog - Hector Analytics | Privacy-First Web Analytics Guides",
    description:
      "Expert guides on cookie-free web analytics, GDPR compliance, and privacy-first alternatives to Google Analytics. Learn from industry professionals.",
    keywords: [
      "cookie-free analytics",
      "GDPR compliance",
      "privacy-first",
      "Google Analytics alternative",
      "web analytics blog",
    ],
    alternates: {
      canonical: "https://www.hectoranalytics.com/blog",
    },
    openGraph: {
      title: "Hector Analytics Blog - Privacy-First Analytics Guides",
      description:
        "Expert insights on privacy-respecting web analytics and GDPR compliance",
      type: "website",
      url: "https://www.hectoranalytics.com/blog",
    },
  };
}
