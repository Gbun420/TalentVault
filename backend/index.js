const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const Stripe = require("stripe");

const app = express();
const port = process.env.PORT || 8080;

const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const corsOrigins = (process.env.CORS_ORIGIN || siteUrl)
  .split(/[,\\s]+/)
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins.length ? corsOrigins : false,
    credentials: true,
  })
);
app.options("*", cors({ origin: corsOrigins.length ? corsOrigins : false, credentials: true }));

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || null;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || null;

let stripe = null;
function getStripe() {
  if (!stripeSecretKey) {
    throw new Error("Stripe not configured");
  }
  if (!stripe) {
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-12-15.clover",
    });
  }
  return stripe;
}

function initFirebase() {
  if (admin.apps.length) return;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : null;

  if (clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId,
    });
  }
}

initFirebase();
const auth = admin.auth();
const db = admin.firestore();

async function requireAuth(req) {
  const header = req.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    const err = new Error("Not authenticated");
    err.status = 401;
    throw err;
  }
  const decoded = await auth.verifyIdToken(match[1]);
  return decoded;
}

async function getProfile(uid) {
  const profileDoc = await db.collection("profiles").doc(uid).get();
  return profileDoc.data() || null;
}

function mapStatus(status) {
  if (status === "active") return "active";
  if (status === "past_due") return "past_due";
  if (status === "canceled") return "canceled";
  return "incomplete";
}

async function handleCheckoutCompleted(session) {
  const paymentType = session.metadata?.payment_type;
  if (paymentType === "unlock") {
    const employerId = session.metadata?.employer_id;
    const jobseekerId = session.metadata?.jobseeker_id;
    if (!employerId || !jobseekerId) return;
    const amount = session.amount_total ?? session.amount_subtotal ?? 0;
    const currency = session.currency ?? "eur";

    const paymentsQuery = await db
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

    await db.collection("unlocked_contacts").add({
      employer_id: employerId,
      jobseeker_id: jobseekerId,
      created_at: new Date().toISOString(),
    });
    return;
  }

  if (paymentType === "subscription") {
    const employerId = session.metadata?.employer_id;
    const planCode = session.metadata?.plan_code;
    if (!employerId || !planCode) return;
    const amount = session.amount_total ?? session.amount_subtotal ?? 0;
    const currency = session.currency ?? "eur";

    const paymentsQuery = await db
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

    await db.collection("employer_subscriptions").add({
      employer_id: employerId,
      plan_code: planCode,
      stripe_customer_id: session.customer?.toString() || null,
      stripe_subscription_id: session.subscription?.toString() || null,
      status: "active",
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });
  }
}

async function handleSubscriptionEvent(subscription) {
  const employerId = subscription.metadata?.employer_id;
  const planCode = subscription.metadata?.plan_code;
  if (!employerId || !planCode) return;

  const existingSubQuery = await db
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
    current_period_start: subscription.current_period_start
      ? new Date(subscription.current_period_start * 1000).toISOString()
      : null,
    current_period_end: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null,
    cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  };

  if (existingSubQuery.empty) {
    await db.collection("employer_subscriptions").add({
      ...subscriptionData,
      created_at: new Date().toISOString(),
    });
  } else {
    await existingSubQuery.docs[0].ref.update(subscriptionData);
  }
}

app.get("/healthz", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  const signature = req.get("stripe-signature");
  if (!signature || !stripeWebhookSecret) {
    res.status(400).json({ error: "Missing webhook secret" });
    return;
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(req.body, signature, stripeWebhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook signature error";
    console.error("Stripe webhook error", message);
    res.status(400).json({ error: "Invalid signature" });
    return;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionEvent(event.data.object);
        break;
      default:
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook processing failed";
    console.error("Stripe webhook handler error", message);
    res.status(500).json({ error: "Webhook processing failed" });
    return;
  }

  res.status(200).json({ received: true });
});

app.use(express.json());

app.post("/api/checkout", async (req, res) => {
  try {
    const decodedClaims = await requireAuth(req);
    const profile = await getProfile(decodedClaims.uid);

    if (!profile || (profile.role !== "employer" && profile.role !== "admin")) {
      res.status(403).json({ error: "Only employers can pay" });
      return;
    }

    const body = req.body;
    const stripe = getStripe();

    if (body.mode === "unlock") {
      const priceId = process.env.STRIPE_UNLOCK_PRICE_ID;
      if (!priceId) {
        res.status(500).json({ error: "Unlock price not configured" });
        return;
      }
      if (!body.jobseekerId) {
        res.status(400).json({ error: "jobseekerId required" });
        return;
      }

      const existingQuery = await db
        .collection("unlocked_contacts")
        .where("employer_id", "==", decodedClaims.uid)
        .where("jobseeker_id", "==", body.jobseekerId)
        .limit(1)
        .get();

      if (!existingQuery.empty) {
        res.json({ alreadyUnlocked: true });
        return;
      }

      const price = await stripe.prices.retrieve(priceId);
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: decodedClaims.email ?? undefined,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${siteUrl}/employer/search?status=success`,
        cancel_url: `${siteUrl}/employer/search?status=cancelled`,
        metadata: {
          payment_type: "unlock",
          employer_id: decodedClaims.uid,
          jobseeker_id: body.jobseekerId,
        },
      });

      await db.collection("payments").add({
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

      res.json({ url: session.url });
      return;
    }

    if (body.mode === "subscription") {
      const priceId =
        body.subscriptionType === "limited"
          ? process.env.STRIPE_SUB_LIMITED_PRICE_ID
          : process.env.STRIPE_SUB_UNLIMITED_PRICE_ID;

      if (!priceId) {
        res.status(500).json({ error: "Subscription price not configured" });
        return;
      }

      const planCode = body.subscriptionType === "limited" ? "limited" : "unlimited";
      const price = await stripe.prices.retrieve(priceId);

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: decodedClaims.email ?? undefined,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${siteUrl}/employer/search?status=success`,
        cancel_url: `${siteUrl}/employer/search?status=cancelled`,
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

      await db.collection("payments").add({
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

      res.json({ url: session.url });
      return;
    }

    res.status(400).json({ error: "Invalid request" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    const status = err.status || 500;
    console.error(err);
    res.status(status).json({ error: message });
  }
});

app.post("/api/unlock", async (req, res) => {
  try {
    const decodedClaims = await requireAuth(req);
    const profile = await getProfile(decodedClaims.uid);

    if (!profile || (profile.role !== "employer" && profile.role !== "admin")) {
      res.status(403).json({ error: "Not allowed" });
      return;
    }

    const jobseekerId = req.body?.jobseekerId;
    if (!jobseekerId) {
      res.status(400).json({ error: "jobseekerId required" });
      return;
    }

    const existingQuery = await db
      .collection("unlocked_contacts")
      .where("employer_id", "==", decodedClaims.uid)
      .where("jobseeker_id", "==", jobseekerId)
      .limit(1)
      .get();

    if (!existingQuery.empty) {
      res.json({ ok: true, alreadyUnlocked: true });
      return;
    }

    if (profile.role !== "admin") {
      const subscriptionQuery = await db
        .collection("employer_subscriptions")
        .where("employer_id", "==", decodedClaims.uid)
        .orderBy("updated_at", "desc")
        .limit(1)
        .get();

      const subscription = subscriptionQuery.empty ? null : subscriptionQuery.docs[0].data();

      const hasActiveSub =
        subscription &&
        subscription.status === "active" &&
        (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date());

      if (!hasActiveSub) {
        res.status(402).json({ error: "No active subscription. Please purchase to unlock." });
        return;
      }

      if (subscription.plan_code === "limited") {
        const planDoc = await db.collection("subscription_plans").doc("limited").get();
        const plan = planDoc.exists ? planDoc.data() : null;
        const unlockLimit = plan?.unlocks_included ?? 0;

        const start = subscription.current_period_start
          ? new Date(subscription.current_period_start)
          : new Date(new Date().setMonth(new Date().getMonth() - 1));
        const end = subscription.current_period_end ? new Date(subscription.current_period_end) : new Date();

        const unlocksQuery = await db
          .collection("unlocked_contacts")
          .where("employer_id", "==", decodedClaims.uid)
          .where("created_at", ">=", start.toISOString())
          .where("created_at", "<=", end.toISOString())
          .get();

        if (unlockLimit > 0 && unlocksQuery.size >= unlockLimit) {
          res.status(402).json({ error: "Unlock limit reached for this billing period." });
          return;
        }
      }
    }

    await db.collection("unlocked_contacts").add({
      employer_id: decodedClaims.uid,
      jobseeker_id: jobseekerId,
      created_at: new Date().toISOString(),
    });

    res.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    const status = err.status || 500;
    res.status(status).json({ error: message });
  }
});

app.post("/api/admin/moderate", async (req, res) => {
  try {
    const decodedClaims = await requireAuth(req);
    const profile = await getProfile(decodedClaims.uid);

    if (!profile || profile.role !== "admin") {
      res.status(403).json({ error: "Admins only" });
      return;
    }

    const jobseekerId = req.body?.jobseekerId;
    const action = req.body?.action;
    if (!jobseekerId || !action) {
      res.status(400).json({ error: "jobseekerId and action required" });
      return;
    }

    switch (action) {
      case "flag": {
        await db.collection("moderation_flags").add({
          subject_type: "jobseeker_profile",
          subject_id: jobseekerId,
          raised_by: decodedClaims.uid,
          status: "pending",
          reason: "Flagged by admin UI",
          created_at: new Date().toISOString(),
        });
        await db.collection("jobseeker_profiles").doc(jobseekerId).update({ moderation_status: "pending" });
        res.json({ moderation_status: "pending" });
        return;
      }
      case "unflag": {
        const flagsQuery = await db
          .collection("moderation_flags")
          .where("subject_id", "==", jobseekerId)
          .where("subject_type", "==", "jobseeker_profile")
          .get();

        for (const doc of flagsQuery.docs) {
          await doc.ref.update({
            status: "approved",
            resolved_at: new Date().toISOString(),
          });
        }

        await db.collection("jobseeker_profiles").doc(jobseekerId).update({ moderation_status: "approved" });
        res.json({ moderation_status: "approved" });
        return;
      }
      case "hide": {
        await db
          .collection("jobseeker_profiles")
          .doc(jobseekerId)
          .update({ visibility: "hidden", moderation_status: "suspended" });
        await db.collection("moderation_flags").add({
          subject_type: "jobseeker_profile",
          subject_id: jobseekerId,
          raised_by: decodedClaims.uid,
          status: "suspended",
          reason: "Hidden/suspended by admin",
          created_at: new Date().toISOString(),
        });
        res.json({ moderation_status: "suspended", visibility: "hidden" });
        return;
      }
      case "unhide": {
        await db.collection("jobseeker_profiles").doc(jobseekerId).update({
          visibility: "public",
          moderation_status: "approved",
        });

        const flagsQuery = await db
          .collection("moderation_flags")
          .where("subject_id", "==", jobseekerId)
          .where("subject_type", "==", "jobseeker_profile")
          .get();

        for (const doc of flagsQuery.docs) {
          await doc.ref.update({
            status: "approved",
            resolved_at: new Date().toISOString(),
          });
        }

        res.json({ moderation_status: "approved", visibility: "public" });
        return;
      }
      default:
        res.status(400).json({ error: "Unknown action" });
        return;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    const status = err.status || 500;
    res.status(status).json({ error: message });
  }
});

app.get("/api/admin/summary", async (req, res) => {
  try {
    const decodedClaims = await requireAuth(req);
    const profile = await getProfile(decodedClaims.uid);

    if (!profile || profile.role !== "admin") {
      res.status(403).json({ error: "Admins only" });
      return;
    }

    const [profileSnapshot, employerSnapshot, unlockSnapshot, profilesSnapshot] = await Promise.all([
      db.collection("jobseeker_profiles").get(),
      db.collection("employers").get(),
      db.collection("unlocked_contacts").get(),
      db.collection("jobseeker_profiles").orderBy("updated_at", "desc").limit(50).get(),
    ]);

    const profileCount = profileSnapshot.size;
    const employerCount = employerSnapshot.size;
    const unlockCount = unlockSnapshot.size;

    const profiles = [];
    for (const doc of profilesSnapshot.docs) {
      const profileData = doc.data();
      const userDoc = await db.collection("profiles").doc(doc.id).get();
      const userData = userDoc.data();

      profiles.push({
        id: doc.id,
        headline: profileData.headline || "",
        visibility: profileData.visibility || "public",
        moderation_status: profileData.moderation_status || "approved",
        skills: profileData.skills || [],
        years_experience: profileData.years_experience || null,
        location: profileData.location || null,
        updated_at: profileData.updated_at || new Date().toISOString(),
        profiles: userData ? { full_name: userData.full_name } : null,
      });
    }

    res.json({ profileCount, employerCount, unlockCount, profiles });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    const status = err.status || 500;
    res.status(status).json({ error: message });
  }
});

app.listen(port, () => {
  console.log(`API server listening on ${port}`);
});
