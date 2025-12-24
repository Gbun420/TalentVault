import { NextResponse } from "next/server";
import { getDbAdmin } from "@/lib/firebase-admin";
import { getDecodedClaims } from "@/lib/api-auth";

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
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    const body = await request.json();
    const jobseekerId = body?.jobseekerId as string | undefined;
    if (!jobseekerId) {
      return NextResponse.json({ error: "jobseekerId required" }, { status: 400 });
    }

    const existingQuery = await dbAdmin
      .collection("unlocked_contacts")
      .where("employer_id", "==", decodedClaims.uid)
      .where("jobseeker_id", "==", jobseekerId)
      .limit(1)
      .get();

    if (!existingQuery.empty) {
      return NextResponse.json({ ok: true, alreadyUnlocked: true });
    }

    if (profile.role !== "admin") {
      const subscriptionQuery = await dbAdmin
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
        return NextResponse.json(
          { error: "No active subscription. Please purchase to unlock." },
          { status: 402 }
        );
      }

      if (subscription.plan_code === "limited") {
        const planDoc = await dbAdmin.collection("subscription_plans").doc("limited").get();
        const plan = planDoc.exists ? planDoc.data() : null;
        const unlockLimit = plan?.unlocks_included ?? 0;

        const start = subscription.current_period_start
          ? new Date(subscription.current_period_start)
          : new Date(new Date().setMonth(new Date().getMonth() - 1));
        const end = subscription.current_period_end ? new Date(subscription.current_period_end) : new Date();

        const unlocksQuery = await dbAdmin
          .collection("unlocked_contacts")
          .where("employer_id", "==", decodedClaims.uid)
          .where("created_at", ">=", start.toISOString())
          .where("created_at", "<=", end.toISOString())
          .get();

        if (unlockLimit > 0 && unlocksQuery.size >= unlockLimit) {
          return NextResponse.json(
            { error: "Unlock limit reached for this billing period." },
            { status: 402 }
          );
        }
      }
    }

    await dbAdmin.collection("unlocked_contacts").add({
      employer_id: decodedClaims.uid,
      jobseeker_id: jobseekerId,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
