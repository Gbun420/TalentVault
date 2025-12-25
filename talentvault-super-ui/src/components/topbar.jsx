'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Menu, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getNavItems, resolvePageMeta } from '@/lib/navigation';

export default function Topbar({ portal }) {
  const pathname = usePathname();
  const router = useRouter();
  const meta = resolvePageMeta(pathname);
  const navItems = getNavItems(portal);

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6 border-b border-black/10 pb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-full lg:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">TalentVault</p>
            <h1 className="font-display text-3xl font-semibold text-slate-900">{meta.title}</h1>
            <p className="text-sm text-muted-foreground">{meta.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="w-64 pl-9" placeholder="Search jobs, talent, companies" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
                <Bell className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                Notifications
              </div>
              <DropdownMenuItem className="text-sm text-slate-600">
                No new alerts yet.
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" className="rounded-full px-4 py-2 text-xs" onClick={handleSignOut}>
            Sign out
          </Button>
          <div className="flex items-center gap-3 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 shadow-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
              GB
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-slate-900">Glenn Bundy</div>
              <div className="text-[11px] text-slate-500">Founder</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:hidden">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input className="w-full pl-9" placeholder="Search jobs, talent, companies" />
        </div>
      </div>
    </div>
  );
}
