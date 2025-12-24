"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={<div className="card p-6 text-sm text-slate-600">Redirecting you back to login...</div>}
    >
      <AuthCallbackHandler />
    </Suspense>
  );
}

function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectUrl = useMemo(() => {
    const mode = searchParams.get("mode");
    const oobCode = searchParams.get("oobCode");
    if (!mode || !oobCode) {
      return "/auth/login?message=Invalid verification link.";
    }
    const params = new URLSearchParams(searchParams.toString());
    return `/auth/login?${params.toString()}`;
  }, [searchParams]);

  useEffect(() => {
    router.replace(redirectUrl);
  }, [redirectUrl, router]);

  return <div className="card p-6 text-sm text-slate-600">Redirecting you back to login...</div>;
}
