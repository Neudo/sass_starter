// Configuration centralisée pour Stripe et les plans

export interface PlanInfo {
  tier: "hobby" | "professional";
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
  // Hobby Monthly (Test)
  hobby_monthly_10k: "price_1RxrBSInt9j1ISHBbGn6XWpR",
  hobby_monthly_100k: "price_1RxrBSInt9j1ISHBWCWy5L16",
  hobby_monthly_250k: "price_1RxreuInt9j1ISHB5A4v7MxT",
  hobby_monthly_500k: "price_1RxrfGInt9j1ISHBW07XPARX",
  hobby_monthly_1m: "price_1RxrfgInt9j1ISHB9VRQWrFj",
  hobby_monthly_2m: "price_1Rxrg7Int9j1ISHBJL4eS4CG",
  hobby_monthly_5m: "price_1RxrgOInt9j1ISHBWbYz0kFH",
  hobby_monthly_10m: "price_1RxrgjInt9j1ISHBYxbZF3t7",

  // Hobby Yearly (Test)
  hobby_yearly_10k: "price_1RxsJzInt9j1ISHBEmDZurno",
  hobby_yearly_100k: "price_1RxsJzInt9j1ISHBPWDBR4xd",
  hobby_yearly_250k: "price_1RxsJzInt9j1ISHBsTq5ZO8S",
  hobby_yearly_500k: "price_1RxsJzInt9j1ISHB9JSkWfQi",
  hobby_yearly_1m: "price_1RxsJzInt9j1ISHBqrnyO8da",
  hobby_yearly_2m: "price_1RxsJzInt9j1ISHBmzdWoftc",
  hobby_yearly_5m: "price_1RxsJzInt9j1ISHBhEMU1t0n",
  hobby_yearly_10m: "price_1RxsJzInt9j1ISHBGJkkXOu1",

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
  // Hobby Monthly (Production)
  hobby_monthly_10k: "price_1S0HlJRFlE5uDVLgksbtaPlC",
  hobby_monthly_100k: "price_1S0HlJRFlE5uDVLgnMbDaduA",
  hobby_monthly_250k: "price_1S0HlJRFlE5uDVLgRSEcLH50",
  hobby_monthly_500k: "price_1S0HlJRFlE5uDVLgAHQK9OFM",
  hobby_monthly_1m: "price_1S0HlJRFlE5uDVLgsMU0sc1Y",
  hobby_monthly_2m: "price_1S0HlJRFlE5uDVLg8f1JO1JZ",
  hobby_monthly_5m: "price_1S0HlIRFlE5uDVLgT2NTEtwY",
  hobby_monthly_10m: "price_1S0HlIRFlE5uDVLg2zir22Ph",

  // Hobby Yearly (Production)
  hobby_yearly_10k: "price_1S0HlFRFlE5uDVLgWTHXftoc",
  hobby_yearly_100k: "price_1S0HlFRFlE5uDVLgiyk3N5qg",
  hobby_yearly_250k: "price_1S0HlFRFlE5uDVLgbsjtN0D0",
  hobby_yearly_500k: "price_1S0HlFRFlE5uDVLg9WZPMLNy",
  hobby_yearly_1m: "price_1S0HlFRFlE5uDVLgW5M6XDuC",
  hobby_yearly_2m: "price_1S0HlFRFlE5uDVLgtLV04H9i",
  hobby_yearly_5m: "price_1S0HlFRFlE5uDVLg6IR7GH6E",
  hobby_yearly_10m: "price_1S0HlFRFlE5uDVLgfwlkH2r8",

  // Professional Monthly (Production)
  professional_monthly_10k: "price_1S0HlHRFlE5uDVLg03oHJ1vQ",
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
    const [tier, period, events] = key.split("_") as [string, string, string];
    acc[priceId] = {
      tier: tier as "hobby" | "professional",
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
  hobby: {
    monthly: [9, 19, 29, 44, 62, 85, 119, 159, "Custom"],
    yearly: [90, 190, 290, 440, 620, 850, 1190, 1590, "Custom"],
  },
  professional: {
    monthly: [14, 29, 46, 69, 99, 129, 189, 229, "Custom"],
    yearly: [140, 290, 450, 690, 990, 1290, 1890, 2290, "Custom"],
  },
};

// Configuration des limites par plan
export const PLAN_LIMITS = {
  free: {
    pageviews: 10000,
    websites: 2,
    retention: "30 days",
    goals: 0,
    customEvents: 0,
  },
  trial: {
    pageviews: 10000,
    websites: 2,
    retention: "3 years",
    goals: 1,
    customEvents: 10,
  },
  hobby: {
    "10k": {
      pageviews: 10000,
      websites: 2,
      retention: "3 years",
      goals: 1,
      customEvents: 10,
    },
    "100k": {
      pageviews: 100000,
      websites: 2,
      retention: "3 years",
      goals: 1,
      customEvents: 10,
    },
    "250k": {
      pageviews: 250000,
      websites: 2,
      retention: "3 years",
      goals: 1,
      customEvents: 10,
    },
    "500k": {
      pageviews: 500000,
      websites: 2,
      retention: "3 years",
      goals: 1,
      customEvents: 10,
    },
    "1m": {
      pageviews: 1000000,
      websites: 2,
      retention: "3 years",
      goals: 1,
      customEvents: 10,
    },
    "2m": {
      pageviews: 2000000,
      websites: 2,
      retention: "3 years",
      goals: 1,
      customEvents: 10,
    },
    "5m": {
      pageviews: 5000000,
      websites: 2,
      retention: "3 years",
      goals: 1,
      customEvents: 10,
    },
    "10m": {
      pageviews: 10000000,
      websites: 2,
      retention: "3 years",
      goals: 1,
      customEvents: 10,
    },
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
      tier: "hobby",
      events: "10k",
      period: "monthly",
    }
  );
}
