'use client';

import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Topbar() {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200/60 pb-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">TalentVault HQ</h1>
        <p className="text-sm text-slate-500">Daily signal on hiring momentum and pipeline health.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input className="w-64 pl-9" placeholder="Search jobs, talent, companies" />
        </div>
        <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
            GB
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-900">Glenn Bundy</div>
            <div className="text-[11px] text-slate-500">Founder</div>
          </div>
        </div>
      </div>
    </div>
  );
}
