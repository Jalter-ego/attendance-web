export type ActivityAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'ATTENDANCE_MARKED'
  | 'ATTENDANCE_UPDATED'
  | 'STUDENTS_IMPORTED'
  | 'SESSIONS_IMPORTED'
  | 'MODULE_ACTIVATED'

/** Un registro del historial (RF-09). `oldValue` y `newValue` dependen de la acción */
export type ActivityItem = {
  id: string
  createdAt: string
  action: ActivityAction
  actor: { type: 'admin' | 'student'; id: string | null; name: string | null }
  entityType: string | null
  entityId: string | null
  oldValue: Record<string, unknown> | null
  newValue: Record<string, unknown> | null
  ip: string | null
}

/** `GET /activity-logs` (RF-10), paginado del más reciente al más antiguo */
export type ActivityPage = { total: number; limit: number; offset: number; items: ActivityItem[] }

export type ActivityFilters = { studentId: string; date: string; page: number }
