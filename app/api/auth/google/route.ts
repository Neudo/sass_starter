import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUrl } from "@/lib/google-analytics";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get the domain from the query params
    const searchParams = request.nextUrl.searchParams;
    const domain = searchParams.get('domain');
    
    // Générer l'URL d'autorisation Google
    const authUrl = getAuthUrl();

    // Create state with domain info
    const stateData = {
      id: crypto.randomUUID(),
      domain: domain || '',
      userId: user.id
    };
    
    const state = Buffer.from(JSON.stringify(stateData)).toString('base64');

    // Add state to the auth URL
    const urlWithState = `${authUrl}&state=${state}`;

    return NextResponse.json({ authUrl: urlWithState });
  } catch (error) {
    console.error("Error generating Google auth URL:", error);
    return NextResponse.json(
      { error: "Failed to generate authorization URL" },
      { status: 500 }
    );
  }
}
