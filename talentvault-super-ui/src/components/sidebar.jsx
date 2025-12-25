'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getNavItems } from '@/lib/navigation';

export default function Sidebar({ portal }) {
  const pathname = usePathname();
  const navItems = getNavItems(portal);

  return (
    <aside className="relative sticky top-0 hidden h-screen w-64 flex-col border-r border-black/10 bg-sidebar text-sidebar-foreground lg:flex">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(247,198,106,0.35),_transparent_55%)] opacity-70" />
      <div className="relative z-10 flex h-full flex-col gap-6">
        <div className="flex items-center gap-3 px-6 pt-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 text-slate-950 text-sm font-semibold">
            TV
          </div>
          <div>
            <div className="text-lg font-semibold">TalentVault</div>
            <div className="text-xs uppercase tracking-[0.25em] text-sidebar-foreground/50">
              {portal === 'jobseeker' ? 'Talent' : 'Command'}
            </div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-2 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                  active
                    ? 'bg-white/15 text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)]'
                    : 'text-sidebar-foreground/70 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 pb-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-sidebar-foreground/70">
            <div className="mb-2 text-sm font-semibold text-white">Vault status</div>
            {portal === 'jobseeker'
              ? 'Profile sync enabled. Keep your details current.'
              : 'Live sync enabled across 3 regions.'}
          </div>
        </div>
      </div>
    </aside>
  );
}
