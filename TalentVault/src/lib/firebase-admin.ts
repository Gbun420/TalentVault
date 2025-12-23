// TalentVault/src/lib/firebase-admin.ts
import * as admin from "firebase-admin";
import { env } from "@/lib/env";

// Check if a Firebase app has already been initialized
// This prevents multiple initializations in Next.js development mode
if (!admin.apps.length) {
  // Ensure required environment variables are present before initialization
  // We use requireEnv here because these are critical for Admin SDK
  env.requireEnv(
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY"
  );

  const serviceAccount = {
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Handle multi-line private key
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Optional: Add other configurations like databaseURL or storageBucket
    // databaseURL: `https://${env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // Use public bucket for admin
  });
}

const authAdmin = admin.auth();
const dbAdmin = admin.firestore();
const storageAdmin = admin.storage();

export { authAdmin, dbAdmin, storageAdmin };