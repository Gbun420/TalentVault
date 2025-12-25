import { NextResponse } from 'next/server';
import { strapiFetch } from '@/lib/strapi-api';

export async function GET(request, { params }) {
  try {
    const data = await strapiFetch(`/applications/${params.id}?populate=candidate,job`);
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
    const data = await strapiFetch(`/applications/${params.id}`, {
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
    const data = await strapiFetch(`/applications/${params.id}`, {
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
