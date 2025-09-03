// Configuration centralisée pour Stripe et les plans

export interface PlanInfo {
  tier: "professional";
  events: string;
  period: "monthly" | "yearly";
}

export interface PlanTierConfig {
  pageviews: number;
  websites: number | -1; // -1 = unlimited
  retention: string;
  goals: number | -1; // -1 = unlimited
  customEvents: number | -1; // -1 = unlimited
}

// Déterminer l'environnement
const isDevelopment =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_NODE_ENV === "developpement";

// Configuration des price IDs Stripe pour TEST (dev)
const STRIPE_PRICE_IDS_TEST: Record<string, string> = {
  // Professional Monthly (Test)
  professional_monthly_10k: "price_1RxsClInt9j1ISHBoPY4rob9",
  professional_monthly_100k: "price_1RxsClInt9j1ISHBrpYRUtk4",
  professional_monthly_250k: "price_1RxsClInt9j1ISHBEGANw1or",
  professional_monthly_500k: "price_1RxsClInt9j1ISHBDrOLsvJl",
  professional_monthly_1m: "price_1RxsClInt9j1ISHB8nq6Bd4a",
  professional_monthly_2m: "price_1RxsClInt9j1ISHBCM2wDehy",
  professional_monthly_5m: "price_1RxsClInt9j1ISHBkRGvCOT3",
  professional_monthly_10m: "price_1RxsClInt9j1ISHBOOL5YSEw",

  // Professional Yearly (Test)
  professional_yearly_10k: "price_1RxsR1Int9j1ISHBvrtE4zB3",
  professional_yearly_100k: "price_1RxsR1Int9j1ISHBYvahz8Zp",
  professional_yearly_250k: "price_1RxsR1Int9j1ISHBZ7q0UdCp",
  professional_yearly_500k: "price_1RxsR1Int9j1ISHBoixryYmb",
  professional_yearly_1m: "price_1RxsR1Int9j1ISHBGmKoyVLn",
  professional_yearly_2m: "price_1RxsR1Int9j1ISHB0GwotGL9",
  professional_yearly_5m: "price_1RxsR1Int9j1ISHBvO1fpdro",
  professional_yearly_10m: "price_1RxsR1Int9j1ISHBLrgFfatU",
};

// Configuration des price IDs Stripe pour PRODUCTION
// TODO: Remplacer ces IDs par les vrais price IDs de production quand ils seront créés
const STRIPE_PRICE_IDS_PROD: Record<string, string> = {
  // Professional Monthly (Production)
  professional_monthly_10k: "price_1S1kDDRFlE5uDVLgthW4nHvt",
  professional_monthly_100k: "price_1S0HlHRFlE5uDVLgfVC5oSdN",
  professional_monthly_250k: "price_1S0HlHRFlE5uDVLggm9SqFOz",
  professional_monthly_500k: "price_1S0HlHRFlE5uDVLgAoU7F0XW",
  professional_monthly_1m: "price_1S0HlHRFlE5uDVLgBLEfyA16",
  professional_monthly_2m: "price_1S0HlHRFlE5uDVLg7Xdi5WaJ",
  professional_monthly_5m: "price_1S0HlHRFlE5uDVLgPQVY6nhz",
  professional_monthly_10m: "price_1S0HlHRFlE5uDVLgoxzRfB4z",

  // Professional Yearly (Production)
  professional_yearly_10k: "price_1S0Hl9RFlE5uDVLgNjcGV73j",
  professional_yearly_100k: "price_1S0Hl9RFlE5uDVLgxUFgvesO",
  professional_yearly_250k: "price_1S0Hl8RFlE5uDVLgaGuWZ2sP",
  professional_yearly_500k: "price_1S0Hl9RFlE5uDVLguAqPMirn",
  professional_yearly_1m: "price_1S0Hl9RFlE5uDVLgaH6Zj39p",
  professional_yearly_2m: "price_1S0Hl8RFlE5uDVLgFAGwLYCF",
  professional_yearly_5m: "price_1S0Hl8RFlE5uDVLgylJanCBa",
  professional_yearly_10m: "price_1S0Hl8RFlE5uDVLgLqUdAXId",
};

// Sélectionner les price IDs selon l'environnement
export const STRIPE_PRICE_IDS = isDevelopment
  ? STRIPE_PRICE_IDS_TEST
  : STRIPE_PRICE_IDS_PROD;

// Log pour debug (optionnel)
if (typeof window !== "undefined") {
  console.log(
    `🔧 Stripe environment: ${isDevelopment ? "TEST" : "PRODUCTION"}`
  );
}

// Map inverse : price ID -> plan info
export const PRICE_TO_PLAN_MAP: Record<string, PlanInfo> = Object.entries(
  STRIPE_PRICE_IDS
).reduce(
  (acc, [key, priceId]) => {
    const [, period, events] = key.split("_") as [string, string, string];
    acc[priceId] = {
      tier: "professional", // Seul plan payant maintenant
      events,
      period: period as "monthly" | "yearly",
    };
    return acc;
  },
  {} as Record<string, PlanInfo>
);

// Configuration des tiers d'événements
export const EVENT_TIERS = [
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

// Configuration des tarifs pour chaque tier
export const PRICING_TIERS = {
  professional: {
    monthly: [9, 29, 46, 69, 99, 129, 189, 229, "Custom"],
    yearly: [90, 290, 450, 690, 990, 1290, 1890, 2290, "Custom"],
  },
};

// Configuration des limites par plan
export const PLAN_LIMITS = {
  hobby: {
    pageviews: "3K",
    websites: 2,
    retention: "60 days",
    goals: 1,
    customEvents: 5,
  },
  professional: {
    "10k": {
      pageviews: 10000,
      websites: -1,
      retention: "5 years",
      goals: -1,
      customEvents: -1,
    },
    "100k": {
      pageviews: 100000,
      websites: -1,
      retention: "5 years",
      goals: -1,
      customEvents: -1,
    },
    "250k": {
      pageviews: 250000,
      websites: -1,
      retention: "5 years",
      goals: -1,
      customEvents: -1,
    },
    "500k": {
      pageviews: 500000,
      websites: -1,
      retention: "5 years",
      goals: -1,
      customEvents: -1,
    },
    "1m": {
      pageviews: 1000000,
      websites: -1,
      retention: "5 years",
      goals: -1,
      customEvents: -1,
    },
    "2m": {
      pageviews: 2000000,
      websites: -1,
      retention: "5 years",
      goals: -1,
      customEvents: -1,
    },
    "5m": {
      pageviews: 5000000,
      websites: -1,
      retention: "5 years",
      goals: -1,
      customEvents: -1,
    },
    "10m": {
      pageviews: 10000000,
      websites: -1,
      retention: "5 years",
      goals: -1,
      customEvents: -1,
    },
  },
};

// Fonction helper pour obtenir un price ID
export function getStripePriceId(
  planName: string,
  tierIndex: number,
  isYearly: boolean
): string {
  const tierNames = EVENT_TIERS.slice(0, -1).map((t) => t.value); // Exclude "10m+"
  const tierName = tierNames[tierIndex];
  const frequency = isYearly ? "yearly" : "monthly";

  const conventionKey = `${planName.toLowerCase()}_${frequency}_${tierName}`;

  return STRIPE_PRICE_IDS[conventionKey] || conventionKey;
}

// Fonction helper pour extraire les infos d'un price ID
export function extractPlanFromPriceId(priceId: string): PlanInfo {
  return (
    PRICE_TO_PLAN_MAP[priceId] || {
      tier: "professional",
      events: "10k",
      period: "monthly",
    }
  );
}
