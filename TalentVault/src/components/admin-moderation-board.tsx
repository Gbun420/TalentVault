"use client";

import { useState } from "react";

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

type Props = {
  profiles: Profile[];
};

export default function AdminModerationBoard({ profiles }: Props) {
  const [items, setItems] = useState(profiles);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const actionsDisabled = true;

  const mutate = async (id: string, action: "flag" | "unflag" | "hide" | "unhide") => {
    if (actionsDisabled) {
      setError("Moderation actions are disabled in the Spark static build.");
      return;
    }
    setLoadingId(id);
    setError(null);
    const res = await fetch("/api/admin/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobseekerId: id, action }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Action failed");
      setLoadingId(null);
      return;
    }
    setItems((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              moderation_status: json.moderation_status ?? p.moderation_status,
              visibility: json.visibility ?? p.visibility,
            }
          : p
      )
    );
    setLoadingId(null);
  };

  return (
    <div className="card p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-900">Moderate Profiles</h2>
        <p className="text-sm text-slate-600">
          Flag, unflag, or hide Profiles that appear abusive or fake. Hidden Profiles are removed from the
          directory.
        </p>
      </div>
      {actionsDisabled ? (
        <p className="mt-2 text-xs text-amber-700">
          Moderation actions require server routes and are disabled on the Spark (static) deployment.
        </p>
      ) : null}
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {items.map((profile) => (
          <div key={profile.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  {profile.profiles?.full_name || "Unknown"}
                </p>
                <h3 className="text-lg font-semibold text-slate-900">{profile.headline}</h3>
                <p className="text-xs text-slate-600">Updated {new Date(profile.updated_at).toLocaleDateString()}</p>
              </div>
              <div className="flex flex-col items-end gap-1 text-xs font-semibold">
                <span className="badge">
                  Status: {profile.moderation_status}
                </span>
                <span className="badge">
                  Visibility: {profile.visibility}
                </span>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-700">
              {profile.skills?.slice(0, 6).map((s) => (
                <span key={s} className="badge">
                  {s}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-600">
              Experience: {profile.years_experience ?? "N/A"} yrs • Location: {profile.location || "Not specified"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
              <button
                onClick={() => mutate(profile.id, "flag")}
                disabled={actionsDisabled || loadingId === profile.id}
                className="btn btn-secondary text-xs"
              >
                Flag
              </button>
              <button
                onClick={() => mutate(profile.id, "unflag")}
                disabled={actionsDisabled || loadingId === profile.id}
                className="btn btn-secondary text-xs"
              >
                Unflag
              </button>
              <button
                onClick={() => mutate(profile.id, "hide")}
                disabled={actionsDisabled || loadingId === profile.id}
                className="btn btn-destructive text-xs"
              >
                Hide (suspend)
              </button>
              <button
                onClick={() => mutate(profile.id, "unhide")}
                disabled={actionsDisabled || loadingId === profile.id}
                className="btn btn-secondary text-xs"
              >
                Unhide
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
