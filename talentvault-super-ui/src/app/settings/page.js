import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-black/10 bg-white/80">
          <CardHeader>
            <CardTitle className="text-lg">Workspace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Workspace name</label>
              <Input defaultValue="TalentVault" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Primary region</label>
              <Input defaultValue="Europe (West)" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Default hiring cycle</label>
              <Input defaultValue="30 days" />
            </div>
            <Button className="w-fit">Save workspace settings</Button>
          </CardContent>
        </Card>

        <Card className="border-black/10 bg-white/80">
          <CardHeader>
            <CardTitle className="text-lg">Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
              <div>
                <div className="text-sm font-medium text-slate-900">Require 2FA</div>
                <div className="text-xs text-slate-500">Protect admin access</div>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-slate-900" />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
              <div>
                <div className="text-sm font-medium text-slate-900">Session timeout</div>
                <div className="text-xs text-slate-500">Auto logout after inactivity</div>
              </div>
              <input type="checkbox" className="h-4 w-4 accent-slate-900" />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
              <div>
                <div className="text-sm font-medium text-slate-900">Audit logging</div>
                <div className="text-xs text-slate-500">Track admin activity</div>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-slate-900" />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-black/10 bg-white/80">
          <CardHeader>
            <CardTitle className="text-lg">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
              <div>
                <div className="text-sm font-medium text-slate-900">Daily summary</div>
                <div className="text-xs text-slate-500">Pipeline digest every morning</div>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-slate-900" />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
              <div>
                <div className="text-sm font-medium text-slate-900">High score alerts</div>
                <div className="text-xs text-slate-500">Notify when match score &gt; 90</div>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-slate-900" />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
              <div>
                <div className="text-sm font-medium text-slate-900">New role intake</div>
                <div className="text-xs text-slate-500">Alert when roles need kickoff</div>
              </div>
              <input type="checkbox" className="h-4 w-4 accent-slate-900" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-black/10 bg-white/80">
          <CardHeader>
            <CardTitle className="text-lg">Integrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
              <div className="text-sm font-medium text-slate-900">Strapi Cloud</div>
              <p className="text-xs text-slate-500">Connected to production workspace</p>
              <Button variant="outline" className="mt-3">Manage</Button>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
              <div className="text-sm font-medium text-slate-900">Resume Matcher</div>
              <p className="text-xs text-slate-500">Awaiting service deployment</p>
              <Button variant="outline" className="mt-3">Configure</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
