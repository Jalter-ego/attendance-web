import { Link } from 'react-router'
import { useAdminSession } from '../../features/auth/context/useAdminSession'
import { paths } from '../../routes/paths'
import './AdminHomePage.css'

/** Áreas del admin. Las que tienen `to` ya están construidas; el resto se anuncia */
const areas: { title: string; text: string; to?: string }[] = [
  { title: 'Estudiantes', text: 'Consulta y busca los estudiantes del módulo activo.', to: paths.adminStudents },
  { title: 'Asistencias', text: 'Revisa y corrige los registros del módulo activo.', to: paths.adminAttendances },
  { title: 'Módulos', text: 'Importa estudiantes y fechas, y activa un nuevo módulo.' },
  { title: 'Actividad', text: 'Consulta el historial de acciones del módulo activo.' },
]

function AdminHomePage() {
  const session = useAdminSession()

  return (
    <>
      <section className="admin-welcome">
        <span className="section-kicker">ADMINISTRACIÓN</span>
        <h1>Hola, {session.user.name}</h1>
        <p>Desde aquí administras la asistencia de {session.tenant.name}.</p>
      </section>

      <section className="admin-areas" aria-label="Funciones administrativas">
        {areas.map((area) => (
          <article className="admin-area" key={area.title}>
            <h2>{area.title}</h2>
            <p>{area.text}</p>
            {area.to
              ? <Link className="admin-area-link" to={area.to}>Abrir</Link>
              : <span className="admin-area-upcoming">Próximamente</span>}
          </article>
        ))}
      </section>
    </>
  )
}

export default AdminHomePage
