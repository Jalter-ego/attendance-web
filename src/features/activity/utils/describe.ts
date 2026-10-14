import { formatClassDate, formatMarkedAt, statusLabel } from '../../attendance/utils/format'
import type { SessionStatus } from '../../attendance/types/attendance'
import type { ActivityAction, ActivityItem } from '../types/activity'

export const actionLabel: Record<ActivityAction, string> = {
  LOGIN: 'Inicio de sesión',
  LOGOUT: 'Cierre de sesión',
  ATTENDANCE_MARKED: 'Marcó asistencia',
  ATTENDANCE_UPDATED: 'Corrigió asistencia',
  STUDENTS_IMPORTED: 'Importó estudiantes',
  SESSIONS_IMPORTED: 'Importó fechas',
  MODULE_ACTIVATED: 'Activó un módulo',
}

const dateTimeFormat = new Intl.DateTimeFormat('es', { dateStyle: 'short', timeStyle: 'short' })

/** `createdAt` llega en UTC; se muestra en la hora local del navegador */
export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso))
}

const text = (value: unknown) => (typeof value === 'string' && value ? value : null)
const number = (value: unknown) => (typeof value === 'number' ? value : null)
const status = (value: unknown) =>
  typeof value === 'string' && value in statusLabel ? statusLabel[value as SessionStatus] : null
const classDate = (value: unknown) => {
  const date = text(value)
  return date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? formatClassDate(date).toLowerCase() : null
}

/**
 * Detalle legible de un registro a partir de `oldValue` y `newValue`.
 * `studentName` resuelve el nombre del estudiante en una corrección, que el API
 * guarda solo con su id y registro.
 */
export function describeActivity(item: ActivityItem, studentName: (id: string) => string | null): string {
  const before = item.oldValue ?? {}
  const after = item.newValue ?? {}

  switch (item.action) {
    case 'ATTENDANCE_MARKED': {
      const date = classDate(after.classDate)
      const markedAt = text(after.markedAt)
      return [date && `Clase del ${date}`, markedAt && `a las ${formatMarkedAt(markedAt)}`].filter(Boolean).join(', ')
    }
    case 'ATTENDANCE_UPDATED': {
      const id = text(after.studentId)
      const who = (id && studentName(id)) ?? (text(after.registrationNumber) && `Registro ${text(after.registrationNumber)}`)
      const date = classDate(after.classDate)
      const change = `${status(before.status) ?? '—'} → ${status(after.status) ?? '—'}`
      return [who, date && `clase del ${date}`, change].filter(Boolean).join(' · ')
    }
    case 'STUDENTS_IMPORTED':
    case 'SESSIONS_IMPORTED': {
      const file = text(after.fileName)
      const rows = number(after.rows)
      const noun = item.action === 'STUDENTS_IMPORTED' ? 'estudiantes' : 'fechas'
      return [file && `«${file}»`, rows !== null && `${rows} ${noun}`].filter(Boolean).join(' · ')
    }
    case 'MODULE_ACTIVATED': {
      const name = text(after.activeModuleName)
      const students = number(after.studentsCount)
      const sessions = number(after.sessionsCount)
      const archived = text(before.activeModuleName)
      return [
        name && `«${name}»`,
        students !== null && sessions !== null && `${students} estudiantes y ${sessions} fechas`,
        archived && `archivó «${archived}»`,
      ].filter(Boolean).join(' · ')
    }
    default:
      return ''
  }
}
