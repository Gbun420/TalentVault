'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatEnum } from '@/lib/formatters';

const availabilityOptions = ['all', 'immediate', 'two_weeks', 'one_month', 'three_months', 'open'];

const selectClassName =
  'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-slate-700 shadow-xs focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50';

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

export default function CandidatesList({ candidates }) {
  const [query, setQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [minScore, setMinScore] = useState('');

  const filteredCandidates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const scoreValue = minScore === '' ? null : Number(minScore);

    return candidates.filter((candidate) => {
      const matchesQuery = normalizedQuery
        ? [candidate.name, candidate.headline, ...(candidate.skills || [])]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(normalizedQuery))
        : true;

      const matchesAvailability =
        availabilityFilter === 'all' || candidate.availability === availabilityFilter;

      const matchesScore = scoreValue === null ? true : candidate.resumeScore >= scoreValue;

      return matchesQuery && matchesAvailability && matchesScore;
    });
  }, [candidates, query, availabilityFilter, minScore]);

  const readyNow = filteredCandidates.filter((candidate) => candidate.availability === 'immediate').length;
  const avgExperience = filteredCandidates.length
    ? Math.round(
        filteredCandidates.reduce((sum, candidate) => sum + (candidate.experience || 0), 0) /
          filteredCandidates.length
      )
    : 0;
  const avgScore = filteredCandidates.length
    ? Math.round(filteredCandidates.reduce((sum, candidate) => sum + candidate.resumeScore, 0) /
        filteredCandidates.length)
    : 0;

  const availabilityCounts = filteredCandidates.reduce((acc, candidate) => {
    const key = candidate.availability || 'open';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const skillCounts = filteredCandidates.reduce((acc, candidate) => {
    candidate.skills.forEach((skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
    });
    return acc;
  }, {});

  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const handleReset = () => {
    setQuery('');
    setAvailabilityFilter('all');
    setMinScore('');
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Pipeline overview</h2>
          <p className="text-sm text-slate-500">{filteredCandidates.length} of {candidates.length} candidates</p>
        </div>
        <Button asChild size="sm">
          <Link href="/candidates/new">Add candidate</Link>
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_auto]">
        <Input
          placeholder="Search names, skills, headlines"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          className={selectClassName}
          value={availabilityFilter}
          onChange={(event) => setAvailabilityFilter(event.target.value)}
        >
          {availabilityOptions.map((option) => (
            <option key={option} value={option}>
              {option === 'all' ? 'All availability' : formatEnum(option)}
            </option>
          ))}
        </select>
        <Input
          type="number"
          placeholder="Min score"
          value={minScore}
          onChange={(event) => setMinScore(event.target.value)}
        />
        <Button variant="outline" size="sm" onClick={handleReset}>
          Reset
        </Button>
      </div>

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
            <div className="text-3xl font-semibold text-slate-900">{filteredCandidates.length}</div>
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
            {filteredCandidates.length ? (
              filteredCandidates.map((candidate) => (
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
                  <div className="mt-4 flex justify-end">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/candidates/${candidate.id}`}>Edit profile</Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
                No candidates match these filters yet.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="border-black/10 bg-white/80">
            <CardHeader>
              <CardTitle className="text-lg">Availability mix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(availabilityCounts).length ? (
                Object.entries(availabilityCounts).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>{formatEnum(key)}</span>
                      <span>{value}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-900"
                        style={{ width: `${Math.round((value / filteredCandidates.length) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No availability data yet.</p>
              )}
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
