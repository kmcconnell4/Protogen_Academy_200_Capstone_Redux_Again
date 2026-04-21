<template>
  <v-app-bar flat color="primary" :elevation="2">
    <v-app-bar-title>
      <div class="d-flex align-center ga-3">
        <v-icon icon="mdi-truck-fast" size="28" color="white" />
        <div>
          <div class="text-h6 font-weight-bold text-white lh-1">FastForward Logistics</div>
          <div class="text-caption text-white" style="opacity: 0.8">Operations Dashboard</div>
        </div>
      </div>
    </v-app-bar-title>

    <template #append>
      <div class="d-flex align-center ga-4 mr-2">
        <!-- Date/time display -->
        <div class="text-caption text-white text-right" style="opacity: 0.9; line-height: 1.4">
          <div class="font-weight-medium">{{ currentDate }}</div>
          <div>{{ currentTime }}</div>
        </div>

        <!-- Date range selector -->
        <v-btn-toggle
          v-model="selectedRange"
          density="compact"
          color="white"
          variant="outlined"
          divided
          rounded="lg"
        >
          <v-btn value="today" size="small" class="text-white">Today</v-btn>
          <v-btn value="week" size="small" class="text-white">Week</v-btn>
          <v-btn value="month" size="small" class="text-white">Month</v-btn>
          <v-btn value="quarter" size="small" class="text-white">Quarter</v-btn>
        </v-btn-toggle>

        <!-- Last updated & refresh -->
        <div class="d-flex align-center ga-1">
          <div class="text-caption text-white" style="opacity: 0.8">
            Updated {{ lastUpdated }}
          </div>
          <v-btn
            icon="mdi-refresh"
            variant="text"
            color="white"
            size="small"
            :loading="refreshing"
            @click="onRefresh"
          />
        </div>

        <!-- Dark mode toggle -->
        <v-btn
          :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          variant="text"
          color="white"
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

const { selectedDateRange } = useMetrics()

const selectedRange = computed({
  get: () => selectedDateRange.value,
  set: (v) => (selectedDateRange.value = v as typeof selectedDateRange.value),
})

const theme = inject<Ref<'light' | 'dark'>>('theme')!
const toggleTheme = inject<() => void>('toggleTheme')!
const isDark = computed(() => theme.value === 'dark')

const now = new Date('2026-04-21T08:00:00')
const currentDate = now.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})
const currentTime = now.toLocaleTimeString('en-US', {
  hour: '2-digit',
  minute: '2-digit',
})

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
