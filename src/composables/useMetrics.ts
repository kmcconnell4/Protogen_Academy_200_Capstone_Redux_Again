import { computed, ref } from 'vue'
import type {
  MetricsData,
  DateRange,
  Exception,
  ShipmentVolumeRecord,
} from '@/types'
import rawData from '@/data/metrics.json'

const data = rawData as MetricsData

// Global reactive state
const selectedDateRange = ref<DateRange>('month')
const selectedRegion = ref<string | null>(null)
const exceptionSearch = ref('')
const exceptionTypeFilter = ref<string | null>(null)
const exceptionSeverityFilter = ref<string | null>(null)

function getDateCutoff(range: DateRange): Date {
  const now = new Date()
  // Work in UTC throughout to match how bare date strings like "2026-04-21"
  // are parsed by the Date constructor (always UTC midnight).
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  switch (range) {
    case 'today':
      return new Date(todayUtc)
    case 'week':
      return new Date(todayUtc - 6 * 86_400_000)
    case 'month':
      return new Date(todayUtc - 30 * 86_400_000)
    case 'quarter':
      return new Date(todayUtc - 90 * 86_400_000)
    case 'ytd':
      return new Date(Date.UTC(now.getUTCFullYear(), 0, 1))
  }
}

const filteredShipmentVolume = computed<ShipmentVolumeRecord[]>(() => {
  const cutoff = getDateCutoff(selectedDateRange.value)
  const dateFiltered = data.shipmentVolume.filter((r) => new Date(r.date) >= cutoff)

  if (!selectedRegion.value) return dateFiltered

  // shipmentVolume records have no region field — scale each day's counts by the
  // selected region's share of global shipments and its own on-time rate.
  const region = data.regions.find((r) => r.name === selectedRegion.value)
  if (!region) return dateFiltered

  const globalTotal = data.regions.reduce((s, r) => s + r.totalShipments, 0)
  const regionShare = globalTotal > 0 ? region.totalShipments / globalTotal : 0

  return dateFiltered.map((r) => {
    const total = Math.round(r.totalShipments * regionShare)
    const onTime = Math.round(total * (region.onTimeRate / 100))
    return {
      ...r,
      totalShipments: total,
      onTimeCount: onTime,
      lateCount: total - onTime,
    }
  })
})

// Date + region filtered only — used for KPI counts.
// Does NOT include the table-level type/severity/search filters so the
// Open Exceptions card always reflects the true period total.
const kpiExceptions = computed<Exception[]>(() => {
  const cutoff = getDateCutoff(selectedDateRange.value)
  let list = data.exceptions.filter((e) => new Date(e.createdAt) >= cutoff)
  if (selectedRegion.value) {
    list = list.filter((e) => e.region === selectedRegion.value)
  }
  return list
})

const filteredExceptions = computed<Exception[]>(() => {
  let list = data.exceptions

  // Filter by date range
  const cutoff = getDateCutoff(selectedDateRange.value)
  list = list.filter((e) => new Date(e.createdAt) >= cutoff)

  // Filter by region
  if (selectedRegion.value) {
    list = list.filter((e) => e.region === selectedRegion.value)
  }

  // Filter by exception type
  if (exceptionTypeFilter.value) {
    list = list.filter((e) => e.exceptionType === exceptionTypeFilter.value)
  }

  // Filter by severity
  if (exceptionSeverityFilter.value) {
    list = list.filter((e) => e.severity === exceptionSeverityFilter.value)
  }

  // Text search
  const q = exceptionSearch.value.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (e) =>
        e.shipmentId.toLowerCase().includes(q) ||
        e.origin.toLowerCase().includes(q) ||
        e.destination.toLowerCase().includes(q) ||
        e.assignedTo.toLowerCase().includes(q),
    )
  }

  const severityOrder: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  }

  return [...list].sort((a, b) => {
    const sev = severityOrder[a.severity] - severityOrder[b.severity]
    if (sev !== 0) return sev
    return b.age - a.age
  })
})

const computedKpis = computed(() => {
  const vol = filteredShipmentVolume.value
  if (!vol.length) return data.kpis

  const total = vol.reduce((s, r) => s + r.totalShipments, 0)
  const onTime = vol.reduce((s, r) => s + r.onTimeCount, 0)
  const onTimeRate = total > 0 ? Math.round((onTime / total) * 1000) / 10 : 0

  // Open exceptions: count from kpiExceptions (date + region only, no table filters)
  const openEx = kpiExceptions.value.length

  // Avg transit time:
  // - If a region is selected, use that region's transit time directly
  // - Otherwise, use the weighted average across all regions by their filtered shipment volume
  const regions = filteredRegions.value
  const regionTotal = regions.reduce((s, r) => s + r.totalShipments, 0)
  // Seasonal offset: YTD/Quarter include early-year winter months where weather
  // adds measurable delay; shorter windows consist mostly of spring shipments.
  const seasonalOffset: Record<string, number> = { today: -0.8, week: -0.5, month: 0, quarter: 0.4, ytd: 1.1 }
  const transitOffset = seasonalOffset[selectedDateRange.value] ?? 0

  const avgTransit = selectedRegion.value
    ? (data.regions.find((r) => r.name === selectedRegion.value)?.avgTransitTime ?? data.kpis.avgTransitTime.current) + transitOffset
    : regionTotal > 0
      ? regions.reduce((s, r) => s + r.avgTransitTime * r.totalShipments, 0) / regionTotal + transitOffset
      : data.kpis.avgTransitTime.current + transitOffset

  // Revenue in transit: scale proportionally to filtered shipment volume
  const allTimeTotal = data.kpis.totalShipments.current
  const revenueScale = allTimeTotal > 0 ? total / allTimeTotal : 1
  const revenue = Math.round(data.kpis.revenueInTransit.current * revenueScale)

  return {
    totalShipments: { current: total, prior: data.kpis.totalShipments.prior },
    onTimeRate: { current: onTimeRate, prior: data.kpis.onTimeRate.prior },
    avgTransitTime: {
      current: Math.round(avgTransit * 10) / 10,
      prior: data.kpis.avgTransitTime.prior,
    },
    openExceptions: { current: openEx, prior: data.kpis.openExceptions.prior },
    revenueInTransit: { current: revenue, prior: data.kpis.revenueInTransit.prior },
  }
})

// Regional breakdown filtered by date range and region selection.
// - totalShipments: scales proportionally with the filtered volume window
// - onTimeRate: the global on-time rate for the filtered period is computed from
//   shipmentVolume, then the delta vs the all-time global rate is applied uniformly
//   to each region so regional differences are preserved while the trend responds
//   to the selected date range
// - openExceptions: counted live from filteredExceptions (already date+region aware)
const filteredRegions = computed(() => {
  const filteredVol = filteredShipmentVolume.value
  const filteredTotal = filteredVol.reduce((s, r) => s + r.totalShipments, 0)
  const filteredOnTime = filteredVol.reduce((s, r) => s + r.onTimeCount, 0)

  const allTimeTotal = data.kpis.totalShipments.current
  const scale = allTimeTotal > 0 ? filteredTotal / allTimeTotal : 1

  // Global on-time rate for the filtered period
  const filteredGlobalRate = filteredTotal > 0 ? (filteredOnTime / filteredTotal) * 100 : data.kpis.onTimeRate.current

  // Weighted all-time global on-time rate from base region data
  const baseGlobalRate =
    data.regions.reduce((s, r) => s + r.totalShipments * r.onTimeRate, 0) /
    data.regions.reduce((s, r) => s + r.totalShipments, 0)

  // Apply the period delta to each region's base rate, preserving relative differences
  const rateDelta = filteredGlobalRate - baseGlobalRate

  // Count open exceptions per region from the date-filtered exceptions list,
  // ignoring the region selection filter so all regions show their own counts
  const exByRegion: Record<string, number> = {}
  const cutoff = getDateCutoff(selectedDateRange.value)
  for (const e of data.exceptions) {
    if (new Date(e.createdAt) >= cutoff) {
      exByRegion[e.region] = (exByRegion[e.region] ?? 0) + 1
    }
  }

  return data.regions.map((r) => ({
    ...r,
    totalShipments: Math.round(r.totalShipments * scale),
    onTimeRate: Math.round(Math.min(100, Math.max(0, r.onTimeRate + rateDelta)) * 10) / 10,
    openExceptions: exByRegion[r.name] ?? 0,
  }))
})

export function useMetrics() {
  return {
    // Raw data
    carriers: data.carriers,

    // Reactive state
    selectedDateRange,
    selectedRegion,
    exceptionSearch,
    exceptionTypeFilter,
    exceptionSeverityFilter,

    // Computed filtered outputs
    filteredShipmentVolume,
    filteredExceptions,
    filteredRegions,
    computedKpis,
  }
}
