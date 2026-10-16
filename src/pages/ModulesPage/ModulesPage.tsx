import { Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAdminSession } from '../../features/auth/context/useAdminSession'
import { useModules } from '../../features/modules/hooks/use-modules'
import { createModule } from '../../features/modules/services/modules-api'
import type { ModuleSummary } from '../../features/modules/types/module'
import { ApiError } from '../../lib/api'
import { modulePath } from '../../routes/paths'
import './ModulesPage.css'

const statusLabel: Record<ModuleSummary['status'], string> = {
  draft: 'Borrador',
  active: 'Activo',
  archived: 'Archivado',
}

/**
 * Módulos de la institución: el activo y los borradores, y la creación de uno
 * nuevo. Los archivados no se consultan en esta versión (RF-15).
 */
function ModulesPage() {
  const session = useAdminSession()
  const navigate = useNavigate()
  const { state, retry } = useModules(session.accessToken)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (creating) return
    const name = String(new FormData(event.currentTarget).get('name') ?? '').trim()
    if (!name) {
      setError('Indica el nombre del módulo.')
      return
    }
    setCreating(true)
    setError('')
    try {
      const module = await createModule(session.accessToken, name)
      navigate(modulePath(module.id))
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No pudimos crear el módulo. Inténtalo de nuevo.')
      setCreating(false)
    }
  }

  const active = state.status === 'ready' ? state.data.filter((module) => module.status === 'active') : []
  const drafts = state.status === 'ready' ? state.data.filter((module) => module.status === 'draft') : []
  const groups = [
    { title: 'En curso', items: active },
    { title: 'Borradores', items: drafts },
  ].filter((group) => group.items.length > 0)

  return (
    <section aria-label="Módulos de la institución">

      <form className="module-create" onSubmit={(event) => void handleCreate(event)}>
        <div className="module-create-text">
          <h2>Preparar un nuevo módulo</h2>
          <p>
            Se crea como borrador. El módulo en curso sigue funcionando igual hasta que actives el nuevo.
          </p>
        </div>
        <div className="module-create-fields">
          <label className="filter-field">
            <span>Nombre del módulo</span>
            <input name="name" maxLength={150} placeholder="p. ej. Módulo 3 · Bases de datos" disabled={creating} required />
          </label>
          <button className="primary-button" type="submit" disabled={creating}>
            <Plus size={15} strokeWidth={2.2} aria-hidden="true" />
            {creating ? 'Creando…' : 'Crear borrador'}
          </button>
        </div>
        {error && <p className="page-feedback page-feedback--error" role="alert">{error}</p>}
      </form>

      {state.status === 'loading' && <p className="page-status" role="status">Cargando módulos…</p>}

      {state.status === 'error' && (
        <div className="page-error" role="alert">
          <p>{state.message}</p>
          <button className="secondary-button" type="button" onClick={retry}>Volver a intentar</button>
        </div>
      )}

      {state.status === 'ready' && (
        groups.length === 0 ? (
          <p className="page-status">Todavía no hay módulos. Crea el primero arriba.</p>
        ) : (
          <div className="ledger-wrap">
            <table className="ledger module-table">
              <thead>
                <tr>
                  <th scope="col">Módulo</th>
                  <th scope="col">Estudiantes</th>
                  <th scope="col">Fechas</th>
                  <th scope="col"><span className="visually-hidden">Estado</span></th>
                </tr>
              </thead>
              {groups.map((group) => (
                <tbody key={group.title}>
                  <tr className="ledger-group">
                    <th scope="colgroup" colSpan={4}>{group.title}</th>
                  </tr>
                  {group.items.map((module) => (
                    <tr key={module.id} className={`module-row module-row--${module.status}`}>
                      <td>
                        <Link className="module-row-name" to={modulePath(module.id)}>{module.name}</Link>
                      </td>
                      <td className="module-row-count">{module.studentsCount}</td>
                      <td className="module-row-count">{module.sessionsCount}</td>
                      <td className="module-row-status">
                        <span className={`module-status module-status--${module.status}`}>{statusLabel[module.status]}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        )
      )}
    </section>
  )
}

export default ModulesPage
