<template>
  <v-card>
    <v-card-title class="pa-4 pb-2 d-flex align-center flex-wrap ga-3">
      <div class="d-flex align-center ga-2">
        <v-icon icon="mdi-alert-circle-outline" color="error" />
        <span class="text-subtitle-1 font-weight-semibold">Open Exceptions</span>
        <v-chip color="error" size="small" variant="tonal">
          {{ filteredExceptions.length }}
        </v-chip>
      </div>

      <v-spacer />

      <!-- Search -->
      <v-text-field
        v-model="exceptionSearch"
        prepend-inner-icon="mdi-magnify"
        placeholder="Search shipment ID, city, or assignee…"
        density="compact"
        variant="outlined"
        hide-details
        clearable
        style="max-width: 280px"
      />

      <!-- Type filter -->
      <v-select
        v-model="exceptionTypeFilter"
        :items="exceptionTypes"
        label="Type"
        density="compact"
        variant="outlined"
        hide-details
        clearable
        style="max-width: 150px"
      />

      <!-- Severity filter -->
      <v-select
        v-model="exceptionSeverityFilter"
        :items="severities"
        label="Severity"
        density="compact"
        variant="outlined"
        hide-details
        clearable
        style="max-width: 140px"
      />

      <!-- Export CSV -->
      <v-btn
        variant="outlined"
        size="small"
        prepend-icon="mdi-download"
        @click="exportCsv"
      >
        CSV
      </v-btn>
    </v-card-title>

    <v-divider />

    <v-data-table
      :headers="headers"
      :items="filteredExceptions"
      :sort-by="sortBy"
      item-value="shipmentId"
      density="compact"
      hover
      class="exceptions-table"
      :row-props="rowProps"
    >
      <!-- Severity chip -->
      <template #item.severity="{ item }">
        <v-chip
          :color="severityColor(item.severity)"
          size="x-small"
          variant="flat"
          class="font-weight-bold text-uppercase"
        >
          {{ item.severity }}
        </v-chip>
      </template>

      <!-- Exception type -->
      <template #item.exceptionType="{ item }">
        <div class="d-flex align-center ga-1">
          <v-icon :icon="exceptionIcon(item.exceptionType)" size="14" />
          <span class="text-capitalize">{{ item.exceptionType }}</span>
        </div>
      </template>

      <!-- Status chip -->
      <template #item.status="{ item }">
        <v-chip
          :color="statusColor(item.status)"
          size="x-small"
          variant="tonal"
          class="text-capitalize"
        >
          {{ item.status }}
        </v-chip>
      </template>

      <!-- Age -->
      <template #item.age="{ item }">
        <span :class="item.age >= 48 ? 'text-error font-weight-bold' : ''">
          {{ formatAge(item.age) }}
        </span>
      </template>

      <!-- Expand row -->
      <template #item.actions="{ item }">
        <v-btn
          :icon="expandedRow === item.shipmentId ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          variant="text"
          size="x-small"
          @click.stop="toggleExpand(item.shipmentId)"
        />
      </template>

      <!-- Expanded detail -->
      <template #expanded-row="{ item }">
        <tr>
          <td :colspan="headers.length + 1" class="pa-0">
            <v-sheet color="surface-variant" class="pa-4 d-flex flex-wrap ga-6">
              <div>
                <div class="text-caption text-medium-emphasis text-uppercase font-weight-medium mb-1">Carrier</div>
                <div class="text-body-2">{{ item.carrier }}</div>
              </div>
              <div>
                <div class="text-caption text-medium-emphasis text-uppercase font-weight-medium mb-1">Region</div>
                <div class="text-body-2">{{ item.region }}</div>
              </div>
              <div>
                <div class="text-caption text-medium-emphasis text-uppercase font-weight-medium mb-1">Created</div>
                <div class="text-body-2">{{ formatDate(item.createdAt) }}</div>
              </div>
              <div>
                <div class="text-caption text-medium-emphasis text-uppercase font-weight-medium mb-1">Assigned To</div>
                <div class="text-body-2">{{ item.assignedTo }}</div>
              </div>
            </v-sheet>
          </td>
        </tr>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Exception } from '@/types'
import { useMetrics } from '@/composables/useMetrics'

const {
  filteredExceptions,
  exceptionSearch,
  exceptionTypeFilter,
  exceptionSeverityFilter,
} = useMetrics()

const expandedRow = ref<string | null>(null)

function toggleExpand(id: string) {
  expandedRow.value = expandedRow.value === id ? null : id
}

const exceptionTypes = [
  { title: 'Delay', value: 'delay' },
  { title: 'Damage', value: 'damage' },
  { title: 'Customs Hold', value: 'customs hold' },
  { title: 'Lost', value: 'lost' },
  { title: 'Address Issue', value: 'address issue' },
]
const severities = [
  { title: 'Critical', value: 'critical' },
  { title: 'High', value: 'high' },
  { title: 'Medium', value: 'medium' },
  { title: 'Low', value: 'low' },
]

const headers = [
  { title: 'Shipment ID', key: 'shipmentId', width: '140px' },
  { title: 'Origin', key: 'origin' },
  { title: 'Destination', key: 'destination' },
  { title: 'Type', key: 'exceptionType', width: '150px' },
  { title: 'Severity', key: 'severity', width: '110px' },
  { title: 'Status', key: 'status', width: '120px' },
  { title: 'Age', key: 'age', width: '90px' },
  { title: 'Assigned To', key: 'assignedTo', width: '140px' },
  { title: '', key: 'actions', sortable: false, width: '50px' },
]

const sortBy = [
  { key: 'severity', order: 'asc' as const },
  { key: 'age', order: 'desc' as const },
]

const severityOrder: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

function severityColor(s: string): string {
  return { critical: 'error', high: 'warning', medium: 'info', low: 'blue-grey' }[s] ?? 'blue-grey'
}

function statusColor(s: string): string {
  return { open: 'grey', 'in progress': 'primary', escalated: 'error' }[s] ?? 'grey'
}

function exceptionIcon(type: string): string {
  return (
    {
      delay: 'mdi-clock-alert-outline',
      damage: 'mdi-package-variant-remove',
      'customs hold': 'mdi-gavel',
      lost: 'mdi-map-marker-question-outline',
      'address issue': 'mdi-home-alert-outline',
    }[type] ?? 'mdi-alert-outline'
  )
}

function formatAge(hours: number): string {
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  const rem = hours % 24
  return rem > 0 ? `${days}d ${rem}h` : `${days}d`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function rowProps({ item }: { item: Exception }) {
  const classes: Record<string, boolean> = {
    'row-critical': item.severity === 'critical',
    'row-high': item.severity === 'high',
    'row-expanded': expandedRow.value === item.shipmentId,
  }
  return { class: classes, onClick: () => toggleExpand(item.shipmentId) }
}

function exportCsv() {
  const cols = [
    'shipmentId',
    'origin',
    'destination',
    'region',
    'carrier',
    'exceptionType',
    'severity',
    'status',
    'age',
    'assignedTo',
    'createdAt',
  ] as const

  const rows = [
    cols.join(','),
    ...filteredExceptions.value.map((e) =>
      cols.map((c) => `"${e[c]}"`).join(','),
    ),
  ]

  const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'exceptions-export.csv'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.exceptions-table :deep(.row-critical) {
  background: rgba(198, 40, 40, 0.06) !important;
}
.exceptions-table :deep(.row-critical:hover) {
  background: rgba(198, 40, 40, 0.1) !important;
}
.exceptions-table :deep(.row-high) {
  background: rgba(245, 124, 0, 0.05) !important;
}
.exceptions-table :deep(.row-expanded) {
  background: rgba(10, 61, 107, 0.05) !important;
}
.exceptions-table {
  cursor: pointer;
}
</style>
