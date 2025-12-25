import { NextResponse } from 'next/server';

const API_BASE = process.env.STRAPI_API_URL || process.env.NEXT_PUBLIC_STRAPI_API || 'http://localhost:1337/api';
const API_TOKEN = process.env.STRAPI_API_TOKEN;

export async function POST(request) {
  try {
    const payload = await request.json();

    const response = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
      },
      body: JSON.stringify({ data: payload }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data?.error?.message || 'Unable to submit.' }, { status: 400 });
    }

    return NextResponse.json({ data: data?.data || null });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to submit.' }, { status: 500 });
  }
}
