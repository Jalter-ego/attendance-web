import { ApiError, apiRequest } from '../../../lib/api.ts'
import type {
  AttendanceHistory,
  ClassSession,
  HistorySession,
  MarkResult,
  SessionStatus,
} from '../types/attendance.ts'

const STATUSES: SessionStatus[] = ['present', 'absent', 'pending', 'upcoming']

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

function nullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string'
}

function isSession(value: unknown): value is ClassSession {
  return record(value) && ['id', 'classDate', 'startTime', 'endTime'].every((key) => typeof value[key] === 'string')
}

function isHistorySession(value: unknown): value is HistorySession {
  return isSession(value) && STATUSES.includes((value as HistorySession).status)
    && nullableString((value as HistorySession).markedAt)
}

function invalidResponse(): ApiError {
  return new ApiError('La respuesta del servidor no es válida. Inténtalo de nuevo.', 502)
}

export async function markAttendance(token: string): Promise<MarkResult> {
  const data = await apiRequest('/attendance/mark', { method: 'POST', token })
  if (record(data) && data.status === 'present' && typeof data.markedAt === 'string' && isSession(data.session)) {
    return data as MarkResult
  }
  throw invalidResponse()
}

export async function fetchMyHistory(token: string, signal?: AbortSignal): Promise<AttendanceHistory> {
  const data = await apiRequest('/attendance/me', { token, signal })
  if (
    record(data) && record(data.module) && typeof data.module.name === 'string'
    && typeof data.today === 'string' && record(data.summary)
    && Array.isArray(data.sessions) && data.sessions.every(isHistorySession)
  ) {
    return data as AttendanceHistory
  }
  throw invalidResponse()
}
