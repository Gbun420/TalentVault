import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE = process.env.STRAPI_API_URL || process.env.NEXT_PUBLIC_STRAPI_API || 'http://localhost:1337/api';

export async function POST(request) {
  try {
    const { identifier, password } = await request.json();
    if (!identifier || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const response = await fetch(`${API_BASE}/auth/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });

    const payload = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: payload?.error?.message || 'Login failed.' }, { status: 401 });
    }

    const token = payload?.jwt;
    if (!token) {
      return NextResponse.json({ error: 'Login failed.' }, { status: 401 });
    }

    cookies().set('tv_jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ user: payload?.user || null });
  } catch (error) {
    return NextResponse.json({ error: 'Login failed.' }, { status: 500 });
  }
}
