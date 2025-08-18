import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUrl } from "@/lib/google-analytics";

export async function GET(request: NextRequest) {
  console.log(request);

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Générer l'URL d'autorisation Google
    const authUrl = getAuthUrl();

    // Stocker l'état pour la validation du callback
    const state = crypto.randomUUID();

    // Vous pourriez vouloir stocker l'état dans une session ou une base de données
    // Pour simplifier, on le passe dans l'URL
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
