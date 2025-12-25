import JobsList from '@/components/lists/jobs-list';
import { formatLocation } from '@/lib/formatters';
import { getJobs } from '@/lib/strapi-server';

export const revalidate = 60;

const fallbackJobs = [
  {
    id: 'job-1',
    title: 'Senior Product Designer',
    company: 'Lumen Labs',
    location: 'Remote',
    status: 'open',
    employmentType: 'contract',
    remoteType: 'remote',
    experienceLevel: 'senior',
    postedAt: '2025-01-02T12:00:00.000Z',
    salaryRange: { min: 110000, max: 145000, period: 'year' },
  },
  {
    id: 'job-2',
    title: 'Platform Engineer',
    company: 'Helix Edge',
    location: 'Austin, TX',
    status: 'filled',
    employmentType: 'full_time',
    remoteType: 'hybrid',
    experienceLevel: 'mid',
    postedAt: '2024-12-28T08:00:00.000Z',
    salaryRange: { min: 135000, max: 170000, period: 'year' },
  },
  {
    id: 'job-3',
    title: 'Head of Growth',
    company: 'NovaStack',
    location: 'New York, NY',
    status: 'open',
    employmentType: 'full_time',
    remoteType: 'onsite',
    experienceLevel: 'lead',
    postedAt: '2025-01-05T14:00:00.000Z',
    salaryRange: { min: 160000, max: 210000, period: 'year' },
  },
];

export default async function JobsPage() {
  let jobs = fallbackJobs;

  try {
    const jobsResponse = await getJobs();
    const normalized = jobsResponse?.data?.map((job) => {
      const attributes = job?.attributes || {};
      return {
        id: job.id,
        title: attributes.title || 'Untitled role',
        company: attributes.company?.data?.attributes?.name || 'TalentVault',
        location: formatLocation(attributes.location),
        status: attributes.status || 'open',
        employmentType: attributes.employmentType || 'full_time',
        remoteType: attributes.remoteType || 'hybrid',
        experienceLevel: attributes.experienceLevel || 'mid',
        postedAt: attributes.postedAt || attributes.createdAt,
        salaryRange: attributes.salaryRange,
      };
    });
    if (normalized?.length) {
      jobs = normalized;
    }
  } catch (error) {
    // Keep fallback jobs when Strapi is unavailable.
  }

  return <JobsList jobs={jobs} />;
}
