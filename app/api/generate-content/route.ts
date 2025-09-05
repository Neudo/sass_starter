import { NextRequest, NextResponse } from "next/server";
import { ContentGenerator } from "@/lib/content-generator";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    // Security: Check for API key or auth
    const authHeader = req.headers.get("authorization");
    const apiKey = authHeader?.replace("Bearer ", "");

    // Allow both API key and authenticated users
    if (apiKey && apiKey === process.env.CONTENT_GENERATION_API_KEY) {
      // API key is valid, proceed
    } else {
      // Check if user is authenticated via Supabase cookies
      const supabase = await createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return NextResponse.json(
          { error: "Unauthorized - Please login" },
          { status: 401 }
        );
      }
    }

    const body = await req.json();

    // Handle article extraction from URL or text
    if (body.action === "extract") {
      try {
        const { source, sourceType } = body;

        if (sourceType === "url") {
          // Fetch content from URL
          const response = await fetch(source);
          if (!response.ok) {
            throw new Error("Impossible de récupérer l'article depuis l'URL");
          }

          const html = await response.text();
          // Extract title and content from HTML (simplified extraction)
          const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
          const title = titleMatch ? titleMatch[1] : "Article sans titre";

          // Remove HTML tags for content
          const contentMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
          const rawContent = contentMatch ? contentMatch[1] : html;
          const content = rawContent
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .substring(0, 5000); // Limit content length

          return NextResponse.json({ title, content });
        } else {
          // Direct text input
          const lines = source.split("\n");
          const title = lines[0] || "Article sans titre";
          const content = lines.slice(1).join("\n");

          return NextResponse.json({ title, content });
        }
      } catch (error) {
        return NextResponse.json(
          {
            error:
              error instanceof Error
                ? error.message
                : "Erreur lors de l'extraction",
          },
          { status: 500 }
        );
      }
    }

    // Handle article rewriting
    if (body.action === "rewrite") {
      try {
        const { originalTitle, originalContent, targetService } = body;

        if (!originalContent) {
          throw new Error("Contenu original requis pour la réécriture");
        }

        // Initialize content generator
        const generator = new ContentGenerator();
        // Rewrite the article for Hector Analytics
        const rewrittenPost = await generator.rewriteArticle({
          originalTitle,
          originalContent,
          targetService: targetService || "Hector Analytics",
          style: body.style || "professional",
        });

        // Save to database as draft
        const postId = await generator.saveToBlog(rewrittenPost, body.authorId);

        return NextResponse.json({
          success: true,
          postId,
          article: {
            title: rewrittenPost.title,
            content: rewrittenPost.content,
            keywords: rewrittenPost.keywords,
            slug: rewrittenPost.slug,
          },
        });
      } catch (error) {
        console.error("Detailed rewrite error:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erreur lors de la réécriture";
        console.error("Rewrite error message:", errorMessage);

        return NextResponse.json(
          {
            error: errorMessage,
            details:
              error instanceof Error ? error.stack : "No stack trace available",
          },
          { status: 500 }
        );
      }
    }

    // Original article generation logic
    const { topic, keyword, tone, length, includeCode, authorId } = body;

    if (!topic || !keyword) {
      return NextResponse.json(
        { error: "Topic and keyword are required" },
        { status: 400 }
      );
    }

    // Initialize content generator
    const generator = new ContentGenerator();

    console.log(`Generating article for topic: ${topic}`);

    // Generate the article
    const blogPost = await generator.generateArticle({
      topic,
      keyword,
      tone: tone || "professional",
      length: length || "medium",
      includeCode: includeCode || false,
    });

    // Save to database
    const postId = await generator.saveToBlog(blogPost, authorId);

    // Send notification email
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Hector Analytics <support@hectoranalytics.com>",
            to: "bassalair.quentin@gmail.com",
            subject: "📝 Nouvel article généré automatiquement",
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #3d9dbd;">Nouvel article de blog généré !</h2>
                
                <p><strong>Titre :</strong> ${blogPost.title}</p>
                <p><strong>Mot-clé :</strong> ${keyword}</p>
                <p><strong>Status :</strong> Draft (nécessite révision)</p>
                
                <p style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-left: 4px solid #3d9dbd;">
                  L'article a été sauvegardé en tant que brouillon. Pensez à le réviser avant publication !
                </p>
                
                <p><a href="https://www.hectoranalytics.com/admin/blog" style="color: #3d9dbd;">Voir dans le dashboard admin</a></p>
              </div>
            `,
          }),
        });
      } catch (emailError) {
        console.error("Failed to send notification email:", emailError);
        // Don't fail the whole request for email issues
      }
    }

    return NextResponse.json({
      success: true,
      postId,
      article: {
        title: blogPost.title,
        slug: blogPost.slug,
        wordCount: blogPost.content.split(/\s+/).length,
      },
    });
  } catch (error) {
    console.error("Content generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate content",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve predefined topics
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "topics") {
      const topics = ContentGenerator.getTopicIdeas();
      return NextResponse.json({ topics });
    }

    if (action === "posts") {
      const supabase = await createAdminClient();
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ posts: data });
    }

    return NextResponse.json({
      message: "Content generation API",
      endpoints: {
        "POST /": "Generate new article",
        "GET /?action=topics": "Get predefined topics",
        "GET /?action=posts": "Get recent blog posts",
      },
    });
  } catch (error) {
    console.error("GET request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
