'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatEnum } from '@/lib/formatters';

const stages = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'in_review', label: 'In review' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'hired', label: 'Hired' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'withdrawn', label: 'Withdrawn' },
];

const statusTone = (status) => {
  switch (status) {
    case 'submitted':
      return 'border-slate-200 bg-slate-100 text-slate-600';
    case 'in_review':
      return 'border-sky-200 bg-sky-50 text-sky-700';
    case 'shortlisted':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'hired':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'rejected':
      return 'border-rose-200 bg-rose-50 text-rose-700';
    case 'withdrawn':
      return 'border-slate-200 bg-slate-100 text-slate-500';
    default:
      return 'border-slate-200 bg-slate-100 text-slate-600';
  }
};

const selectClassName =
  'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-slate-700 shadow-xs focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50';

const normalizeApplication = (application) => {
  const attributes = application?.attributes || {};
  const candidateData = attributes.candidate?.data;
  const candidateAttributes = candidateData?.attributes || {};

  return {
    id: application.id,
    status: attributes.status || 'submitted',
    appliedAt: attributes.appliedAt || attributes.createdAt,
    rating: attributes.rating || null,
    candidate: candidateData
      ? {
          id: candidateData.id,
          name: candidateAttributes.fullName || 'Unnamed candidate',
          headline: candidateAttributes.headline || 'Candidate profile',
          resumeScore: candidateAttributes.resumeScore || 0,
          availability: candidateAttributes.availability || 'open',
        }
      : null,
  };
};

export default function JobPipelinePage({ params }) {
  const jobId = params.id;
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('submitted');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const candidateIdsInPipeline = useMemo(
    () => new Set(applications.map((app) => app.candidate?.id).filter(Boolean)),
    [applications]
  );

  const availableCandidates = useMemo(
    () => candidates.filter((candidate) => !candidateIdsInPipeline.has(candidate.id)),
    [candidates, candidateIdsInPipeline]
  );

  const groupedApplications = useMemo(() => {
    const initial = stages.reduce((acc, stage) => {
      acc[stage.key] = [];
      return acc;
    }, {});

    applications.forEach((application) => {
      const key = application.status || 'submitted';
      if (!initial[key]) {
        initial[key] = [];
      }
      initial[key].push(application);
    });

    return initial;
  }, [applications]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [jobRes, applicationsRes, candidatesRes] = await Promise.all([
        fetch(`/api/jobs/${jobId}`),
        fetch(`/api/applications?jobId=${jobId}`),
        fetch('/api/candidates'),
      ]);

      if (!jobRes.ok || !applicationsRes.ok || !candidatesRes.ok) {
        throw new Error('Unable to load the pipeline data.');
      }

      const jobPayload = await jobRes.json();
      const jobAttributes = jobPayload?.data?.attributes || {};
      setJob({
        id: jobPayload?.data?.id,
        title: jobAttributes.title || 'Untitled role',
        company: jobAttributes.company?.data?.attributes?.name || 'TalentVault',
      });

      const applicationsPayload = await applicationsRes.json();
      const normalizedApps = applicationsPayload?.data?.map(normalizeApplication) || [];
      setApplications(normalizedApps);

      const candidatesPayload = await candidatesRes.json();
      const normalizedCandidates = candidatesPayload?.data?.map((candidate) => {
        const attributes = candidate?.attributes || {};
        return {
          id: candidate.id,
          name: attributes.fullName || 'Unnamed candidate',
          headline: attributes.headline || 'Candidate profile',
          availability: attributes.availability || 'open',
          resumeScore: attributes.resumeScore || 0,
        };
      });
      setCandidates(normalizedCandidates || []);
    } catch (err) {
      setError(err.message || 'Unable to load the pipeline data.');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDrop = async (event, nextStatus) => {
    event.preventDefault();
    const applicationId = event.dataTransfer.getData('applicationId');
    if (!applicationId) return;

    const current = applications.find((app) => String(app.id) === String(applicationId));
    if (!current || current.status === nextStatus) return;

    const previous = applications;
    setApplications((prev) =>
      prev.map((app) => (app.id === current.id ? { ...app, status: nextStatus } : app))
    );

    try {
      const response = await fetch(`/api/applications/${current.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        throw new Error('Unable to update status.');
      }
    } catch (err) {
      setApplications(previous);
      setError(err.message || 'Unable to update status.');
    }
  };

  const handleDragStart = (event, applicationId) => {
    event.dataTransfer.setData('applicationId', String(applicationId));
  };

  const handleAddCandidate = async (event) => {
    event.preventDefault();
    setError('');

    if (!selectedCandidate) {
      setError('Select a candidate to add.');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          candidateId: selectedCandidate,
          status: selectedStatus,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || 'Unable to add candidate.');
      }

      const payload = await response.json();
      const newApplication = normalizeApplication(payload?.data);
      setApplications((prev) => [newApplication, ...prev]);
      setSelectedCandidate('');
      setSelectedStatus('submitted');
    } catch (err) {
      setError(err.message || 'Unable to add candidate.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading pipeline...</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Pipeline</p>
          <h2 className="text-2xl font-semibold text-slate-900">{job?.title}</h2>
          <p className="text-sm text-slate-500">{job?.company} · Hiring flow overview</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/jobs/${jobId}`}>Back to role</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={loadData}>
            Refresh
          </Button>
        </div>
      </div>

      <Card className="border-black/10 bg-white/80">
        <CardHeader>
          <CardTitle className="text-lg">Add candidate to pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 lg:grid-cols-[1.5fr_1fr_auto]" onSubmit={handleAddCandidate}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Candidate</label>
              <select
                className={selectClassName}
                value={selectedCandidate}
                onChange={(event) => setSelectedCandidate(event.target.value)}
              >
                <option value="">Select candidate</option>
                {availableCandidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name}
                  </option>
                ))}
              </select>
              {!availableCandidates.length ? (
                <p className="text-xs text-slate-500">All candidates are already in this pipeline.</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Initial stage</label>
              <select
                className={selectClassName}
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
              >
                {stages.map((stage) => (
                  <option key={stage.key} value={stage.key}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={saving}>
                {saving ? 'Adding...' : 'Add candidate'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="grid gap-4 lg:grid-cols-6">
        {stages.map((stage) => (
          <div
            key={stage.key}
            className="rounded-2xl border border-slate-200/70 bg-white/80 p-3"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDrop(event, stage.key)}
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{stage.label}</div>
                <div className="text-sm font-semibold text-slate-900">
                  {groupedApplications[stage.key]?.length || 0} candidates
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {groupedApplications[stage.key]?.length ? (
                groupedApplications[stage.key].map((application) => (
                  <div
                    key={application.id}
                    draggable
                    onDragStart={(event) => handleDragStart(event, application.id)}
                    className="rounded-2xl border border-slate-200/70 bg-white px-3 py-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {application.candidate?.name || 'Candidate'}
                        </div>
                        <p className="text-xs text-slate-500">
                          {application.candidate?.headline || 'Candidate profile'}
                        </p>
                      </div>
                      <Badge className={statusTone(application.status)}>
                        {formatEnum(application.status)}
                      </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>Applied {formatDate(application.appliedAt)}</span>
                      <span>•</span>
                      <span>Score {application.candidate?.resumeScore || 0}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 px-3 py-4 text-xs text-slate-400">
                  Drag candidates here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
