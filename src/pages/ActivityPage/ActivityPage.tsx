import { ChevronLeft, ChevronRight, History, X } from 'lucide-react'
import { useSearchParams } from 'react-router'
import PageHeading from '../../components/shared/PageHeading'
import EmptyState from '../../components/shared/EmptyState'
import { PAGE_SIZE, useActivity } from '../../features/activity/hooks/use-activity'
import type { ActivityItem } from '../../features/activity/types/activity'
import { actionLabel, describeActivity, formatDateTime, formatDayHeading, formatTime, localDay } from '../../features/activity/utils/describe'
import { useAdminSession } from '../../features/auth/context/useAdminSession'
import { useStudents } from '../../features/students/hooks/use-students'
import './ActivityPage.css'

/** Historial de actividades del módulo activo, filtrable por estudiante o fecha (RF-10) */
function ActivityPage() {
  const session = useAdminSession()
  // Filtros y página en la URL, para que sobrevivan a una recarga
  const [searchParams, setSearchParams] = useSearchParams()
  const studentId = searchParams.get('estudiante') ?? ''
  const date = searchParams.get('fecha') ?? ''
  const page = Math.max(1, Number(searchParams.get('pagina')) || 1)

  const { data, loading, error, retry } = useActivity(session.accessToken, { studentId, date, page })
  const students = useStudents(session.accessToken, '')
  const names = new Map(students.data?.students.map((s) => [s.id, s.fullName]) ?? [])

  function update(changes: Record<string, string>) {
    const next = new URLSearchParams(searchParams)
    for (const [name, value] of Object.entries(changes)) {
      if (value) next.set(name, value)
      else next.delete(name)
    }
    setSearchParams(next, { replace: true })
  }

  const pages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1
  const from = data && data.total > 0 ? data.offset + 1 : 0
  const to = data ? data.offset + data.items.length : 0

  // El API manda del más reciente al más antiguo: se agrupa por día local sin reordenar
  const days: { key: string; heading: string; items: ActivityItem[] }[] = []
  for (const item of data?.items ?? []) {
    const key = localDay(item.createdAt)
    const last = days.at(-1)
    if (last?.key === key) last.items.push(item)
    else days.push({ key, heading: formatDayHeading(item.createdAt), items: [item] })
  }

  return (
    <section aria-labelledby="activity-title">
      <PageHeading id="activity-title" title="Actividad" description="Consulta las marcas de asistencia y los cambios realizados en el módulo activo." />
      <div className="workspace-panel">
        <header className="panel-heading"><div><h2>Historial de actividad</h2><p>{students.data?.module.name ?? 'Módulo activo'}</p></div>{data && <span className="count-label">{data.total} registros</span>}</header>

      <div className="activity-filters panel-toolbar">
        <label className="filter-field">
          <span>Estudiante</span>
          <select
            value={studentId}
            onChange={(event) => update({ estudiante: event.target.value, pagina: '' })}
            disabled={!students.data}
          >
            <option value="">Todos</option>
            {students.data?.students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.fullName} · {student.registrationNumber}
              </option>
            ))}
          </select>
        </label>
        <label className="filter-field">
          <span>Fecha</span>
          <input type="date" value={date} onChange={(event) => update({ fecha: event.target.value, pagina: '' })} />
        </label>
        {(studentId || date) && (
          <button className="secondary-button activity-clear" type="button" onClick={() => update({ estudiante: '', fecha: '', pagina: '' })}>
            <X size={15} aria-hidden="true" />
            Quitar filtros
          </button>
        )}
        {data && data.total > 0 && <p className="ledger-count activity-count">{from}–{to} de {data.total}</p>}
      </div>

      {error ? (
        <div className="page-error" role="alert">
          <p>{error}</p>
          <button className="secondary-button" type="button" onClick={retry}>Volver a intentar</button>
        </div>
      ) : !data ? (
        <p className="page-status" role="status">Cargando historial…</p>
      ) : data.items.length === 0 ? (
        <EmptyState icon={History} title={studentId || date ? 'Sin actividad para estos filtros' : 'Todavía no hay actividad'}
          description={studentId || date ? 'Prueba con otra fecha o consulta todos los estudiantes.' : 'Aquí aparecerán las marcas de asistencia y los cambios del módulo.'}
          actions={(studentId || date) && <button className="secondary-button" type="button" onClick={() => update({ estudiante: '', fecha: '', pagina: '' })}>Ver toda la actividad</button>} />
      ) : (
        <>
          <div className={`ledger-wrap panel-table${loading ? ' is-loading' : ''}`} aria-busy={loading} tabIndex={0} role="region" aria-label="Registros de actividad">
            <table className="ledger activity-table">
              <thead>
                <tr>
                  <th scope="col">Hora</th>
                  <th scope="col">Quién</th>
                  <th scope="col">Acción</th>
                  <th scope="col">Detalle</th>
                </tr>
              </thead>
              {days.map((day) => (
                <tbody key={day.key}>
                  <tr className="ledger-group">
                    <th scope="colgroup" colSpan={4}>{day.heading}</th>
                  </tr>
                  {day.items.map((item) => (
                    <tr key={item.id}>
                      <td className="activity-time" title={formatDateTime(item.createdAt)}>{formatTime(item.createdAt)}</td>
                      <td>
                        <span className="activity-actor">{item.actor.name ?? 'Usuario eliminado'}</span>
                        <span className="activity-role">{item.actor.type === 'admin' ? 'Administrador' : 'Estudiante'}</span>
                      </td>
                      <td className={`activity-action activity-action--${item.action.toLowerCase()}`}>
                        {actionLabel[item.action]}
                      </td>
                      <td className="activity-detail">
                        {describeActivity(item, (id) => names.get(id) ?? null) || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>

          <nav className="activity-pagination" aria-label="Páginas del historial">
            <div>
              <button
                className="secondary-button"
                type="button"
                onClick={() => update({ pagina: page - 1 > 1 ? String(page - 1) : '' })}
                disabled={page <= 1 || loading}
              >
                <ChevronLeft size={15} aria-hidden="true" />
                Anterior
              </button>
              <span>Página {Math.min(page, pages)} de {pages}</span>
              <button
                className="secondary-button"
                type="button"
                onClick={() => update({ pagina: String(page + 1) })}
                disabled={page >= pages || loading}
              >
                Siguiente
                <ChevronRight size={15} aria-hidden="true" />
              </button>
            </div>
          </nav>
        </>
      )}
      </div>
    </section>
  )
}

export default ActivityPage
