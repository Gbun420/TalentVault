'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const STORAGE_KEY = 'tv_settings';

const defaultSettings = {
  workspaceName: 'TalentVault',
  primaryRegion: 'Europe (West)',
  defaultCycle: '30 days',
  security: {
    require2fa: true,
    sessionTimeout: false,
    auditLogging: true,
  },
  notifications: {
    dailySummary: true,
    highScoreAlerts: true,
    newRoleIntake: false,
  },
};

const loadStoredSettings = () => {
  if (typeof window === 'undefined') return defaultSettings;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultSettings;
  try {
    const parsed = JSON.parse(stored);
    return { ...defaultSettings, ...parsed };
  } catch (error) {
    return defaultSettings;
  }
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(loadStoredSettings);
  const [saved, setSaved] = useState(false);

  const updateField = (field) => (event) => {
    setSettings((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const updateToggle = (section, field) => (event) => {
    const checked = event.target.checked;
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: checked,
      },
    }));
  };

  const handleSave = () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const openIntegration = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

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
              <Input value={settings.workspaceName} onChange={updateField('workspaceName')} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Primary region</label>
              <Input value={settings.primaryRegion} onChange={updateField('primaryRegion')} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Default hiring cycle</label>
              <Input value={settings.defaultCycle} onChange={updateField('defaultCycle')} />
            </div>
            <div className="flex items-center gap-3">
              <Button className="w-fit" onClick={handleSave}>
                Save workspace settings
              </Button>
              {saved ? <span className="text-xs text-emerald-600">Saved</span> : null}
            </div>
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
              <input
                type="checkbox"
                checked={settings.security.require2fa}
                onChange={updateToggle('security', 'require2fa')}
                className="h-4 w-4 accent-slate-900"
              />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
              <div>
                <div className="text-sm font-medium text-slate-900">Session timeout</div>
                <div className="text-xs text-slate-500">Auto logout after inactivity</div>
              </div>
              <input
                type="checkbox"
                checked={settings.security.sessionTimeout}
                onChange={updateToggle('security', 'sessionTimeout')}
                className="h-4 w-4 accent-slate-900"
              />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
              <div>
                <div className="text-sm font-medium text-slate-900">Audit logging</div>
                <div className="text-xs text-slate-500">Track admin activity</div>
              </div>
              <input
                type="checkbox"
                checked={settings.security.auditLogging}
                onChange={updateToggle('security', 'auditLogging')}
                className="h-4 w-4 accent-slate-900"
              />
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
              <input
                type="checkbox"
                checked={settings.notifications.dailySummary}
                onChange={updateToggle('notifications', 'dailySummary')}
                className="h-4 w-4 accent-slate-900"
              />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
              <div>
                <div className="text-sm font-medium text-slate-900">High score alerts</div>
                <div className="text-xs text-slate-500">Notify when match score &gt; 90</div>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.highScoreAlerts}
                onChange={updateToggle('notifications', 'highScoreAlerts')}
                className="h-4 w-4 accent-slate-900"
              />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
              <div>
                <div className="text-sm font-medium text-slate-900">New role intake</div>
                <div className="text-xs text-slate-500">Alert when roles need kickoff</div>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.newRoleIntake}
                onChange={updateToggle('notifications', 'newRoleIntake')}
                className="h-4 w-4 accent-slate-900"
              />
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
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => openIntegration('https://cloud.strapi.io/projects')}
              >
                Manage
              </Button>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
              <div className="text-sm font-medium text-slate-900">Resume Matcher</div>
              <p className="text-xs text-slate-500">Awaiting service deployment</p>
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => openIntegration('https://github.com/srbhr/Resume-Matcher')}
              >
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
