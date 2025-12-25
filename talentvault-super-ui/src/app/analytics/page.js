import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const weeklyPipeline = [
  { label: 'Mon', value: 48 },
  { label: 'Tue', value: 62 },
  { label: 'Wed', value: 58 },
  { label: 'Thu', value: 71 },
  { label: 'Fri', value: 65 },
  { label: 'Sat', value: 34 },
  { label: 'Sun', value: 29 },
];

const sourceMix = [
  { label: 'Direct outreach', value: 32 },
  { label: 'Referrals', value: 26 },
  { label: 'Community', value: 18 },
  { label: 'Inbound', value: 24 },
];

const funnelStages = [
  { label: 'Sourced', value: 120 },
  { label: 'Qualified', value: 74 },
  { label: 'Interviewing', value: 38 },
  { label: 'Offer', value: 12 },
];

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Pipeline velocity', value: '4.2 days' },
          { label: 'Conversion rate', value: '31%' },
          { label: 'Offer acceptance', value: '82%' },
          { label: 'Time to hire', value: '19 days' },
        ].map((item) => (
          <Card key={item.label} className="border-black/10 bg-white/70">
            <CardHeader>
              <CardTitle className="text-sm text-slate-500">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-slate-900">{item.value}</div>
              <p className="text-xs text-slate-500">Last 30 days</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-black/10 bg-white/80">
          <CardHeader>
            <CardTitle className="text-lg">Weekly pipeline pulse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {weeklyPipeline.map((day) => (
              <div key={day.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>{day.label}</span>
                  <span>{day.value} matches</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-900"
                    style={{ width: `${day.value}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-black/10 bg-white/80">
          <CardHeader>
            <CardTitle className="text-lg">Source mix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sourceMix.map((source) => (
              <div key={source.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>{source.label}</span>
                  <span>{source.value}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-900"
                    style={{ width: `${source.value}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="border-black/10 bg-white/80">
          <CardHeader>
            <CardTitle className="text-lg">Conversion funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {funnelStages.map((stage, index) => (
              <div key={stage.label} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900">{stage.label}</div>
                  <div className="text-xs text-slate-500">Step {index + 1}</div>
                </div>
                <Badge variant="secondary">{stage.value}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-black/10 bg-white/80">
          <CardHeader>
            <CardTitle className="text-lg">Decision notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Signal</div>
              Offer acceptance improved after aligning comp bands.
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Insight</div>
              Referral cohorts convert 1.6x faster than inbound.
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Focus</div>
              Prioritize candidate nurture for senior design roles.
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
