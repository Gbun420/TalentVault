'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LeadForm() {
  const [formState, setFormState] = useState({
    fullName: '',
    email: '',
    company: '',
    role: '',
    message: '',
  });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const updateField = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setStatus('submitting');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || 'Unable to submit your request.');
      }

      setStatus('success');
      setFormState({
        fullName: '',
        email: '',
        company: '',
        role: '',
        message: '',
      });
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Unable to submit your request.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          placeholder="Full name"
          value={formState.fullName}
          onChange={(event) => updateField('fullName', event.target.value)}
          required
        />
        <Input
          type="email"
          placeholder="Work email"
          value={formState.email}
          onChange={(event) => updateField('email', event.target.value)}
          required
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          placeholder="Company"
          value={formState.company}
          onChange={(event) => updateField('company', event.target.value)}
        />
        <Input
          placeholder="Role"
          value={formState.role}
          onChange={(event) => updateField('role', event.target.value)}
        />
      </div>
      <Input
        placeholder="What do you want to solve first?"
        value={formState.message}
        onChange={(event) => updateField('message', event.target.value)}
      />
      {status === 'success' ? (
        <p className="text-sm text-emerald-200">Thanks - we will reach out shortly.</p>
      ) : null}
      {status === 'error' ? <p className="text-sm text-rose-200">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending...' : 'Request access'}
      </Button>
    </form>
  );
}
