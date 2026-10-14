import { ApiError, apiRequest } from '../../../lib/api.ts'
import type { ActivityItem, ActivityPage } from '../types/activity.ts'

const ACTIONS = [
  'LOGIN', 'LOGOUT', 'ATTENDANCE_MARKED', 'ATTENDANCE_UPDATED', 'STUDENTS_IMPORTED', 'SESSIONS_IMPORTED', 'MODULE_ACTIVATED',
]

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

function isItem(value: unknown): value is ActivityItem {
  return record(value) && typeof value.id === 'string' && typeof value.createdAt === 'string'
    && ACTIONS.includes(value.action as string)
    && record(value.actor) && (value.actor.type === 'admin' || value.actor.type === 'student')
    && (value.oldValue === null || record(value.oldValue))
    && (value.newValue === null || record(value.newValue))
}

export async function fetchActivity(
  token: string,
  query: { studentId?: string; date?: string; limit: number; offset: number },
  signal?: AbortSignal,
): Promise<ActivityPage> {
  const params = new URLSearchParams({ limit: String(query.limit), offset: String(query.offset) })
  if (query.studentId) params.set('studentId', query.studentId)
  if (query.date) params.set('date', query.date)

  const data = await apiRequest(`/activity-logs?${params}`, { token, signal })
  if (record(data) && typeof data.total === 'number' && Array.isArray(data.items) && data.items.every(isItem)) {
    return data as ActivityPage
  }
  throw new ApiError('La respuesta del servidor no es válida. Inténtalo de nuevo.', 502)
}
