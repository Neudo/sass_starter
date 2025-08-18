import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getGA4Properties } from "@/lib/google-analytics";

export async function GET(request: NextRequest) {
  console.log(request);

  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get stored Google tokens
    const { data: tokenData, error: tokenError } = await adminClient
      .from("google_auth_tokens")
      .select("access_token, refresh_token")
      .eq("user_id", user.id)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        {
          error:
            "Google Analytics not connected. Please connect your account first.",
        },
        { status: 400 }
      );
    }

    // Fetch GA4 properties
    const properties = await getGA4Properties(
      tokenData.access_token,
      tokenData.refresh_token
    );

    // Format properties for frontend
    const formattedProperties = properties.map((prop) => ({
      id: prop.name?.split("/")[1] || "", // Extract property ID from name
      displayName: prop.displayName,
      name: prop.name,
      createTime: prop.createTime,
      currencyCode: prop.currencyCode,
      timeZone: prop.timeZone,
    }));

    return NextResponse.json({ properties: formattedProperties });
  } catch (error) {
    console.error("Error fetching GA4 properties:", error);

    // Handle specific Google API errors
    if (error instanceof Error) {
      if (
        error.message.includes("invalid_grant") ||
        error.message.includes("unauthorized")
      ) {
        return NextResponse.json(
          {
            error:
              "Google Analytics authorization expired. Please reconnect your account.",
          },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch Google Analytics properties" },
      { status: 500 }
    );
  }
}
