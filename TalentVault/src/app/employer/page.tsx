"use client";

import { useEffect, useState } from "react";
import { getClientSessionProfile } from "@/lib/auth-client";

export default function EmployerDashboard() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const load = async () => {
      const session = await getClientSessionProfile();
      if (!session.profile || !["employer", "admin"].includes(session.profile.role)) {
        setMessage("You must be signed in as an employer to access this page.");
        setLoading(false);
        return;
      }
      setFullName(session.profile.full_name || "");
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div className="card p-6 text-sm text-slate-600">Loading employer dashboard...</div>;
  }

  if (message) {
    return <div className="card p-6 text-sm text-slate-600">{message}</div>;
  }

  return (
    <div className="card p-8">
      <h1 className="text-2xl font-semibold text-slate-900">Employer dashboard</h1>
      <p className="mt-2 text-sm text-slate-600">
        Welcome, {fullName}. Browse and unlock local Profiles.
      </p>
      <ul className="mt-6 space-y-2 text-sm text-slate-700">
        <li>• Search Profile directory (public and employers-only visibility).</li>
        <li>• Unlock contact details after payment or subscription allowance.</li>
        <li>• Manage invoices and subscription status.</li>
      </ul>
      <div className="mt-6">
        <a
          href="/employer/search"
          className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-800"
        >
          Go to Profile search
        </a>
      </div>
    </div>
  );
}
