<template>
  <v-card class="d-flex flex-column" style="height: 100%">
    <v-card-title class="pa-4 pb-2 flex-shrink-0">
      <span class="text-subtitle-1 font-weight-semibold">On-Time Delivery Trend</span>
    </v-card-title>
    <v-card-text class="pa-2 pt-0" style="flex: 1 1 0; min-height: 0">
      <Line :data="chartData" :options="chartOptions" style="height: 100%; width: 100%" />
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
      borderColor: '#38BDF8',
      backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D; chartArea?: { top: number; bottom: number } } }) => {
        const { ctx, chartArea } = context.chart
        if (!chartArea) return 'transparent'
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
        gradient.addColorStop(0, 'rgba(56, 189, 248, 0.25)')
        gradient.addColorStop(1, 'rgba(56, 189, 248, 0.0)')
        return gradient
      },
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: '#38BDF8',
      borderWidth: 2,
    },
    {
      label: 'Target (90%)',
      data: onTimeRates.value.map(() => 90),
      borderColor: 'rgba(52, 211, 153, 0.5)',
      borderDash: [6, 4],
      pointRadius: 0,
      fill: false,
      borderWidth: 1.5,
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
        label: (ctx: { dataset: { label?: string }; parsed: { y: number } }) =>
          `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}%`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#64748B', font: { family: 'Inter, sans-serif', size: 11 } },
    },
    y: {
      min: 60,
      max: 100,
      grid: { color: 'rgba(148, 163, 184, 0.08)' },
      ticks: {
        color: '#64748B',
        font: { family: 'Inter, sans-serif', size: 11 },
        callback: (v: number | string) => `${v}%`,
      },
    },
  },
}
</script>
