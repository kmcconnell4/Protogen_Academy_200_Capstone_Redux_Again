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

  return {
    totalShipments: { current: total, prior: data.kpis.totalShipments.prior },
    onTimeRate: { current: onTimeRate, prior: data.kpis.onTimeRate.prior },
    avgTransitTime: data.kpis.avgTransitTime,
    openExceptions: { current: openEx, prior: data.kpis.openExceptions.prior },
    revenueInTransit: data.kpis.revenueInTransit,
  }
})

export function useMetrics() {
  return {
    // Raw data
    regions: data.regions,
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
    computedKpis,
  }
}
