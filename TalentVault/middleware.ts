import { NextResponse, NextRequest } from "next/server";
import { authAdmin, dbAdmin } from "@/lib/firebase-admin";
import { AppRole, roleHome } from "@/lib/auth-constants";

const jobseekerPrefixes = ["/jobseeker"];
const employerPrefixes = ["/employer"];
const adminPrefixes = ["/admin"];

const isProtected = (path: string, prefixes: string[]) =>
  prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const path = req.nextUrl.pathname;

    const isE2E = process.env.NEXT_PUBLIC_E2E_AUTH_BYPASS === "true"; // Define isE2E flag

    // E2E Bypass: If in E2E mode and path is protected, allow to continue without auth checks
    if (isE2E) {
      if (
        isProtected(path, adminPrefixes) ||
        isProtected(path, employerPrefixes) ||
        isProtected(path, jobseekerPrefixes)
      ) {
        return res; // Allow to continue
      }
    }

    // Add CSP headers to allow Next.js inline scripts
    res.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.firebaseio.com https://vercel.live;"
    );

    // Skip static and public assets
    if (path.startsWith("/_next") || path.startsWith("/api/webhooks") || path.includes(".")) {
      return res;
    }

    // Get the session token from cookies
    const sessionCookie = req.cookies.get('__session')?.value;

    const requireRole = async (allowed: AppRole[]) => {
      if (!sessionCookie) {
        return NextResponse.redirect(new URL(`/auth/login?redirectTo=${encodeURIComponent(path)}`, req.url));
      }

      try {
        // Verify the session cookie
        const decodedClaims = await authAdmin.verifySessionCookie(sessionCookie, true);
        
        // Get user profile from Firestore
        const profileDoc = await dbAdmin.collection('profiles').doc(decodedClaims.uid).get();
        const profile = profileDoc.data();
        const role = profile?.role as AppRole | undefined;

        if (!role || !allowed.includes(role)) {
          const userHome = role ? roleHome[role] : "/auth/login";
          if (path !== userHome) {
            return NextResponse.redirect(new URL(userHome, req.url));
          } else {
            return NextResponse.redirect(new URL("/auth/login", req.url));
          }
        }
        return res;
      } catch (error) {
        console.error("Firebase auth error:", error);
        return NextResponse.redirect(new URL(`/auth/login?redirectTo=${encodeURIComponent(path)}`, req.url));
      }
    };

    if (isProtected(path, adminPrefixes)) {
      return requireRole(["admin"]);
    }
    if (isProtected(path, employerPrefixes)) {
      return requireRole(["employer"]);
    }
    if (isProtected(path, jobseekerPrefixes)) {
      return requireRole(["jobseeker"]);
    }

    return res;
  } catch (error) {
    console.error("Middleware error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)"],
};
