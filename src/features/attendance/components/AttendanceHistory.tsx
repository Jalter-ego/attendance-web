import type { Feedback } from '../hooks/use-student-attendance'
import type { AttendanceHistory as History } from '../types/attendance'
import { formatClassDate, formatMarkedAt } from '../utils/format'
import StatusBadge from './StatusBadge'

type AttendanceHistoryProps = {
  history: History
  marking: boolean
  feedback: Feedback | null
  onMark: () => void
}

/**
 * Historial personal con resumen (RF-04, RF-05).
 *
 * La fila de hoy sin marca (`pending`) lleva el botón para marcar (RF-03): es la
 * única fecha en la que el estudiante puede hacerlo.
 */
function AttendanceHistory({ history, marking, feedback, onMark }: AttendanceHistoryProps) {
  const { summary } = history
  // El porcentaje solo cuenta fechas ya cerradas: las que vienen todavía no suman ni restan
  const closed = summary.present + summary.absent
  const rate = closed > 0 ? Math.round((summary.present / closed) * 100) : null

  const cards = [
    { label: 'Asistencias', value: summary.present, tone: 'present' },
    { label: 'Faltas', value: summary.absent, tone: 'absent' },
    { label: 'Por venir', value: summary.pending + summary.upcoming, tone: 'upcoming' },
    { label: 'Asistencia', value: rate === null ? '—' : `${rate}%`, tone: 'neutral' },
  ]

  return (
    <section className="history" aria-labelledby="history-title">
      <div className="history-heading">
        <span className="section-kicker">MI ASISTENCIA</span>
        <h2 className="page-title" id="history-title">{history.module.name}</h2>
      </div>

      <dl className="summary-grid">
        {cards.map((card) => (
          <div className={`summary-card summary-card--${card.tone}`} key={card.label}>
            <dt>{card.label}</dt>
            <dd>{card.value}</dd>
          </div>
        ))}
      </dl>

      {feedback && (
        <p className={`page-feedback page-feedback--${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>
          {feedback.text}
        </p>
      )}

      {history.sessions.length === 0 ? (
        <p className="history-empty">Este módulo todavía no tiene fechas de clase.</p>
      ) : (
        <div className="history-table-wrap">
          <table className="history-table">
            <thead>
              <tr>
                <th scope="col">Fecha</th>
                <th scope="col">Horario</th>
                <th scope="col">Estado</th>
                <th scope="col">Hora de marca</th>
              </tr>
            </thead>
            <tbody>
              {history.sessions.map((session) => (
                <tr key={session.id} className={session.classDate === history.today ? 'is-today' : undefined}>
                  <td>
                    {formatClassDate(session.classDate)}
                    {session.classDate === history.today && <span className="today-tag">Hoy</span>}
                  </td>
                  <td>{session.startTime} – {session.endTime}</td>
                  <td>
                    {session.status === 'pending' ? (
                      <button className="mark-button" type="button" onClick={onMark} disabled={marking}>
                        {marking ? 'Registrando…' : 'Marcar asistencia'}
                      </button>
                    ) : (
                      <StatusBadge status={session.status} />
                    )}
                  </td>
                  <td>{session.markedAt ? formatMarkedAt(session.markedAt) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default AttendanceHistory
