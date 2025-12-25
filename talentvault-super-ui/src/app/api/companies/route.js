import { NextResponse } from 'next/server';
import { strapiFetch } from '@/lib/strapi-api';

export async function GET() {
  try {
    const data = await strapiFetch('/companies?populate=industry,location&sort[0]=name:asc&pagination[pageSize]=100');
    return NextResponse.json(data);
  } catch (error) {
    if (error.message === 'unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Request failed.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const data = await strapiFetch('/companies', {
      method: 'POST',
      body: JSON.stringify({ data: payload }),
    });
    return NextResponse.json(data);
  } catch (error) {
    if (error.message === 'unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Request failed.' }, { status: 500 });
  }
}
