import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlowCard } from '@/components/glow-card';
import { formatDate, formatEnum, formatLocation } from '@/lib/formatters';
import { getCandidates, getJobs, getStats } from '@/lib/strapi-server';

export const revalidate = 60;

const fallbackJobs = [
  {
    id: 'job-1',
    title: 'Head of Growth',
    company: 'NovaStack',
    location: 'New York, NY',
    status: 'open',
    employmentType: 'full_time',
    experienceLevel: 'lead',
    postedAt: '2025-01-05T14:00:00.000Z',
  },
  {
    id: 'job-2',
    title: 'Senior Product Designer',
    company: 'Lumen Labs',
    location: 'Remote',
    status: 'open',
    employmentType: 'contract',
    experienceLevel: 'senior',
    postedAt: '2025-01-03T10:30:00.000Z',
  },
  {
    id: 'job-3',
    title: 'Platform Engineer',
    company: 'Helix Edge',
    location: 'Austin, TX',
    status: 'filled',
    employmentType: 'full_time',
    experienceLevel: 'mid',
    postedAt: '2024-12-29T08:45:00.000Z',
  },
];

const fallbackCandidates = [
  {
    id: 'candidate-1',
    name: 'Maya Chen',
    headline: 'VP Product with fintech scale experience',
    location: 'San Francisco, CA',
    availability: 'two_weeks',
    experience: 12,
    resumeScore: 92,
    skills: ['Product Strategy', 'Growth', 'AI'],
  },
  {
    id: 'candidate-2',
    name: 'Andre Johnson',
    headline: 'Senior recruiter focused on executive search',
    location: 'Remote',
    availability: 'open',
    experience: 8,
    resumeScore: 87,
    skills: ['Sourcing', 'Talent Ops', 'Diversity'],
  },
  {
    id: 'candidate-3',
    name: 'Priya Patel',
    headline: 'Lead engineer, distributed systems',
    location: 'London, UK',
    availability: 'one_month',
    experience: 10,
    resumeScore: 90,
    skills: ['Go', 'Cloud', 'Security'],
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

export default async function Home() {
  let stats = {
    jobs: 12,
    candidates: 38,
    companies: 9,
    insights: 6,
  };
  let jobs = fallbackJobs;
  let candidates = fallbackCandidates;

  try {
    stats = await getStats();
  } catch (error) {
    // Keep fallback stats when Strapi is unavailable.
  }

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
        experienceLevel: attributes.experienceLevel || 'mid',
        postedAt: attributes.postedAt || attributes.createdAt,
      };
    });
    if (normalized?.length) {
      jobs = normalized.slice(0, 5);
    }
  } catch (error) {
    // Keep fallback jobs when Strapi is unavailable.
  }

  try {
    const candidatesResponse = await getCandidates();
    const normalized = candidatesResponse?.data?.map((candidate) => {
      const attributes = candidate?.attributes || {};
      const skills = attributes.skills?.data
        ?.map((skill) => skill?.attributes?.name)
        .filter(Boolean)
        .slice(0, 3);
      return {
        id: candidate.id,
        name: attributes.fullName || 'Unnamed candidate',
        headline: attributes.headline || 'Talent profile ready for review',
        location: formatLocation(attributes.location),
        availability: attributes.availability || 'open',
        experience: attributes.yearsExperience || null,
        resumeScore: Number(attributes.resumeScore || 0),
        skills: skills?.length ? skills : ['Talent Ops', 'Strategy'],
      };
    });
    if (normalized?.length) {
      candidates = normalized.slice(0, 5);
    }
  } catch (error) {
    // Keep fallback candidates when Strapi is unavailable.
  }

  const matchIndex = stats.candidates
    ? Math.min(97, 72 + Math.round(stats.candidates / 4))
    : 86;

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <GlowCard>
          <div className="flex h-full flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">Signal</p>
                <h2 className="font-display text-3xl text-white text-shadow-soft">
                  Talent momentum is strong this week.
                </h2>
              </div>
              <Badge className="border-white/30 bg-white/15 text-white">Live</Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <div className="text-3xl font-semibold text-white">{stats.jobs}</div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Active roles</p>
              </div>
              <div>
                <div className="text-3xl font-semibold text-white">{stats.candidates}</div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Talent in play</p>
              </div>
              <div>
                <div className="text-3xl font-semibold text-white">{matchIndex}%</div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Match index</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-white/80">
              <div className="mb-2 text-sm font-semibold text-white">Signal highlights</div>
              <ul className="space-y-1">
                <li>Executive search conversions are up 18% week over week.</li>
                <li>Remote roles are pulling 2.4x more qualified talent.</li>
                <li>AI matching signals flagged 6 standout candidates.</li>
              </ul>
            </div>
          </div>
        </GlowCard>
        <Card className="border-black/10 bg-white/80">
          <CardHeader>
            <CardTitle className="text-lg">Today on your desk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Priority</div>
              <div className="text-base font-semibold text-slate-900">Lock the Head of Growth shortlist</div>
              <p>Review the top 5 candidates flagged by the signal engine.</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Partnership</div>
              <div className="text-base font-semibold text-slate-900">Align with Lumen Labs on hiring plan</div>
              <p>Confirm next interview loop and offer bands.</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Pipeline</div>
              <div className="text-base font-semibold text-slate-900">3 new roles need intake</div>
              <p>Draft kickoff calls for the next hiring wave.</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Open roles', value: stats.jobs },
          { label: 'Active candidates', value: stats.candidates },
          { label: 'Partner companies', value: stats.companies },
          { label: 'Insight drops', value: stats.insights },
        ].map((item) => (
          <Card key={item.label} className="border-black/10 bg-white/70">
            <CardHeader>
              <CardTitle className="text-sm text-slate-500">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-slate-900">{item.value}</div>
              <p className="text-xs text-slate-500">Updated just now</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-black/10 bg-white/80">
          <CardHeader>
            <CardTitle className="text-lg">Priority roles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-slate-900">{job.title}</div>
                    <p className="text-sm text-slate-500">
                      {job.company} | {job.location}
                    </p>
                  </div>
                  <Badge className={statusTone(job.status)}>{formatEnum(job.status)}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>{formatEnum(job.employmentType)}</span>
                  <span>|</span>
                  <span>{formatEnum(job.experienceLevel)}</span>
                  <span>|</span>
                  <span>Posted {formatDate(job.postedAt)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-black/10 bg-white/80">
          <CardHeader>
            <CardTitle className="text-lg">Candidate watchlist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-slate-900">{candidate.name}</div>
                    <p className="text-sm text-slate-500">{candidate.headline}</p>
                  </div>
                  <div className="text-right text-sm text-slate-600">
                    <div className="text-lg font-semibold text-slate-900">{candidate.resumeScore}</div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Score</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{candidate.location}</span>
                  <span>|</span>
                  <span>{formatEnum(candidate.availability)}</span>
                  {candidate.experience ? (
                    <>
                      <span>|</span>
                      <span>{candidate.experience}+ yrs</span>
                    </>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
