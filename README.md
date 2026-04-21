# FastForward Logistics — Operations Dashboard

An internal operations dashboard for FastForward Logistics, built as the Protogen Academy P200 Capstone project. Gives the VP of Operations and leadership team an at-a-glance view of shipment volume, on-time delivery, regional performance, and open exceptions — replacing a tangle of spreadsheets with a single, data-dense screen.

**Live site:** _coming soon_

---

## What it does

- **KPI cards** — Total Shipments, On-Time Delivery Rate, Avg Transit Time, Open Exceptions, Revenue in Transit. Each shows current-period value plus trend vs. prior period.
- **Shipment Volume chart** — Stacked bar chart (on-time vs. late) with daily/weekly toggle.
- **On-Time Delivery Trend** — Gradient area line chart with a 90% target reference line.
- **Regional Performance** — Ranked breakdown by region with on-time rate, shipment volume, and exception counts. Clicking a region filters the entire dashboard.
- **Open Exceptions Table** — Sortable by any column, filterable by type/severity/search, expandable rows with full shipment details, CSV export.
- **Date range filters** — Today, 7 Days, 30 Days, 90 Days, YTD.
- **Dark / light mode toggle** — Dark-first, optimized for dim conference rooms.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Vue 3 (Composition API) |
| Build tool | Vite 5 |
| Language | TypeScript |
| UI library | Vuetify 3 |
| Icons | Material Design Icons (`@mdi/font`) |
| Charts | Chart.js + vue-chartjs |
| Data | Static JSON (`src/data/metrics.json`) |

---

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Building for production

```bash
npm run build
```

Output goes to `dist/`. Deploy that folder to any static host (Vercel, Netlify, GitHub Pages).

---

## Project structure

```
src/
  components/
    layout/         # TopBar
    kpi/            # KpiCard
    charts/         # ShipmentVolumeChart, OnTimeDeliveryChart
    regional/       # RegionalBreakdown
    exceptions/     # ExceptionsTable
  composables/
    useMetrics.ts   # Central reactive data layer — all filters and computed KPIs
  data/
    metrics.json    # Static fake dataset (single source of truth)
  types/
    index.ts        # TypeScript interfaces
  views/
    DashboardView.vue
```

---

## AI scaffolding

This project was built using GitHub Copilot as the primary development tool. `BRIEF.md` in the root documents the original project brief and all major design and implementation decisions made during the build. It serves as the working context for the AI and as a record of intent for reviewers.
