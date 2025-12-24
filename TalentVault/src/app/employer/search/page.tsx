"use client";

import { useEffect, useState } from "react";
import { getClientSessionProfile } from "@/lib/auth-client";
import EmployerSearch from "@/components/employer-search";

export default function EmployerSearchPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const session = await getClientSessionProfile();
      if (!session.profile || !["employer", "admin"].includes(session.profile.role)) {
        setMessage("You must be signed in as an employer to access this page.");
        setLoading(false);
        return;
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div className="card p-6 text-sm text-slate-600">Loading employer search...</div>;
  }

  if (message) {
    return <div className="card p-6 text-sm text-slate-600">{message}</div>;
  }

  return <EmployerSearch />;
}
