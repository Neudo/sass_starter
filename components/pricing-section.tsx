"use client";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { Check, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

interface PricingSectionProps {
  showFullPage?: boolean;
  showUpgradeButtons?: boolean;
}

export function PricingSection({
  showFullPage = false,
  showUpgradeButtons = false,
}: PricingSectionProps) {
  const router = useRouter();
  const onNavigateToPricing = () => router.push("/pricing");
  const [isYearly, setIsYearly] = useState(false);
  const [eventTier, setEventTier] = useState(0); // Index for event tiers
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();
  }, []);

  // Mapping from your naming convention to actual Stripe price IDs
  const stripePriceMapping: Record<string, string> = {
    // Hobby Monthly
    hobby_monthly_10k: "price_1RxrBSInt9j1ISHBbGn6XWpR", // Replace with your actual price IDs
    hobby_monthly_100k: "price_1RxrBSInt9j1ISHBWCWy5L16",
    hobby_monthly_250k: "price_1RxreuInt9j1ISHB5A4v7MxT",
    hobby_monthly_500k: "price_1RxrfGInt9j1ISHBW07XPARX",
    hobby_monthly_1m: "price_1RxrfgInt9j1ISHB9VRQWrFj",
    hobby_monthly_2m: "price_1Rxrg7Int9j1ISHBJL4eS4CG",
    hobby_monthly_5m: "price_1RxrgOInt9j1ISHBWbYz0kFH",
    hobby_monthly_10m: "price_1RxrgjInt9j1ISHBYxbZF3t7",

    // Hobby Yearly
    hobby_yearly_10k: "price_1RxsJzInt9j1ISHBEmDZurno",
    hobby_yearly_100k: "price_1RxsJzInt9j1ISHBPWDBR4xd",
    hobby_yearly_250k: "price_1RxsJzInt9j1ISHBsTq5ZO8S",
    hobby_yearly_500k: "price_1RxsJzInt9j1ISHB9JSkWfQi",
    hobby_yearly_1m: "price_1RxsJzInt9j1ISHBqrnyO8da",
    hobby_yearly_2m: "price_1RxsJzInt9j1ISHBmzdWoftc",
    hobby_yearly_5m: "price_1RxsJzInt9j1ISHBhEMU1t0n",
    hobby_yearly_10m: "price_1RxsJzInt9j1ISHBGJkkXOu1",

    // Professional Monthly
    professional_monthly_10k: "price_1RxsClInt9j1ISHBoPY4rob9",
    professional_monthly_100k: "price_1RxsClInt9j1ISHBrpYRUtk4",
    professional_monthly_250k: "price_1RxsClInt9j1ISHBEGANw1or",
    professional_monthly_500k: "price_1RxsClInt9j1ISHBDrOLsvJl",
    professional_monthly_1m: "price_1RxsClInt9j1ISHB8nq6Bd4a",
    professional_monthly_2m: "price_1RxsClInt9j1ISHBCM2wDehy",
    professional_monthly_5m: "price_1RxsClInt9j1ISHBkRGvCOT3",
    professional_monthly_10m: "price_1RxsClInt9j1ISHBOOL5YSEw",
    // ... add all your professional prices

    // Professional Yearly
    professional_yearly_10k: "price_1RxsR1Int9j1ISHBvrtE4zB3",
    professional_yearly_100k: "price_1RxsR1Int9j1ISHBYvahz8Zp",
    professional_yearly_250k: "price_1RxsR1Int9j1ISHBZ7q0UdCp",
    professional_yearly_500k: "price_1RxsR1Int9j1ISHBoixryYmb",
    professional_yearly_1m: "price_1RxsR1Int9j1ISHBGmKoyVLn",
    professional_yearly_2m: "price_1RxsR1Int9j1ISHB0GwotGL9",
    professional_yearly_5m: "price_1RxsR1Int9j1ISHBvO1fpdro",
    professional_yearly_10m: "price_1RxsR1Int9j1ISHBLrgFfatU",
  };

  // Helper function to get actual Stripe price ID
  const getStripePriceId = (
    planName: string,
    tierIndex: number,
    isYearly: boolean
  ) => {
    const tierNames = ["10k", "100k", "250k", "500k", "1m", "2m", "5m", "10m"];
    const tierName = tierNames[tierIndex];
    const frequency = isYearly ? "yearly" : "monthly";

    const conventionKey = `${planName.toLowerCase()}_${frequency}_${tierName}`;

    // Return the actual Stripe price ID, or fallback to convention key for development
    return stripePriceMapping[conventionKey] || conventionKey;
  };

  const handleStartTrial = (plan: string) => {
    if (!user && !showUpgradeButtons) {
      router.push("/auth/sign-up");
    } else if (showUpgradeButtons || user) {
      const priceId = getStripePriceId(plan, eventTier, isYearly);

      // Redirect to Stripe Checkout
      const checkoutUrl = `/api/stripe/checkout?price_id=${priceId}`;
      window.location.href = checkoutUrl;
    } else {
      router.push("/auth/sign-up");
    }
  };

  const eventTiers = [
    { value: "10k", label: "10K" },
    { value: "100k", label: "100K" },
    { value: "250k", label: "250K" },
    { value: "500k", label: "500K" },
    { value: "1m", label: "1M" },
    { value: "2m", label: "2M" },
    { value: "5m", label: "5M" },
    { value: "10m", label: "10M" },
    { value: "10m+", label: "10M+" },
  ];

  // Define pricing for each tier
  const pricingTiers = {
    hobby: {
      monthly: [9, 19, 29, 44, 62, 85, 119, 159, "Custom"], // Prices for each tier
      yearly: [90, 190, 290, 440, 620, 850, 1190, 1590, "Custom"], // 10 months price (2 months free)
    },
    professional: {
      monthly: [14, 29, 46, 69, 99, 129, 189, 229, "Custom"],
      yearly: [140, 290, 450, 690, 990, 1290, 1890, 2290, "Custom"], // 10 months price (2 months free)
    },
  };

  const basePlans = [
    {
      name: "Hobby",
      description: "Perfect for personal projects",
      features: [
        "events/month",
        "2 websites",
        "3 years retention",
        "Goals (limited to 1)",
        "Custom events (limited to 10)",
        "Export data",
      ],
      cta: "Start free trial",
      popular: false,
      color: "secondary",
      pricing: pricingTiers.hobby,
    },
    {
      name: "Professional",
      description: "For serious businesses",
      features: [
        "events/month",
        "Unlimited websites",
        "5 years data retention",
        "Unlimited goals",
        "Unlimited custom events",
        "Export/import data",
        "Google Analytics import",
        "Teams (unlimited members)",
        "Public dashboard",
        "Funnels",
      ],
      cta: "Start free trial",
      popular: true,
      color: "primary",
      pricing: pricingTiers.professional,
    },
  ];

  // Get current prices based on selected tier
  const isCustomTier = eventTier === eventTiers.length - 1; // Check if it's 10M+

  const plans = basePlans.map((plan) => ({
    ...plan,
    monthlyPrice: plan.pricing.monthly[eventTier],
    yearlyPrice: plan.pricing.yearly[eventTier],
    features: plan.features.map((feature, index) =>
      index === 0 ? `${eventTiers[eventTier].label} ${feature}` : feature
    ),
    cta: isCustomTier
      ? "Contact us"
      : showUpgradeButtons
      ? "Upgrade"
      : plan.cta,
  }));

  return (
    <section className={`${showFullPage ? "py-24" : "py-16"} bg-background`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Badge
              variant="secondary"
              className="mb-4 bg-primary/10 text-primary border-primary/20"
            >
              Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Go as you growth
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                <span>30 days free</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                <span>No hidden fees</span>
              </div>
            </div>

            {/* Annual/Monthly toggle */}
            <div className="relative flex items-center justify-center gap-4 mb-10 bg-slate-50 dark:bg-slate-800 w-fit px-4 py-4 mx-auto rounded-lg">
              <button
                onClick={() => setIsYearly(false)}
                className={`text-xl cursor-pointer transition-colors ${
                  !isYearly
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground/80"
                }`}
              >
                Monthly
              </button>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
                className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300"
              />
              <button
                onClick={() => setIsYearly(true)}
                className={`text-xl cursor-pointer transition-colors ${
                  isYearly
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground/80"
                }`}
              >
                Annual
              </button>
              <Badge
                variant="secondary"
                className="bg-green-50 text-green-700 border-green-200 absolute top-[-7px] right-[-30px]"
              >
                2 months free
              </Badge>
            </div>

            {/* Event tier selector */}
            <div className="max-w-2xl mx-auto mb-5 md:mb-16">
              <label className="block text-sm font-medium text-muted-foreground mb-4 text-center">
                Monthly page views
              </label>
              <div className="relative px-4">
                <Slider
                  value={[eventTier]}
                  onValueChange={(value) => setEventTier(value[0])}
                  min={0}
                  max={eventTiers.length - 1}
                  step={1}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  {eventTiers.map((tier, index) => (
                    <span
                      key={tier.value}
                      className={`cursor-pointer transition-all ${
                        index === eventTier
                          ? "text-primary font-semibold scale-110"
                          : "hover:text-foreground"
                      }`}
                      onClick={() => setEventTier(index)}
                    >
                      {tier.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card
                className={`relative h-full ${
                  plan.popular
                    ? "border-primary shadow-lg scale-105 ring-2 ring-primary/20"
                    : plan.color === "secondary"
                    ? "border-slate-100 hover:border-slate-200 dark:border-slate-800 dark:hover:border-slate-700 transition-colors"
                    : ""
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}

                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                  <p className="text-muted-foreground mb-4">
                    {plan.description}
                  </p>

                  <div className="space-y-2">
                    {isCustomTier ? (
                      <div className="flex items-baseline justify-center gap-1">
                        <span
                          className={`text-3xl font-bold ${
                            plan.color === "primary" ? "text-primary" : "black"
                          }`}
                        >
                          Custom
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-baseline justify-center gap-1">
                          <span
                            className={`text-4xl font-bold ${
                              plan.color === "primary"
                                ? "text-primary"
                                : "black"
                            }`}
                          >
                            ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                          </span>
                          <span className="text-muted-foreground">
                            {isYearly ? "/year" : "/month"}
                          </span>
                        </div>
                        {isYearly &&
                          typeof plan.monthlyPrice === "number" &&
                          typeof plan.yearlyPrice === "number" && (
                            <div className="text-sm text-muted-foreground">
                              <span className="line-through">
                                ${plan.monthlyPrice * 12}
                              </span>
                              <span className="ml-2 text-slate-500">
                                ${(plan.yearlyPrice / 12).toFixed(2)}/month
                              </span>
                            </div>
                          )}
                      </>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? ""
                        : plan.color === "secondary"
                        ? "text-secondar y-foreground"
                        : "variant-outline border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    }`}
                    variant={
                      plan.popular
                        ? "default"
                        : plan.color === "secondary"
                        ? "outline"
                        : "ghost"
                    }
                    onClick={() => handleStartTrial(plan.name)}
                    disabled={loading || isCustomTier}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          plan.color === "primary"
                            ? "text-primary"
                            : "text-secondary"
                        }`}
                      />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {!showFullPage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={onNavigateToPricing}
              className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
            >
              View all pricing details
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
