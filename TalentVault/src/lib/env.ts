type EnvKey = keyof NodeJS.ProcessEnv;

export const env = {
  // Firebase client-side
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // Optional
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, // Optional
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional

  // Firebase Admin (server-side)
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID!,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL!,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY!, // This will be a multi-line string

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || null,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || null,
  stripeUnlockPriceId: process.env.STRIPE_UNLOCK_PRICE_ID || null,
  stripeSubLimitedPriceId: process.env.STRIPE_SUB_LIMITED_PRICE_ID || null,
  stripeSubUnlimitedPriceId: process.env.STRIPE_SUB_UNLIMITED_PRICE_ID || null,

  // General
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