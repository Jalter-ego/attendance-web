import { ArrowLeft, Power } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { formatClassDate } from '../../features/attendance/utils/format'
import { useAdminSession } from '../../features/auth/context/useAdminSession'
import ImportCard from '../../features/modules/components/ImportCard'
import { useModuleDetail } from '../../features/modules/hooks/use-modules'
import { activateModule, importExcel } from '../../features/modules/services/modules-api'
import { useAdminOutlet } from '../../layouts/admin-outlet'
import { ApiError } from '../../lib/api'
import { paths } from '../../routes/paths'
import '../ModulesPage/ModulesPage.css'
import './ModuleDetailPage.css'

const students = (count: number) => (count === 1 ? '1 estudiante' : `${count} estudiantes`)
const dates = (count: number) => (count === 1 ? '1 fecha' : `${count} fechas`)

/**
 * Preparación de un módulo: importar estudiantes y fechas (RF-11, RF-12),
 * revisar la vista previa (RF-16) y activarlo con confirmación (RF-13).
 */
function ModuleDetailPage() {
  const session = useAdminSession()
  const { moduleId = '' } = useParams()
  const detail = useModuleDetail(session.accessToken, moduleId)
  // La lista del layout: al recargarla, la barra lateral muestra el nuevo activo
  const { modules } = useAdminOutlet()
  const [confirming, setConfirming] = useState(false)
  const [activating, setActivating] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  if (detail.state.status === 'loading') return <p className="page-status" role="status">Cargando módulo…</p>
  if (detail.state.status === 'error') {
    return (
      <div className="page-error" role="alert">
        <p>{detail.state.message}</p>
        <Link className="secondary-button" to={paths.adminModules}>Volver a módulos</Link>
      </div>
    )
  }

  const module = detail.state.data
  const isDraft = module.status === 'draft'
  const ready = module.studentsCount > 0 && module.sessionsCount > 0
  const current = modules.state.status === 'ready'
    ? modules.state.data.find((item) => item.status === 'active' && item.id !== module.id) ?? null
    : null

  async function upload(kind: 'students' | 'sessions', file: File) {
    const imported = await importExcel(session.accessToken, module.id, kind, file)
    detail.reload()
    return imported
  }

  async function activate() {
    setConfirming(false)
    setActivating(true)
    setFeedback(null)
    try {
      const result = await activateModule(session.accessToken, module.id)
      setFeedback({
        type: 'success',
        text: result.archivedModule
          ? `«${result.name}» ya es el módulo activo. «${result.archivedModule.name}» quedó archivado con todos sus datos.`
          : `«${result.name}» ya es el módulo activo.`,
      })
      detail.reload()
      modules.reload()
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof ApiError ? error.message : 'No pudimos activar el módulo.' })
    } finally {
      setActivating(false)
    }
  }

  const preview = (
    <div className="preview-grid">
      <section aria-labelledby="preview-students">
        <h3 className="preview-title" id="preview-students">Estudiantes <span>{module.studentsCount}</span></h3>
        {module.students.length === 0 ? (
          <p className="preview-empty">Sin estudiantes cargados.</p>
        ) : (
          <div className="ledger-wrap preview-wrap">
            <table className="ledger preview-table">
              <thead><tr><th scope="col">Registro</th><th scope="col">Nombre</th><th scope="col">Correo</th></tr></thead>
              <tbody>
                {module.students.map((student) => (
                  <tr key={student.id}>
                    <td className="preview-muted">{student.registrationNumber}</td>
                    <td>{student.fullName}</td>
                    <td className="preview-muted">{student.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="preview-sessions">
        <h3 className="preview-title" id="preview-sessions">Fechas de clase <span>{module.sessionsCount}</span></h3>
        {module.sessions.length === 0 ? (
          <p className="preview-empty">Sin fechas cargadas.</p>
        ) : (
          <div className="ledger-wrap preview-wrap">
            <table className="ledger preview-table">
              <thead><tr><th scope="col">Fecha</th><th scope="col">Horario</th></tr></thead>
              <tbody>
                {module.sessions.map((item) => (
                  <tr key={item.id}>
                    <td>{formatClassDate(item.classDate)}</td>
                    <td className="preview-muted">{item.startTime} – {item.endTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )

  return (
    <section aria-labelledby="module-title">
      <Link className="back-link" to={paths.adminModules}>
        <ArrowLeft size={15} aria-hidden="true" />
        Módulos
      </Link>
      <div className="module-heading">
        <h2 className="page-title" id="module-title">{module.name}</h2>
        <span className={`module-status module-status--${module.status}`}>
          {isDraft ? 'Borrador' : module.status === 'active' ? 'Activo' : 'Archivado'}
        </span>
      </div>

      {feedback && (
        <p className={`page-feedback page-feedback--${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>
          {feedback.text}
        </p>
      )}

      {isDraft ? (
        // Es una secuencia real: no se puede activar sin importar, y conviene revisar antes
        <ol className="module-steps">
          <li className={`module-step${ready ? ' is-done' : ' is-current'}`}>
            <span className="module-step-marker" aria-hidden="true">{ready ? '✓' : '1'}</span>
            <div className="module-step-body">
              <h2>Importa los estudiantes y las fechas</h2>
              <p>Subir otro archivo reemplaza lo que ya estaba cargado.</p>
              <div className="import-grid">
                <ImportCard
                  title="Estudiantes"
                  columns={['Número de registro', 'Nombre completo', 'Correo electrónico']}
                  note="El número de registro no se puede repetir."
                  loaded={module.studentsCount}
                  loadedLabel={students}
                  onUpload={(file) => upload('students', file)}
                />
                <ImportCard
                  title="Fechas de clase"
                  columns={['Fecha', 'Hora inicio', 'Hora fin']}
                  note="Fecha en formato dd/mm/aaaa; la hora de fin debe ser posterior a la de inicio."
                  loaded={module.sessionsCount}
                  loadedLabel={dates}
                  onUpload={(file) => upload('sessions', file)}
                />
              </div>
            </div>
          </li>

          <li className={`module-step${ready ? ' is-current' : ''}`}>
            <span className="module-step-marker" aria-hidden="true">2</span>
            <div className="module-step-body">
              <h2>Revisa lo que se cargó</h2>
              <p>Así quedará el módulo al activarlo. Si algo está mal, corrige el Excel y vuelve a subirlo.</p>
              {preview}
            </div>
          </li>

          <li className={`module-step${ready ? ' is-current' : ''}`}>
            <span className="module-step-marker" aria-hidden="true">3</span>
            <div className="module-step-body">
              <h2>Activa el módulo</h2>
              <p>
                {ready
                  ? 'Los estudiantes cargados podrán ingresar y marcar asistencia en estas fechas. Empieza sin asistencias, y el módulo en curso se archiva con todo su historial.'
                  : 'Importa al menos un estudiante y una fecha de clase para poder activarlo.'}
              </p>
              <button className="primary-button" type="button" onClick={() => setConfirming(true)} disabled={!ready || activating}>
                <Power size={15} strokeWidth={2.2} aria-hidden="true" />
                {activating ? 'Activando…' : 'Activar módulo'}
              </button>
            </div>
          </li>
        </ol>
      ) : (
        <>
          <p className="module-note">
            {module.status === 'active'
              ? 'Este es el módulo en curso: los estudiantes de la lista son los que pueden ingresar y marcar asistencia.'
              : 'Este módulo está archivado. Sus datos se conservan, pero ya no se puede marcar asistencia en él.'}
          </p>
          {preview}
        </>
      )}

      <ConfirmDialog
        open={confirming}
        title={`¿Activar «${module.name}»?`}
        actions={[{ label: 'Sí, activar', onSelect: () => void activate(), tone: 'danger' }]}
        onCancel={() => setConfirming(false)}
      >
        <p>Se activará con {students(module.studentsCount)} y {dates(module.sessionsCount)}.</p>
        {current ? (
          <p>
            El módulo activo <strong>«{current.name}»</strong> se archivará. Sus datos se conservan, pero sus
            estudiantes ya no podrán ingresar ni marcar asistencia. Esto no se puede deshacer.
          </p>
        ) : (
          <p>No hay otro módulo activo en este momento.</p>
        )}
      </ConfirmDialog>
    </section>
  )
}

export default ModuleDetailPage
