import { redirect } from "next/navigation";
import { AppRole, roleHome } from "@/lib/auth-constants";
import { env } from "@/lib/env";
import { authAdmin, dbAdmin } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export default async function AuthCallbackPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const mode = searchParams.mode as string;
  const oobCode = searchParams.oobCode as string; // Out-of-band code for Firebase Auth actions
  const continueUrl = searchParams.continueUrl as string || "/"; // Where to redirect after action
  const roleFromSignup = searchParams.role as AppRole || "jobseeker"; // Role passed during signup
  const fullNameFromSignup = searchParams.full_name as string || ""; // Full name passed during signup

  if (!oobCode || !mode) {
    redirect("/auth/login?message=Invalid verification link.");
  }

  try {
    switch (mode) {
      case "verifyEmail": {
        // Verify email and sign in the user
        const userRecord = await authAdmin.verifyIdToken(oobCode);
        
        if (userRecord) {
          // Ensure profile exists in Firestore (from signup) or create it if not
          const profileRef = dbAdmin.collection("profiles").doc(userRecord.uid);
          const profileSnap = await profileRef.get();

          if (!profileSnap.exists) {
            await profileRef.set({
              full_name: fullNameFromSignup || userRecord.displayName || userRecord.email,
              email: userRecord.email,
              role: roleFromSignup,
              createdAt: new Date().toISOString(),
              emailVerified: true,
            });
          } else {
            // Update emailVerified status if profile already exists
            await profileRef.update({ emailVerified: true });
          }

          // Create a session cookie for the user
          const sessionCookie = await authAdmin.createSessionCookie(oobCode, { expiresIn: 60 * 60 * 24 * 5 * 1000 }); // 5 days
          
          // Set the session cookie
          const cookieStore = await cookies();
          cookieStore.set('__session', sessionCookie, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 5, // 5 days
            path: '/',
          });
          
          // Redirect to role-specific homepage
          redirect(roleHome[roleFromSignup] || "/");
        }
        break;
      }
      case "signIn": {
        // This is primarily handled client-side in login/page.tsx's useEffect.
        // If the user lands here directly, it means the client-side redirect didn't happen for some reason.
        // We can simply try to redirect them to the client-side login to complete the flow.
        redirect("/auth/login?message=Login link received. Redirecting to complete sign-in...");
        break;
      }
      // Add other modes like 'resetPassword' if needed
      default: {
        redirect("/auth/login?message=Unsupported action.");
      }
    }
  } catch (error: any) {
    console.error("Firebase Auth Callback Error:", error);
    // Handle error - typically redirect to login with an error message
    redirect(`/auth/login?message=${encodeURIComponent(error.message || "Authentication failed.")}`);
  }
}
