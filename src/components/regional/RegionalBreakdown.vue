<template>
  <v-card>
    <v-card-title class="pa-4 pb-2">
      <span class="text-subtitle-1 font-weight-semibold">Regional Performance</span>
    </v-card-title>
    <v-card-text class="pa-3 pt-0">
      <div
        v-for="region in sortedRegions"
        :key="region.name"
        class="region-row mb-3"
        :class="{ 'region-row--selected': selectedRegion === region.name }"
        @click="toggleRegion(region.name)"
      >
        <div class="d-flex align-center justify-space-between mb-1">
          <div class="d-flex align-center ga-2">
            <span class="text-body-2 font-weight-medium">{{ region.name }}</span>
            <v-chip
              v-if="isAnomaly(region)"
              color="warning"
              size="x-small"
              variant="tonal"
              prepend-icon="mdi-alert"
            >
              ↓ Anomaly
            </v-chip>
          </div>
          <span
            class="text-body-2 font-weight-bold"
            :class="rateTextClass(region.onTimeRate)"
          >
            {{ region.onTimeRate.toFixed(1) }}%
          </span>
        </div>

        <v-progress-linear
          :model-value="region.onTimeRate"
          :color="rateColor(region.onTimeRate)"
          bg-color="surface-variant"
          height="8"
          rounded
        />

        <div class="d-flex gap-4 mt-1">
          <span class="text-caption text-medium-emphasis">
            {{ region.totalShipments.toLocaleString() }} shipments
          </span>
          <span class="text-caption text-medium-emphasis ml-3">
            Avg {{ region.avgTransitTime.toFixed(1) }}h transit
          </span>
          <v-spacer />
          <span class="text-caption" :class="region.openExceptions > 5 ? 'text-error' : 'text-medium-emphasis'">
            {{ region.openExceptions }} exceptions
          </span>
        </div>
      </div>

      <div v-if="selectedRegion" class="mt-2 text-center">
        <v-btn
          variant="text"
          size="x-small"
          prepend-icon="mdi-close"
          @click="selectedRegion = null"
        >
          Clear region filter
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMetrics } from '@/composables/useMetrics'

const { filteredRegions, selectedRegion } = useMetrics()

const sortedRegions = computed(() =>
  [...filteredRegions.value].sort((a, b) => b.onTimeRate - a.onTimeRate),
)

function toggleRegion(name: string) {
  selectedRegion.value = selectedRegion.value === name ? null : name
}

function rateColor(rate: number): string {
  if (rate >= 90) return 'success'
  if (rate >= 82) return 'warning'
  return 'error'
}

function rateTextClass(rate: number): string {
  if (rate >= 90) return 'text-success'
  if (rate >= 82) return 'text-warning'
  return 'text-error'
}

// Flag a region as anomalous if its on-time rate is 10+ points below the best-performing region
const avgOnTimeRate = computed(
  () => filteredRegions.value.reduce((s, r) => s + r.onTimeRate, 0) / filteredRegions.value.length,
)

function isAnomaly(region: { onTimeRate: number }): boolean {
  return avgOnTimeRate.value - region.onTimeRate >= 10
}
</script>

<style scoped>
.region-row {
  cursor: pointer;
  border-radius: 8px;
  padding: 6px 8px;
  transition: background 0.15s ease;
}
.region-row:hover {
  background: rgba(10, 61, 107, 0.05);
}
.region-row--selected {
  background: rgba(10, 61, 107, 0.08);
  outline: 1px solid rgba(10, 61, 107, 0.3);
}
</style>
