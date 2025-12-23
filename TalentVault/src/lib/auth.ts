import { redirect } from "next/navigation";
import { authAdmin, dbAdmin } from "@/lib/firebase-admin"; // Import Firebase Admin
import { cookies } from "next/headers"; // For getting the ID token from cookies

export type AppRole = "jobseeker" | "employer" | "admin";

export const roleHome: Record<AppRole, string> = {
  jobseeker: "/jobseeker",
  employer: "/employer",
  admin: "/admin",
};

export type SessionProfile = {
  id: string;
  email: string;
  full_name: string;
  role: AppRole;
  emailVerified: boolean;
};

export async function getSessionProfile(): Promise<{
  userId: string | null;
  profile: SessionProfile | null;
}> {
  try {
    const idToken = cookies().get("firebase_id_token")?.value;

    if (!idToken) {
      return { userId: null, profile: null };
    }

    const decodedToken = await authAdmin.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const profileDoc = await dbAdmin.collection("profiles").doc(userId).get();

    if (!profileDoc.exists) {
      return { userId: userId, profile: null };
    }

    const profileData = profileDoc.data() as Omit<SessionProfile, 'id'>; // Cast to expected type
    const profile: SessionProfile = {
      id: userId,
      email: decodedToken.email || "",
      full_name: profileData.full_name,
      role: profileData.role,
      emailVerified: decodedToken.email_verified,
    };

    return { userId, profile };
  } catch (error) {
    console.error("Error getting session profile:", error);
    return { userId: null, profile: null };
  }
}

export async function requireRole(required: AppRole | AppRole[], redirectTo?: string) {
  const allowed = Array.isArray(required) ? required : [required];
  const { profile } = await getSessionProfile();
  if (!profile) {
    redirect(`/auth/login?redirectTo=${encodeURIComponent(redirectTo || "/")}`);
  }
  if (!allowed.includes(profile.role)) {
    redirect(roleHome[profile.role]);
  }
  return profile;
}
