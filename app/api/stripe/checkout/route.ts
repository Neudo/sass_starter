import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Stripe checkout initiated");
    
    const { searchParams } = new URL(request.url);
    const price_id = searchParams.get("price_id");
    console.log("💰 Price ID:", price_id);

    if (!price_id) {
      console.log("❌ No price ID provided");
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }

    // Check if Stripe key exists
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log("❌ STRIPE_SECRET_KEY not found in environment");
      return NextResponse.json(
        { error: "Stripe configuration missing" },
        { status: 500 }
      );
    }

    console.log("🔑 Stripe key exists, checking user auth...");

    // Get user from Supabase
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.log("❌ Auth error:", authError);
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 401 }
      );
    }

    if (!user) {
      console.log("❌ No user found");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log("✅ User authenticated:", user.email);

    // Check user's subscription and trial status
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("trial_end, stripe_customer_id, status, stripe_subscription_id")
      .eq("user_id", user.id)
      .single();

    if (subError) {
      console.log("❌ Error fetching subscription:", subError);
      // If no subscription exists, that's okay for first-time users
      if (subError.code !== 'PGRST116') {
        return NextResponse.json(
          { error: "Failed to fetch subscription data" },
          { status: 500 }
        );
      }
    }

    console.log("👤 User subscription:", subscription);

    // Check if user is still in trial period
    const isInTrial = subscription?.trial_end && new Date(subscription.trial_end) > new Date();
    console.log("🎯 User in trial:", isInTrial);

    console.log("🛒 Creating Stripe checkout session...");

    // Get the origin URL
    const origin = request.headers.get("origin") || "http://localhost:3000";
    console.log("🌐 Origin URL:", origin);

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

    // If user is still in trial, add trial end date to subscription
    if (isInTrial && subscription?.trial_end) {
      const trialEndTimestamp = Math.floor(new Date(subscription.trial_end).getTime() / 1000);
      sessionConfig.subscription_data!.trial_end = trialEndTimestamp;
    }

    // If user already has a Stripe customer ID, use it
    if (subscription?.stripe_customer_id && subscription.stripe_customer_id !== '') {
      sessionConfig.customer = subscription.stripe_customer_id;
      delete sessionConfig.customer_email; // Can't use both customer and customer_email
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log("✅ Stripe session created:", session.id);

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
