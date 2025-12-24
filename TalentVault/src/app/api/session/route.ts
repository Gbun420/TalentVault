import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthAdmin } from "@/lib/firebase-admin";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 5;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const idToken = body?.idToken as string | undefined;
    if (!idToken) {
      return NextResponse.json({ error: "idToken required" }, { status: 400 });
    }

    const authAdmin = getAuthAdmin();
    const sessionCookie = await authAdmin.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_SECONDS * 1000,
    });

    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === "production";
    cookieStore.set("__session", sessionCookie, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";
  cookieStore.set("__session", "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ ok: true });
}
