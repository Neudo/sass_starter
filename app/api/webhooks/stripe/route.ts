import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractPlanFromPriceId } from "@/lib/stripe-config";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  console.log("🪝 Stripe webhook received");

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !webhookSecret) {
    console.log("❌ Missing signature or webhook secret");
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    console.log("✅ Webhook verified:", event.type);
  } catch (err) {
    console.log("❌ Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        console.log("🛒 Processing checkout.session.completed");
        const session = event.data.object as Stripe.Checkout.Session;

        // Get the subscription details
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        ) as any; // Cast to any to access all properties

        console.log("📋 Checkout session details:", {
          customer: session.customer,
          subscription: session.subscription,
          metadata: session.metadata,
          user_id: session.metadata?.user_id,
        });

        if (!session.metadata?.user_id) {
          console.log("❌ No user_id in session metadata. Full session:", JSON.stringify(session, null, 2));
          return NextResponse.json(
            { error: "No user_id in metadata" },
            { status: 400 }
          );
        }

        // Extract plan information from the price ID
        const priceId = subscription.items.data[0].price.id;
        const planInfo = extractPlanFromPriceId(priceId);

        console.log("🎯 Extracted plan info:", planInfo);

        // Update the existing subscription in the database
        const { error } = await supabase
          .from("subscriptions")
          .update({
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            stripe_price_id: priceId,
            plan_tier: planInfo.tier,
            events_limit: planInfo.events,
            billing_period: planInfo.period,
            status: subscription.status,
            current_period_start: subscription.current_period_start
              ? new Date(subscription.current_period_start * 1000).toISOString()
              : null,
            current_period_end: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
            trial_start: subscription.trial_start
              ? new Date(subscription.trial_start * 1000).toISOString()
              : null,
            trial_end: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", session.metadata.user_id);

        if (error) {
          console.log("❌ Error updating subscription:", error);
          return NextResponse.json(
            { error: "Database update failed" },
            { status: 500 }
          );
        }

        console.log("✅ Subscription updated successfully");
        break;
      }

      case "customer.subscription.updated": {
        console.log("🔄 Processing subscription update");
        const subscription = event.data.object as any; // Cast to any to access all properties

        // Find the user by stripe_subscription_id
        const { data: existingSub, error: findError } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (findError || !existingSub) {
          console.log("❌ Subscription not found in database");
          return NextResponse.json(
            { error: "Subscription not found" },
            { status: 404 }
          );
        }

        // Update subscription status
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            current_period_start: subscription.current_period_start
              ? new Date(subscription.current_period_start * 1000).toISOString()
              : null,
            current_period_end: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
            canceled_at: subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (updateError) {
          console.log("❌ Error updating subscription status:", updateError);
          return NextResponse.json(
            { error: "Failed to update subscription" },
            { status: 500 }
          );
        }

        console.log("✅ Subscription status updated");
        break;
      }

      case "customer.subscription.deleted": {
        console.log("🗑️ Processing subscription cancellation");
        const subscription = event.data.object as any; // Cast to any to access all properties

        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.log("❌ Error canceling subscription:", error);
          return NextResponse.json(
            { error: "Failed to cancel subscription" },
            { status: 500 }
          );
        }

        console.log("✅ Subscription canceled");
        break;
      }

      default:
        console.log("🤷 Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.log("❌ Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
