import type { ClassSession } from '../../attendance/types/attendance'
import type { StudentRow } from '../../students/types/student'

export type ModuleStatus = 'draft' | 'active' | 'archived'

/** `GET /modules`: los módulos en borrador y el activo, con cuántos datos tienen cargados */
export type ModuleSummary = {
  id: string
  name: string
  status: ModuleStatus
  activatedAt: string | null
  createdAt: string
  studentsCount: number
  sessionsCount: number
}

/** `GET /modules/:id`: vista previa con lo importado (RF-16) */
export type ModuleDetail = ModuleSummary & { students: StudentRow[]; sessions: ClassSession[] }

/** `POST /modules/:id/activate` (RF-13) */
export type ActivationResult = ModuleSummary & { archivedModule: { id: string; name: string } | null }
