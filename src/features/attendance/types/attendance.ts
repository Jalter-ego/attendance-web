/** Estado de una fecha de clase, tal como lo resuelve el API (RN-05) */
export type SessionStatus = 'present' | 'absent' | 'pending' | 'upcoming'

/** Fecha de clase. `classDate` es 'YYYY-MM-DD' y las horas 'HH:mm' */
export type ClassSession = { id: string; classDate: string; startTime: string; endTime: string }

/** `POST /attendance/mark` */
export type MarkResult = { id: string; status: 'present'; markedAt: string; session: ClassSession }

export type HistorySession = ClassSession & { status: SessionStatus; markedAt: string | null }

export type AttendanceSummary = Record<SessionStatus, number> & { total: number }

/** `GET /attendance/me` (RF-05) */
export type AttendanceHistory = {
  module: { id: string; name: string }
  today: string
  summary: AttendanceSummary
  sessions: HistorySession[]
}
