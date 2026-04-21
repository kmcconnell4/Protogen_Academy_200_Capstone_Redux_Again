<template>
  <v-app-bar flat color="surface" elevation="0" class="topbar">
    <v-app-bar-title>
      <div class="d-flex align-center ga-3">
        <v-icon icon="mdi-truck-fast" size="26" color="primary" />
        <div>
          <div class="text-subtitle-1 font-weight-bold lh-1" style="font-family: Inter, sans-serif; letter-spacing: -0.01em">
            FastForward Logistics
          </div>
          <div class="text-caption text-medium-emphasis">Operations Dashboard</div>
        </div>
      </div>
    </v-app-bar-title>

    <template #append>
      <div class="d-flex align-center ga-4 mr-3">
        <!-- Date/time -->
        <div class="text-caption text-medium-emphasis text-right" style="line-height: 1.5">
          <div class="font-weight-medium text-on-surface" style="opacity: 0.85">{{ currentDate }}</div>
          <div>{{ currentTime }}</div>
        </div>

        <!-- Date range selector -->
        <v-btn-toggle
          v-model="selectedRange"
          density="compact"
          color="primary"
          variant="outlined"
          divided
          rounded="lg"
        >
          <v-btn value="today" size="small">Today</v-btn>
          <v-btn value="week" size="small">Week</v-btn>
          <v-btn value="month" size="small">Month</v-btn>
          <v-btn value="quarter" size="small">Quarter</v-btn>
        </v-btn-toggle>

        <!-- Last updated & refresh -->
        <div class="d-flex align-center ga-1">
          <span class="text-caption text-medium-emphasis">Updated {{ lastUpdated }}</span>
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
import { computed, inject, onUnmounted, ref } from 'vue'
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

const now = ref(new Date())
const ticker = setInterval(() => { now.value = new Date() }, 1000)
onUnmounted(() => clearInterval(ticker))

const currentDate = computed(() =>
  now.value.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
)
const currentTime = computed(() =>
  now.value.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }),
)

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
</style>
