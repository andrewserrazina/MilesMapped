# MilesMapped – Points & Miles Agent Portal

## Getting Started

```bash
npm install
npm run dev
```

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

## Extending the Portal

- Replace mock data in `lib/mock/data.ts` with real data access (DB or API).
- Swap `useState` edits in pages for server actions or a state store.
- Add API routes under `app/api` for persisted workflows.
- Expand the award search, itinerary generation, and reporting shells into full modules.
