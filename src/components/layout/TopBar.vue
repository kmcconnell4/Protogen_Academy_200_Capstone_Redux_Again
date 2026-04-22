<template>
  <v-app-bar flat color="surface" elevation="0" class="topbar">
    <v-app-bar-title>
      <div class="d-flex align-center ga-3">
        <v-icon icon="mdi-truck-fast" size="26" color="primary" />
        <div class="d-none d-sm-block">
          <div class="text-subtitle-1 font-weight-bold lh-1" style="font-family: Inter, sans-serif; letter-spacing: -0.01em">
            FastForward Logistics
          </div>
          <div class="text-caption text-medium-emphasis">Operations Dashboard</div>
        </div>
      </div>
    </v-app-bar-title>

    <template #append>
      <div class="d-flex align-center ga-2 ga-sm-4 mr-2 mr-sm-3">

        <!-- Date range dropdown -->
        <v-select
          v-model="selectedRange"
          :items="rangeItems"
          density="compact"
          variant="outlined"
          hide-details
          class="range-select"
          :menu-props="{ contentClass: 'range-select-menu' }"
        />

        <!-- Region dropdown -->
        <v-select
          v-model="selectedRegionValue"
          :items="regionItems"
          density="compact"
          variant="outlined"
          hide-details
          class="range-select region-select"
          :menu-props="{ contentClass: 'range-select-menu' }"
        />

        <!-- Refresh: label hidden on mobile, icon always visible -->
        <div class="d-flex align-center ga-1">
          <span class="d-none d-md-inline text-caption text-medium-emphasis">Updated {{ lastUpdated }}</span>
          <v-btn
            icon="mdi-refresh"
            variant="text"
            color="primary"
            size="small"
            :loading="refreshing"
            @click="onRefresh"
          />
        </div>

        <!-- Dark mode toggle -->
        <v-btn
          :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          variant="text"
          color="on-surface"
          size="small"
          @click="toggleTheme"
        />
      </div>
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import type { Ref } from 'vue'
import { useMetrics } from '@/composables/useMetrics'

const { selectedDateRange, selectedRegion } = useMetrics()

const selectedRange = computed({
  get: () => selectedDateRange.value,
  set: (v) => (selectedDateRange.value = v as typeof selectedDateRange.value),
})

const selectedRegionValue = computed({
  get: () => selectedRegion.value ?? 'all',
  set: (v: string) => (selectedRegion.value = v === 'all' ? null : v),
})

const rangeItems = [
  { title: 'Today', value: 'today' },
  { title: '7 Days', value: 'week' },
  { title: '30 Days', value: 'month' },
  { title: '90 Days', value: 'quarter' },
  { title: 'YTD', value: 'ytd' },
]

const regionNames = ['Northeast', 'Southeast', 'Midwest', 'West', 'International']
const regionItems = [
  { title: 'All Regions', value: 'all' },
  ...regionNames.map((name) => ({ title: name, value: name })),
]

const theme = inject<Ref<'light' | 'dark'>>('theme')!
const toggleTheme = inject<() => void>('toggleTheme')!
const isDark = computed(() => theme.value === 'dark')

const refreshing = ref(false)
const lastUpdated = ref('just now')

function onRefresh() {
  refreshing.value = true
  setTimeout(() => {
    refreshing.value = false
    lastUpdated.value = 'just now'
  }, 1200)
}
</script>

<style scoped>
.topbar {
  border-bottom: 1px solid rgba(148, 163, 184, 0.12) !important;
  font-family: Inter, sans-serif;
}
.lh-1 {
  line-height: 1;
}
.range-select {
  width: 140px;
  font-size: 13px;
  font-family: Inter, sans-serif;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
:deep(.range-select .v-field__outline) {
  --v-field-border-opacity: 0.4;
}
:deep(.range-select .v-field--focused .v-field__outline) {
  --v-field-border-opacity: 1;
}
:deep(.range-select .v-select__selection-text) {
  color: rgb(var(--v-theme-primary));
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.region-select {
  width: 150px;
}
</style>

<style>
.range-select-menu .v-list-item--active {
  color: rgb(var(--v-theme-primary)) !important;
}
.range-select-menu .v-list-item-title {
  font-size: 13px;
  font-family: Inter, sans-serif;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
</style>
