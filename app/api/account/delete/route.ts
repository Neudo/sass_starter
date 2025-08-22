import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

export async function DELETE() {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!user) {
      console.error("No user found in session");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user's subscription to cancel Stripe subscription
    const { data: subscription, error: subscriptionError } = await adminClient
      .from("subscriptions")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("user_id", user.id)
      .single();

    if (subscriptionError && subscriptionError.code !== "PGRST116") {
      console.error("Error fetching subscription:", subscriptionError);
    }

    // Cancel Stripe subscription if exists
    if (subscription?.stripe_subscription_id && process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
      } catch (stripeError) {
        console.error("❌ Error cancelling Stripe subscription:", stripeError);
        // Continue with deletion even if Stripe fails
      }
    }
    const { data: userFunnels, error: funnelsError } = await adminClient
      .from("funnels")
      .select("id")
      .eq("user_id", user.id);

    if (funnelsError) {
      console.error("❌ Error fetching funnels:", funnelsError);
    }

    const { data: userSites, error: sitesError } = await adminClient
      .from("sites")
      .select("id")
      .eq("user_id", user.id);

    if (sitesError) {
      console.error("❌ Error fetching sites:", sitesError);
    }

    const { data: userSubscriptions, error: subscriptionsError } =
      await adminClient
        .from("subscriptions")
        .select("id")
        .eq("user_id", user.id);

    if (subscriptionsError) {
      console.error("❌ Error fetching subscriptions:", subscriptionsError);
    }

    const funnelIds = userFunnels?.map((f) => f.id) || [];
    const siteIds = userSites?.map((s) => s.id) || [];
    const subscriptionIds = userSubscriptions?.map((s) => s.id) || [];

    if (funnelIds.length > 0) {
      const { error: funnelConversionsError } = await adminClient
        .from("funnel_conversions")
        .delete()
        .in("funnel_id", funnelIds);

      if (funnelConversionsError) {
        console.error(
          "❌ Error deleting funnel conversions:",
          funnelConversionsError
        );
      }
    }

    if (funnelIds.length > 0) {
      const { error: funnelStepsError } = await adminClient
        .from("funnel_steps")
        .delete()
        .in("funnel_id", funnelIds);

      if (funnelStepsError) {
        console.error("❌ Error deleting funnel steps:", funnelStepsError);
      }
    }

    const { error: funnelsError2 } = await adminClient
      .from("funnels")
      .delete()
      .eq("user_id", user.id);
    if (funnelsError2) {
      console.error("❌ Error deleting funnels:", funnelsError2);
    }

    if (siteIds.length > 0) {
      const { error: analyticsEventsError } = await adminClient
        .from("analytics_events")
        .delete()
        .in("site_id", siteIds);

      if (analyticsEventsError) {
        console.error(
          "❌ Error deleting analytics events:",
          analyticsEventsError
        );
      }
    }

    if (siteIds.length > 0) {
      const { error: sessionsError } = await adminClient
        .from("sessions")
        .delete()
        .in("site_id", siteIds);

      if (sessionsError) {
        console.error("❌ Error deleting sessions:", sessionsError);
      }
    }

    const { error: gaImportError } = await adminClient
      .from("ga_import_jobs")
      .delete()
      .eq("user_id", user.id);
    if (gaImportError) {
      console.error("❌ Error deleting GA import jobs:", gaImportError);
    }

    const { error: googleAuthError } = await adminClient
      .from("google_auth_tokens")
      .delete()
      .eq("user_id", user.id);

    if (googleAuthError) {
      console.error("❌ Error deleting Google auth tokens:", googleAuthError);
    }

    if (subscriptionIds.length > 0) {
      const { error: usageEventsError } = await adminClient
        .from("usage_events")
        .delete()
        .in("subscription_id", subscriptionIds);

      if (usageEventsError) {
        console.error("❌ Error deleting usage events:", usageEventsError);
      }
    }

    if (subscriptionIds.length > 0) {
      const { error: planFeaturesError } = await adminClient
        .from("plan_features")
        .delete()
        .in("subscription_id", subscriptionIds);

      if (planFeaturesError) {
        console.error("❌ Error deleting plan features:", planFeaturesError);
      }
    }

    if (subscriptionIds.length > 0) {
      const { error: paymentHistoryError } = await adminClient
        .from("payment_history")
        .delete()
        .in("subscription_id", subscriptionIds);

      if (paymentHistoryError) {
        console.error(
          "❌ Error deleting payment history:",
          paymentHistoryError
        );
      }
    }

    const { error: subscriptionsDeleteError } = await adminClient
      .from("subscriptions")
      .delete()
      .eq("user_id", user.id);
    if (subscriptionsDeleteError) {
      console.error(
        "❌ Error deleting subscriptions:",
        subscriptionsDeleteError
      );
    }

    const { error: sitesDeleteError } = await adminClient
      .from("sites")
      .delete()
      .eq("user_id", user.id);
    if (sitesDeleteError) {
      console.error("❌ Error deleting sites:", sitesDeleteError);
    }

    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(
      user.id
    );

    if (deleteUserError) {
      console.error("❌ Error deleting user from auth:", deleteUserError);
      throw deleteUserError;
    }

    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error("❌ Error signing out user:", signOutError);
    }

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("=== FATAL ERROR DURING ACCOUNT DELETION ===");
    console.error("Error details:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    return NextResponse.json(
      { error: "Failed to delete account. Please contact support." },
      { status: 500 }
    );
  }
}
