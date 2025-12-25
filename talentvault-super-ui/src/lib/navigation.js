import {
  LayoutDashboard,
  Briefcase,
  Building2,
  Users,
  LineChart,
  Settings,
} from 'lucide-react';

export const employerNavItems = [
  {
    href: '/hq',
    label: 'Overview',
    icon: LayoutDashboard,
  },
  {
    href: '/jobs',
    label: 'Jobs',
    icon: Briefcase,
  },
  {
    href: '/companies',
    label: 'Companies',
    icon: Building2,
  },
  {
    href: '/candidates',
    label: 'Candidates',
    icon: Users,
  },
  {
    href: '/analytics',
    label: 'Analytics',
    icon: LineChart,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
  },
];

export const jobSeekerNavItems = [
  {
    href: '/talent',
    label: 'My Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
  },
];

export const getNavItems = (portal) =>
  portal === 'jobseeker' ? jobSeekerNavItems : employerNavItems;

const pageMeta = {
  '/hq': {
    title: 'TalentVault HQ',
    description: 'Daily signal on hiring momentum and pipeline health.',
  },
  '/jobs': {
    title: 'Roles in Motion',
    description: 'Open roles, hiring velocity, and role readiness.',
  },
  '/companies': {
    title: 'Company Ledger',
    description: 'Hiring partners, account health, and engagement context.',
  },
  '/candidates': {
    title: 'Talent Flow',
    description: 'Pipeline strength, availability, and match intelligence.',
  },
  '/analytics': {
    title: 'Decision Intelligence',
    description: 'Trends, conversion rates, and growth levers.',
  },
  '/settings': {
    title: 'Vault Controls',
    description: 'Workspace rules, integrations, and guardrails.',
  },
  '/talent': {
    title: 'My Talent Hub',
    description: 'Track applications, interviews, and profile readiness.',
  },
};

export const resolvePageMeta = (pathname) =>
  pageMeta[pathname] || {
    title: 'TalentVault',
    description: 'Command center for hiring operations.',
  };
