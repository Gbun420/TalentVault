// TalentVault/src/lib/firebase-admin.ts
import * as admin from "firebase-admin";
import { env } from "@/lib/env";

let cachedApp: admin.app.App | null = null;

const getFirebaseAdminApp = () => {
  if (cachedApp) return cachedApp;

  if (!admin.apps.length) {
    if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
      throw new Error(
        "Missing required Firebase Admin SDK environment variables. Please check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
      );
    }

    const serviceAccount = {
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  }

  cachedApp = admin.app();
  return cachedApp;
};

export const getAuthAdmin = () => getFirebaseAdminApp().auth();
export const getDbAdmin = () => getFirebaseAdminApp().firestore();
export const getStorageAdmin = () => getFirebaseAdminApp().storage();
