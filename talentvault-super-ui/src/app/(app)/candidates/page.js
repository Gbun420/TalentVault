import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatEnum, formatLocation } from '@/lib/formatters';
import { getCandidates } from '@/lib/strapi-client';

export const revalidate = 60;

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
  {
    id: 'candidate-4',
    name: 'Noah Williams',
    headline: 'Revenue operations strategist',
    location: 'Toronto, CA',
    availability: 'immediate',
    experience: 6,
    resumeScore: 84,
    skills: ['RevOps', 'Analytics', 'Enablement'],
  },
];

const availabilityTone = (availability) => {
  switch (availability) {
    case 'immediate':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'two_weeks':
      return 'border-sky-200 bg-sky-50 text-sky-700';
    case 'one_month':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'three_months':
      return 'border-rose-200 bg-rose-50 text-rose-700';
    default:
      return 'border-slate-200 bg-slate-100 text-slate-600';
  }
};

export default async function CandidatesPage() {
  let candidates = fallbackCandidates;

  try {
    const candidatesResponse = await getCandidates();
    const normalized = candidatesResponse?.data?.map((candidate) => {
      const attributes = candidate?.attributes || {};
      const skills = attributes.skills?.data
        ?.map((skill) => skill?.attributes?.name)
        .filter(Boolean)
        .slice(0, 4);
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
      candidates = normalized;
    }
  } catch (error) {
    // Keep fallback candidates when Strapi is unavailable.
  }

  const readyNow = candidates.filter((candidate) => candidate.availability === 'immediate').length;
  const avgExperience = candidates.length
    ? Math.round(
        candidates.reduce((sum, candidate) => sum + (candidate.experience || 0), 0) / candidates.length
      )
    : 0;
  const avgScore = candidates.length
    ? Math.round(candidates.reduce((sum, candidate) => sum + candidate.resumeScore, 0) / candidates.length)
    : 0;

  const availabilityCounts = candidates.reduce((acc, candidate) => {
    const key = candidate.availability || 'open';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const skillCounts = candidates.reduce((acc, candidate) => {
    candidate.skills.forEach((skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
    });
    return acc;
  }, {});

  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-black/10 bg-white/70">
          <CardHeader>
            <CardTitle className="text-sm text-slate-500">Ready now</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-900">{readyNow}</div>
            <p className="text-xs text-slate-500">Immediate availability</p>
          </CardContent>
        </Card>
        <Card className="border-black/10 bg-white/70">
          <CardHeader>
            <CardTitle className="text-sm text-slate-500">Average experience</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-900">{avgExperience}</div>
            <p className="text-xs text-slate-500">Years in role</p>
          </CardContent>
        </Card>
        <Card className="border-black/10 bg-white/70">
          <CardHeader>
            <CardTitle className="text-sm text-slate-500">Match score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-900">{avgScore}</div>
            <p className="text-xs text-slate-500">Average across pipeline</p>
          </CardContent>
        </Card>
        <Card className="border-black/10 bg-white/70">
          <CardHeader>
            <CardTitle className="text-sm text-slate-500">Featured talent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-900">{candidates.length}</div>
            <p className="text-xs text-slate-500">Profiles ready to surface</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-black/10 bg-white/80">
          <CardHeader>
            <CardTitle className="text-lg">Candidate flow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
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
                  <span>{candidate.experience ? `${candidate.experience}+ yrs` : 'Experience TBD'}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge className={availabilityTone(candidate.availability)}>
                    {formatEnum(candidate.availability)}
                  </Badge>
                  {candidate.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <div className="mt-3">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-900"
                      style={{ width: `${Math.min(candidate.resumeScore, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="border-black/10 bg-white/80">
            <CardHeader>
              <CardTitle className="text-lg">Availability mix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(availabilityCounts).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>{formatEnum(key)}</span>
                    <span>{value}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-900"
                      style={{ width: `${Math.round((value / candidates.length) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-black/10 bg-white/80">
            <CardHeader>
              <CardTitle className="text-lg">Skills radar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topSkills.length ? (
                topSkills.map(([skill, count]) => (
                  <div key={skill} className="flex items-center justify-between text-sm text-slate-600">
                    <span>{skill}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No skill tags available yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
