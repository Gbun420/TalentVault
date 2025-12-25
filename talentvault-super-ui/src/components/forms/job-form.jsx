'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const employmentOptions = ['full_time', 'part_time', 'contract', 'internship', 'temporary'];
const experienceOptions = ['junior', 'mid', 'senior', 'lead', 'director'];
const remoteOptions = ['onsite', 'hybrid', 'remote'];
const statusOptions = ['open', 'closed', 'filled'];
const periodOptions = ['hour', 'month', 'year'];

const selectClassName =
  'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-slate-700 shadow-xs focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50';

const formatDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

const defaultState = {
  title: '',
  status: 'open',
  employmentType: 'full_time',
  experienceLevel: 'mid',
  remoteType: 'hybrid',
  companyId: '',
  postedAt: '',
  applicationDeadline: '',
  applyUrl: '',
  applyEmail: '',
  locationCity: '',
  locationRegion: '',
  locationCountry: '',
  salaryMin: '',
  salaryMax: '',
  salaryPeriod: 'year',
  skills: [],
};

const parseNumber = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export default function JobForm({ jobId }) {
  const router = useRouter();
  const [formState, setFormState] = useState(defaultState);
  const [companies, setCompanies] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(Boolean(jobId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isEditing = Boolean(jobId);

  const skillIds = useMemo(() => new Set(formState.skills), [formState.skills]);

  const updateField = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [companiesRes, skillsRes] = await Promise.all([
          fetch('/api/companies'),
          fetch('/api/skills'),
        ]);
        if (companiesRes.ok) {
          const payload = await companiesRes.json();
          const list = payload?.data?.map((company) => ({
            id: company.id,
            name: company?.attributes?.name || 'Unnamed company',
          }));
          setCompanies(list || []);
        }
        if (skillsRes.ok) {
          const payload = await skillsRes.json();
          const list = payload?.data?.map((skill) => ({
            id: skill.id,
            name: skill?.attributes?.name || 'Skill',
          }));
          setSkills(list || []);
        }
      } catch (err) {
        // Ignore lookup errors to keep the form usable.
      }
    };

    loadLookups();
  }, []);

  useEffect(() => {
    if (!jobId) return;

    const loadJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        if (!response.ok) {
          throw new Error('Unable to load this role.');
        }
        const payload = await response.json();
        const attributes = payload?.data?.attributes || {};
        setFormState({
          title: attributes.title || '',
          status: attributes.status || 'open',
          employmentType: attributes.employmentType || 'full_time',
          experienceLevel: attributes.experienceLevel || 'mid',
          remoteType: attributes.remoteType || 'hybrid',
          companyId: attributes.company?.data?.id ? String(attributes.company.data.id) : '',
          postedAt: formatDateInput(attributes.postedAt || attributes.createdAt),
          applicationDeadline: attributes.applicationDeadline || '',
          applyUrl: attributes.applyUrl || '',
          applyEmail: attributes.applyEmail || '',
          locationCity: attributes.location?.city || '',
          locationRegion: attributes.location?.region || '',
          locationCountry: attributes.location?.country || '',
          salaryMin: attributes.salaryRange?.min ?? '',
          salaryMax: attributes.salaryRange?.max ?? '',
          salaryPeriod: attributes.salaryRange?.period || 'year',
          skills: attributes.skills?.data?.map((skill) => skill.id) || [],
        });
      } catch (err) {
        setError(err.message || 'Unable to load this role.');
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [jobId]);

  const toggleSkill = (skillId) => {
    setFormState((prev) => {
      const current = new Set(prev.skills);
      if (current.has(skillId)) {
        current.delete(skillId);
      } else {
        current.add(skillId);
      }
      return { ...prev, skills: Array.from(current) };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!formState.title.trim()) {
      setError('Role title is required.');
      return;
    }

    const hasLocation =
      formState.locationCity || formState.locationRegion || formState.locationCountry;
    if (hasLocation && !formState.locationCountry) {
      setError('Country is required when adding a location.');
      return;
    }

    const hasSalary = formState.salaryMin !== '' || formState.salaryMax !== '';

    const payload = {
      title: formState.title.trim(),
      status: formState.status,
      employmentType: formState.employmentType,
      experienceLevel: formState.experienceLevel,
      remoteType: formState.remoteType,
      postedAt: formState.postedAt ? new Date(formState.postedAt).toISOString() : undefined,
      applicationDeadline: formState.applicationDeadline || undefined,
      applyUrl: formState.applyUrl || undefined,
      applyEmail: formState.applyEmail || undefined,
      company: formState.companyId ? Number(formState.companyId) : null,
      skills: formState.skills.map((skillId) => Number(skillId)),
      location: hasLocation
        ? {
            city: formState.locationCity || undefined,
            region: formState.locationRegion || undefined,
            country: formState.locationCountry,
          }
        : null,
      salaryRange: hasSalary
        ? {
            min: parseNumber(formState.salaryMin),
            max: parseNumber(formState.salaryMax),
            period: formState.salaryPeriod,
            currency: 'EUR',
          }
        : null,
    };

    try {
      setSaving(true);
      const response = await fetch(isEditing ? `/api/jobs/${jobId}` : '/api/jobs', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || 'Unable to save this role.');
      }

      const data = await response.json();
      const savedId = data?.data?.id;
      setSuccess('Role saved successfully.');
      if (!isEditing && savedId) {
        router.push(`/jobs/${savedId}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err.message || 'Unable to save this role.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading role details...</p>;
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Role title</label>
          <Input value={formState.title} onChange={updateField('title')} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Company</label>
          <select
            className={selectClassName}
            value={formState.companyId}
            onChange={updateField('companyId')}
          >
            <option value="">Select company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Status</label>
          <select className={selectClassName} value={formState.status} onChange={updateField('status')}>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Employment</label>
          <select
            className={selectClassName}
            value={formState.employmentType}
            onChange={updateField('employmentType')}
          >
            {employmentOptions.map((option) => (
              <option key={option} value={option}>
                {option.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Experience</label>
          <select
            className={selectClassName}
            value={formState.experienceLevel}
            onChange={updateField('experienceLevel')}
          >
            {experienceOptions.map((option) => (
              <option key={option} value={option}>
                {option.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Remote</label>
          <select
            className={selectClassName}
            value={formState.remoteType}
            onChange={updateField('remoteType')}
          >
            {remoteOptions.map((option) => (
              <option key={option} value={option}>
                {option.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Posted date</label>
            <Input type="date" value={formState.postedAt} onChange={updateField('postedAt')} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Application deadline</label>
            <Input
              type="date"
              value={formState.applicationDeadline}
              onChange={updateField('applicationDeadline')}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Apply URL</label>
            <Input value={formState.applyUrl} onChange={updateField('applyUrl')} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Apply email</label>
            <Input type="email" value={formState.applyEmail} onChange={updateField('applyEmail')} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">City</label>
          <Input value={formState.locationCity} onChange={updateField('locationCity')} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Region</label>
          <Input value={formState.locationRegion} onChange={updateField('locationRegion')} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Country</label>
          <Input value={formState.locationCountry} onChange={updateField('locationCountry')} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-4">
        <h3 className="text-sm font-semibold text-slate-900">Salary range</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Minimum (EUR)</label>
            <Input type="number" value={formState.salaryMin} onChange={updateField('salaryMin')} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Maximum (EUR)</label>
            <Input type="number" value={formState.salaryMax} onChange={updateField('salaryMax')} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Period</label>
            <select
              className={selectClassName}
              value={formState.salaryPeriod}
              onChange={updateField('salaryPeriod')}
            >
              {periodOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-4">
        <h3 className="text-sm font-semibold text-slate-900">Key skills</h3>
        <p className="text-xs text-slate-500">Select the skills aligned with this role.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.length ? (
            skills.map((skill) => (
              <button
                key={skill.id}
                type="button"
                onClick={() => toggleSkill(skill.id)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  skillIds.has(skill.id)
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {skill.name}
              </button>
            ))
          ) : (
            <p className="text-sm text-slate-500">No skills available yet.</p>
          )}
        </div>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save role'}
        </Button>
        <Button asChild variant="outline">
          <Link href="/jobs">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
