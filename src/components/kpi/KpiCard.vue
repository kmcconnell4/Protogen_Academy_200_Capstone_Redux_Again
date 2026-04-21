<template>
  <v-card
    class="kpi-card"
    :class="{ 'kpi-card--clickable': !!props.scrollTarget }"
    :style="{ borderTop: `3px solid ${accentColor}` }"
    @click="handleClick"
  >
    <v-card-text class="pa-4">
      <div class="d-flex align-start justify-space-between mb-2">
        <div>
          <div class="text-caption text-medium-emphasis font-weight-medium text-uppercase ls-wide">
            {{ label }}
          </div>
          <div class="text-h3 font-weight-bold mt-1 kpi-value" style="letter-spacing: -0.02em; font-family: Inter, sans-serif">
            {{ formattedValue }}
          </div>
        </div>
        <v-icon :icon="icon" :color="accentColor" size="24" class="mt-1 opacity-60" />
      </div>

      <!-- Trend indicator -->
      <div class="d-flex align-center ga-1 mt-2">
        <v-icon
          :icon="trendIcon"
          :color="trendColor"
          size="16"
        />
        <span class="text-caption font-weight-medium" :class="`text-${trendColor}`">
          {{ trendLabel }}
        </span>
        <span class="text-caption text-medium-emphasis ml-1">vs prior period</span>
      </div>

      <!-- Anomaly flag — only fires for rate metrics that have genuinely dropped -->
      <v-chip
        v-if="anomalyFlag"
        color="warning"
        size="x-small"
        variant="tonal"
        class="mt-2"
        prepend-icon="mdi-alert"
      >
        {{ trendLabel }} vs prior period
      </v-chip>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  value: number
  priorValue: number
  format?: 'number' | 'percent' | 'hours' | 'currency'
  icon: string
  accentColor?: string
  higherIsBetter?: boolean
  scrollTarget?: string
}

const props = withDefaults(defineProps<Props>(), {
  format: 'number',
  higherIsBetter: true,
  accentColor: '#38BDF8',
})

const emit = defineEmits<{ click: [] }>()

function handleClick() {
  if (props.scrollTarget) {
    const el = document.getElementById(props.scrollTarget)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    emit('click')
  }
}

function formatVal(v: number): string {
  switch (props.format) {
    case 'percent':
      return `${v.toFixed(1)}%`
    case 'hours':
      return `${v.toFixed(1)}h`
    case 'currency':
      return `$${(v / 1_000_000).toFixed(2)}M`
    default:
      return v.toLocaleString()
  }
}

const formattedValue = computed(() => formatVal(props.value))

const delta = computed(() => {
  if (props.priorValue === 0) return 0
  return ((props.value - props.priorValue) / props.priorValue) * 100
})

const isPositive = computed(() =>
  props.higherIsBetter ? delta.value >= 0 : delta.value <= 0,
)

const trendIcon = computed(() =>
  delta.value > 0 ? 'mdi-trending-up' : delta.value < 0 ? 'mdi-trending-down' : 'mdi-trending-neutral',
)

const trendColor = computed(() =>
  delta.value === 0 ? 'medium-emphasis' : isPositive.value ? 'success' : 'error',
)

const trendLabel = computed(() => {
  const sign = delta.value > 0 ? '+' : ''
  return `${sign}${delta.value.toFixed(1)}%`
})

const iconColor = computed(() => props.accentColor)

const valueClass = computed(() => '')

// Anomaly: only meaningful for rate/ratio KPIs (percent, hours).
// Volume and currency counts naturally shrink with a narrower date window,
// so flagging them would produce constant false positives.
const anomalyFlag = computed(() => {
  const isRateMetric = props.format === 'percent' || props.format === 'hours'
  return isRateMetric && !isPositive.value && Math.abs(delta.value) >= 10
})
</script>

<style scoped>
.kpi-card {
  transition: box-shadow 0.2s ease, transform 0.15s ease;
  border: 1px solid rgba(148, 163, 184, 0.1);
  font-family: Inter, sans-serif;
}
.kpi-card--clickable {
  cursor: pointer;
}
.kpi-card--clickable:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25) !important;
}
.ls-wide {
  letter-spacing: 0.08em;
}
.lh-1 {
  line-height: 1;
}
</style>
