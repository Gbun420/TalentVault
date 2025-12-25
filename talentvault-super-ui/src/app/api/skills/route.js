import { NextResponse } from 'next/server';
import { strapiFetch } from '@/lib/strapi-api';

export async function GET() {
  try {
    const data = await strapiFetch('/skills?sort[0]=name:asc&pagination[pageSize]=200');
    return NextResponse.json(data);
  } catch (error) {
    if (error.message === 'unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Request failed.' }, { status: 500 });
  }
}
