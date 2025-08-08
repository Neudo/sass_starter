import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// GET - Récupérer un article par ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: post, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !post) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour un article
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const updateData = await req.json();

    // Remove ID from updateData to avoid conflicts
    delete updateData.id;
    delete updateData.created_at;

    const supabase = createAdminClient();

    // Update the post
    const { data, error } = await supabase
      .from("blog_posts")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating post:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      post: data,
      message: "Article updated successfully" 
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un article
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting post:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Article deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}