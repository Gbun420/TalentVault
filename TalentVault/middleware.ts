import { NextResponse, NextRequest } from "next/server";

const jobseekerPrefixes = ["/jobseeker"];
const employerPrefixes = ["/employer"];
const adminPrefixes = ["/admin"];

const isProtected = (path: string, prefixes: string[]) =>
  prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const res = NextResponse.next();

  const isE2E = process.env.NEXT_PUBLIC_E2E_AUTH_BYPASS === "true";

  // 1️⃣ FULL E2E BYPASS — NO AUTH, NO REDIRECTS
  if (isE2E) {
    return res;
  }

  // 2️⃣ Skip static / public assets
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api/webhooks") ||
    path.includes(".")
  ) {
    return res;
  }

  // 3️⃣ Basic session presence check ONLY
  // (Real verification happens server-side)
  const hasSession =
    req.cookies.has("__session") || req.cookies.has("session");

  const redirectToLogin = () =>
    NextResponse.redirect(
      new URL(`/auth/login?redirectTo=${encodeURIComponent(path)}`, req.url)
    );

  // 4️⃣ Protect routes by presence, not verification
  if (isProtected(path, adminPrefixes)) {
    return hasSession ? res : redirectToLogin();
  }

  if (isProtected(path, employerPrefixes)) {
    return hasSession ? res : redirectToLogin();
  }

  if (isProtected(path, jobseekerPrefixes)) {
    return hasSession ? res : redirectToLogin();
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)"],
};
