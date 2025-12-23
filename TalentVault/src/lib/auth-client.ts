import { auth, db } from "./firebase"; // Import Firebase client-side auth and db
import { getDoc, doc } from "firebase/firestore"; // Import Firestore functions
import { User } from "firebase/auth"; // Import Firebase User type

export type AppRole = "jobseeker" | "employer" | "admin";

export type SessionProfile = {
  id: string;
  email: string;
  full_name: string;
  role: AppRole;
  emailVerified: boolean; // Add emailVerified as it's part of Firebase User
};

export async function getClientSessionProfile(): Promise<{
  userId: string | null;
  profile: SessionProfile | null;
}> {
  return new Promise((resolve) => {
    // Firebase onAuthStateChanged is asynchronous
    const unsubscribe = auth.onAuthStateChanged(async (user: User | null) => {
      unsubscribe(); // Unsubscribe after first call

      if (!user) {
        resolve({ userId: null, profile: null });
        return;
      }

      try {
        const profileDoc = await getDoc(doc(db, "profiles", user.uid));

        if (!profileDoc.exists()) {
          resolve({
            userId: user.uid,
            profile: null,
          });
          return;
        }

        const profileData = profileDoc.data();
        const profile: SessionProfile = {
          id: user.uid,
          email: user.email || "",
          full_name: profileData?.full_name || "",
          role: profileData?.role as AppRole,
          emailVerified: user.emailVerified,
        };
        resolve({ userId: user.uid, profile });
      } catch (error) {
        console.error("Error getting client session profile:", error);
        resolve({ userId: null, profile: null });
      }
    });
  });
}
