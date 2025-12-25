import { NextResponse } from 'next/server';
import { strapiFetch } from '@/lib/strapi-api';

export async function GET(request, { params }) {
  try {
    const data = await strapiFetch(`/companies/${params.id}?populate=industry,location`);
    return NextResponse.json(data);
  } catch (error) {
    if (error.message === 'unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Request failed.' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const payload = await request.json();
    const data = await strapiFetch(`/companies/${params.id}`, {
      method: 'PUT',
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

export async function DELETE(request, { params }) {
  try {
    const data = await strapiFetch(`/companies/${params.id}`, {
      method: 'DELETE',
    });
    return NextResponse.json(data);
  } catch (error) {
    if (error.message === 'unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Request failed.' }, { status: 500 });
  }
}
