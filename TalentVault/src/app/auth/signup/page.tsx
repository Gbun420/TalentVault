"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase"; // Import auth and db from firebase.ts
import { AppRole } from "@/lib/auth-constants";
import { env } from "@/lib/env"; // Import the env object
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // For storing roles in Firestore

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getErrorMessage = (err: unknown) =>
    err instanceof Error ? err.message : "Something went wrong";

  useEffect(() => {
    // E2E Bypass: Immediately redirect to dashboard
    if (process.env.NEXT_PUBLIC_E2E_AUTH_BYPASS === "true") {
      router.replace("/jobseeker"); // Redirect to a default authenticated route
      return; // Prevent further execution in E2E mode
    }
  }, [router]); // Dependency array includes router

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const full_name = String(formData.get("full_name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const role = (formData.get("role") as AppRole) || "jobseeker";
    setError(null);
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        // Send email verification
        await sendEmailVerification(user, {
          url: `${env.siteUrl}/auth/callback?role=${encodeURIComponent(role)}&full_name=${encodeURIComponent(full_name)}`,
          handleCodeInApp: true, // Required for custom email action handlers
        });

        // Store user profile in Firestore
        await setDoc(doc(db, "profiles", user.uid), {
          full_name: full_name,
          email: user.email,
          role: role,
          createdAt: new Date().toISOString(),
        });

        router.push("/auth/verify-email-message"); // Inform user to check email
      }
    } catch (firebaseError: unknown) {
      setError(getErrorMessage(firebaseError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="card w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Create account</h1>
          <p className="text-sm text-slate-600">
            Choose whether you are hiring or publishing your Profile.
          </p>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-700">Full name</label>
            <input
              name="full_name"
              required
              className="input mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              name="email"
              type="email"
              required
              className="input mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              name="password"
              type="password"
              minLength={6}
              required
              className="input mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Account type</label>
            <select
              name="role"
              defaultValue="jobseeker"
              className="input mt-1"
            >
              <option value="jobseeker">Jobseeker</option>
              <option value="employer">Employer</option>
            </select>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-slate-600">
          Already have an account?{" "}
          <Link className="text-blue-700 hover:underline" href="/auth/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
