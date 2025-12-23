import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { getDbAdmin } from "@/lib/firebase-admin";
import Stripe from "stripe";

function mapStatus(status: Stripe.Subscription.Status) {
  if (status === "active") return "active";
  if (status === "past_due") return "past_due";
  if (status === "canceled") return "canceled";
  return "incomplete";
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const dbAdmin = getDbAdmin();
  const paymentType = session.metadata?.payment_type;
  if (paymentType === "unlock") {
    const employerId = session.metadata?.employer_id as string | undefined;
    const jobseekerId = session.metadata?.jobseeker_id as string | undefined;
    if (!employerId || !jobseekerId) return;
    const amount = session.amount_total ?? session.amount_subtotal ?? 0;
    const currency = session.currency ?? "eur";

    // Find and update the payment record
    const paymentsQuery = await dbAdmin
      .collection("payments")
      .where("stripe_checkout_session_id", "==", session.id)
      .limit(1)
      .get();

    if (!paymentsQuery.empty) {
      await paymentsQuery.docs[0].ref.update({
        status: "succeeded",
        amount_cents: amount,
        currency,
        stripe_payment_intent_id: session.payment_intent?.toString() || null,
        stripe_checkout_session_id: session.id,
        updated_at: new Date().toISOString(),
      });
    }

    await dbAdmin.collection("unlocked_contacts").add({
      employer_id: employerId,
      jobseeker_id: jobseekerId,
      created_at: new Date().toISOString(),
    });
    return;
  }

  if (paymentType === "subscription") {
    const employerId = session.metadata?.employer_id as string | undefined;
    const planCode = session.metadata?.plan_code as string | undefined;
    if (!employerId || !planCode) return;
    const amount = session.amount_total ?? session.amount_subtotal ?? 0;
    const currency = session.currency ?? "eur";
    
    // Find and update the payment record
    const paymentsQuery = await dbAdmin
      .collection("payments")
      .where("stripe_checkout_session_id", "==", session.id)
      .limit(1)
      .get();

    if (!paymentsQuery.empty) {
      await paymentsQuery.docs[0].ref.update({
        status: "succeeded",
        amount_cents: amount,
        currency,
        stripe_payment_intent_id: session.payment_intent?.toString() || null,
        stripe_checkout_session_id: session.id,
        updated_at: new Date().toISOString(),
      });
    }

    await dbAdmin.collection("employer_subscriptions").add({
      employer_id: employerId,
      plan_code: planCode,
      stripe_customer_id: session.customer?.toString() || null,
      stripe_subscription_id: (session.subscription as string) || null,
      status: "active",
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });
  }
}

async function handleSubscriptionEvent(subscription: Stripe.Subscription) {
  const dbAdmin = getDbAdmin();
  const employerId = subscription.metadata?.employer_id as string | undefined;
  const planCode = subscription.metadata?.plan_code as string | undefined;
  if (!employerId || !planCode) return;
  const sub = subscription as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
    cancel_at?: number;
    canceled_at?: number;
  };
  
  // Find existing subscription or create new one
  const existingSubQuery = await dbAdmin
    .collection("employer_subscriptions")
    .where("employer_id", "==", employerId)
    .where("stripe_subscription_id", "==", subscription.id)
    .limit(1)
    .get();

  const subscriptionData = {
    employer_id: employerId,
    plan_code: planCode,
    stripe_customer_id: subscription.customer?.toString() || null,
    stripe_subscription_id: subscription.id,
    status: mapStatus(subscription.status),
    current_period_start: sub.current_period_start
      ? new Date(sub.current_period_start * 1000).toISOString()
      : null,
    current_period_end: sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null,
    cancel_at: sub.cancel_at ? new Date(sub.cancel_at * 1000).toISOString() : null,
    canceled_at: sub.canceled_at
      ? new Date(sub.canceled_at * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  };

  if (existingSubQuery.empty) {
    // Create new subscription
    await dbAdmin.collection("employer_subscriptions").add({
      ...subscriptionData,
      created_at: new Date().toISOString(),
    });
  } else {
    // Update existing subscription
    await existingSubQuery.docs[0].ref.update(subscriptionData);
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature || !env.stripeWebhookSecret) { // Corrected env var name
    return NextResponse.json({ error: "Missing webhook secret" }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, env.stripeWebhookSecret); // Use getStripe() and corrected env var name
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook signature error";
    console.error("Stripe webhook error", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionEvent(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook processing failed";
    console.error("Stripe webhook handler error", message);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
