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

  return (
    <section aria-labelledby="modules-title">
      <h2 className="page-title" id="modules-title">Módulos</h2>

      <form className="module-create" onSubmit={(event) => void handleCreate(event)}>
        <div className="module-create-text">
          <h2>Preparar un nuevo módulo</h2>
          <p>
            Se crea como borrador: importas los estudiantes y las fechas, revisas la vista previa y lo
            activas. Hasta entonces el módulo actual sigue funcionando igual.
          </p>
        </div>
        <div className="module-create-fields">
          <label className="filter-field">
            <span>Nombre del módulo</span>
            <input name="name" maxLength={150} placeholder="p. ej. Módulo 3 · Bases de datos" disabled={creating} required />
          </label>
          <button className="primary-button" type="submit" disabled={creating}>
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
        state.data.length === 0 ? (
          <p className="page-status">Todavía no hay módulos.</p>
        ) : (
          <ul className="module-list">
            {state.data.map((module) => (
              <li key={module.id}>
                <Link className="module-item" to={modulePath(module.id)}>
                  <span className="module-item-name">{module.name}</span>
                  <span className={`module-status module-status--${module.status}`}>{statusLabel[module.status]}</span>
                  <span className="module-item-counts">
                    {module.studentsCount} estudiantes · {module.sessionsCount} fechas
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )
      )}
    </section>
  )
}

export default ModulesPage
