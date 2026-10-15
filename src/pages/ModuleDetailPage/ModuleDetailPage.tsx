import { useState } from 'react'
import { Link, useParams } from 'react-router'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { formatClassDate } from '../../features/attendance/utils/format'
import { useAdminSession } from '../../features/auth/context/useAdminSession'
import ImportCard from '../../features/modules/components/ImportCard'
import { useModuleDetail, useModules } from '../../features/modules/hooks/use-modules'
import { activateModule, importExcel } from '../../features/modules/services/modules-api'
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
  const modules = useModules(session.accessToken)
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

  return (
    <section aria-labelledby="module-title">
      <Link className="back-link" to={paths.adminModules}>← Módulos</Link>
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
        <>
          <ol className="module-steps">
            <li>Importa los estudiantes y las fechas de clase. Subir otro archivo reemplaza lo cargado.</li>
            <li>Revisa la vista previa.</li>
            <li>Activa el módulo. El módulo actual se archiva y conserva su historial.</li>
          </ol>

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
        </>
      ) : (
        <p className="module-note">
          Este módulo está activo: los estudiantes de la lista son los que pueden ingresar y marcar asistencia.
        </p>
      )}

      <div className="preview-grid">
        <section aria-labelledby="preview-students">
          <h2 className="preview-title" id="preview-students">Estudiantes · {module.studentsCount}</h2>
          {module.students.length === 0 ? (
            <p className="preview-empty">Sin estudiantes cargados.</p>
          ) : (
            <div className="preview-wrap">
              <table className="preview-table">
                <thead><tr><th scope="col">Registro</th><th scope="col">Nombre</th><th scope="col">Correo</th></tr></thead>
                <tbody>
                  {module.students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.registrationNumber}</td>
                      <td>{student.fullName}</td>
                      <td>{student.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section aria-labelledby="preview-sessions">
          <h2 className="preview-title" id="preview-sessions">Fechas de clase · {module.sessionsCount}</h2>
          {module.sessions.length === 0 ? (
            <p className="preview-empty">Sin fechas cargadas.</p>
          ) : (
            <div className="preview-wrap">
              <table className="preview-table">
                <thead><tr><th scope="col">Fecha</th><th scope="col">Horario</th></tr></thead>
                <tbody>
                  {module.sessions.map((item) => (
                    <tr key={item.id}>
                      <td>{formatClassDate(item.classDate)}</td>
                      <td>{item.startTime} – {item.endTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {isDraft && (
        <div className="module-activate">
          <div>
            <h2>Activar módulo</h2>
            <p>
              {ready
                ? 'Al activarlo, los estudiantes cargados podrán ingresar y marcar asistencia en estas fechas, sin asistencias previas.'
                : 'Importa al menos un estudiante y una fecha de clase para poder activarlo.'}
            </p>
          </div>
          <button className="primary-button" type="button" onClick={() => setConfirming(true)} disabled={!ready || activating}>
            {activating ? 'Activando…' : 'Activar módulo'}
          </button>
        </div>
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
