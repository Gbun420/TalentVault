'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const portal = searchParams.get('portal') || 'employer';
  const defaultNext = portal === 'jobseeker' ? '/talent' : '/hq';
  const nextPath = searchParams.get('next') || defaultNext;
  const portalLabel = portal === 'jobseeker' ? 'Job Seeker' : 'Employer';
  const portalCopy =
    portal === 'jobseeker'
      ? 'Track applications, update your profile, and stay in sync with opportunities.'
      : 'Manage roles, pipelines, and hiring alignment for your team.';
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resolveNextPath = (path, userPortal) => {
    const portalHome = userPortal === 'jobseeker' ? '/talent' : '/hq';
    const allowedRoutes =
      userPortal === 'jobseeker'
        ? ['/talent', '/settings']
        : ['/hq', '/jobs', '/companies', '/candidates', '/analytics', '/settings'];

    return allowedRoutes.some((route) => path.startsWith(route)) ? path : portalHome;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, portal }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || 'Login failed. Check your credentials.');
      }

      const userPortal = payload?.portal || payload?.user?.portal || portal;
      const normalizedPortal = userPortal === 'jobseeker' ? 'jobseeker' : 'employer';
      router.push(resolveNextPath(nextPath, normalizedPortal));
      router.refresh();
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(250,214,165,0.5),_transparent_55%)] px-6 py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <Link href="/" className="text-sm font-semibold text-slate-600">
          Back to landing
        </Link>
        <div className="grid gap-10 rounded-[32px] border border-slate-200 bg-white/90 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{portalLabel} portal</p>
            <h1 className="font-display text-3xl text-slate-900">Sign in to your workspace.</h1>
            <p className="text-sm text-slate-600">{portalCopy}</p>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
              New here?{' '}
              <Link
                href={`/register?portal=${portal}&next=${encodeURIComponent(nextPath)}`}
                className="font-semibold text-slate-700"
              >
                Create your account
              </Link>
              .
            </div>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input
                type="email"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="you@talentvault.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen px-6 py-16">Loading sign-in...</div>}>
      <LoginForm />
    </Suspense>
  );
}
