import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { getDbAdmin } from "@/lib/firebase-admin";
import { getDecodedClaims } from "@/lib/api-auth";

type Body =
  | { mode: "unlock"; jobseekerId: string }
  | { mode: "subscription"; subscriptionType: "limited" | "unlimited" };

export async function POST(request: Request) {
  try {
    const dbAdmin = getDbAdmin();
    const decodedClaims = await getDecodedClaims(request);
    if (!decodedClaims) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const profileDoc = await dbAdmin.collection("profiles").doc(decodedClaims.uid).get();
    const profile = profileDoc.data();

    if (!profile || (profile.role !== "employer" && profile.role !== "admin")) {
      return NextResponse.json({ error: "Only employers can pay" }, { status: 403 });
    }

    const body = (await request.json()) as Body;
    const stripe = getStripe();

    if (body.mode === "unlock") {
      if (!env.stripeUnlockPriceId) {
        return NextResponse.json({ error: "Unlock price not configured" }, { status: 500 });
      }
      if (!body.jobseekerId) {
        return NextResponse.json({ error: "jobseekerId required" }, { status: 400 });
      }

      const existingQuery = await dbAdmin
        .collection("unlocked_contacts")
        .where("employer_id", "==", decodedClaims.uid)
        .where("jobseeker_id", "==", body.jobseekerId)
        .limit(1)
        .get();

      if (!existingQuery.empty) {
        return NextResponse.json({ alreadyUnlocked: true });
      }

      const price = await stripe.prices.retrieve(env.stripeUnlockPriceId);
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: decodedClaims.email ?? undefined,
        line_items: [{ price: env.stripeUnlockPriceId, quantity: 1 }],
        success_url: `${env.siteUrl}/employer/search?status=success`,
        cancel_url: `${env.siteUrl}/employer/search?status=cancelled`,
        metadata: {
          payment_type: "unlock",
          employer_id: decodedClaims.uid,
          jobseeker_id: body.jobseekerId,
        },
      });

      await dbAdmin.collection("payments").add({
        user_id: decodedClaims.uid,
        jobseeker_id: body.jobseekerId,
        amount_cents: price.unit_amount ?? 0,
        currency: price.currency ?? "eur",
        payment_type: "unlock",
        status: "pending",
        stripe_checkout_session_id: session.id,
        metadata: { mode: "unlock" },
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({ url: session.url });
    }

    if (body.mode === "subscription") {
      const priceId =
        body.subscriptionType === "limited"
          ? env.stripeSubLimitedPriceId
          : env.stripeSubUnlimitedPriceId;

      if (!priceId) {
        return NextResponse.json({ error: "Subscription price not configured" }, { status: 500 });
      }

      const planCode = body.subscriptionType === "limited" ? "limited" : "unlimited";
      const price = await stripe.prices.retrieve(priceId);

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: decodedClaims.email ?? undefined,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${env.siteUrl}/employer/search?status=success`,
        cancel_url: `${env.siteUrl}/employer/search?status=cancelled`,
        metadata: {
          payment_type: "subscription",
          employer_id: decodedClaims.uid,
          plan_code: planCode,
        },
        subscription_data: {
          metadata: {
            employer_id: decodedClaims.uid,
            plan_code: planCode,
          },
        },
      });

      await dbAdmin.collection("payments").add({
        user_id: decodedClaims.uid,
        jobseeker_id: null,
        amount_cents: price.unit_amount ?? 0,
        currency: price.currency ?? "eur",
        payment_type: "subscription",
        status: "pending",
        stripe_checkout_session_id: session.id,
        metadata: { plan_code: planCode },
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({ url: session.url });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
