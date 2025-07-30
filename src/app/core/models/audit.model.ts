export interface Audit {
  _id: string
  userId: number
  userName: string
  userEmail: string
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  entityType: 'PERSONA'
  entityId: number
  entityData: any
  previousData?: any
  timestamp: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
  updatedAt: string
}

export interface AuditPagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface AuditResponse {
  success: boolean
  data: Audit[]
  pagination: AuditPagination
}

export interface AuditStats {
  actionStats: Array<{
    _id: string
    count: number
  }>
  topUsers: Array<{
    _id: string
    count: number
  }>
}

export interface AuditStatsResponse {
  success: boolean
  data: AuditStats
}

export interface AuditFilters {
  userId?: number
  entityType?: string
  entityId?: number
  action?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}
