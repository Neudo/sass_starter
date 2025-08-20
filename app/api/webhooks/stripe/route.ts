/* eslint-disable @typescript-eslint/no-explicit-any */
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

        // Get the subscription details with full expansion
        const subscription = (await stripe.subscriptions.retrieve(
          session.subscription as string,
          {
            expand: ['latest_invoice', 'customer']
          }
        )) as any; // Cast to any to access all properties

        console.log("📋 Checkout session details:", {
          customer: session.customer,
          subscription: session.subscription,
          metadata: session.metadata,
          user_id: session.metadata?.user_id,
        });

        if (!session.metadata?.user_id) {
          console.log(
            "❌ No user_id in session metadata. Full session:",
            JSON.stringify(session, null, 2)
          );
          return NextResponse.json(
            { error: "No user_id in metadata" },
            { status: 400 }
          );
        }

        // Extract plan information from the price ID
        const priceId = subscription.items.data[0].price.id;
        const planInfo = extractPlanFromPriceId(priceId);

        // Convert events string to number (e.g., "250k" -> 250000, "1m" -> 1000000)
        const parseEventsLimit = (eventsStr: string): number => {
          const num = parseFloat(eventsStr);
          if (eventsStr.includes('k')) return num * 1000;
          if (eventsStr.includes('m')) return num * 1000000;
          return num;
        };

        const eventsLimit = parseEventsLimit(planInfo.events);
        const planTier = planInfo.tier; // Use the tier directly now that DB accepts "professional"

        console.log("🎯 Extracted plan info:", planInfo);
        console.log("📊 Events limit:", eventsLimit);
        console.log("🎭 Plan tier for DB:", planTier);
        console.log("💳 User upgrading from free to paid plan:", planTier);
        
        // Debug subscription data from Stripe
        console.log("🔍 Checking subscription structure:");
        console.log("  - Has current_period_start?", 'current_period_start' in subscription);
        console.log("  - Has current_period_end?", 'current_period_end' in subscription); 
        console.log("  - Actual values:", {
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
            status: subscription.status
        });
        
        // If the periods are missing, use created timestamp as fallback
        const periodStart = subscription.current_period_start || subscription.created || Math.floor(Date.now() / 1000);
        const periodEnd = subscription.current_period_end || (periodStart + 2592000); // +30 days
        
        console.log("📅 Using periods for DB:", {
          start: new Date(periodStart * 1000).toISOString(),
          end: new Date(periodEnd * 1000).toISOString()
        });

        // Check if subscription exists first
        const { data: existingSub } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("user_id", session.metadata.user_id)
          .single();

        if (!existingSub) {
          console.log("⚠️ No existing subscription found for user, creating new one");
          // Create new subscription if none exists
          const { error } = await supabase
            .from("subscriptions")
            .insert({
              user_id: session.metadata.user_id,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
              stripe_price_id: priceId,
              plan_tier: planTier,
              events_limit: eventsLimit,
              billing_period: planInfo.period,
              status: 'active',
              current_period_start: new Date(periodStart * 1000).toISOString(),
              current_period_end: new Date(periodEnd * 1000).toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          
          if (error) {
            console.log("❌ Error creating subscription:", error);
            return NextResponse.json(
              { error: "Database insert failed", details: error },
              { status: 500 }
            );
          }
        } else {
          console.log("✅ Existing subscription found, updating...");
          // Update existing subscription
          const { error } = await supabase
            .from("subscriptions")
            .update({
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
              stripe_price_id: priceId,
              plan_tier: planTier,
              events_limit: eventsLimit,
              billing_period: planInfo.period,
              status: 'active',
              current_period_start: new Date(periodStart * 1000).toISOString(),
              current_period_end: new Date(periodEnd * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", session.metadata.user_id);
          
          if (error) {
            console.log("❌ Error updating subscription:", error);
            return NextResponse.json(
              { error: "Database update failed", details: error },
              { status: 500 }
            );
          }
        }

        console.log("✅ Subscription updated successfully");
        break;
      }

      case "customer.subscription.updated": {
        console.log("🔄 Processing subscription update");
        const subscription = event.data.object as any; // Cast to any to access all properties
        
        console.log("📅 Update event - Subscription periods:", {
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
          canceled_at: subscription.canceled_at,
          status: subscription.status
        });

        // Find the user by stripe_subscription_id
        const { data: existingSub, error: findError } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (findError || !existingSub) {
          console.log("⚠️ Subscription not found in database for update event, skipping...");
          // This can happen if the update event arrives before checkout.session.completed
          // Just log and skip - the checkout.session.completed will handle creation
          return NextResponse.json({ received: true, skipped: true });
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
