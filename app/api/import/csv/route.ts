import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const siteId = formData.get("siteId") as string;

    if (!file || !siteId) {
      return NextResponse.json(
        { error: "File and siteId are required" },
        { status: 400 }
      );
    }

    // Verify site ownership
    const { data: site, error: siteError } = await adminClient
      .from("sites")
      .select("id")
      .eq("id", siteId)
      .eq("user_id", user.id)
      .single();

    if (siteError || !site) {
      return NextResponse.json(
        { error: "Site not found or unauthorized" },
        { status: 404 }
      );
    }

    // Read CSV file
    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim() !== "");

    if (lines.length < 2) {
      return NextResponse.json(
        { error: "CSV file must have at least a header and one data row" },
        { status: 400 }
      );
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const dataLines = lines.slice(1);

    // Validate CSV format - expected columns from all_data export
    const expectedHeaders = [
      "date",
      "session_id",
      "country",
      "region",
      "city",
      "browser",
      "os",
      "screen_size",
      "referrer",
      "referrer_domain",
      "entry_page",
      "exit_page",
      "page_views",
      "visitors",
      "visits",
      "visit_duration",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "channel",
    ];

    const missingHeaders = expectedHeaders.filter(
      (header) => !headers.includes(header)
    );
    if (missingHeaders.length > 0) {
      return NextResponse.json(
        { error: `Missing required columns: ${missingHeaders.join(", ")}` },
        { status: 400 }
      );
    }

    // Parse data rows
    const sessions = [];
    let errorCount = 0;

    for (let i = 0; i < dataLines.length; i++) {
      try {
        const values = dataLines[i]
          .split(",")
          .map((v) => v.trim().replace(/"/g, ""));

        if (values.length !== headers.length) {
          errorCount++;
          continue;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sessionData: any = {};
        headers.forEach((header, index) => {
          sessionData[header] = values[index] || null;
        });

        // Generate unique session ID
        const sessionId = `imported_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // Map CSV data to database columns
        const dbSession = {
          id: sessionId,
          site_id: siteId,
          created_at: new Date(sessionData.date).toISOString(),
          last_seen: new Date(
            new Date(sessionData.date).getTime() +
              parseInt(sessionData.visit_duration) * 1000
          ).toISOString(),
          country: sessionData.country || null,
          region: sessionData.region || null,
          city: sessionData.city || null,
          browser: sessionData.browser || null,
          os: sessionData.os || null,
          screen_size: sessionData.screen_size || null,
          referrer: sessionData.referrer || null,
          referrer_domain: sessionData.referrer_domain || null,
          entry_page: sessionData.entry_page || "/",
          exit_page: sessionData.exit_page || "/",
          page_views: parseInt(sessionData.page_views) || 1,
          utm_source: sessionData.utm_source || null,
          utm_medium: sessionData.utm_medium || null,
          utm_campaign: sessionData.utm_campaign || null,
          utm_term: sessionData.utm_term || null,
          utm_content: sessionData.utm_content || null,
          channel: sessionData.channel || null,
        };

        sessions.push(dbSession);
      } catch (error) {
        console.log(error);

        errorCount++;
      }
    }

    if (sessions.length === 0) {
      return NextResponse.json(
        { error: "No valid sessions found in CSV" },
        { status: 400 }
      );
    }

    // Insert sessions in batches
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < sessions.length; i += batchSize) {
      const batch = sessions.slice(i, i + batchSize);

      const { error: insertError } = await adminClient
        .from("sessions")
        .insert(batch);

      if (insertError) {
        console.error("Batch insert error:", insertError);
        errorCount += batch.length;
      } else {
        insertedCount += batch.length;
      }
    }

    return NextResponse.json({
      success: true,
      imported: insertedCount,
      errors: errorCount,
      total: dataLines.length,
    });
  } catch (error) {
    console.error("CSV import error:", error);
    return NextResponse.json(
      { error: "Failed to import CSV data" },
      { status: 500 }
    );
  }
}
