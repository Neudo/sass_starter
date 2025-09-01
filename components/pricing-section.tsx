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
import {
  EVENT_TIERS,
  PRICING_TIERS,
  getStripePriceId,
  PLAN_LIMITS,
} from "@/lib/stripe-config";

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

  const handleStartTrial = (plan: "hobby" | "professional") => {
    if (plan === "hobby") {
      router.push("/auth/sign-up");
      return;
    }

    // For Professional plan
    if (!user && !showUpgradeButtons) {
      router.push("/auth/sign-up");
    } else if (showUpgradeButtons || user) {
      const priceId = getStripePriceId("professional", eventTier, isYearly);
      const checkoutUrl = `/api/stripe/checkout?price_id=${priceId}`;
      window.location.href = checkoutUrl;
    } else {
      router.push("/auth/sign-up");
    }
  };

  const isCustomTier = eventTier === EVENT_TIERS.length - 1;
  const professionalPrice = PRICING_TIERS.professional;
  const monthlyPrice = professionalPrice.monthly[eventTier];
  const yearlyPrice = professionalPrice.yearly[eventTier];

  return (
    <section className={`${showFullPage ? "py-24" : "py-16"} bg-background`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
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
          </motion.div>
        </div>

        {/* Two Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto">
          {/* Hobby Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="relative h-full border-slate-100 hover:border-slate-200 dark:border-slate-800 dark:hover:border-slate-700 transition-colors">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-xl mb-2">Hobby</CardTitle>
                <p className="text-muted-foreground mb-4">
                  Perfect for personal projects and to discover.
                </p>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-white">Free</span>
                  </div>
                  <div className="text-lg font-semibold text-primary">
                    {PLAN_LIMITS.hobby.pageviews.toLocaleString()} events/month
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleStartTrial("hobby")}
                  disabled={loading}
                >
                  Start for free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>

                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-secondary" />
                  <span className="text-sm">
                    {PLAN_LIMITS.hobby.websites} websites max
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-secondary" />
                  <span className="text-sm">
                    {PLAN_LIMITS.hobby.retention} data retention
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-secondary" />
                  <span className="text-sm">Basic analytics</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-secondary" />
                  <span className="text-sm">Export data</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Professional Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="relative h-full border-primary shadow-lg scale-105 ring-2 ring-primary/20">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                Most Popular
              </Badge>

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl mb-2">Professional</CardTitle>
                <p className="text-muted-foreground mb-4">
                  For serious businesses
                </p>

                {/* Event tier selector */}
                <div className="mb-4">
                  <div className="relative px-2">
                    <Slider
                      value={[eventTier]}
                      onValueChange={(value) => setEventTier(value[0])}
                      min={0}
                      max={EVENT_TIERS.length - 1}
                      step={1}
                      className="mb-2"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-lg font-semibold text-primary mb-2">
                    {EVENT_TIERS[eventTier].label} events/month
                  </div>
                  {isCustomTier ? (
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold text-primary">
                        Custom
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-primary">
                          ${isYearly ? yearlyPrice : monthlyPrice}
                        </span>
                        <span className="text-muted-foreground">
                          {isYearly ? "/year" : "/month"}
                        </span>
                      </div>
                      {isYearly &&
                        typeof monthlyPrice === "number" &&
                        typeof yearlyPrice === "number" && (
                          <div className="text-sm text-muted-foreground">
                            <span className="line-through">
                              ${monthlyPrice * 12}
                            </span>
                            <span className="ml-2 text-slate-500">
                              ${(yearlyPrice / 12).toFixed(2)}/month
                            </span>
                          </div>
                        )}
                    </>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <Button
                  className="w-full"
                  onClick={() => handleStartTrial("professional")}
                  disabled={loading || isCustomTier}
                >
                  {isCustomTier
                    ? "Contact us"
                    : showUpgradeButtons
                      ? "Upgrade"
                      : "Start free trial"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>

                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                  <span className="text-sm">Unlimited websites</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                  <span className="text-sm">5 years data retention</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                  <span className="text-sm">Custom events</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                  <span className="text-sm">Funnels</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                  <span className="text-sm">Export/import data</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                  <span className="text-sm">Google Analytics import</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
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
