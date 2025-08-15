import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headersList = headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";
    
    // Log que le fallback est utilisé (pour monitoring)
    console.log("Fallback tracking utilisé - Bloqueur détecté", {
      domain: body.domain,
      page: body.page,
      blocked: true
    });

    // Si vous voulez quand même tracker (optionnel)
    // Vous pouvez utiliser une approche server-side
    if (body.domain && body.page) {
      const supabase = createServiceRoleClient();
      
      // Créer une session avec un flag "blocked"
      await supabase.from("sessions").insert({
        site_id: await getSiteIdFromDomain(body.domain),
        page_path: body.page,
        referrer: body.referrer,
        user_agent: headersList.get("user-agent"),
        ip_address: ip,
        // Marquer comme tracking de fallback
        tracking_method: "fallback",
        ad_blocker_detected: true,
        created_at: new Date().toISOString(),
        last_seen: new Date().toISOString(),
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Fallback tracking received" 
    });
  } catch (error) {
    console.error("Erreur fallback tracking:", error);
    return NextResponse.json(
      { error: "Failed to process fallback tracking" },
      { status: 500 }
    );
  }
}

async function getSiteIdFromDomain(domain: string) {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("sites")
    .select("id")
    .eq("domain", domain)
    .single();
  
  return data?.id || null;
}