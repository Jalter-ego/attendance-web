import { ApiError, apiRequest } from '../../../lib/api.ts'
import type { AttendanceOverview, AttendanceUpdate, OverviewRecord } from '../types/admin.ts'

const STATUSES = ['present', 'absent', 'pending', 'upcoming']
const SOURCES = ['student', 'admin', null]

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

function strings(value: unknown, keys: string[]): boolean {
  return record(value) && keys.every((key) => typeof value[key] === 'string')
}

function isOverviewRecord(value: unknown): value is OverviewRecord {
  return record(value)
    && strings(value.student, ['id', 'registrationNumber', 'fullName'])
    && strings(value.session, ['id', 'classDate', 'startTime', 'endTime'])
    && STATUSES.includes(value.status as string)
    && (value.markedAt === null || typeof value.markedAt === 'string')
    && SOURCES.includes(value.source as string | null)
}

function invalidResponse(): ApiError {
  return new ApiError('La respuesta del servidor no es válida. Inténtalo de nuevo.', 502)
}

export async function fetchOverview(token: string, signal?: AbortSignal): Promise<AttendanceOverview> {
  const data = await apiRequest('/attendances', { token, signal })
  if (
    record(data) && strings(data.module, ['id', 'name']) && typeof data.today === 'string'
    && Array.isArray(data.records) && data.records.every(isOverviewRecord)
  ) {
    return data as AttendanceOverview
  }
  throw invalidResponse()
}

export async function updateAttendance(
  token: string,
  body: { studentId: string; classSessionId: string; status: 'present' | 'absent' },
): Promise<AttendanceUpdate> {
  const data = await apiRequest('/attendances', { method: 'PUT', token, body })
  if (
    record(data) && typeof data.changed === 'boolean' && (data.status === 'present' || data.status === 'absent')
    && (data.markedAt === null || typeof data.markedAt === 'string')
  ) {
    return data as AttendanceUpdate
  }
  throw invalidResponse()
}
