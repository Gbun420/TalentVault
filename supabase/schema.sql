-- Supabase schema for Malta CV Directory
-- Auth: Supabase Auth (auth.users); GDPR: soft deletes via deleted_at, never hard-delete PII automatically.

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('jobseeker', 'employer', 'admin');
  end if;
  if not exists (select 1 from pg_type where typname = 'cv_visibility') then
    create type public.cv_visibility as enum ('public', 'employers_only', 'hidden');
  end if;
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum ('pending', 'succeeded', 'failed', 'refunded');
  end if;
  if not exists (select 1 from pg_type where typname = 'payment_type') then
    create type public.payment_type as enum ('unlock', 'boost', 'subscription');
  end if;
  if not exists (select 1 from pg_type where typname = 'moderation_status') then
    create type public.moderation_status as enum ('pending', 'approved', 'rejected', 'suspended');
  end if;
  if not exists (select 1 from pg_type where typname = 'subscription_status') then
    create type public.subscription_status as enum ('active', 'incomplete', 'past_due', 'canceled');
  end if;
end$$;

-- Profiles (auth.users mirror)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role public.user_role not null default 'jobseeker',
  full_name text not null,
  email text not null,
  phone text,
  location text default 'Malta',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles: owner or admin can select"
  on public.profiles for select
  using (
    deleted_at is null and (
      auth.uid() = id
      or (select role from public.profiles p where p.id = auth.uid()) = 'admin'
    )
  );

create policy "Profiles: owner or admin can update"
  on public.profiles for update
  using (
    auth.uid() = id
    or (select role from public.profiles p where p.id = auth.uid()) = 'admin'
  );

create policy "Profiles: self-insert"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Jobseeker core profile (directory-safe fields)
create table if not exists public.jobseeker_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  headline text not null,
  summary text,
  skills text[] not null default '{}',
  preferred_roles text[] not null default '{}',
  years_experience int,
  availability text default 'immediately',
  languages text[] not null default '{}',
  location text not null default 'Malta',
  visibility public.cv_visibility not null default 'public',
  boosted boolean not null default false,
  boost_expires_at timestamptz,
  moderation_status public.moderation_status not null default 'approved',
  work_permit_status text,
  salary_expectation_eur integer,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.jobseeker_profiles enable row level security;

create policy "Jobseeker profiles: owner or admin manage"
  on public.jobseeker_profiles for all
  using (
    (auth.uid() = id and deleted_at is null)
    or (select role from public.profiles p where p.id = auth.uid()) = 'admin'
  )
  with check (
    auth.uid() = id
    or (select role from public.profiles p where p.id = auth.uid()) = 'admin'
  );

create policy "Jobseeker profiles: directory view (non-hidden, approved)"
  on public.jobseeker_profiles for select
  using (
    deleted_at is null
    and visibility in ('public', 'employers_only')
    and moderation_status = 'approved'
  );

-- Contact details (kept separate to gate unlocks)
create table if not exists public.jobseeker_contacts (
  jobseeker_id uuid primary key references public.profiles(id) on delete cascade,
  contact_email text,
  phone text,
  cv_storage_path text,
  cv_public_url text,
  allow_email boolean not null default true,
  allow_phone boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.jobseeker_contacts enable row level security;

create policy "Jobseeker contacts: owner or admin manage"
  on public.jobseeker_contacts for all
  using (
    (auth.uid() = jobseeker_id and deleted_at is null)
    or (select role from public.profiles p where p.id = auth.uid()) = 'admin'
  )
  with check (
    auth.uid() = jobseeker_id
    or (select role from public.profiles p where p.id = auth.uid()) = 'admin'
  );

create policy "Jobseeker contacts: unlocked employers may select"
  on public.jobseeker_contacts for select
  using (
    deleted_at is null and (
      auth.uid() = jobseeker_id
      or (select role from public.profiles p where p.id = auth.uid()) = 'admin'
      or exists (
        select 1 from public.unlocked_contacts uc
        where uc.jobseeker_id = jobseeker_contacts.jobseeker_id
          and uc.employer_id = auth.uid()
      )
    )
  );

-- Structured CV data
create table if not exists public.work_experiences (
  id uuid primary key default gen_random_uuid(),
  jobseeker_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  company text not null,
  start_date date not null,
  end_date date,
  is_current boolean not null default false,
  location text,
  description text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.work_experiences enable row level security;

create policy "Work exp: owner/admin manage"
  on public.work_experiences for all
  using (
    (auth.uid() = jobseeker_id and deleted_at is null)
    or (select role from public.profiles p where p.id = auth.uid()) = 'admin'
  )
  with check (
    auth.uid() = jobseeker_id
    or (select role from public.profiles p where p.id = auth.uid()) = 'admin'
  );

create policy "Work exp: directory view aligned with profile visibility"
  on public.work_experiences for select
  using (
    deleted_at is null and exists (
      select 1 from public.jobseeker_profiles jp
      where jp.id = work_experiences.jobseeker_id
        and jp.deleted_at is null
        and jp.moderation_status = 'approved'
        and jp.visibility in ('public', 'employers_only')
    )
  );

create table if not exists public.educations (
  id uuid primary key default gen_random_uuid(),
  jobseeker_id uuid not null references public.profiles(id) on delete cascade,
  school text not null,
  degree text,
  field_of_study text,
  start_year int,
  end_year int,
  description text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.educations enable row level security;

create policy "Education: owner/admin manage"
  on public.educations for all
  using (
    (auth.uid() = jobseeker_id and deleted_at is null)
    or (select role from public.profiles p where p.id = auth.uid()) = 'admin'
  )
  with check (
    auth.uid() = jobseeker_id
    or (select role from public.profiles p where p.id = auth.uid()) = 'admin'
  );

create policy "Education: directory view aligned with profile visibility"
  on public.educations for select
  using (
    deleted_at is null and exists (
      select 1 from public.jobseeker_profiles jp
      where jp.id = educations.jobseeker_id
        and jp.deleted_at is null
        and jp.moderation_status = 'approved'
        and jp.visibility in ('public', 'employers_only')
    )
  );

create table if not exists public.certifications (
  id uuid primary key default gen_random_uuid(),
  jobseeker_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  issuer text,
  issued_on date,
  expires_on date,
  credential_url text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.certifications enable row level security;

create policy "Certifications: owner/admin manage"
  on public.certifications for all
  using (
    (auth.uid() = jobseeker_id and deleted_at is null)
    or (select role from public.profiles p where p.id = auth.uid()) = 'admin'
  )
  with check (
    auth.uid() = jobseeker_id
    or (select role from public.profiles p where p.id = auth.uid()) = 'admin'
  );

create policy "Certifications: directory view aligned with profile visibility"
  on public.certifications for select
  using (
    deleted_at is null and exists (
      select 1 from public.jobseeker_profiles jp
      where jp.id = certifications.jobseeker_id
        and jp.deleted_at is null
        and jp.moderation_status = 'approved'
        and jp.visibility in ('public', 'employers_only')
    )
  );

-- Employers
create table if not exists public.employers (
  id uuid primary key references public.profiles(id) on delete cascade,
  company_name text not null,
  company_size text,
  industry text,
  website text,
  billing_email text,
  vat_number text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.employers enable row level security;

create policy "Employers: owner/admin manage"
  on public.employers for all
  using (
    (auth.uid() = id and deleted_at is null)
    or (select role from public.profiles p where p.id = auth.uid()) = 'admin'
  )
  with check (
    auth.uid() = id
    or (select role from public.profiles p where p.id = auth.uid()) = 'admin'
  );

-- Unlock tracking (employers pay to unlock contact)
create table if not exists public.unlocked_contacts (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.profiles(id) on delete cascade,
  jobseeker_id uuid not null references public.profiles(id) on delete cascade,
  payment_id uuid references public.payments(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (employer_id, jobseeker_id)
);

alter table public.unlocked_contacts enable row level security;

create policy "Unlocks: employer or admin can view"
  on public.unlocked_contacts for select
  using (
    auth.uid() = employer_id
    or (select role from public.profiles p where p.id = auth.uid()) = 'admin'
  );

create policy "Unlocks: service role inserts"
  on public.unlocked_contacts for insert
  with check (true);

-- Subscription plans (static catalogue)
create table if not exists public.subscription_plans (
  plan_code text primary key,
  name text not null,
  description text,
  price_cents integer not null,
  currency text not null default 'eur',
  interval text not null check (interval in ('month', 'year')),
  unlocks_included integer not null default 0,
  boosts_included integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.subscription_plans enable row level security;

create policy "Plans: readable by all"
  on public.subscription_plans for select
  using (true);

create policy "Plans: admin manage"
  on public.subscription_plans for all
  using (
    (select role from public.profiles p where p.id = auth.uid()) = 'admin'
  );

-- Employer subscriptions (Stripe)
create table if not exists public.employer_subscriptions (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.profiles(id) on delete cascade,
  plan_code text not null references public.subscription_plans(plan_code),
  stripe_customer_id text,
  stripe_subscription_id text,
  status public.subscription_status not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.employer_subscriptions enable row level security;

create policy "Employer subscriptions: owner/admin read"
  on public.employer_subscriptions for select
  using (
    auth.uid() = employer_id
    or (select role from public.profiles p where p.id = auth.uid()) = 'admin'
  );

create policy "Employer subscriptions: owner/admin update"
  on public.employer_subscriptions for update
  using (
    auth.uid() = employer_id
    or (select role from public.profiles p where p.id = auth.uid()) = 'admin'
  );

create policy "Employer subscriptions: service role inserts"
  on public.employer_subscriptions for insert
  with check (true);

-- Payments (Stripe checkout/intents)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  jobseeker_id uuid references public.profiles(id) on delete cascade,
  amount_cents integer not null,
  currency text not null default 'eur',
  payment_type public.payment_type not null,
  status public.payment_status not null default 'pending',
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  stripe_invoice_id text,
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "Payments: owner/admin read"
  on public.payments for select
  using (
    auth.uid() = user_id
    or (select role from public.profiles p where p.id = auth.uid()) = 'admin'
  );

create policy "Payments: service role inserts"
  on public.payments for insert
  with check (true);

create policy "Payments: service role updates"
  on public.payments for update
  using (true)
  with check (true);

-- Moderation flags
create table if not exists public.moderation_flags (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('jobseeker_profile', 'employer', 'work_experience', 'education', 'certification')),
  subject_id uuid not null,
  raised_by uuid references public.profiles(id) on delete set null,
  assigned_admin_id uuid references public.profiles(id) on delete set null,
  status public.moderation_status not null default 'pending',
  reason text,
  notes text,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.moderation_flags enable row level security;

create policy "Moderation: admins full access"
  on public.moderation_flags for all
  using (
    (select role from public.profiles p where p.id = auth.uid()) = 'admin'
  )
  with check (
    (select role from public.profiles p where p.id = auth.uid()) = 'admin'
  );

create policy "Moderation: authenticated can file"
  on public.moderation_flags for insert
  with check (auth.role() = 'authenticated');

create policy "Moderation: reporters can view own"
  on public.moderation_flags for select
  using (
    raised_by = auth.uid()
    or (select role from public.profiles p where p.id = auth.uid()) = 'admin'
  );

-- Public directory view (non-sensitive fields only)
create or replace view public.public_cv_directory as
select
  jp.id,
  p.full_name,
  jp.headline,
  jp.summary,
  jp.skills,
  jp.preferred_roles,
  jp.years_experience,
  jp.availability,
  jp.work_permit_status,
  jp.languages,
  jp.location,
  jp.boosted,
  jp.boost_expires_at,
  jp.updated_at
from public.jobseeker_profiles jp
join public.profiles p on p.id = jp.id
where jp.deleted_at is null
  and jp.visibility in ('public', 'employers_only')
  and jp.moderation_status = 'approved';

grant select on public.public_cv_directory to anon, authenticated;

-- Storage bucket for CV files
insert into storage.buckets (id, name, public)
values ('cv-files', 'cv-files', false)
on conflict do nothing;

create policy "CV files: jobseeker owns path"
  on storage.objects for insert
  with check (
    bucket_id = 'cv-files'
    and auth.role() = 'authenticated'
    and auth.uid()::text = split_part(name, '/', 1)
  );

create policy "CV files: jobseeker can read own"
  on storage.objects for select using (
    bucket_id = 'cv-files'
    and auth.uid()::text = split_part(name, '/', 1)
  );

create policy "CV files: jobseeker can update own"
  on storage.objects for update using (
    bucket_id = 'cv-files'
    and auth.uid()::text = split_part(name, '/', 1)
  )
  with check (
    bucket_id = 'cv-files'
    and auth.uid()::text = split_part(name, '/', 1)
  );

create policy "CV files: service role read"
  on storage.objects for select
  using (bucket_id = 'cv-files');

-- Indexes for search/performance
create index if not exists idx_jobseeker_profiles_tsv
  on public.jobseeker_profiles
  using gin (to_tsvector('english', coalesce(headline, '') || ' ' || coalesce(summary, '')));

create index if not exists idx_jobseeker_profiles_skills_gin
  on public.jobseeker_profiles using gin (skills);

create index if not exists idx_jobseeker_profiles_roles_gin
  on public.jobseeker_profiles using gin (preferred_roles);

create index if not exists idx_jobseeker_profiles_visibility
  on public.jobseeker_profiles (visibility, moderation_status)
  where deleted_at is null;

create index if not exists idx_jobseeker_profiles_boosted
  on public.jobseeker_profiles (boosted, boost_expires_at desc);

create index if not exists idx_jobseeker_profiles_salary
  on public.jobseeker_profiles (salary_expectation_eur);

create index if not exists idx_work_experiences_jobseeker
  on public.work_experiences (jobseeker_id)
  where deleted_at is null;

create index if not exists idx_educations_jobseeker
  on public.educations (jobseeker_id)
  where deleted_at is null;

create index if not exists idx_certifications_jobseeker
  on public.certifications (jobseeker_id)
  where deleted_at is null;

create index if not exists idx_unlocked_contacts_employer
  on public.unlocked_contacts (employer_id, created_at desc);

create index if not exists idx_payments_user
  on public.payments (user_id, created_at desc);

create index if not exists idx_moderation_subject
  on public.moderation_flags (subject_type, subject_id);
