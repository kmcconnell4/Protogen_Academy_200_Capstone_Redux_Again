export interface KpiData {
  totalShipments: { current: number; prior: number }
  onTimeRate: { current: number; prior: number }
  avgTransitTime: { current: number; prior: number }
  openExceptions: { current: number; prior: number }
  revenueInTransit: { current: number; prior: number }
}

export interface ShipmentVolumeRecord {
  date: string
  totalShipments: number
  onTimeCount: number
  lateCount: number
}

export interface Region {
  name: string
  totalShipments: number
  onTimeRate: number
  avgTransitTime: number
  openExceptions: number
}

export interface Carrier {
  name: string
  totalShipments: number
  onTimeRate: number
  avgTransitTime: number
}

export type ExceptionType = 'delay' | 'damage' | 'customs hold' | 'lost' | 'address issue'
export type Severity = 'critical' | 'high' | 'medium' | 'low'
export type ExceptionStatus = 'open' | 'in progress' | 'escalated'

export interface Exception {
  shipmentId: string
  origin: string
  destination: string
  region: string
  carrier: string
  exceptionType: ExceptionType
  severity: Severity
  status: ExceptionStatus
  age: number
  assignedTo: string
  createdAt: string
}

export interface MetricsData {
  kpis: KpiData
  shipmentVolume: ShipmentVolumeRecord[]
  regions: Region[]
  carriers: Carrier[]
  exceptions: Exception[]
}

export type DateRange = 'today' | 'week' | 'month' | 'quarter'
