"use client";

import { FormEvent, Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase"; // Import auth and db from firebase.ts
import { AppRole, roleHome } from "@/lib/auth-constants";
import { env } from "@/lib/env"; // Import the env object
import {
  signInWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // For fetching roles from Firestore

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const redirectTo = search.get("redirectTo") || "/";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [usePasswordless, setUsePasswordless] = useState(false);
  const [showMagicLinkSentMessage, setShowMagicLinkSentMessage] = useState(false);
  const [emailForSignIn, setEmailForSignIn] = useState("");

  const handleRedirect = async (userId: string) => {
    // Fetch role from Firestore
    const docRef = doc(db, "profiles", userId);
    const docSnap = await getDoc(docRef);

    let role: AppRole | undefined;
    if (docSnap.exists()) {
      role = docSnap.data().role as AppRole;
    }

    const fallback = redirectTo || (role ? roleHome[role] : "/");
    router.replace(role ? roleHome[role] : fallback);
  };

  useEffect(() => {
    // E2E Bypass: Immediately redirect to dashboard
    if (process.env.NEXT_PUBLIC_E2E_AUTH_BYPASS === "true") {
      router.replace("/jobseeker"); // Redirect to a default authenticated route
      return; // Prevent further execution in E2E mode
    }

    // Handle magic link sign-in on component mount
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem("emailForSignIn");
      if (!email) {
        // User opened the link on a different device or browser
        email = window.prompt("Please provide your email for confirmation");
      }
      if (email) {
        setLoading(true);
        signInWithEmailLink(auth, email, window.location.href)
          .then((result) => {
            window.localStorage.removeItem("emailForSignIn");
            if (result.user) {
              handleRedirect(result.user.uid);
            }
          })
          .catch((firebaseError: any) => {
            setError(firebaseError.message);
            setLoading(false);
          });
      }
    }
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    setError(null);
    setLoading(true);

    if (usePasswordless) {
      // Send magic link
      const actionCodeSettings = {
        url: `${env.siteUrl}/auth/callback`, // Firebase will append the oobCode
        handleCodeInApp: true,
      };
      sendSignInLinkToEmail(auth, email, actionCodeSettings)
        .then(() => {
          window.localStorage.setItem("emailForSignIn", email);
          setShowMagicLinkSentMessage(true);
        })
        .catch((firebaseError: any) => {
          setError(firebaseError.message);
        })
        .finally(() => {
          setLoading(false);
        });
      return;
    }

    // Regular password login
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        if (userCredential.user) {
          handleRedirect(userCredential.user.uid);
        }
      })
      .catch((firebaseError: any) => {
        setError(firebaseError.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="card w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Login</h1>
          <p className="text-sm text-slate-600">
            Access your TalentVault account.
          </p>
        </div>
        {showMagicLinkSentMessage ? (
          <p className="text-sm text-green-600 text-center mb-4">
            A magic link has been sent to your email. Please click it to sign in.
          </p>
        ) : null}
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              name="email"
              type="email"
              required
              className="input mt-1"
              defaultValue={emailForSignIn}
              onChange={(e) => setEmailForSignIn(e.target.value)}
              readOnly={loading}
            />
          </div>
          {!usePasswordless && (
            <div>
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input
                name="password"
                type="password"
                required
                className="input mt-1"
              />
            </div>
          )}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={() => setUsePasswordless(!usePasswordless)}
            className="text-sm text-blue-700 hover:underline w-full text-center"
          >
            {usePasswordless ? "Use password instead" : "Send magic link instead"}
          </button>
        </div>
        <p className="mt-4 text-sm text-center text-slate-600">
          New here?{" "}
          <Link className="text-blue-700 hover:underline" href="/auth/signup">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
