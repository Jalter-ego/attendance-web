import { CalendarDays, Check, Clock } from 'lucide-react'
import type { Feedback } from '../hooks/use-student-attendance'
import type { AttendanceHistory as History } from '../types/attendance'
import { formatClassDate, formatMarkedAt } from '../utils/format'
import StatusBadge from './StatusBadge'
import PageHeading from '../../../components/shared/PageHeading'
import EmptyState from '../../../components/shared/EmptyState'

type AttendanceHistoryProps = {
  history: History
  marking: boolean
  feedback: Feedback | null
  onMark: () => void
}

/**
 * Historial personal con resumen (RF-04, RF-05).
 *
 * La clase de hoy se destaca antes del resumen y del historial. El botón para
 * marcar solo aparece si hoy tiene una clase pendiente (RF-03).
 */
function AttendanceHistory({ history, marking, feedback, onMark }: AttendanceHistoryProps) {
  const { summary } = history
  const todaySession = history.sessions.find((session) => session.classDate === history.today)
  const nextSession = history.sessions.filter((session) => session.classDate > history.today).sort((a, b) => a.classDate.localeCompare(b.classDate))[0]
  const upcomingSession = todaySession ?? nextSession
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
      <PageHeading id="history-title" title="Mi asistencia" description={history.module.name} />

      <section className="student-today workspace-panel" aria-labelledby="student-today-title">
        <span className="student-today-icon"><CalendarDays size={24} strokeWidth={1.5} aria-hidden="true" /></span>
        <div className="student-today-copy">
          <h2 id="student-today-title">{todaySession ? 'Tu clase de hoy' : 'Hoy no tienes clase'}</h2>
          <p>{todaySession ? formatClassDate(todaySession.classDate) : nextSession ? `Próxima clase: ${formatClassDate(nextSession.classDate).toLowerCase()}` : 'No hay más clases programadas en este módulo.'}</p>
          {upcomingSession && <span className="student-today-hours"><Clock size={13} aria-hidden="true" />{upcomingSession.startTime} – {upcomingSession.endTime}</span>}
        </div>
        {todaySession && <div className="student-today-action">{todaySession.status === 'pending' ? (
          <button className="mark-button" type="button" onClick={onMark} disabled={marking}><Check size={16} strokeWidth={2} aria-hidden="true" />{marking ? 'Registrando…' : 'Marcar asistencia'}</button>
        ) : <StatusBadge status={todaySession.status} />}</div>}
      </section>

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

      <section className="workspace-panel history-panel" aria-labelledby="history-list-title">
        <header className="panel-heading"><div><h2 id="history-list-title">Historial de clases</h2><p>Las próximas fechas no afectan tu porcentaje de asistencia.</p></div><span className="count-label">{history.sessions.length} fechas</span></header>
      {history.sessions.length === 0 ? (
        <EmptyState icon={CalendarDays} title="Sin clases programadas" description="Las fechas aparecerán aquí cuando tu institución las cargue en el módulo." />
      ) : (
        <div className="ledger-wrap panel-table" tabIndex={0} role="region" aria-label="Historial personal de asistencia">
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
                    <StatusBadge status={session.status} />
                  </td>
                  <td className="history-marked">{session.markedAt ? formatMarkedAt(session.markedAt) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </section>
    </section>
  )
}

export default AttendanceHistory
