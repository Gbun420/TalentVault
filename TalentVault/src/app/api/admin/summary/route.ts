import { NextResponse } from "next/server";
import { getDbAdmin } from "@/lib/firebase-admin";
import { getDecodedClaims } from "@/lib/api-auth";

export async function GET(request: Request) {
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

    const [profileSnapshot, employerSnapshot, unlockSnapshot, profilesSnapshot] = await Promise.all([
      dbAdmin.collection("jobseeker_profiles").get(),
      dbAdmin.collection("employers").get(),
      dbAdmin.collection("unlocked_contacts").get(),
      dbAdmin.collection("jobseeker_profiles").orderBy("updated_at", "desc").limit(50).get(),
    ]);

    const profiles = [];
    for (const doc of profilesSnapshot.docs) {
      const profileData = doc.data();
      const userDoc = await dbAdmin.collection("profiles").doc(doc.id).get();
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

    return NextResponse.json({
      profileCount: profileSnapshot.size,
      employerCount: employerSnapshot.size,
      unlockCount: unlockSnapshot.size,
      profiles,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
