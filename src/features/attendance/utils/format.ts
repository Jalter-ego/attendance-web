import type { SessionStatus } from '../types/attendance'

// `classDate` es una fecha de calendario sin hora: se formatea en UTC para que la
// zona del navegador no la corra un día
const classDateFormat = new Intl.DateTimeFormat('es', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
})

// `markedAt` llega en UTC: se muestra en la hora local del navegador
const timeFormat = new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit', hour12: false })

export function formatClassDate(classDate: string): string {
  const [year, month, day] = classDate.split('-').map(Number)
  const text = classDateFormat.format(new Date(Date.UTC(year, month - 1, day)))
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatMarkedAt(markedAt: string): string {
  return timeFormat.format(new Date(markedAt))
}

export const statusLabel: Record<SessionStatus, string> = {
  present: 'Presente',
  absent: 'Falta',
  pending: 'Pendiente',
  upcoming: 'Próxima',
}
