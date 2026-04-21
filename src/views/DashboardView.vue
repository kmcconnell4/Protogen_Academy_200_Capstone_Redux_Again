<template>
  <v-main class="bg-background">
    <TopBar />

    <v-container fluid class="pa-4 pa-sm-6" style="max-width: 1600px">

      <!-- KPI Row -->
      <v-row class="mb-4" dense>
        <v-col cols="12" sm="6" lg>
          <KpiCard
            label="Total Shipments"
            :value="kpis.totalShipments.current"
            :prior-value="kpis.totalShipments.prior"
            icon="mdi-package-variant-closed"
            accent-color="#38BDF8"
            scroll-target="exceptions-section"
          />
        </v-col>
        <v-col cols="12" sm="6" lg>
          <KpiCard
            label="On-Time Delivery"
            :value="kpis.onTimeRate.current"
            :prior-value="kpis.onTimeRate.prior"
            format="percent"
            icon="mdi-check-circle-outline"
            accent-color="#34D399"
          />
        </v-col>
        <v-col cols="12" sm="6" lg>
          <KpiCard
            label="Avg Transit Time"
            :value="kpis.avgTransitTime.current"
            :prior-value="kpis.avgTransitTime.prior"
            format="hours"
            icon="mdi-clock-outline"
            accent-color="#A78BFA"
            :higher-is-better="false"
          />
        </v-col>
        <v-col cols="12" sm="6" lg>
          <KpiCard
            label="Open Exceptions"
            :value="kpis.openExceptions.current"
            :prior-value="kpis.openExceptions.prior"
            icon="mdi-alert-circle-outline"
            accent-color="#FBBF24"
            :higher-is-better="false"
            scroll-target="exceptions-section"
          />
        </v-col>
        <v-col cols="12" sm="6" lg>
          <KpiCard
            label="Revenue in Transit"
            :value="kpis.revenueInTransit.current"
            :prior-value="kpis.revenueInTransit.prior"
            format="currency"
            icon="mdi-currency-usd"
            accent-color="#22D3EE"
          />
        </v-col>
      </v-row>

      <!-- Middle Section: Regional + Charts -->
      <v-row class="mb-4" style="align-items: stretch">
        <v-col cols="12" lg="5" xl="4">
          <RegionalBreakdown />
        </v-col>

        <v-col cols="12" lg="7" xl="8" class="d-flex flex-column" style="gap: 12px">
          <ShipmentVolumeChart />
          <OnTimeDeliveryChart style="flex: 1 1 0; min-height: 0" />
        </v-col>
      </v-row>

      <!-- Exceptions Table -->
      <div id="exceptions-section">
        <ExceptionsTable />
      </div>

    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import TopBar from '@/components/layout/TopBar.vue'
import KpiCard from '@/components/kpi/KpiCard.vue'
import ShipmentVolumeChart from '@/components/charts/ShipmentVolumeChart.vue'
import OnTimeDeliveryChart from '@/components/charts/OnTimeDeliveryChart.vue'
import RegionalBreakdown from '@/components/regional/RegionalBreakdown.vue'
import ExceptionsTable from '@/components/exceptions/ExceptionsTable.vue'
import { useMetrics } from '@/composables/useMetrics'

const { computedKpis: kpis } = useMetrics()
</script>
