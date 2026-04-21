# FastForward Logistics — Operations Dashboard Brief

## Summary

Build a single-page internal operations dashboard for FastForward Logistics that gives the VP of Operations and leadership team an at-a-glance view of how the business is running. The dashboard replaces a tangle of spreadsheets and should be ready to pull up in leadership meetings — clean, confident, and data-dense without feeling cluttered. Key metrics: **shipment volume, on-time delivery rate, regional performance, and open exceptions**.

---

## Design

- **Visual tone:** Professional, clean, and corporate. Think "airline ops center," not "startup SaaS." Use a neutral base (white/light gray) with a bold accent color drawn from the FastForward brand (e.g., deep blue or teal).
- **Typography:** Clear hierarchy — large KPI numbers that are readable from across a conference table, with smaller supporting labels and trend indicators.
- **Color coding:** Use a consistent semantic palette — green for on-target, amber for at-risk, red for missed/critical. Avoid overusing color; let it draw the eye to what matters.
- **Data density:** The dashboard should feel information-rich but not overwhelming. Every element should earn its space.
- **Presentation-ready:** It should look polished enough to project on a screen in a leadership meeting with zero prep.

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

- **Dark mode toggle** for different presentation environments.
- **Sparklines** inside KPI cards showing 7-day or 30-day micro-trends.
- **Anomaly flags:** Automatically highlight KPIs or regions that have deviated significantly from their rolling average (e.g., a region whose on-time rate dropped 10+ points).
- **Export options:** Allow exporting the exceptions table to CSV and the full dashboard view to PDF for email recaps.
- **Annotations:** Ability to pin a note to a specific date on the timeline charts (e.g., "Warehouse 3 closed for maintenance") so leadership has context.
- **Carrier performance mini-view:** A small leaderboard or breakdown by carrier showing on-time rates per carrier partner.
- **Mobile-responsive layout** so the VP can glance at it from her phone before a meeting.
- **Saved views/presets:** Let users save filtered views (e.g., "West Region — This Quarter") for quick access.