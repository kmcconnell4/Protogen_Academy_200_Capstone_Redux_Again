<template>
  <v-card>
    <v-card-title class="pa-4 pb-2">
      <span class="text-subtitle-1 font-weight-semibold">On-Time Delivery Trend</span>
    </v-card-title>
    <v-card-text class="pa-2 pt-0">
      <Line :data="chartData" :options="chartOptions" style="max-height: 200px" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { useMetrics } from '@/composables/useMetrics'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const { filteredShipmentVolume } = useMetrics()

const labels = computed(() =>
  filteredShipmentVolume.value.map((r) =>
    new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  ),
)

const onTimeRates = computed(() =>
  filteredShipmentVolume.value.map((r) =>
    r.totalShipments > 0
      ? Math.round((r.onTimeCount / r.totalShipments) * 1000) / 10
      : 0,
  ),
)

const chartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'On-Time Rate (%)',
      data: onTimeRates.value,
      borderColor: 'rgba(10, 61, 107, 0.9)',
      backgroundColor: 'rgba(10, 61, 107, 0.08)',
      fill: true,
      tension: 0.35,
      pointRadius: 2,
      pointHoverRadius: 5,
    },
    {
      label: 'Target (90%)',
      data: onTimeRates.value.map(() => 90),
      borderColor: 'rgba(46, 125, 50, 0.5)',
      borderDash: [6, 4],
      pointRadius: 0,
      fill: false,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const, align: 'end' as const },
    tooltip: {
      callbacks: {
        label: (ctx: { dataset: { label?: string }; parsed: { y: number } }) =>
          `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}%`,
      },
    },
  },
  scales: {
    x: { grid: { display: false } },
    y: {
      min: 60,
      max: 100,
      ticks: {
        callback: (v: number | string) => `${v}%`,
      },
    },
  },
}
</script>
