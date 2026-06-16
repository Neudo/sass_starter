import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { Card, CardContent } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateArticleSchema } from "@/lib/schema";
import { Calendar } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";
import { sanitizeHtml } from "@/lib/markdown-utils";
import { BlogPost } from "@/types";

interface BlogPostProps {
  params: Promise<{ slug: string }>;
}

type RelatedBlogPost = Pick<
  BlogPost,
  "id" | "title" | "slug" | "excerpt" | "published_at"
>;

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const supabase = createAdminClient();

  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !post) {
    return null;
  }

  return post as BlogPost;
}

async function getRelatedPosts(
  currentSlug: string,
  keywords: string[],
  limit = 3
): Promise<RelatedBlogPost[]> {
  const supabase = createAdminClient();

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, published_at")
    .eq("status", "published")
    .neq("slug", currentSlug)
    .limit(limit);

  return (posts || []) as RelatedBlogPost[];
}

export default async function BlogPostPage({ params }: BlogPostProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post.slug, post.keywords);
  const publishedAt = post.published_at || post.created_at;

  const articleSchema = generateArticleSchema({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    publishedAt,
    keywords: post.keywords,
    featuredImage: post.featured_image,
  });

  return (
    <div className="min-h-screen">
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb
            items={[{ label: "Blog", href: "/blog" }, { label: post.title }]}
            className="mb-6"
          />

          <div className="max-w-4xl">
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(publishedAt).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              {post.title}
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              {post.excerpt}
            </p>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="lg:p-12">
            <div
              className="blogPost prose prose-lg max-w-none prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-ul:text-gray-700 prose-ol:text-gray-700 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-blockquote:border-blue-200 prose-blockquote:bg-blue-50 prose-blockquote:not-italic prose-img:rounded-lg prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
            />

            {/* Article Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-primary dark:to-secondary rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">
                  Discover Hector Analytics
                </h3>
                <p className="text-gray-600 mb-4">
                  The web analytics privacy-first that respects your users and
                  simplifies your GDPR compliance.
                </p>
                <div className="flex gap-4">
                  <Link
                    href="/auth/sign-up"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    Sign-up for free
                  </Link>
                  <Link
                    target="_blank"
                    href="/hectoranalytics.com"
                    className="bg-white hover:bg-gray-50 dark:text-black px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    See the demo
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="container mx-auto px-4 pb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold  mb-8">Related posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Card
                  key={relatedPost.id}
                  className="hover:shadow-lg transition-shadow pt-4"
                >
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      <Link
                        href={`/blog/${relatedPost.slug}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {relatedPost.title}
                      </Link>
                    </h3>
                    <p className="text-sm line-clamp-3 mb-4">
                      {relatedPost.excerpt}
                    </p>
                    <div className="flex items-center justify-end text-xs text-gray-500">
                      <span>
                        {new Date(
                          relatedPost.published_at || new Date().toISOString()
                        ).toLocaleDateString("en-US")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export async function generateMetadata({ params }: BlogPostProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: "Article non trouvé",
    };
  }

  const publishedAt = post.published_at || post.created_at;

  return {
    title: `${post.title} | Blog Hector Analytics`,
    description: post.meta_description || post.excerpt,
    keywords: post.keywords.join(", "),
    alternates: {
      canonical: `https://www.hectoranalytics.com/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.meta_description || post.excerpt,
      type: "article",
      url: `https://www.hectoranalytics.com/blog/${post.slug}`,
      publishedTime: publishedAt,
      authors: ["Hector Analytics"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.meta_description || post.excerpt,
    },
  };
}
