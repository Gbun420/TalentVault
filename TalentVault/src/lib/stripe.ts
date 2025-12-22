import Stripe from "stripe";
import { env } from "@/lib/env";

let stripe: Stripe | null = null;

export function getStripe() {
  if (!env.stripeSecretKey) {
    throw new Error("Stripe not configured");
  }

  if (!stripe) {
    stripe = new Stripe(env.stripeSecretKey, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    });
  }

  return stripe;
}