'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, formatEnum, formatSalary } from '@/lib/formatters';

const statusOptions = ['all', 'open', 'filled', 'closed'];
const remoteOptions = ['all', 'remote', 'hybrid', 'onsite'];
const employmentOptions = ['all', 'full_time', 'part_time', 'contract', 'internship', 'temporary'];
const experienceOptions = ['all', 'junior', 'mid', 'senior', 'lead', 'director'];

const selectClassName =
  'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-slate-700 shadow-xs focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50';

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

export default function JobsList({ jobs }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [remoteFilter, setRemoteFilter] = useState('all');
  const [employmentFilter, setEmploymentFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesQuery = normalizedQuery
        ? [job.title, job.company, job.location]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(normalizedQuery))
        : true;

      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchesRemote = remoteFilter === 'all' || job.remoteType === remoteFilter;
      const matchesEmployment =
        employmentFilter === 'all' || job.employmentType === employmentFilter;
      const matchesExperience =
        experienceFilter === 'all' || job.experienceLevel === experienceFilter;

      return matchesQuery && matchesStatus && matchesRemote && matchesEmployment && matchesExperience;
    });
  }, [jobs, query, statusFilter, remoteFilter, employmentFilter, experienceFilter]);

  const openRoles = filteredJobs.filter((job) => job.status === 'open').length;
  const filledRoles = filteredJobs.filter((job) => job.status === 'filled').length;
  const remoteRoles = filteredJobs.filter((job) => job.remoteType === 'remote').length;

  const salarySamples = filteredJobs
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

  const handleReset = () => {
    setQuery('');
    setStatusFilter('all');
    setRemoteFilter('all');
    setEmploymentFilter('all');
    setExperienceFilter('all');
  };

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
              {filteredJobs.length ? Math.round((remoteRoles / filteredJobs.length) * 100) : 0}%
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
            <p className="text-xs text-slate-500">Across filtered roles</p>
          </CardContent>
        </Card>
      </section>

      <Card className="border-black/10 bg-white/80">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Roles pipeline</CardTitle>
              <p className="text-sm text-slate-500">{filteredJobs.length} of {jobs.length} roles</p>
            </div>
            <Button asChild size="sm">
              <Link href="/jobs/new">New role</Link>
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            <Input
              placeholder="Search roles, companies, locations"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <select className={selectClassName} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All statuses' : formatEnum(option)}
                </option>
              ))}
            </select>
            <select className={selectClassName} value={remoteFilter} onChange={(event) => setRemoteFilter(event.target.value)}>
              {remoteOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All remote' : formatEnum(option)}
                </option>
              ))}
            </select>
            <select className={selectClassName} value={employmentFilter} onChange={(event) => setEmploymentFilter(event.target.value)}>
              {employmentOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All employment' : formatEnum(option)}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <select className={selectClassName} value={experienceFilter} onChange={(event) => setExperienceFilter(event.target.value)}>
                {experienceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'all' ? 'All levels' : formatEnum(option)}
                  </option>
                ))}
              </select>
              <Button variant="outline" size="sm" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredJobs.length ? (
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
                {filteredJobs.map((job) => (
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
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
              No roles match these filters yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
