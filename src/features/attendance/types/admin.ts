import type { ClassSession, SessionStatus } from './attendance'

export type OverviewStudent = { id: string; registrationNumber: string; fullName: string }

/** Una celda estudiante × fecha. `source` es null si nadie registró nada todavía */
export type OverviewRecord = {
  student: OverviewStudent
  session: ClassSession
  status: SessionStatus
  markedAt: string | null
  source: 'student' | 'admin' | null
}

/** `GET /attendances` (RF-08) */
export type AttendanceOverview = {
  module: { id: string; name: string }
  today: string
  records: OverviewRecord[]
}

/** `PUT /attendances` (RF-07). `changed` es false si el estado ya era ese */
export type AttendanceUpdate = {
  changed: boolean
  previousStatus: SessionStatus
  status: 'present' | 'absent'
  markedAt: string | null
}
