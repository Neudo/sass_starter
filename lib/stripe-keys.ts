// Configuration des clés Stripe selon l'environnement

const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_NODE_ENV === 'developpement';

// Clés Stripe - utilisées côté serveur uniquement
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

// Clé publique Stripe - peut être utilisée côté client
export const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '';

// Webhook secret
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// Helper pour vérifier si on est en mode test
export const isStripeTestMode = () => {
  return STRIPE_PUBLIC_KEY.includes('_test_') || isDevelopment;
};

// Products IDs Stripe (si vous utilisez des product IDs au lieu des price IDs)
const STRIPE_PRODUCTS_TEST = {
  hobby: 'prod_test_hobby',
  professional: 'prod_test_professional',
};

const STRIPE_PRODUCTS_PROD = {
  hobby: 'prod_live_hobby', // TODO: Remplacer avec le vrai product ID de production
  professional: 'prod_live_professional', // TODO: Remplacer avec le vrai product ID de production
};

export const STRIPE_PRODUCTS = isDevelopment ? STRIPE_PRODUCTS_TEST : STRIPE_PRODUCTS_PROD;

// Configuration pour les webhooks
export const STRIPE_WEBHOOK_EVENTS = {
  CHECKOUT_COMPLETED: 'checkout.session.completed',
  PAYMENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_FAILED: 'payment_intent.payment_failed',
  SUBSCRIPTION_CREATED: 'customer.subscription.created',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
} as const;

// Helper pour obtenir l'URL de retour après paiement
export const getStripeReturnUrl = (success: boolean = true) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return success 
    ? `${baseUrl}/settings/billing?success=true`
    : `${baseUrl}/settings/billing?canceled=true`;
};

// Validation des variables d'environnement
export const validateStripeConfig = () => {
  const missingVars = [];
  
  if (!STRIPE_SECRET_KEY) missingVars.push('STRIPE_SECRET_KEY');
  if (!STRIPE_PUBLIC_KEY) missingVars.push('NEXT_PUBLIC_STRIPE_PUBLIC_KEY');
  if (!STRIPE_WEBHOOK_SECRET) missingVars.push('STRIPE_WEBHOOK_SECRET');
  
  if (missingVars.length > 0) {
    console.error(`❌ Missing Stripe environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  
  console.log(`✅ Stripe configured in ${isStripeTestMode() ? 'TEST' : 'LIVE'} mode`);
  return true;
};