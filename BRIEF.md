# FastForward Logistics — Operations Dashboard Brief

## Summary

Build a single-page internal operations dashboard for FastForward Logistics that gives the VP of Operations and leadership team an at-a-glance view of how the business is running. The dashboard replaces a tangle of spreadsheets and should be ready to pull up in leadership meetings — clean, confident, and data-dense without feeling cluttered. Key metrics: **shipment volume, on-time delivery rate, regional performance, and open exceptions**.

---

## Design

- **Visual tone:** Dark ops center. Think flight operations control room — not startup SaaS. The default theme is dark-first (`#0F1117` background, `#161C27` card surfaces, 1px `rgba(148,163,184,0.12)` borders). A light mode is available via the header toggle.
- **Typography:** Inter (Google Fonts) throughout. KPI numbers rendered at `text-h3` size with `-0.02em` letter spacing — readable from across a conference table. Labels are uppercase with `0.08em` tracking.
- **Color accent system:** Cards use per-metric 3px top borders to create visual identity without overloading the layout:
  - Total Shipments — sky blue `#38BDF8`
  - On-Time Delivery — emerald `#34D399`
  - Avg Transit Time — violet `#A78BFA`
  - Open Exceptions — amber `#FBBF24`
  - Revenue in Transit — cyan `#22D3EE`
- **Semantic palette:** Success `#34D399` (emerald), Warning `#FBBF24` (amber), Error `#F87171` (coral red). Applied to trend indicators, table row highlighting, and regional bars.
- **Chart style:** Gradient area fills on dark backgrounds. Emerald/coral stacked bars for shipment volume. Muted grid lines (`rgba(148,163,184,0.08)`) and slate tick labels (`#64748B`). Custom dark tooltips (`#1E2636` background).
- **Flat/border card discipline:** All cards use `elevation: 0` with a 1px border. No drop shadows except on hover (subtle lift). Every element earns its space.
- **Presentation-ready:** Dark theme is optimized for projection in a dim conference room. Light mode available for daytime use. Both themes share the same Inter typography and semantic color logic.

---

## Layout

- **Top bar:** Company logo/dashboard title, current date/time, and a global date-range selector (Today, This Week, This Month, This Quarter).
- **KPI row (top):** 4–5 large metric cards spanning the width:
  - Total Shipments (with trend vs. prior period)
  - On-Time Delivery Rate (%)
  - Average Transit Time
  - Open Exceptions Count
  - Revenue in Transit (optional)
- **Middle section — two columns:**
  - **Left (wider ~60%):** Shipment volume over time (bar or area chart, daily/weekly toggle). Below it, an on-time delivery trend line chart.
  - **Right (~40%):** Regional performance breakdown — a ranked list or horizontal bar chart showing on-time % by region (e.g., Northeast, Southeast, Midwest, West, International).
- **Bottom section — full width:**
  - **Open Exceptions Table:** A sortable, scannable table of active exceptions — columns for Shipment ID, Origin, Destination, Exception Type (delay, damage, customs hold, etc.), Status, Age, and Assigned To. Highlight rows by severity.

---

## Interactions

- **Date-range selector:** Changing the range updates all charts, KPIs, and the exceptions table globally.
- **KPI cards:** Clicking a KPI card could filter or scroll to the related detail section (e.g., clicking "Open Exceptions" scrolls to the exceptions table).
- **Regional breakdown:** Clicking a region filters the shipment volume chart and exceptions table to that region.
- **Exceptions table:**
  - Sortable by any column (default sort: severity then age, oldest first).
  - Clicking a row expands an inline detail panel or opens a side drawer with full shipment details and timeline.
  - Filter/search bar above the table for quick lookup by Shipment ID or exception type.
- **Chart hover states:** Tooltips on all charts showing exact values on hover.
- **Refresh:** Auto-refresh on a sensible interval (e.g., every 5 minutes) with a visible "Last updated" timestamp and a manual refresh button.

---

## Tech

- **Framework:** Vue 3 (Composition API)
- **Build Tool:** Vite
- **Language:** TypeScript
- **Routing:** Vue Router
- **UI Component Library:** Vuetify 3 with Material Design Icons (`@mdi/font`)
- **Visualizations:** Chart.js with vue-chartjs for all chart components (area charts, bar charts, line charts, sparklines)

---

## Data

- **Source:** Generate a realistic fake dataset as a static JSON file located at `src/data/metrics.json`. This file will serve as the single data source for the entire dashboard until a real API is connected.
- **Structure:** The JSON file should include the following top-level keys:
  - **`kpis`** — Current-period values and prior-period comparisons for: Total Shipments, On-Time Delivery Rate (%), Average Transit Time (hours), Open Exceptions Count, and Revenue in Transit ($).
  - **`shipmentVolume`** — An array of daily records spanning at least the last 90 days. Each record should include: `date`, `totalShipments`, `onTimeCount`, and `lateCount`.
  - **`regions`** — An array of regional objects (Northeast, Southeast, Midwest, West, International). Each should include: `name`, `totalShipments`, `onTimeRate`, `avgTransitTime`, and `openExceptions`.
  - **`carriers`** — An array of carrier partner objects (at least 5). Each should include: `name`, `totalShipments`, `onTimeRate`, and `avgTransitTime`.
  - **`exceptions`** — An array of at least 30 open exception records. Each should include: `shipmentId`, `origin`, `destination`, `region`, `carrier`, `exceptionType` (one of: delay, damage, customs hold, lost, address issue), `severity` (critical, high, medium, low), `status` (open, in progress, escalated), `age` (in hours), `assignedTo`, and `createdAt` (ISO timestamp).
- **Realism:** Use realistic city names, shipment ID formats (e.g., `FF-2026-XXXXX`), carrier names (e.g., "Summit Freight", "BlueLine Express"), and plausible numeric distributions. On-time rates should vary by region and carrier to make the dashboard interesting — not everything should look perfect.
- **Filtering:** All dashboard views should support filtering the dataset by:
  - **Date range** — Today, This Week, This Month, This Quarter (filter `shipmentVolume` and `exceptions` by date).
  - **Region** — Selecting a region from the regional breakdown should filter shipment volume charts, KPIs, and the exceptions table to that region.
  - **Exception type** — The exceptions table should be filterable by exception type and severity.
  - **Search** — A text search on the exceptions table that matches against Shipment ID, origin, destination, or assigned team member.
- **Import pattern:** Import the JSON file directly in Vue components or through a composable (e.g., `useMetrics()`) that wraps the data and exposes filtered/computed subsets reactively.

---

## Nice to Haves

- **Dark mode toggle** ✅ implemented — header toggle switches between dark (`#0F1117`) and light themes.
- **Sparklines** inside KPI cards showing 7-day or 30-day micro-trends.
- **Anomaly flags:** Automatically highlight KPIs or regions that have deviated significantly from their rolling average. *(Decided against: produced too many false positives with static data; removed entirely.)*
- **Export options:** ✅ CSV export implemented on the exceptions table. PDF export not yet built.
- **Annotations:** Ability to pin a note to a specific date on the timeline charts. Not yet implemented.
- **Carrier performance mini-view:** A small leaderboard or breakdown by carrier showing on-time rates per carrier partner. Not yet implemented.
- **Mobile-responsive layout** ✅ implemented — header collapses date range selector to a dropdown on small screens; exceptions table filters stack vertically on mobile.
- **Saved views/presets:** Let users save filtered views (e.g., "West Region — This Quarter") for quick access. Not yet implemented.

---

## Implementation Decisions

Decisions made during build that deviate from or extend the original brief.

### Layout
- **Column arrangement swapped:** Regional Performance moved to the left column (~40%) and the charts (Shipment Volume + On-Time Delivery) moved to the right (~60%). This puts the scannable regional data closer to the KPI row for faster reading in meetings.
- **Date/time removed from header:** The live clock was removed as unnecessary visual noise. The header now shows only the logo, title, date-range selector, "Last updated" label, refresh button, and theme toggle.
- **Favicon:** Sky blue `mdi-truck-fast` icon on a `#0F1117` rounded background, matching the header logo exactly.

### Date Range Filters
The brief specified "Today, This Week, This Month, This Quarter." The implemented filters use rolling windows rather than calendar boundaries, and a YTD option was added:

| Label | Range |
|-------|-------|
| Today | Current UTC day |
| 7 Days | Today − 7 days |
| 30 Days | Today − 30 days |
| 90 Days | Today − 90 days |
| YTD | January 1 of current year → today |

### Data Layer
- **Single composable pattern:** All reactive state (`selectedDateRange`, `selectedRegion`, exception filters) lives as **module-level refs** inside `src/composables/useMetrics.ts`. Every component that calls `useMetrics()` shares the same state — no prop drilling or Pinia store needed.
- **Two exception computed values:** `kpiExceptions` filters by date + region only (drives the KPI card count). `filteredExceptions` adds type, severity, and search on top (drives the table). This prevents table-level filters from changing the headline number.
- **Regional scaling:** `shipmentVolume` records have no region field. When a region is selected, each day's totals are scaled by that region's share of global shipments, preserving chart shape while reflecting the correct regional volume.
- **Avg Transit Time — seasonal offset:** Transit time is a per-route characteristic that doesn't inherently vary by date range. A small seasonal offset is applied by period (YTD +1.1h, 90 Days +0.4h, 30 Days ±0, 7 Days −0.5h, Today −0.8h) to model winter weather impact on longer lookback windows.
- **Dataset:** 111 daily shipment volume records (Jan 1 – Apr 21, 2026) and 56 exception records (Jan 1 – Apr 21, 2026) across 5 regions, 5 carriers, and all exception/severity types. Early-year exceptions (Jan 1–21) were added specifically so YTD and 90-day filters return meaningfully different counts.

### Exceptions Table
- **Filters inline with title on desktop:** Search, Type, Severity, and CSV button sit on the same line as "Open Exceptions" on `sm+` breakpoints. On mobile they wrap below the title.
- **Default sort:** Severity (critical first) then age (oldest first) — matches the brief.
- **Row expansion:** Clicking a row expands an inline detail panel (Vuetify `v-data-table` expansion model) showing full shipment details. No side drawer was built.
- **Severity color coding:** Critical = coral red, High = amber, Medium = blue, Low = blue-grey.

### Removed / Deferred
- No Vue Router: the dashboard is single-view; routing adds no value at this scope.
- No sparklines yet.
- No PDF export.
- No chart annotations.
- No carrier performance view.
- No saved presets.