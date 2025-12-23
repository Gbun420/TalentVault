import { requireRole } from "@/lib/auth";
import { getDbAdmin } from "@/lib/firebase-admin";
import JobseekerProfileForm from "@/components/jobseeker-profile-form";

export const dynamic = "force-dynamic";

export default async function JobseekerDashboard() {
  const profile = await requireRole("jobseeker", "/jobseeker");
  const dbAdmin = getDbAdmin();

  const [jobseekerProfileDoc, contactDoc, experiencesSnapshot] = await Promise.all([
    dbAdmin.collection("jobseeker_profiles").doc(profile.id).get(),
    dbAdmin.collection("jobseeker_contacts").doc(profile.id).get(),
    dbAdmin.collection("work_experiences")
      .where("jobseeker_id", "==", profile.id)
      .orderBy("start_date", "desc")
      .get()
  ]);

  const jobseekerProfile = jobseekerProfileDoc.exists ? jobseekerProfileDoc.data() : null;
  const contact = contactDoc.exists ? contactDoc.data() : null;
  const experiences = experiencesSnapshot.docs.map(doc => ({
    id: doc.id,
    title: doc.data().title || '',
    company: doc.data().company || '',
    start_date: doc.data().start_date || '',
    end_date: doc.data().end_date || null,
    is_current: doc.data().is_current || false,
    location: doc.data().location || null,
    description: doc.data().description || null,
  }));

  return (
    <JobseekerProfileForm
      userId={profile.id}
      fullName={profile.full_name}
      initialProfile={jobseekerProfile ?? null}
      initialContact={contact ?? null}
      initialExperiences={experiences ?? []}
    />
  );
}
