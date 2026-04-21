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
  const now = new Date('2026-04-21T08:00:00Z')
  switch (range) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    case 'week': {
      const d = new Date(now)
      d.setDate(d.getDate() - 6)
      return d
    }
    case 'month': {
      const d = new Date(now)
      d.setDate(d.getDate() - 29)
      return d
    }
    case 'quarter': {
      const d = new Date(now)
      d.setDate(d.getDate() - 89)
      return d
    }
  }
}

const filteredShipmentVolume = computed<ShipmentVolumeRecord[]>(() => {
  const cutoff = getDateCutoff(selectedDateRange.value)
  return data.shipmentVolume.filter((r) => new Date(r.date) >= cutoff)
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
  const openEx = filteredExceptions.value.length

  // Avg transit time: weighted average of each filtered exception's region transit time
  const regionTransitMap: Record<string, number> = {}
  for (const r of data.regions) regionTransitMap[r.name] = r.avgTransitTime
  const exList = filteredExceptions.value
  const avgTransit =
    exList.length > 0
      ? exList.reduce((s, e) => s + (regionTransitMap[e.region] ?? data.kpis.avgTransitTime.current), 0) /
        exList.length
      : data.kpis.avgTransitTime.current

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
// totalShipments scales with filtered volume; openExceptions is counted live from
// filteredExceptions; onTimeRate and avgTransitTime are period-independent route
// characteristics so they stay as-is from the base data.
const filteredRegions = computed(() => {
  const allTimeTotal = data.kpis.totalShipments.current
  const filteredTotal = filteredShipmentVolume.value.reduce((s, r) => s + r.totalShipments, 0)
  const scale = allTimeTotal > 0 ? filteredTotal / allTimeTotal : 1

  // Count open exceptions per region from the already-filtered exceptions list
  const exByRegion: Record<string, number> = {}
  for (const e of filteredExceptions.value) {
    exByRegion[e.region] = (exByRegion[e.region] ?? 0) + 1
  }

  return data.regions.map((r) => ({
    ...r,
    totalShipments: Math.round(r.totalShipments * scale),
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
