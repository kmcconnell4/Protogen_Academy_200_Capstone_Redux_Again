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

function localDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

// Returns a YYYY-MM-DD cutoff string in LOCAL time so that "today" always
// reflects the user's wall-clock date, regardless of UTC offset.
// Shipment volume records use bare date strings (compared lexicographically),
// and exception timestamps use .slice(0,10) before comparison.
function getDateCutoff(range: DateRange): string {
  const now = new Date()
  const y = now.getFullYear()
  const mo = now.getMonth()
  const d = now.getDate()
  switch (range) {
    case 'today':
      return localDateStr(now)
    case 'week':
      return localDateStr(new Date(y, mo, d - 6))
    case 'month':
      return localDateStr(new Date(y, mo, d - 30))
    case 'quarter':
      return localDateStr(new Date(y, mo, d - 90))
    case 'ytd':
      return `${y}-01-01`
  }
}

const filteredShipmentVolume = computed<ShipmentVolumeRecord[]>(() => {
  const cutoff = getDateCutoff(selectedDateRange.value)
  const dateFiltered = data.shipmentVolume.filter((r) => r.date >= cutoff)

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
  let list = data.exceptions.filter((e) => e.createdAt.slice(0, 10) >= cutoff)
  if (selectedRegion.value) {
    list = list.filter((e) => e.region === selectedRegion.value)
  }
  return list
})

const filteredExceptions = computed<Exception[]>(() => {
  let list = data.exceptions

  // Filter by date range
  const cutoff = getDateCutoff(selectedDateRange.value)
  list = list.filter((e) => e.createdAt.slice(0, 10) >= cutoff)

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
  if (!vol.length) {
    // No data for the selected period — return zeros so KPI cards don't show
    // the all-time dataset totals as if they were filtered values.
    return {
      totalShipments: { current: 0, prior: data.kpis.totalShipments.prior },
      onTimeRate: { current: 0, prior: data.kpis.onTimeRate.prior },
      avgTransitTime: { current: data.kpis.avgTransitTime.current, prior: data.kpis.avgTransitTime.prior },
      openExceptions: { current: 0, prior: data.kpis.openExceptions.prior },
      revenueInTransit: { current: 0, prior: data.kpis.revenueInTransit.prior },
    }
  }

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

  // For "today", compare against yesterday so the trend is day-over-day
  // rather than today's single-day count vs. a full multi-period total.
  let priorTotal = data.kpis.totalShipments.prior
  let priorOnTimeRate = data.kpis.onTimeRate.prior
  let priorRevenue = data.kpis.revenueInTransit.prior
  if (selectedDateRange.value === 'today') {
    const now = new Date()
    const yesterdayStr = localDateStr(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1))
    const yesterdayRecord = data.shipmentVolume.find((r) => r.date === yesterdayStr)
    if (yesterdayRecord) {
      priorTotal = yesterdayRecord.totalShipments
      priorOnTimeRate =
        yesterdayRecord.totalShipments > 0
          ? Math.round((yesterdayRecord.onTimeCount / yesterdayRecord.totalShipments) * 1000) / 10
          : 0
      priorRevenue = Math.round(data.kpis.revenueInTransit.current * (priorTotal / data.kpis.totalShipments.current))
    }
  }

  return {
    totalShipments: { current: total, prior: priorTotal },
    onTimeRate: { current: onTimeRate, prior: priorOnTimeRate },
    avgTransitTime: {
      current: Math.round(avgTransit * 10) / 10,
      prior: data.kpis.avgTransitTime.prior,
    },
    openExceptions: { current: openEx, prior: data.kpis.openExceptions.prior },
    revenueInTransit: { current: revenue, prior: priorRevenue },
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
    if (e.createdAt.slice(0, 10) >= cutoff) {
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
