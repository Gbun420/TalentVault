import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlowCard } from '@/components/glow-card';
import { formatDate, formatEnum, formatLocation } from '@/lib/formatters';
import { getJobs } from '@/lib/strapi-server';

export const revalidate = 60;

const fallbackRoles = [
  {
    id: 'role-1',
    title: 'Customer Success Lead',
    company: 'Harborline',
    location: 'Remote',
    status: 'open',
    employmentType: 'full_time',
    postedAt: '2025-01-02T10:15:00.000Z',
  },
  {
    id: 'role-2',
    title: 'Product Operations Manager',
    company: 'Lumen Labs',
    location: 'London, UK',
    status: 'open',
    employmentType: 'full_time',
    postedAt: '2024-12-28T09:30:00.000Z',
  },
  {
    id: 'role-3',
    title: 'Growth Marketing Strategist',
    company: 'NovaStack',
    location: 'Malta',
    status: 'open',
    employmentType: 'contract',
    postedAt: '2024-12-23T08:00:00.000Z',
  },
];

const fallbackApplications = [
  {
    id: 'app-1',
    role: 'Product Analyst',
    company: 'Aether Partners',
    stage: 'in_review',
    updatedAt: '2025-01-04T16:00:00.000Z',
  },
  {
    id: 'app-2',
    role: 'Customer Success Lead',
    company: 'Harborline',
    stage: 'interviewing',
    updatedAt: '2025-01-03T10:00:00.000Z',
  },
  {
    id: 'app-3',
    role: 'Chief of Staff',
    company: 'Atlas Ridge',
    stage: 'offer',
    updatedAt: '2024-12-30T14:45:00.000Z',
  },
];

const applicationTone = (stage) => {
  switch (stage) {
    case 'in_review':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'interviewing':
      return 'border-sky-200 bg-sky-50 text-sky-700';
    case 'offer':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'rejected':
      return 'border-rose-200 bg-rose-50 text-rose-700';
    default:
      return 'border-slate-200 bg-slate-100 text-slate-600';
  }
};

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

export default async function TalentHubPage() {
  let roles = fallbackRoles;
  const applications = fallbackApplications;

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
        postedAt: attributes.postedAt || attributes.createdAt,
      };
    });
    if (normalized?.length) {
      roles = normalized.slice(0, 4);
    }
  } catch (error) {
    // Keep fallback roles when Strapi is unavailable.
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <GlowCard>
          <div className="flex h-full flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">Momentum</p>
                <h2 className="font-display text-3xl text-white text-shadow-soft">
                  Your talent journey is moving forward.
                </h2>
              </div>
              <Badge className="border-white/30 bg-white/15 text-white">Live</Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <div className="text-3xl font-semibold text-white">3</div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Active applications</p>
              </div>
              <div>
                <div className="text-3xl font-semibold text-white">2</div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Interviews scheduled</p>
              </div>
              <div>
                <div className="text-3xl font-semibold text-white">86%</div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Profile readiness</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-white/80">
              <div className="mb-2 text-sm font-semibold text-white">Next steps</div>
              <ul className="space-y-1">
                <li>Finish your leadership summary for higher match scores.</li>
                <li>Confirm availability windows for the next two weeks.</li>
                <li>Review outreach updates from your recruiter team.</li>
              </ul>
            </div>
          </div>
        </GlowCard>
        <Card className="border-black/10 bg-white/80">
          <CardHeader>
            <CardTitle className="text-lg">Today on your timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Interview</div>
              <div className="text-base font-semibold text-slate-900">Harborline panel</div>
              <p>Prep notes and finalize your availability.</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Update</div>
              <div className="text-base font-semibold text-slate-900">Lumen Labs follow-up</div>
              <p>Share salary expectations in the portal.</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Profile</div>
              <div className="text-base font-semibold text-slate-900">Add your latest case study</div>
              <p>Boost match confidence for senior roles.</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active applications', value: '3' },
          { label: 'Interview stages', value: '2' },
          { label: 'Recruiter notes', value: '5' },
          { label: 'New matches', value: '7' },
        ].map((item) => (
          <Card key={item.label} className="border-black/10 bg-white/70">
            <CardHeader>
              <CardTitle className="text-sm text-slate-500">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-slate-900">{item.value}</div>
              <p className="text-xs text-slate-500">Updated today</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-black/10 bg-white/80">
          <CardHeader>
            <CardTitle className="text-lg">Recommended roles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-slate-900">{role.title}</div>
                    <p className="text-sm text-slate-500">
                      {role.company} | {role.location}
                    </p>
                  </div>
                  <Badge className={statusTone(role.status)}>{formatEnum(role.status)}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>{formatEnum(role.employmentType)}</span>
                  <span>|</span>
                  <span>Posted {formatDate(role.postedAt)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-black/10 bg-white/80">
          <CardHeader>
            <CardTitle className="text-lg">Application tracker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {applications.map((application) => (
              <div
                key={application.id}
                className="flex flex-col gap-2 rounded-2xl border border-slate-200/70 bg-white px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{application.role}</div>
                    <div className="text-xs text-slate-500">{application.company}</div>
                  </div>
                  <Badge className={applicationTone(application.stage)}>
                    {formatEnum(application.stage)}
                  </Badge>
                </div>
                <div className="text-xs text-slate-500">Updated {formatDate(application.updatedAt)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="border-black/10 bg-white/80">
          <CardHeader>
            <CardTitle className="text-lg">Profile checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
              <div>
                <div className="font-semibold text-slate-900">Executive summary</div>
                <p className="text-xs text-slate-500">Add a 2-3 sentence leadership snapshot.</p>
              </div>
              <Badge className="border-amber-200 bg-amber-50 text-amber-700">Pending</Badge>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
              <div>
                <div className="font-semibold text-slate-900">Portfolio links</div>
                <p className="text-xs text-slate-500">Share 2 standout case studies.</p>
              </div>
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Complete</Badge>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
              <div>
                <div className="font-semibold text-slate-900">Availability windows</div>
                <p className="text-xs text-slate-500">Confirm start date and notice period.</p>
              </div>
              <Badge className="border-sky-200 bg-sky-50 text-sky-700">In progress</Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="border-black/10 bg-white/80">
          <CardHeader>
            <CardTitle className="text-lg">Interview readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Prep pack</div>
              <div className="text-base font-semibold text-slate-900">Harborline panel</div>
              <p>Review the interviewer matrix and highlight stories.</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Insights</div>
              <div className="text-base font-semibold text-slate-900">Role alignment</div>
              <p>Update your skills taxonomy to improve match confidence.</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Feedback loop</div>
              <div className="text-base font-semibold text-slate-900">Recruiter sync</div>
              <p>Schedule a 15-minute sync to adjust role targets.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
