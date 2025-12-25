import { NextResponse } from 'next/server';
import { strapiFetch } from '@/lib/strapi-api';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const filter = jobId ? `&filters[job][id][$eq]=${encodeURIComponent(jobId)}` : '';
    const data = await strapiFetch(
      `/applications?populate=candidate,job&sort[0]=createdAt:desc${filter}`
    );
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
    const jobId = payload.jobId || payload.job;
    const candidateId = payload.candidateId || payload.candidate;
    if (!jobId || !candidateId) {
      return NextResponse.json({ error: 'jobId and candidateId are required.' }, { status: 400 });
    }

    const data = await strapiFetch('/applications', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          job: Number(jobId),
          candidate: Number(candidateId),
          status: payload.status || 'submitted',
          source: payload.source || 'platform',
          appliedAt: payload.appliedAt || new Date().toISOString(),
        },
      }),
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error.message === 'unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Request failed.' }, { status: 500 });
  }
}
