import { Link } from 'react-router'
import Icon, { type IconName } from '../../components/shared/Icon'
import { useAdminSession } from '../../features/auth/context/useAdminSession'
import { paths } from '../../routes/paths'
import './AdminHomePage.css'

const areas: { title: string; text: string; to: string; icon: IconName }[] = [
  {
    title: 'Estudiantes',
    text: 'Consulta y busca los estudiantes del módulo activo.',
    to: paths.adminStudents,
    icon: 'users',
  },
  {
    title: 'Asistencias',
    text: 'Revisa y corrige los registros del módulo activo.',
    to: paths.adminAttendances,
    icon: 'grid',
  },
  {
    title: 'Módulos',
    text: 'Importa estudiantes y fechas, y activa un nuevo módulo.',
    to: paths.adminModules,
    icon: 'layers',
  },
  {
    title: 'Actividad',
    text: 'Consulta el historial de acciones del módulo activo.',
    to: paths.adminActivity,
    icon: 'history',
  },
]

function AdminHomePage() {
  const session = useAdminSession()

  return (
    <div className="stack">
      <section className="admin-welcome">
        <h2>Hola, {session.user.name}</h2>
        <p>Desde aquí administras la asistencia de {session.tenant.name}.</p>
      </section>

      <section className="admin-areas" aria-label="Funciones administrativas">
        {areas.map((area) => (
          <Link className="admin-area" key={area.title} to={area.to}>
            <span className="admin-area-icon">
              <Icon name={area.icon} size={20} />
            </span>
            <span className="admin-area-copy">
              <strong>{area.title}</strong>
              <span>{area.text}</span>
            </span>
            <span className="admin-area-go" aria-hidden="true">
              <Icon name="chevronRight" size={16} />
            </span>
          </Link>
        ))}
      </section>
    </div>
  )
}

export default AdminHomePage
