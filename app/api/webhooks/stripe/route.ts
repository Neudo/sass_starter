/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractPlanFromPriceId } from "@/lib/stripe-config";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Get the subscription details with full expansion
        const subscription = (await stripe.subscriptions.retrieve(
          session.subscription as string,
          {
            expand: ["latest_invoice", "customer"],
          }
        )) as any; // Cast to any to access all properties

        if (!session.metadata?.user_id) {
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
          if (eventsStr.includes("k")) return num * 1000;
          if (eventsStr.includes("m")) return num * 1000000;
          return num;
        };

        const eventsLimit = parseEventsLimit(planInfo.events);
        const planTier = planInfo.tier; // Use the tier directly now that DB accepts "professional"

        // If the periods are missing, use created timestamp as fallback
        const periodStart =
          subscription.current_period_start ||
          subscription.created ||
          Math.floor(Date.now() / 1000);
        const periodEnd =
          subscription.current_period_end || periodStart + 2592000; // +30 days

        // Check if subscription exists first
        const { data: existingSub } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("user_id", session.metadata.user_id)
          .single();

        if (!existingSub) {
          // Create new subscription if none exists
          const { error } = await supabase.from("subscriptions").insert({
            user_id: session.metadata.user_id,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            stripe_price_id: priceId,
            plan_tier: planTier,
            events_limit: eventsLimit,
            billing_period: planInfo.period,
            status: "active",
            current_period_start: new Date(periodStart * 1000).toISOString(),
            current_period_end: new Date(periodEnd * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          if (error) {
            return NextResponse.json(
              { error: "Database insert failed", details: error },
              { status: 500 }
            );
          }
        } else {
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
              status: "active",
              current_period_start: new Date(periodStart * 1000).toISOString(),
              current_period_end: new Date(periodEnd * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", session.metadata.user_id);

          if (error) {
            return NextResponse.json(
              { error: "Database update failed", details: error },
              { status: 500 }
            );
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any; // Cast to any to access all properties
        // Find the user by stripe_subscription_id
        const { data: existingSub, error: findError } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (findError || !existingSub) {
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
          return NextResponse.json(
            { error: "Failed to update subscription" },
            { status: 500 }
          );
        }

        break;
      }

      case "customer.subscription.deleted": {
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
          return NextResponse.json(
            { error: "Failed to cancel subscription" },
            { status: 500 }
          );
        }
        break;
      }

      default:
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
