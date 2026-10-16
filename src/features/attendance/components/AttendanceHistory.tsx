import { Check } from 'lucide-react'
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
        <p className="eyebrow">Tu registro</p>
        <h1 className="page-title" id="history-title">Mi asistencia</h1>
        <p>{history.module.name}</p>
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
        <div className="ledger-wrap">
          <table className="ledger history-table">
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
                  <td className="history-date">
                    {session.classDate === history.today && <span className="today-tag">Hoy</span>}
                    {formatClassDate(session.classDate)}
                  </td>
                  <td className="history-hours">{session.startTime} – {session.endTime}</td>
                  <td className="history-status">
                    {session.status === 'pending' ? (
                      <button className="mark-button" type="button" onClick={onMark} disabled={marking}>
                        <Check size={16} strokeWidth={2.5} aria-hidden="true" />
                        {marking ? 'Registrando…' : 'Marcar asistencia'}
                      </button>
                    ) : (
                      <StatusBadge status={session.status} />
                    )}
                  </td>
                  <td className="history-marked">{session.markedAt ? formatMarkedAt(session.markedAt) : '—'}</td>
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
