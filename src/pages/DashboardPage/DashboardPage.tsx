import type { AuthSession } from '../../features/auth/types/session'
import './DashboardPage.css'

type DashboardPageProps = {
  session: AuthSession
  onLogout: () => Promise<void>
  signingOut: boolean
}

function DashboardPage({ session, onLogout, signingOut }: DashboardPageProps) {
  const admin = session.type === 'admin'
  const name = session.type === 'admin' ? session.user.name : session.student.fullName
  const areas = admin
    ? [
        { title: 'Estudiantes', text: 'Aquí podrás consultar e importar los estudiantes de tu institución.' },
        { title: 'Asistencias', text: 'Aquí podrás revisar y corregir los registros del módulo activo.' },
        { title: 'Módulos y actividades', text: 'Aquí podrás preparar un nuevo módulo y consultar sus actividades.' },
      ]
    : [
        { title: 'Mi asistencia', text: 'Aquí podrás registrar tu asistencia en las fechas de clase habilitadas.' },
        { title: 'Mi historial', text: 'Aquí podrás consultar tus asistencias y faltas del módulo activo.' },
      ]

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-brand">CONTROL DE ASISTENCIA</p>
          <p className="dashboard-institution">{session.tenant.name}</p>
        </div>
        <button className="logout-button" type="button" onClick={() => void onLogout()} disabled={signingOut}>
          {signingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
        </button>
      </header>
      <section className="dashboard-welcome">
        <span className="dashboard-role">{admin ? 'ADMINISTRACIÓN' : 'ESTUDIANTES'}</span>
        <h1>{admin ? 'Panel de administración' : 'Mi espacio de estudiante'}</h1>
        <p>Hola, {name}. Bienvenido a {session.tenant.name}.</p>
        <dl className="profile-details">
          {session.type === 'admin' ? (
            <>
              <div><dt>Correo</dt><dd>{session.user.email}</dd></div>
              <div><dt>Perfil</dt><dd>{session.user.role === 'owner' ? 'Propietario' : 'Administrador'}</dd></div>
            </>
          ) : (
            <>
              <div><dt>Número de registro</dt><dd>{session.student.registrationNumber}</dd></div>
              <div><dt>Módulo activo</dt><dd>{session.module.name}</dd></div>
            </>
          )}
        </dl>
      </section>
      <section className="dashboard-areas" aria-label={admin ? 'Funciones administrativas' : 'Funciones del estudiante'}>
        {areas.map((area) => (
          <article className="dashboard-card" key={area.title}>
            <span className="upcoming-label">Próximamente</span>
            <h2>{area.title}</h2>
            <p>{area.text}</p>
          </article>
        ))}
      </section>
    </main>
  )
}

export default DashboardPage
