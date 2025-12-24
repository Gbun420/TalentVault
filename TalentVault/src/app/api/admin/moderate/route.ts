import { NextResponse } from "next/server";
import { getDbAdmin } from "@/lib/firebase-admin";
import { getDecodedClaims } from "@/lib/api-auth";

type Action = "flag" | "unflag" | "hide" | "unhide";

export async function POST(request: Request) {
  try {
    const dbAdmin = getDbAdmin();
    const decodedClaims = await getDecodedClaims(request);
    if (!decodedClaims) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const profileDoc = await dbAdmin.collection("profiles").doc(decodedClaims.uid).get();
    const profile = profileDoc.data();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    const body = await request.json();
    const jobseekerId = body?.jobseekerId as string | undefined;
    const action = body?.action as Action | undefined;
    if (!jobseekerId || !action) {
      return NextResponse.json({ error: "jobseekerId and action required" }, { status: 400 });
    }

    switch (action) {
      case "flag": {
        await dbAdmin.collection("moderation_flags").add({
          subject_type: "jobseeker_profile",
          subject_id: jobseekerId,
          raised_by: decodedClaims.uid,
          status: "pending",
          reason: "Flagged by admin UI",
          created_at: new Date().toISOString(),
        });
        await dbAdmin.collection("jobseeker_profiles").doc(jobseekerId).update({
          moderation_status: "pending",
        });
        return NextResponse.json({ moderation_status: "pending" });
      }
      case "unflag": {
        const flagsQuery = await dbAdmin
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

        await dbAdmin.collection("jobseeker_profiles").doc(jobseekerId).update({
          moderation_status: "approved",
        });
        return NextResponse.json({ moderation_status: "approved" });
      }
      case "hide": {
        await dbAdmin
          .collection("jobseeker_profiles")
          .doc(jobseekerId)
          .update({ visibility: "hidden", moderation_status: "suspended" });
        await dbAdmin.collection("moderation_flags").add({
          subject_type: "jobseeker_profile",
          subject_id: jobseekerId,
          raised_by: decodedClaims.uid,
          status: "suspended",
          reason: "Hidden/suspended by admin",
          created_at: new Date().toISOString(),
        });
        return NextResponse.json({ moderation_status: "suspended", visibility: "hidden" });
      }
      case "unhide": {
        await dbAdmin.collection("jobseeker_profiles").doc(jobseekerId).update({
          visibility: "public",
          moderation_status: "approved",
        });

        const flagsQuery = await dbAdmin
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

        return NextResponse.json({ moderation_status: "approved", visibility: "public" });
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
