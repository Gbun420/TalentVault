export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRole: process.env.SUPABASE_SERVICE_ROLE_KEY,
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  siteUrl: process.env.SITE_URL || 'http://localhost:3000',
  unlockPriceEur: Number(process.env.UNLOCK_PRICE_EUR || '25'),
  boostPriceEur: Number(process.env.BOOST_PRICE_EUR || '15'),
};

export const requiredEnv = (...keys: (keyof typeof env)[]) => {
  keys.forEach((key) => {
    if (!env[key]) {
      throw new Error(`Missing required env var: ${key}`);
    }
  });
};
