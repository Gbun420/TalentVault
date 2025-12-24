"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getClientSessionProfile } from "@/lib/auth-client";
import JobseekerProfileForm from "@/components/jobseeker-profile-form";

type ProfileRow = {
  headline?: string | null;
  summary?: string | null;
  skills?: string[] | null;
  preferred_roles?: string[] | null;
  years_experience?: number | null;
  availability?: string | null;
  location?: string | null;
  visibility?: "public" | "employers_only" | "hidden" | null;
  work_permit_status?: string | null;
  salary_expectation_eur?: number | null;
};

type ContactRow = {
  contact_email?: string | null;
  phone?: string | null;
  profile_storage_path?: string | null;
  profile_public_url?: string | null;
};

type ExperienceRow = {
  id?: string;
  title: string;
  company: string;
  start_date: string;
  end_date?: string | null;
  is_current?: boolean | null;
  location?: string | null;
  description?: string | null;
};

export default function JobseekerDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [contact, setContact] = useState<ContactRow | null>(null);
  const [experiences, setExperiences] = useState<ExperienceRow[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const session = await getClientSessionProfile();
        if (!session.profile || session.profile.role !== "jobseeker") {
          setError("You must be signed in as a jobseeker to access this page.");
          setLoading(false);
          return;
        }
        if (!session.userId) {
          setError("Missing user session.");
          setLoading(false);
          return;
        }
        const uid = session.userId;
        setUserId(uid);
        setFullName(session.profile.full_name || "");

        const [jobseekerProfileDoc, contactDoc, experiencesSnapshot] = await Promise.all([
          getDoc(doc(db, "jobseeker_profiles", uid)),
          getDoc(doc(db, "jobseeker_contacts", uid)),
          getDocs(
            query(
              collection(db, "work_experiences"),
              where("jobseeker_id", "==", uid),
              orderBy("start_date", "desc")
            )
          ),
        ]);

        setProfile(jobseekerProfileDoc.exists() ? (jobseekerProfileDoc.data() as ProfileRow) : null);
        setContact(contactDoc.exists() ? (contactDoc.data() as ContactRow) : null);
        setExperiences(
          experiencesSnapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            title: docSnap.data().title || "",
            company: docSnap.data().company || "",
            start_date: docSnap.data().start_date || "",
            end_date: docSnap.data().end_date || null,
            is_current: docSnap.data().is_current || false,
            location: docSnap.data().location || null,
            description: docSnap.data().description || null,
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="card p-6 text-sm text-slate-600">Loading jobseeker profile...</div>;
  }

  if (error || !userId) {
    return (
      <div className="card p-6 text-sm text-slate-600">
        {error || "You must be signed in to view this page."}
      </div>
    );
  }

  return (
    <JobseekerProfileForm
      userId={userId}
      fullName={fullName}
      initialProfile={profile}
      initialContact={contact}
      initialExperiences={experiences}
    />
  );
}
