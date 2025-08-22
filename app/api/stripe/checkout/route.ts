import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const price_id = searchParams.get("price_id");

    if (!price_id) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }

    // Check if Stripe key exists
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe configuration missing" },
        { status: 500 }
      );
    }

    // Get user from Supabase
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check user's subscription and trial status
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select(
        "created_at, stripe_customer_id, status, stripe_subscription_id, plan_tier"
      )
      .eq("user_id", user.id)
      .single();

    if (subError) {
      // If no subscription exists, that's okay for first-time users
      if (subError.code !== "PGRST116") {
        return NextResponse.json(
          { error: "Failed to fetch subscription data" },
          { status: 500 }
        );
      }
    }

    // Get the origin URL
    const origin = request.headers.get("origin") || "http://localhost:3000";

    // Prepare checkout session configuration
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/settings/billing?success=true`,
      cancel_url: `${origin}/pricing?canceled=true`,
      customer_email: user.email,
      automatic_tax: {
        enabled: true,
      },
      metadata: {
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
    };

    // No trial period to preserve - user pays immediately regardless of remaining free days

    // If user already has a Stripe customer ID, use it
    if (
      subscription?.stripe_customer_id &&
      subscription.stripe_customer_id !== ""
    ) {
      sessionConfig.customer = subscription.stripe_customer_id;
      delete sessionConfig.customer_email; // Can't use both customer and customer_email
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    // Redirect to Stripe Checkout
    return NextResponse.redirect(session.url);
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
