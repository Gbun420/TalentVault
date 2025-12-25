import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE = process.env.STRAPI_API_URL || process.env.NEXT_PUBLIC_STRAPI_API || 'http://localhost:1337/api';

const buildCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
});

export async function POST(request) {
  try {
    const { name, email, password, portal } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const username = name?.trim() || email;
    const normalizedPortal = portal === 'jobseeker' ? 'jobseeker' : 'employer';

    const response = await fetch(`${API_BASE}/auth/local/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, portal: normalizedPortal }),
    });

    const payload = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: payload?.error?.message || 'Registration failed.' }, { status: 400 });
    }

    const token = payload?.jwt;
    if (!token) {
      return NextResponse.json({ error: 'Registration failed.' }, { status: 400 });
    }

    const userPortal = payload?.user?.portal || normalizedPortal;
    const cookieOptions = buildCookieOptions();

    cookies().set('tv_jwt', token, cookieOptions);
    cookies().set('tv_portal', userPortal === 'jobseeker' ? 'jobseeker' : 'employer', cookieOptions);

    return NextResponse.json({ user: payload?.user || null, portal: userPortal });
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed.' }, { status: 500 });
  }
}
