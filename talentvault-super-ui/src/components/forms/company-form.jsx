'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const sizeOptions = ['micro', 'small', 'medium', 'large', 'enterprise'];

const selectClassName =
  'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-slate-700 shadow-xs focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50';

const defaultState = {
  name: '',
  website: '',
  size: 'small',
  industryId: '',
  contactEmail: '',
  contactPhone: '',
  verified: false,
  locationCity: '',
  locationRegion: '',
  locationCountry: '',
};

export default function CompanyForm({ companyId }) {
  const router = useRouter();
  const [formState, setFormState] = useState(defaultState);
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(Boolean(companyId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isEditing = Boolean(companyId);

  const updateField = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const loadIndustries = async () => {
      try {
        const response = await fetch('/api/industries');
        if (!response.ok) return;
        const payload = await response.json();
        const list = payload?.data?.map((industry) => ({
          id: industry.id,
          name: industry?.attributes?.name || 'Industry',
        }));
        setIndustries(list || []);
      } catch (err) {
        // Ignore lookup errors to keep the form usable.
      }
    };

    loadIndustries();
  }, []);

  useEffect(() => {
    if (!companyId) return;

    const loadCompany = async () => {
      try {
        const response = await fetch(`/api/companies/${companyId}`);
        if (!response.ok) {
          throw new Error('Unable to load this company.');
        }
        const payload = await response.json();
        const attributes = payload?.data?.attributes || {};
        setFormState({
          name: attributes.name || '',
          website: attributes.website || '',
          size: attributes.size || 'small',
          industryId: attributes.industry?.data?.id ? String(attributes.industry.data.id) : '',
          contactEmail: attributes.contactEmail || '',
          contactPhone: attributes.contactPhone || '',
          verified: Boolean(attributes.verified),
          locationCity: attributes.location?.city || '',
          locationRegion: attributes.location?.region || '',
          locationCountry: attributes.location?.country || '',
        });
      } catch (err) {
        setError(err.message || 'Unable to load this company.');
      } finally {
        setLoading(false);
      }
    };

    loadCompany();
  }, [companyId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!formState.name.trim()) {
      setError('Company name is required.');
      return;
    }

    const hasLocation =
      formState.locationCity || formState.locationRegion || formState.locationCountry;
    if (hasLocation && !formState.locationCountry) {
      setError('Country is required when adding a location.');
      return;
    }

    const payload = {
      name: formState.name.trim(),
      website: formState.website || undefined,
      size: formState.size,
      industry: formState.industryId ? Number(formState.industryId) : null,
      contactEmail: formState.contactEmail || undefined,
      contactPhone: formState.contactPhone || undefined,
      verified: formState.verified,
      location: hasLocation
        ? {
            city: formState.locationCity || undefined,
            region: formState.locationRegion || undefined,
            country: formState.locationCountry,
          }
        : null,
    };

    try {
      setSaving(true);
      const response = await fetch(isEditing ? `/api/companies/${companyId}` : '/api/companies', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || 'Unable to save this company.');
      }

      const data = await response.json();
      const savedId = data?.data?.id;
      setSuccess('Company saved successfully.');
      if (!isEditing && savedId) {
        router.push(`/companies/${savedId}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err.message || 'Unable to save this company.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading company details...</p>;
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Company name</label>
          <Input value={formState.name} onChange={updateField('name')} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Website</label>
          <Input value={formState.website} onChange={updateField('website')} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Company size</label>
          <select className={selectClassName} value={formState.size} onChange={updateField('size')}>
            {sizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Industry</label>
          <select
            className={selectClassName}
            value={formState.industryId}
            onChange={updateField('industryId')}
          >
            <option value="">Select industry</option>
            {industries.map((industry) => (
              <option key={industry.id} value={industry.id}>
                {industry.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 pt-7">
          <input
            id="verified"
            type="checkbox"
            checked={formState.verified}
            onChange={updateField('verified')}
            className="h-4 w-4 accent-slate-900"
          />
          <label htmlFor="verified" className="text-sm text-slate-700">
            Verified account
          </label>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Contact email</label>
          <Input type="email" value={formState.contactEmail} onChange={updateField('contactEmail')} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Contact phone</label>
          <Input value={formState.contactPhone} onChange={updateField('contactPhone')} />
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

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save company'}
        </Button>
        <Button asChild variant="outline">
          <Link href="/companies">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
