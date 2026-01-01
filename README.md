# MilesMapped – Points & Miles Agent Portal

MilesMapped is a Next.js + Tailwind Agent Portal for points & miles workflows.

## Requirements

- **Node.js 20.x** (recommended: 20 LTS)
- npm (ships with Node)

## Local Setup

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Build for Production

```bash
npm run build
npm run start
```

## Deploy to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In Vercel, click **Add New → Project** and import the repo.
3. Keep the default build settings:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Click **Deploy**.

### Deployment Notes

- No custom Vercel configuration is required; the app uses the default Next.js
  runtime and build output.
- All client-side storage reads occur after hydration, so SSR renders safely
  without browser-only globals.

### Environment Variables

No environment variables are required for deployment right now.

#### Data Mode

Set `NEXT_PUBLIC_DATA_MODE` to control the data backend:

```bash
# default (localStorage-backed)
NEXT_PUBLIC_DATA_MODE=local

# Supabase stub (read-only placeholders until implemented)
NEXT_PUBLIC_DATA_MODE=supabase
```

When `supabase` is enabled, the UI will show a banner indicating that the
Supabase repo is not configured yet. Implementations are scaffolded in
`lib/repo/supabaseRepo.ts`; replace the TODOs with Supabase queries/mutations
and remove the placeholder errors as you wire up the backend.

## Scripts

- `npm run dev` – start the dev server
- `npm run build` – create a production build
- `npm run start` – run the production server
- `npm run lint` – run ESLint
- `npm run typecheck` – run TypeScript without emitting output

## Portal Routes

- `/dashboard` – KPI overview, recent activity, quick actions
- `/clients` – Client list + filters
- `/clients/[id]` – Client detail with tabs
- `/trips` – Trip list + status filters
- `/trips/[id]` – Trip workflow detail (status-driven)
- `/award-search` – Award search workspace shell
- `/itineraries` – Itinerary hub shell
- `/reports` – Reporting shell
- `/kb` – Knowledge base shell
- `/settings` – Settings shell

## Data Model

Typed models live in `lib/types.ts` and mock data in `lib/mock/data.ts`.

- **Client** → **Trip** → **AwardOption** → **Itinerary**
- `Client` captures preferences + point balances.
- `Trip` holds workflow status and options.
- `AwardOption` / `HotelOption` provide the comparison layer.

## Status Logic

Trip lifecycle is status-driven:

`Intake → Searching → Draft Ready → Sent → Booked → Closed`

- The Trip Detail page shows a "Next step" banner based on status.
- "Generate Itinerary" is only enabled when:
  - At least 1 award option exists
  - A pinned award option is selected
  - Status is **Draft Ready**

## Troubleshooting

- **Tailwind styles not applying**
  - Confirm `app/globals.css` is imported in `app/layout.tsx`.
  - Ensure `tailwind.config.ts` content paths include `app/`, `components/`, and `lib/`.
- **shadcn/ui components not found**
  - Check `components.json` and `components/ui/*` for the needed components.
- **Type errors during build**
  - Run `npm run typecheck` to validate local TypeScript errors.
- **Vercel build fails**
  - Verify the repo includes `package.json`, `tsconfig.json`, and `next.config.mjs` at the root.
  - Ensure build does not rely on local-only files or environment variables.

## Extending the Portal

- Replace mock data in `lib/mock/data.ts` with real data access (DB or API).
- Swap `useState` edits in pages for server actions or a state store.
- Add API routes under `app/api` for persisted workflows.
- Expand the award search, itinerary generation, and reporting shells into full modules.
