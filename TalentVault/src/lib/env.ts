type EnvKey = keyof NodeJS.ProcessEnv;

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,

  stripeSecretKey: process.env.STRIPE_SECRET_KEY || null,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || null,

  stripeUnlockPriceId: process.env.STRIPE_UNLOCK_PRICE_ID || null,
  stripeSubLimitedPriceId: process.env.STRIPE_SUB_LIMITED_PRICE_ID || null,
  stripeSubUnlimitedPriceId:
    process.env.STRIPE_SUB_UNLIMITED_PRICE_ID || null,

  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "http://localhost:3000",
};

export function requireEnv(...keys: EnvKey[]) {
  for (const key of keys) {
    if (!process.env[key]) {
      throw new Error(`Missing required env var: ${key}`);
    }
  }
}