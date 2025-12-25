import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  };

  cookies().set('tv_jwt', '', cookieOptions);
  cookies().set('tv_portal', '', cookieOptions);

  return NextResponse.json({ ok: true });
}
