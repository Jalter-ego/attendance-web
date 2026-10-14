import { useSearchParams } from 'react-router'
import { PAGE_SIZE, useActivity } from '../../features/activity/hooks/use-activity'
import { actionLabel, describeActivity, formatDateTime } from '../../features/activity/utils/describe'
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

  return (
    <section aria-labelledby="activity-title">
      <span className="section-kicker">ACTIVIDAD</span>
      <h1 className="page-title" id="activity-title">Historial de actividades</h1>

      <div className="activity-filters">
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
            Quitar filtros
          </button>
        )}
      </div>

      {error ? (
        <div className="page-error" role="alert">
          <p>{error}</p>
          <button className="secondary-button" type="button" onClick={retry}>Volver a intentar</button>
        </div>
      ) : !data ? (
        <p className="page-status" role="status">Cargando historial…</p>
      ) : data.items.length === 0 ? (
        <p className="activity-empty">
          {studentId || date ? 'No hay actividad con estos filtros.' : 'Todavía no hay actividad en el módulo activo.'}
        </p>
      ) : (
        <>
          <div className={`activity-table-wrap${loading ? ' is-loading' : ''}`} aria-busy={loading}>
            <table className="activity-table">
              <thead>
                <tr>
                  <th scope="col">Fecha y hora</th>
                  <th scope="col">Usuario</th>
                  <th scope="col">Acción</th>
                  <th scope="col">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td className="activity-time">{formatDateTime(item.createdAt)}</td>
                    <td>
                      <span className="activity-actor">{item.actor.name ?? 'Usuario eliminado'}</span>
                      <span className={`actor-type actor-type--${item.actor.type}`}>
                        {item.actor.type === 'admin' ? 'Admin' : 'Estudiante'}
                      </span>
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
            </table>
          </div>

          <nav className="activity-pagination" aria-label="Páginas del historial">
            <p>{from}–{to} de {data.total}</p>
            <div>
              <button
                className="secondary-button"
                type="button"
                onClick={() => update({ pagina: page - 1 > 1 ? String(page - 1) : '' })}
                disabled={page <= 1 || loading}
              >
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
              </button>
            </div>
          </nav>
        </>
      )}
    </section>
  )
}

export default ActivityPage
