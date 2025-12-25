import {
  LayoutDashboard,
  Briefcase,
  Users,
  LineChart,
  Settings,
} from 'lucide-react';

export const navItems = [
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

const pageMeta = {
  '/hq': {
    title: 'TalentVault HQ',
    description: 'Daily signal on hiring momentum and pipeline health.',
  },
  '/jobs': {
    title: 'Roles in Motion',
    description: 'Open roles, hiring velocity, and role readiness.',
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
};

export const resolvePageMeta = (pathname) =>
  pageMeta[pathname] || {
    title: 'TalentVault',
    description: 'Command center for hiring operations.',
  };
