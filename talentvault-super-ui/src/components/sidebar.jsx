'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  LineChart,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/candidates', label: 'Candidates', icon: Users },
  { href: '/analytics', label: 'Analytics', icon: LineChart },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col gap-6 border-r border-white/10 bg-slate-950 px-6 py-8 text-white lg:flex">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-rose-400 text-slate-900 font-semibold">
          TV
        </div>
        <div>
          <div className="text-lg font-semibold">TalentVault</div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/50">Command</div>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                active ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
        <div className="mb-2 text-sm font-semibold text-white">Vault status</div>
        Live sync enabled
      </div>
    </aside>
  );
}
