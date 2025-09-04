import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// POST - Créer un nouvel article
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const authHeader = req.headers.get("authorization");
    const apiKey = authHeader?.replace("Bearer ", "");

    if (!(apiKey && apiKey === process.env.CONTENT_GENERATION_API_KEY)) {
      const supabase = await createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return NextResponse.json(
          { error: "Unauthorized - Please login" },
          { status: 401 }
        );
      }
    }

    const postData = await req.json();

    // Validate required fields
    if (!postData.title || !postData.slug || !postData.content) {
      return NextResponse.json(
        { error: "Title, slug, and content are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if slug already exists
    const { data: existingPost } = await supabase
      .from("blog_posts")
      .select("id")
      .eq("slug", postData.slug)
      .single();

    if (existingPost) {
      return NextResponse.json(
        { error: "Un article avec ce slug existe déjà" },
        { status: 400 }
      );
    }

    // Prepare data for insertion
    const insertData = {
      title: postData.title,
      slug: postData.slug,
      content: postData.content,
      excerpt: postData.excerpt || "",
      meta_description: postData.meta_description || "",
      keywords: postData.keywords || [],
      status: postData.status || "draft",
      generated_by_ai: postData.generated_by_ai || false,
      reading_time: postData.reading_time || 1,
      seo_score: postData.seo_score || 0,
      view_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...(postData.status === "published" && {
        published_at: new Date().toISOString(),
      }),
    };

    // Insert the new post
    const { data, error } = await supabase
      .from("blog_posts")
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error("Error creating post:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      post: data,
      message: "Article created successfully" 
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}