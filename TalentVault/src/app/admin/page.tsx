import { requireRole } from "@/lib/auth";
import { dbAdmin } from "@/lib/firebase-admin";
import AdminModerationBoard from "@/components/admin-moderation-board";

export default async function AdminDashboard() {
  await requireRole("admin", "/admin");

  const [profileSnapshot, employerSnapshot, unlockSnapshot, profilesSnapshot] = await Promise.all([
    dbAdmin.collection("jobseeker_profiles").get(),
    dbAdmin.collection("employers").get(),
    dbAdmin.collection("unlocked_contacts").get(),
    dbAdmin.collection("jobseeker_profiles")
      .orderBy("updated_at", "desc")
      .limit(50)
      .get()
  ]);

  const profileCount = profileSnapshot.size;
  const employerCount = employerSnapshot.size;
  const unlockCount = unlockSnapshot.size;

  // Get profiles with user data
  const profiles = [];
  for (const doc of profilesSnapshot.docs) {
    const profileData = doc.data();
    const userDoc = await dbAdmin.collection("profiles").doc(doc.id).get();
    const userData = userDoc.data();
    
    profiles.push({
      id: doc.id,
      headline: profileData.headline || '',
      visibility: profileData.visibility || 'public',
      moderation_status: profileData.moderation_status || 'approved',
      skills: profileData.skills || [],
      years_experience: profileData.years_experience || null,
      location: profileData.location || null,
      updated_at: profileData.updated_at || new Date().toISOString(),
      profiles: userData ? { full_name: userData.full_name } : null
    });
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Admin console</h1>
        <p className="text-sm text-slate-600">
          Moderate Profiles, flag abuse, and view basic directory metrics.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Metric label="Total Profiles" value={profileCount} />
          <Metric label="Active employers" value={employerCount} />
          <Metric label="Profile unlocks" value={unlockCount} />
        </div>
      </div>

      <AdminModerationBoard profiles={profiles} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
