import { cellKey } from '../hooks/use-attendance-overview'
import type { OverviewRecord, OverviewStudent } from '../types/admin'
import type { ClassSession } from '../types/attendance'
import { formatClassDate, formatMarkedAt, formatShortDate, statusLabel } from '../utils/format'

type AttendanceGridProps = {
  students: OverviewStudent[]
  sessions: ClassSession[]
  records: Map<string, OverviewRecord>
  today: string
  /** Celda que se está guardando, para bloquearla */
  saving: string | null
  onEdit: (record: OverviewRecord) => void
}

/** Detalle de la celda para el lector de pantalla y el tooltip */
function describe(record: OverviewRecord): string {
  const parts = [statusLabel[record.status]]
  if (record.markedAt) parts.push(`marcó a las ${formatMarkedAt(record.markedAt)}`)
  if (record.source === 'admin') parts.push('corregido por un administrador')
  return parts.join(', ')
}

/**
 * Tabla estudiante × fecha (RF-08). Cada celda abre la corrección (RF-07),
 * salvo las fechas que todavía no llegan.
 */
function AttendanceGrid({ students, sessions, records, today, saving, onEdit }: AttendanceGridProps) {
  const count = (items: (OverviewRecord | undefined)[], status: OverviewRecord['status']) =>
    items.filter((item) => item?.status === status).length

  return (
    <div className="grid-wrap">
      <table className="attendance-grid">
        <thead>
          <tr>
            <th scope="col" className="grid-student">Estudiante</th>
            {sessions.map((session) => (
              <th
                scope="col"
                key={session.id}
                className={session.classDate === today ? 'is-today' : undefined}
                title={`${formatClassDate(session.classDate)}, ${session.startTime} – ${session.endTime}`}
              >
                {formatShortDate(session.classDate)}
                {session.classDate === today && <span className="grid-today">Hoy</span>}
              </th>
            ))}
            <th scope="col" className="grid-total">Asist.</th>
            <th scope="col" className="grid-total">Faltas</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const row = sessions.map((session) => records.get(cellKey(student.id, session.id)))
            return (
              <tr key={student.id}>
                <th scope="row" className="grid-student">
                  <span className="grid-student-name">{student.fullName}</span>
                  <span className="grid-student-registration">{student.registrationNumber}</span>
                </th>
                {row.map((record, index) => {
                  const session = sessions[index]
                  if (!record) return <td key={session.id} className="grid-cell">—</td>
                  const key = cellKey(student.id, session.id)
                  const label = `${student.fullName}, ${formatClassDate(session.classDate)}: ${describe(record)}`
                  return (
                    <td key={session.id} className={`grid-cell${session.classDate === today ? ' is-today' : ''}`}>
                      {record.status === 'upcoming' ? (
                        <span className="grid-status grid-status--upcoming" title={label} aria-label={label}>
                          {statusLabel.upcoming}
                        </span>
                      ) : (
                        <button
                          type="button"
                          className={`grid-status grid-status--${record.status}`}
                          onClick={() => onEdit(record)}
                          disabled={saving !== null}
                          aria-busy={saving === key}
                          title={`${describe(record)}. Clic para corregir`}
                          aria-label={`${label}. Corregir`}
                        >
                          {saving === key ? 'Guardando…' : statusLabel[record.status]}
                          {record.source === 'admin' && <span className="grid-edited" aria-hidden="true">•</span>}
                        </button>
                      )}
                    </td>
                  )
                })}
                <td className="grid-total grid-total--present">{count(row, 'present')}</td>
                <td className="grid-total grid-total--absent">{count(row, 'absent')}</td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" className="grid-student">Presentes</th>
            {sessions.map((session) => {
              const column = students.map((student) => records.get(cellKey(student.id, session.id)))
              return (
                <td key={session.id} className={`grid-total${session.classDate === today ? ' is-today' : ''}`}>
                  {session.classDate > today ? '—' : `${count(column, 'present')}/${students.length}`}
                </td>
              )
            })}
            <td className="grid-total" colSpan={2} />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default AttendanceGrid
