<template>
  <v-card>
    <v-card-title class="d-flex align-center justify-space-between pa-4 pb-2">
      <span class="text-subtitle-1 font-weight-semibold">Shipment Volume</span>
      <v-btn-toggle v-model="granularity" density="compact" variant="outlined" rounded="lg">
        <v-btn value="daily" size="x-small">Daily</v-btn>
        <v-btn value="weekly" size="x-small">Weekly</v-btn>
      </v-btn-toggle>
    </v-card-title>
    <v-card-text class="pa-2 pt-0">
      <Bar :data="chartData" :options="chartOptions" style="max-height: 260px" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { useMetrics } from '@/composables/useMetrics'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const { filteredShipmentVolume } = useMetrics()
const granularity = ref<'daily' | 'weekly'>('daily')

const records = computed(() => {
  const raw = filteredShipmentVolume.value
  if (granularity.value === 'daily') return raw

  // Bin into weekly buckets
  const weeks: Record<string, { onTime: number; late: number }> = {}
  for (const r of raw) {
    const d = new Date(r.date)
    // Sunday of the containing week
    const sun = new Date(d)
    sun.setDate(d.getDate() - d.getDay())
    const key = sun.toISOString().slice(0, 10)
    if (!weeks[key]) weeks[key] = { onTime: 0, late: 0 }
    weeks[key].onTime += r.onTimeCount
    weeks[key].late += r.lateCount
  }
  return Object.entries(weeks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      date,
      totalShipments: v.onTime + v.late,
      onTimeCount: v.onTime,
      lateCount: v.late,
    }))
})

const labels = computed(() =>
  records.value.map((r) => {
    const d = new Date(r.date)
    return granularity.value === 'daily'
      ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : `Wk ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }),
)

const chartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'On Time',
      data: records.value.map((r) => r.onTimeCount),
      backgroundColor: 'rgba(52, 211, 153, 0.8)',
      stack: 'volume',
      borderRadius: 3,
    },
    {
      label: 'Late',
      data: records.value.map((r) => r.lateCount),
      backgroundColor: 'rgba(248, 113, 113, 0.75)',
      stack: 'volume',
      borderRadius: 3,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      align: 'end' as const,
      labels: { color: '#94A3B8', boxWidth: 12, font: { family: 'Inter, sans-serif' } },
    },
    tooltip: {
      backgroundColor: '#1E2636',
      titleColor: '#F1F5F9',
      bodyColor: '#94A3B8',
      borderColor: '#2A3347',
      borderWidth: 1,
      callbacks: {
        footer: (items: { parsed: { y: number } }[]) => {
          const total = items.reduce((s, i) => s + i.parsed.y, 0)
          return `Total: ${total}`
        },
      },
    },
  },
  scales: {
    x: {
      stacked: true,
      grid: { display: false },
      ticks: { color: '#64748B', font: { family: 'Inter, sans-serif', size: 11 } },
    },
    y: {
      stacked: true,
      beginAtZero: true,
      grid: { color: 'rgba(148, 163, 184, 0.08)' },
      ticks: { color: '#64748B', font: { family: 'Inter, sans-serif', size: 11 } },
    },
  },
}
</script>
