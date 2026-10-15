import { useEffect, useRef } from 'react'
import { cellKey } from '../hooks/use-attendance-overview'
import type { OverviewRecord, OverviewStudent } from '../types/admin'
import type { ClassSession } from '../types/attendance'
import { formatClassDate, formatColumnDate, formatMarkedAt, statusLabel } from '../utils/format'
import StatusIcon from './StatusIcon'

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
 * Tabla estudiante × fecha (RF-08). Cada marca abre la corrección (RF-07),
 * salvo las fechas que todavía no llegan. La columna de hoy va resaltada.
 */
function AttendanceGrid({ students, sessions, records, today, saving, onEdit }: AttendanceGridProps) {
  const count = (items: (OverviewRecord | undefined)[], status: OverviewRecord['status']) =>
    items.filter((item) => item?.status === status).length
  const todayClass = (session: ClassSession) => (session.classDate === today ? ' is-today' : '')
  const wrapRef = useRef<HTMLDivElement>(null)

  // Con muchas fechas, la de hoy puede quedar fuera de vista: se desplaza hasta
  // ella al abrir, dejando a la vista también la clase anterior
  useEffect(() => {
    const wrap = wrapRef.current
    const column = wrap?.querySelector<HTMLElement>('thead .is-today')
    const student = wrap?.querySelector<HTMLElement>('thead .grid-student')
    if (!wrap || !column || !student) return
    const previous = column.previousElementSibling as HTMLElement | null
    const target = (previous && previous !== student ? previous : column).offsetLeft - student.offsetWidth
    wrap.scrollLeft = Math.max(0, target)
  }, [today, sessions.length])

  return (
    <div className="grid-wrap" ref={wrapRef}>
      <table className="attendance-grid">
        <thead>
          <tr>
            <th scope="col" className="grid-student">Estudiante</th>
            {sessions.map((session) => {
              const { weekday, day } = formatColumnDate(session.classDate)
              return (
                <th
                  scope="col"
                  key={session.id}
                  className={`grid-date${todayClass(session)}`}
                  title={`${formatClassDate(session.classDate)}, ${session.startTime} – ${session.endTime}`}
                >
                  <span className="grid-date-weekday">{session.classDate === today ? 'hoy' : weekday}</span>
                  <span className="grid-date-day">{day}</span>
                </th>
              )
            })}
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
                  if (!record) return <td key={session.id} className={`grid-cell${todayClass(session)}`}>—</td>
                  const key = cellKey(student.id, session.id)
                  const label = `${student.fullName}, ${formatClassDate(session.classDate)}: ${describe(record)}`
                  const edited = record.source === 'admin' ? ' is-edited' : ''
                  return (
                    <td key={session.id} className={`grid-cell${todayClass(session)}`}>
                      {record.status === 'upcoming' ? (
                        <span className="grid-mark grid-mark--upcoming" title={label} aria-label={label}>
                          <StatusIcon status="upcoming" />
                        </span>
                      ) : (
                        <button
                          type="button"
                          className={`grid-mark grid-mark--${record.status}${edited}`}
                          onClick={() => onEdit(record)}
                          disabled={saving !== null}
                          aria-busy={saving === key}
                          title={`${describe(record)}. Clic para corregir`}
                          aria-label={`${label}. Corregir`}
                        >
                          {saving === key ? <span aria-hidden="true">…</span> : <StatusIcon status={record.status} />}
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
                <td key={session.id} className={`grid-total${todayClass(session)}`}>
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
