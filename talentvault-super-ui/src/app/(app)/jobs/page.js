import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, formatEnum, formatLocation, formatSalary } from '@/lib/formatters';
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

const statusTone = (status) => {
  switch (status) {
    case 'open':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'filled':
      return 'border-slate-200 bg-slate-100 text-slate-600';
    case 'closed':
      return 'border-rose-200 bg-rose-50 text-rose-700';
    default:
      return 'border-slate-200 bg-slate-100 text-slate-600';
  }
};

const remoteTone = (remoteType) => {
  switch (remoteType) {
    case 'remote':
      return 'border-sky-200 bg-sky-50 text-sky-700';
    case 'hybrid':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'onsite':
      return 'border-slate-200 bg-slate-100 text-slate-600';
    default:
      return 'border-slate-200 bg-slate-100 text-slate-600';
  }
};

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

  const openRoles = jobs.filter((job) => job.status === 'open').length;
  const filledRoles = jobs.filter((job) => job.status === 'filled').length;
  const remoteRoles = jobs.filter((job) => job.remoteType === 'remote').length;

  const salarySamples = jobs
    .map((job) => job.salaryRange)
    .filter((range) => range && (range.min || range.max));
  const averageSalary = salarySamples.length
    ? Math.round(
        salarySamples.reduce((sum, range) => {
          const min = range.min || range.max || 0;
          const max = range.max || range.min || 0;
          return sum + (min + max) / 2;
        }, 0) / salarySamples.length
      )
    : null;

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-black/10 bg-white/70">
          <CardHeader>
            <CardTitle className="text-sm text-slate-500">Open roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-900">{openRoles}</div>
            <p className="text-xs text-slate-500">Live search sprints</p>
          </CardContent>
        </Card>
        <Card className="border-black/10 bg-white/70">
          <CardHeader>
            <CardTitle className="text-sm text-slate-500">Roles filled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-900">{filledRoles}</div>
            <p className="text-xs text-slate-500">Last 30 days</p>
          </CardContent>
        </Card>
        <Card className="border-black/10 bg-white/70">
          <CardHeader>
            <CardTitle className="text-sm text-slate-500">Remote mix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-900">
              {jobs.length ? Math.round((remoteRoles / jobs.length) * 100) : 0}%
            </div>
            <p className="text-xs text-slate-500">Roles that are fully remote</p>
          </CardContent>
        </Card>
        <Card className="border-black/10 bg-white/70">
          <CardHeader>
            <CardTitle className="text-sm text-slate-500">Average salary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-900">
              {averageSalary ? `EUR ${averageSalary.toLocaleString()}` : '--'}
            </div>
            <p className="text-xs text-slate-500">Across active roles</p>
          </CardContent>
        </Card>
      </section>

      <Card className="border-black/10 bg-white/80">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">Roles pipeline</CardTitle>
            <p className="text-sm text-slate-500">Create, review, and update active roles.</p>
          </div>
          <Button asChild size="sm">
            <Link href="/jobs/new">New role</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div className="font-medium text-slate-900">{job.title}</div>
                    <div className="text-xs text-slate-500">
                      {formatEnum(job.experienceLevel)} level
                    </div>
                  </TableCell>
                  <TableCell>{job.company}</TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{formatEnum(job.employmentType)}</Badge>
                      <Badge className={remoteTone(job.remoteType)}>{formatEnum(job.remoteType)}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusTone(job.status)}>{formatEnum(job.status)}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(job.postedAt)}</TableCell>
                  <TableCell>{formatSalary(job.salaryRange)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/jobs/${job.id}`}>Edit</Link>
                      </Button>
                      <Button asChild variant="secondary" size="sm">
                        <Link href={`/jobs/${job.id}/pipeline`}>Pipeline</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
