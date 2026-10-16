import { ArrowUpRight, CalendarDays, Clock } from 'lucide-react'
import { Link } from 'react-router'
import PageHeading from '../../components/shared/PageHeading'
import { useActivity } from '../../features/activity/hooks/use-activity'
import { actionLabel, describeActivity, formatDateTime } from '../../features/activity/utils/describe'
import { useAttendanceOverview } from '../../features/attendance/hooks/use-attendance-overview'
import type { AttendanceOverview, OverviewRecord } from '../../features/attendance/types/admin'
import StatusIcon from '../../features/attendance/components/StatusIcon'
import { formatClassDate, statusLabel } from '../../features/attendance/utils/format'
import { useAdminSession } from '../../features/auth/context/useAdminSession'
import { paths } from '../../routes/paths'
import './AdminHomePage.css'

/** Cuántas acciones recientes se muestran. Los inicios y cierres de sesión no cuentan */
const RECENT_COUNT = 6

/** Lo que pasa hoy en el módulo activo, armado con los registros del overview */
function summarize(data: AttendanceOverview) {
  const sessions = [...new Map(data.records.map((r) => [r.session.id, r.session])).values()]
    .sort((a, b) => a.classDate.localeCompare(b.classDate))
  const todaySession = sessions.find((s) => s.classDate === data.today) ?? null
  const nextSession = sessions.find((s) => s.classDate > data.today) ?? null
  const todayRecords = data.records
    .filter((r) => r.session.classDate === data.today)
    .sort((a, b) => a.student.fullName.localeCompare(b.student.fullName))

  // El porcentaje solo cuenta fechas ya cerradas, igual que el historial del estudiante
  const present = data.records.filter((r) => r.status === 'present').length
  const absent = data.records.filter((r) => r.status === 'absent').length
  return {
    sessions,
    todaySession,
    nextSession,
    todayRecords,
    held: sessions.filter((s) => s.classDate <= data.today).length,
    rate: present + absent > 0 ? Math.round((present / (present + absent)) * 100) : null,
  }
}

/** Inicio del admin: la clase de hoy, quién falta marcar y lo último que pasó */
function AdminHomePage() {
  const session = useAdminSession()
  const overview = useAttendanceOverview(session.accessToken)
  const activity = useActivity(session.accessToken, { studentId: '', date: '', page: 1 })
  const firstName = session.user.name.split(' ')[0]

  const data = overview.state.status === 'ready' ? overview.state.data : null
  const names = new Map(data?.records.map((r) => [r.student.id, r.student.fullName]) ?? [])
  const recent = (activity.data?.items ?? [])
    .filter((item) => item.action !== 'LOGIN' && item.action !== 'LOGOUT')
    .slice(0, RECENT_COUNT)

  const metrics = data ? summarize(data) : null
  const studentCount = new Set(data?.records.map((record) => record.student.id)).size

  return (
    <div className="home">
      <PageHeading title={`Hola, ${firstName}`} description={data ? `Este es el resumen de ${data.module.name}.` : 'Tu espacio para el seguimiento de la asistencia.'}
        actions={data && <span className="home-date"><CalendarDays size={16} aria-hidden="true" />{formatClassDate(data.today)}</span>} />

      {metrics && (
        <dl className="summary-grid home-summary">
          <div className="summary-card"><dt>Estudiantes inscritos</dt><dd>{studentCount}</dd></div>
          <div className="summary-card"><dt>Clases dadas</dt><dd>{metrics.held}<span className="summary-context"> / {metrics.sessions.length}</span></dd></div>
          <div className="summary-card summary-card--present"><dt>Asistencia del módulo</dt><dd>{metrics.rate === null ? '—' : `${metrics.rate}%`}</dd></div>
        </dl>
      )}

      <div className="home-grid">
        {overview.state.status === 'loading' && <p className="page-status" role="status">Cargando el día…</p>}

        {overview.state.status === 'error' && (
          <div className="page-error" role="alert">
            <p>{overview.state.message}</p>
            <div className="home-error-actions">
              <button className="secondary-button" type="button" onClick={overview.retry}>Volver a intentar</button>
              <Link className="secondary-button" to={paths.adminModules}>Ir a módulos</Link>
            </div>
          </div>
        )}

        {data && <TodayPanel data={data} />}

        <section className="home-recent workspace-panel" aria-labelledby="recent-title">
          <header className="panel-heading"><div><h2 id="recent-title">Actividad reciente</h2><p>Marcas, correcciones e importaciones del módulo.</p></div></header>
          <div className="home-recent-body">
          {activity.error ? (
            <p className="home-muted">{activity.error}</p>
          ) : !activity.data ? (
            <p className="home-muted" role="status">Cargando…</p>
          ) : recent.length === 0 ? (
            <p className="home-muted">Todavía no hay marcas, correcciones ni importaciones.</p>
          ) : (
            <ol className="recent-list">
              {recent.map((item) => (
                <li key={item.id}>
                  <time dateTime={item.createdAt}>{formatDateTime(item.createdAt)}</time>
                  <span className="recent-what">
                    <strong>{item.actor.name ?? 'Usuario eliminado'}</strong> {actionLabel[item.action].toLowerCase()}
                  </span>
                  <span className="recent-detail">{describeActivity(item, (id) => names.get(id) ?? null)}</span>
                </li>
              ))}
            </ol>
          )}
          <Link className="home-link" to={paths.adminActivity}>Ver todo el historial <ArrowUpRight size={14} aria-hidden="true" /></Link>
          </div>
        </section>
      </div>
    </div>
  )
}

function TodayPanel({ data }: { data: AttendanceOverview }) {
  const { todaySession, nextSession, todayRecords } = summarize(data)
  const marked = todayRecords.filter((r) => r.status === 'present').length
  const missing = todayRecords.filter((r) => r.status === 'pending')

  return (
    <section className="home-today" aria-labelledby="today-title">
      <header className="home-today-header">
        <h2 id="today-title">{todaySession ? 'Clase de hoy' : 'Hoy no hay clase'}</h2>
        {todaySession && (
          <span>
            <Clock size={14} aria-hidden="true" />
            {todaySession.startTime} – {todaySession.endTime}
          </span>
        )}
      </header>

      <div className="home-today-body">
        {todaySession ? (
          <>
            <p className="home-today-count">
              <strong>{marked}</strong> de {todayRecords.length} presentes
            </p>

            {/* Una marca por estudiante, igual que la columna de hoy en Asistencias */}
            <ul className="home-today-marks" aria-label="Asistencia de hoy por estudiante">
              {todayRecords.map((record: OverviewRecord) => (
                <li key={record.student.id}>
                  <span
                    className={`grid-mark grid-mark--${record.status}`}
                    title={`${record.student.fullName}: ${statusLabel[record.status]}`}
                    aria-label={`${record.student.fullName}: ${statusLabel[record.status]}`}
                  >
                    <StatusIcon status={record.status} />
                  </span>
                </li>
              ))}
            </ul>

            {missing.length > 0 ? (
              <p className="home-today-missing">
                Sin marcar todavía: {missing.map((r) => r.student.fullName).join(', ')}.
              </p>
            ) : (
              <p className="home-today-missing">Todos los estudiantes ya tienen su asistencia de hoy.</p>
            )}
          </>
        ) : (
          <p className="home-today-missing">
            {nextSession
              ? `La próxima es el ${formatClassDate(nextSession.classDate).toLowerCase()}, de ${nextSession.startTime} a ${nextSession.endTime}.`
              : 'El módulo ya no tiene clases por delante.'}
          </p>
        )}

        <Link className="primary-button home-today-action" to={paths.adminAttendances}>Abrir asistencias</Link>
      </div>
    </section>
  )
}

export default AdminHomePage
