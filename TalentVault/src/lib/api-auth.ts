import { cookies } from "next/headers";
import { getAuthAdmin } from "@/lib/firebase-admin";

export async function getDecodedClaims(request: Request) {
  const authAdmin = getAuthAdmin();
  const authHeader = request.headers.get("authorization") || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (match) {
    return authAdmin.verifyIdToken(match[1]);
  }

  const sessionCookie = (await cookies()).get("__session")?.value;
  if (!sessionCookie) {
    return null;
  }

  return authAdmin.verifySessionCookie(sessionCookie, true);
}
