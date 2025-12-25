# TalentVault Super UI

Premium multi-page dashboard experience for TalentVault, built with Next.js, shadcn/ui, and motion-driven accents.

## Quick start

```bash
npm install
```

Create a `.env.local` and point it at your Strapi API:

```bash
NEXT_PUBLIC_STRAPI_API=http://localhost:1337/api
```

Then run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Pages

- Overview (/) for signal and pipeline pulse
- Jobs (/jobs) for role tracking
- Candidates (/candidates) for talent flow
- Analytics (/analytics) for decision intelligence
- Settings (/settings) for workspace controls

## Notes

- If Strapi is unavailable, the UI falls back to seeded sample data.
- Update `NEXT_PUBLIC_STRAPI_API` to point at Strapi Cloud when needed.
