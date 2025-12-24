"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { env } from "@/lib/env";
import { getClientSessionProfile } from "@/lib/auth-client";
import AdminModerationBoard from "@/components/admin-moderation-board";

type Profile = {
  id: string;
  headline: string;
  visibility: string;
  moderation_status: string;
  skills: string[];
  years_experience: number | null;
  location: string | null;
  updated_at: string;
  profiles: { full_name: string | null } | null;
};

type AdminSummary = {
  profileCount: number;
  employerCount: number;
  unlockCount: number;
  profiles: Profile[];
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const apiBaseUrl = env.apiBaseUrl ? env.apiBaseUrl.replace(/\/$/, "") : "";

  const getErrorMessage = (err: unknown) =>
    err instanceof Error ? err.message : "Something went wrong";

  const requireToken = async () => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("You must be signed in.");
    }
    return user.getIdToken();
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const session = await getClientSessionProfile();
        if (!session.profile || session.profile.role !== "admin") {
          setError("Admins only.");
          setLoading(false);
          return;
        }
        if (!apiBaseUrl) {
          setError("API is not configured. Set NEXT_PUBLIC_API_BASE_URL.");
          setLoading(false);
          return;
        }
        const token = await requireToken();
        const res = await fetch(`${apiBaseUrl}/api/admin/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "Failed to load admin data.");
          setLoading(false);
          return;
        }
        setSummary(json as AdminSummary);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiBaseUrl]);

  if (loading) {
    return <div className="card p-6 text-sm text-slate-600">Loading admin console...</div>;
  }

  if (error) {
    return <div className="card p-6 text-sm text-slate-600">{error}</div>;
  }

  if (!summary) {
    return <div className="card p-6 text-sm text-slate-600">No admin data available.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Admin console</h1>
        <p className="text-sm text-slate-600">
          Moderate Profiles, flag abuse, and view basic directory metrics.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Metric label="Total Profiles" value={summary.profileCount} />
          <Metric label="Active employers" value={summary.employerCount} />
          <Metric label="Profile unlocks" value={summary.unlockCount} />
        </div>
      </div>

      <AdminModerationBoard profiles={summary.profiles} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
