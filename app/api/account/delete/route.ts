import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

export async function DELETE() {
  console.log("=== STARTING ACCOUNT DELETION PROCESS ===");
  console.log(`Timestamp: ${new Date().toISOString()}`);

  try {
    console.log("Step 1: Creating Supabase clients...");
    const supabase = await createClient();
    const adminClient = createAdminClient();
    console.log("✓ Supabase clients created successfully");

    console.log("Step 2: Getting authenticated user...");
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

    console.log(`✓ User authenticated: ${user.id} (${user.email})`);
    console.log(`Starting account deletion for user: ${user.id}`);

    // Get user's subscription to cancel Stripe subscription
    console.log("Step 3: Fetching user subscriptions...");
    const { data: subscription, error: subscriptionError } = await adminClient
      .from("subscriptions")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("user_id", user.id)
      .single();

    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      console.error("Error fetching subscription:", subscriptionError);
    }

    console.log(`✓ Subscription data: ${subscription ? 'found' : 'none'}`);
    if (subscription) {
      console.log(`  - Customer ID: ${subscription.stripe_customer_id}`);
      console.log(`  - Subscription ID: ${subscription.stripe_subscription_id}`);
    }

    // Cancel Stripe subscription if exists
    if (subscription?.stripe_subscription_id && process.env.STRIPE_SECRET_KEY) {
      console.log("Step 4: Cancelling Stripe subscription...");
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
        console.log(
          `✓ Cancelled Stripe subscription: ${subscription.stripe_subscription_id}`
        );
      } catch (stripeError) {
        console.error("❌ Error cancelling Stripe subscription:", stripeError);
        // Continue with deletion even if Stripe fails
      }
    } else {
      console.log("Step 4: Skipping Stripe cancellation (no subscription or API key)");
    }

    // Get all user's data IDs first to avoid subquery issues
    console.log("Step 5: Fetching user's data IDs...");
    
    console.log("  5.1: Fetching funnels...");
    const { data: userFunnels, error: funnelsError } = await adminClient
      .from("funnels")
      .select("id")
      .eq("user_id", user.id);

    if (funnelsError) {
      console.error("❌ Error fetching funnels:", funnelsError);
    } else {
      console.log(`✓ Found ${userFunnels?.length || 0} funnels`);
    }

    console.log("  5.2: Fetching sites...");
    const { data: userSites, error: sitesError } = await adminClient
      .from("sites")
      .select("id")
      .eq("user_id", user.id);

    if (sitesError) {
      console.error("❌ Error fetching sites:", sitesError);
    } else {
      console.log(`✓ Found ${userSites?.length || 0} sites`);
    }

    console.log("  5.3: Fetching subscriptions...");
    const { data: userSubscriptions, error: subscriptionsError } = await adminClient
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id);

    if (subscriptionsError) {
      console.error("❌ Error fetching subscriptions:", subscriptionsError);
    } else {
      console.log(`✓ Found ${userSubscriptions?.length || 0} subscriptions`);
    }

    const funnelIds = userFunnels?.map(f => f.id) || [];
    const siteIds = userSites?.map(s => s.id) || [];
    const subscriptionIds = userSubscriptions?.map(s => s.id) || [];

    console.log("✓ Data IDs prepared:");
    console.log(`  - Funnel IDs: [${funnelIds.join(', ')}]`);
    console.log(`  - Site IDs: [${siteIds.join(', ')}]`);
    console.log(`  - Subscription IDs: [${subscriptionIds.join(', ')}]`);

    // Delete user data in the correct order (due to foreign key constraints)
    console.log("Step 6: Starting cascade deletion...");
    
    console.log("  6.1: Deleting funnel conversions...");
    if (funnelIds.length > 0) {
      const { error: funnelConversionsError } = await adminClient
        .from("funnel_conversions")
        .delete()
        .in("funnel_id", funnelIds);
      
      if (funnelConversionsError) {
        console.error("❌ Error deleting funnel conversions:", funnelConversionsError);
      } else {
        console.log("✓ Funnel conversions deleted");
      }
    } else {
      console.log("✓ No funnel conversions to delete");
    }

    console.log("  6.2: Deleting funnel steps...");
    if (funnelIds.length > 0) {
      const { error: funnelStepsError } = await adminClient
        .from("funnel_steps")
        .delete()
        .in("funnel_id", funnelIds);
      
      if (funnelStepsError) {
        console.error("❌ Error deleting funnel steps:", funnelStepsError);
      } else {
        console.log("✓ Funnel steps deleted");
      }
    } else {
      console.log("✓ No funnel steps to delete");
    }

    console.log("  6.3: Deleting funnels...");
    const { error: funnelsError2 } = await adminClient.from("funnels").delete().eq("user_id", user.id);
    if (funnelsError2) {
      console.error("❌ Error deleting funnels:", funnelsError2);
    } else {
      console.log("✓ Funnels deleted");
    }

    console.log("  6.4: Deleting analytics events...");
    if (siteIds.length > 0) {
      const { error: analyticsEventsError } = await adminClient
        .from("analytics_events")
        .delete()
        .in("site_id", siteIds);
      
      if (analyticsEventsError) {
        console.error("❌ Error deleting analytics events:", analyticsEventsError);
      } else {
        console.log("✓ Analytics events deleted");
      }
    } else {
      console.log("✓ No analytics events to delete");
    }

    console.log("  6.5: Deleting sessions...");
    if (siteIds.length > 0) {
      const { error: sessionsError } = await adminClient
        .from("sessions")
        .delete()
        .in("site_id", siteIds);
      
      if (sessionsError) {
        console.error("❌ Error deleting sessions:", sessionsError);
      } else {
        console.log("✓ Sessions deleted");
      }
    } else {
      console.log("✓ No sessions to delete");
    }

    console.log("  6.6: Deleting GA import jobs...");
    const { error: gaImportError } = await adminClient.from("ga_import_jobs").delete().eq("user_id", user.id);
    if (gaImportError) {
      console.error("❌ Error deleting GA import jobs:", gaImportError);
    } else {
      console.log("✓ GA import jobs deleted");
    }

    console.log("  6.7: Deleting Google auth tokens...");
    const { error: googleAuthError } = await adminClient
      .from("google_auth_tokens")
      .delete()
      .eq("user_id", user.id);
    
    if (googleAuthError) {
      console.error("❌ Error deleting Google auth tokens:", googleAuthError);
    } else {
      console.log("✓ Google auth tokens deleted");
    }

    console.log("  6.8: Deleting usage events...");
    if (subscriptionIds.length > 0) {
      const { error: usageEventsError } = await adminClient
        .from("usage_events")
        .delete()
        .in("subscription_id", subscriptionIds);
      
      if (usageEventsError) {
        console.error("❌ Error deleting usage events:", usageEventsError);
      } else {
        console.log("✓ Usage events deleted");
      }
    } else {
      console.log("✓ No usage events to delete");
    }

    console.log("  6.9: Deleting plan features...");
    if (subscriptionIds.length > 0) {
      const { error: planFeaturesError } = await adminClient
        .from("plan_features")
        .delete()
        .in("subscription_id", subscriptionIds);
      
      if (planFeaturesError) {
        console.error("❌ Error deleting plan features:", planFeaturesError);
      } else {
        console.log("✓ Plan features deleted");
      }
    } else {
      console.log("✓ No plan features to delete");
    }

    console.log("  6.10: Deleting payment history...");
    if (subscriptionIds.length > 0) {
      const { error: paymentHistoryError } = await adminClient
        .from("payment_history")
        .delete()
        .in("subscription_id", subscriptionIds);
      
      if (paymentHistoryError) {
        console.error("❌ Error deleting payment history:", paymentHistoryError);
      } else {
        console.log("✓ Payment history deleted");
      }
    } else {
      console.log("✓ No payment history to delete");
    }

    console.log("  6.11: Deleting subscriptions...");
    const { error: subscriptionsDeleteError } = await adminClient.from("subscriptions").delete().eq("user_id", user.id);
    if (subscriptionsDeleteError) {
      console.error("❌ Error deleting subscriptions:", subscriptionsDeleteError);
    } else {
      console.log("✓ Subscriptions deleted");
    }

    console.log("  6.12: Deleting sites...");
    const { error: sitesDeleteError } = await adminClient.from("sites").delete().eq("user_id", user.id);
    if (sitesDeleteError) {
      console.error("❌ Error deleting sites:", sitesDeleteError);
    } else {
      console.log("✓ Sites deleted");
    }

    console.log("Step 7: Deleting user account from auth...");
    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(
      user.id
    );

    if (deleteUserError) {
      console.error("❌ Error deleting user from auth:", deleteUserError);
      throw deleteUserError;
    }

    console.log("✓ User account deleted from auth");

    console.log("Step 8: Signing out user...");
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error("❌ Error signing out user:", signOutError);
    } else {
      console.log("✓ User signed out successfully");
    }

    console.log(`=== ACCOUNT DELETION COMPLETED FOR USER: ${user.id} ===`);
    console.log(`Completion timestamp: ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("=== FATAL ERROR DURING ACCOUNT DELETION ===");
    console.error("Error details:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    console.error(`Error timestamp: ${new Date().toISOString()}`);
    
    return NextResponse.json(
      { error: "Failed to delete account. Please contact support." },
      { status: 500 }
    );
  }
}
