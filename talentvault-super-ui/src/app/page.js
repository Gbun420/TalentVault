import Link from 'next/link';
import { ArrowUpRight, Globe2, Sparkles, ShieldCheck } from 'lucide-react';
import LeadForm from '@/components/lead-form';

const metrics = [
  { label: 'Avg. time to shortlist', value: '5 days' },
  { label: 'Qualified candidates surfaced', value: '48%' },
  { label: 'Global talent markets', value: '32' },
  { label: 'Hiring signals tracked', value: '120+' },
];

const pillars = [
  {
    title: 'Talent intelligence',
    description:
      'Unify candidate, role, and market signals so every search starts with clarity and momentum.',
  },
  {
    title: 'Pipeline command',
    description:
      'Visualize velocity, risks, and next moves across every hiring squad in one workspace.',
  },
  {
    title: 'Signal matching',
    description:
      'Pair resumes with job narratives using AI scoring and skill alignment you can explain.',
  },
];

const productLines = [
  {
    name: 'Role Studio',
    detail: 'Intake frameworks, calibrated scorecards, and market guidance in minutes.',
    tag: 'Strategy',
  },
  {
    name: 'Talent Graph',
    detail: 'Live talent pools with enrichment, outreach tracking, and decision history.',
    tag: 'Pipeline',
  },
  {
    name: 'Match Lab',
    detail: 'Resume parsing, skill matching, and confidence scoring in one workflow.',
    tag: 'AI Assist',
  },
  {
    name: 'Growth Signals',
    detail: 'Executive dashboards for hiring velocity, demand, and partner readiness.',
    tag: 'Analytics',
  },
];

const steps = [
  {
    step: '01',
    title: 'Align on the role narrative',
    detail: 'Turn hiring goals into measurable scorecards, benchmarks, and outreach targets.',
  },
  {
    step: '02',
    title: 'Activate the talent vault',
    detail: 'Surface qualified candidates and prioritize who to contact next.',
  },
  {
    step: '03',
    title: 'Run the hiring sprint',
    detail: 'Track progress, unblock teams, and keep decision makers aligned.',
  },
];

const proofPoints = [
  'Shortlist delivery down from weeks to days.',
  'Pipeline visibility across hiring partners and founders.',
  'Match scoring tied directly to role requirements.',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 text-sm font-semibold text-slate-900">
              TV
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">TalentVault</div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Malta HQ</div>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <a className="hover:text-slate-900" href="#platform">Platform</a>
            <a className="hover:text-slate-900" href="#product">Product</a>
            <a className="hover:text-slate-900" href="#method">Method</a>
            <a className="hover:text-slate-900" href="#security">Security</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/hq"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300"
            >
              Launch HQ
            </Link>
            <a
              href="#contact"
              className="hidden items-center gap-1 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 md:flex"
            >
              Request access
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 pb-24 pt-16">
        <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
              <Sparkles className="h-4 w-4" />
              Talent operating system
            </div>
            <h1 className="font-display text-4xl leading-tight text-slate-950 md:text-5xl">
              A strategic landing zone for hiring leaders who move fast.
            </h1>
            <p className="text-lg text-slate-600">
              TalentVault unifies executive search, pipeline visibility, and AI matching so every role
              turns into a confident hire. Built for Malta teams scaling globally.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/hq"
                className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Enter TalentVault HQ
              </Link>
              <a
                href="#product"
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400"
              >
                Explore the platform
              </a>
            </div>
            <div className="grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
              {proofPoints.map((point) => (
                <div key={point} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-400" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-br from-amber-200/60 via-transparent to-slate-200/60 blur-2xl" />
            <div className="relative rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Signal board</p>
                  <h2 className="text-xl font-semibold text-slate-900">Hiring momentum</h2>
                </div>
                <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Live
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{metric.value}</div>
                      <div className="text-xs text-slate-500">{metric.label}</div>
                    </div>
                    <div className="text-xs font-semibold text-slate-500">Updated now</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="platform" className="space-y-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Platform</p>
              <h2 className="text-3xl font-semibold text-slate-900">A strategic command layer for talent.</h2>
            </div>
            <div className="hidden items-center gap-2 text-sm text-slate-500 md:flex">
              <Globe2 className="h-4 w-4" />
              Malta and EU-first data posture
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-[28px] border border-slate-200 bg-white px-6 py-8 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
              >
                <h3 className="text-lg font-semibold text-slate-900">{pillar.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{pillar.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="product" className="grid gap-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Product suite</p>
              <h2 className="text-3xl font-semibold text-slate-900">Every team gets a clear view.</h2>
            </div>
            <a href="#contact" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
              Talk to the team
            </a>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {productLines.map((line) => (
              <div
                key={line.name}
                className="flex flex-col justify-between rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
              >
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-amber-500">{line.tag}</div>
                  <h3 className="mt-3 text-xl font-semibold text-slate-900">{line.name}</h3>
                  <p className="mt-2 text-sm text-slate-600">{line.detail}</p>
                </div>
                <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                  <span>Configured for Malta hiring teams</span>
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="method" className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Method</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">Run every search with focus.</h2>
            <p className="mt-4 text-sm text-slate-600">
              TalentVault keeps hiring partners aligned with a shared narrative, prioritized pipeline,
              and measurable outcomes.
            </p>
          </div>
          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.step} className="rounded-[28px] border border-slate-200 bg-white px-6 py-5">
                <div className="flex items-start gap-4">
                  <div className="text-lg font-semibold text-amber-500">{step.step}</div>
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{step.title}</div>
                    <p className="mt-2 text-sm text-slate-600">{step.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="security" className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <h3 className="text-lg font-semibold text-slate-900">Security and trust</h3>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              Malta-based data governance, audit-ready activity logs, and role-based permissions keep
              your hiring operations compliant.
            </p>
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                GDPR-aware data residency and access policies.
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Secure uploads with media access controls.
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                API governance for hiring partners and vendors.
              </div>
            </div>
          </div>
          <div id="contact" className="rounded-[32px] border border-slate-900 bg-slate-900 p-8 text-white">
            <h3 className="text-2xl font-semibold">Ready to activate your vault?</h3>
            <p className="mt-3 text-sm text-white/70">
              Launch the HQ or request access for your recruiting team. We will help configure your
              hiring blueprint.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/hq"
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900"
              >
                Launch HQ
              </Link>
              <a
                href="/hq"
                className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Schedule onboarding
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/10 bg-white/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <span>TalentVault - Malta</span>
          <span>Talent intelligence platform for modern hiring teams.</span>
        </div>
      </footer>
    </div>
  );
}
