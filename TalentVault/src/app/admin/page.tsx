"use client";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Admin console</h1>
        <p className="text-sm text-slate-600">
          This deployment is a static Spark build. Admin metrics and moderation actions require server routes and
          are disabled.
        </p>
      </div>
      <div className="card p-6 text-sm text-slate-600">
        To enable admin features, deploy on a server-capable platform (or upgrade to Blaze and use Firebase
        Frameworks/Functions).
      </div>
    </div>
  );
}
