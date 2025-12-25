'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const availabilityOptions = ['immediate', 'two_weeks', 'one_month', 'three_months', 'open'];
const visibilityOptions = ['public', 'private', 'unlisted'];
const moderationOptions = ['pending', 'approved', 'flagged', 'suspended'];
const periodOptions = ['hour', 'month', 'year'];

const selectClassName =
  'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-slate-700 shadow-xs focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50';

const defaultState = {
  fullName: '',
  headline: '',
  availability: 'open',
  yearsExperience: '',
  resumeScore: '',
  visibility: 'public',
  moderationStatus: 'pending',
  locationCity: '',
  locationRegion: '',
  locationCountry: '',
  desiredMin: '',
  desiredMax: '',
  desiredPeriod: 'year',
  skills: [],
};

const parseNumber = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export default function CandidateForm({ candidateId }) {
  const router = useRouter();
  const [formState, setFormState] = useState(defaultState);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(Boolean(candidateId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isEditing = Boolean(candidateId);
  const skillIds = useMemo(() => new Set(formState.skills), [formState.skills]);

  const updateField = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const response = await fetch('/api/skills');
        if (!response.ok) return;
        const payload = await response.json();
        const list = payload?.data?.map((skill) => ({
          id: skill.id,
          name: skill?.attributes?.name || 'Skill',
        }));
        setSkills(list || []);
      } catch (err) {
        // Ignore lookup errors to keep the form usable.
      }
    };

    loadSkills();
  }, []);

  useEffect(() => {
    if (!candidateId) return;

    const loadCandidate = async () => {
      try {
        const response = await fetch(`/api/candidates/${candidateId}`);
        if (!response.ok) {
          throw new Error('Unable to load this profile.');
        }
        const payload = await response.json();
        const attributes = payload?.data?.attributes || {};
        setFormState({
          fullName: attributes.fullName || '',
          headline: attributes.headline || '',
          availability: attributes.availability || 'open',
          yearsExperience: attributes.yearsExperience ?? '',
          resumeScore: attributes.resumeScore ?? '',
          visibility: attributes.visibility || 'public',
          moderationStatus: attributes.moderationStatus || 'pending',
          locationCity: attributes.location?.city || '',
          locationRegion: attributes.location?.region || '',
          locationCountry: attributes.location?.country || '',
          desiredMin: attributes.desiredSalary?.min ?? '',
          desiredMax: attributes.desiredSalary?.max ?? '',
          desiredPeriod: attributes.desiredSalary?.period || 'year',
          skills: attributes.skills?.data?.map((skill) => skill.id) || [],
        });
      } catch (err) {
        setError(err.message || 'Unable to load this profile.');
      } finally {
        setLoading(false);
      }
    };

    loadCandidate();
  }, [candidateId]);

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

    if (!formState.fullName.trim()) {
      setError('Full name is required.');
      return;
    }

    const hasLocation =
      formState.locationCity || formState.locationRegion || formState.locationCountry;
    if (hasLocation && !formState.locationCountry) {
      setError('Country is required when adding a location.');
      return;
    }

    const hasSalary = formState.desiredMin !== '' || formState.desiredMax !== '';

    const payload = {
      fullName: formState.fullName.trim(),
      headline: formState.headline || undefined,
      availability: formState.availability,
      yearsExperience: parseNumber(formState.yearsExperience),
      resumeScore: parseNumber(formState.resumeScore),
      visibility: formState.visibility,
      moderationStatus: formState.moderationStatus,
      skills: formState.skills.map((skillId) => Number(skillId)),
      location: hasLocation
        ? {
            city: formState.locationCity || undefined,
            region: formState.locationRegion || undefined,
            country: formState.locationCountry,
          }
        : null,
      desiredSalary: hasSalary
        ? {
            min: parseNumber(formState.desiredMin),
            max: parseNumber(formState.desiredMax),
            period: formState.desiredPeriod,
            currency: 'EUR',
          }
        : null,
    };

    try {
      setSaving(true);
      const response = await fetch(isEditing ? `/api/candidates/${candidateId}` : '/api/candidates', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || 'Unable to save this profile.');
      }

      const data = await response.json();
      const savedId = data?.data?.id;
      setSuccess('Candidate saved successfully.');
      if (!isEditing && savedId) {
        router.push(`/candidates/${savedId}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err.message || 'Unable to save this profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading candidate profile...</p>;
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Full name</label>
          <Input value={formState.fullName} onChange={updateField('fullName')} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Headline</label>
          <Input value={formState.headline} onChange={updateField('headline')} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Availability</label>
          <select
            className={selectClassName}
            value={formState.availability}
            onChange={updateField('availability')}
          >
            {availabilityOptions.map((option) => (
              <option key={option} value={option}>
                {option.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Experience (yrs)</label>
          <Input
            type="number"
            value={formState.yearsExperience}
            onChange={updateField('yearsExperience')}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Resume score</label>
          <Input
            type="number"
            value={formState.resumeScore}
            onChange={updateField('resumeScore')}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Visibility</label>
          <select
            className={selectClassName}
            value={formState.visibility}
            onChange={updateField('visibility')}
          >
            {visibilityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Moderation</label>
          <select
            className={selectClassName}
            value={formState.moderationStatus}
            onChange={updateField('moderationStatus')}
          >
            {moderationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
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
        <h3 className="text-sm font-semibold text-slate-900">Desired salary</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Minimum (EUR)</label>
            <Input type="number" value={formState.desiredMin} onChange={updateField('desiredMin')} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Maximum (EUR)</label>
            <Input type="number" value={formState.desiredMax} onChange={updateField('desiredMax')} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Period</label>
            <select
              className={selectClassName}
              value={formState.desiredPeriod}
              onChange={updateField('desiredPeriod')}
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
        <h3 className="text-sm font-semibold text-slate-900">Skill tags</h3>
        <p className="text-xs text-slate-500">Toggle relevant skills for this candidate.</p>
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
          {saving ? 'Saving...' : 'Save candidate'}
        </Button>
        <Button asChild variant="outline">
          <Link href="/candidates">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
