import { NavLink, Outlet } from 'react-router'
import AppHeader from '../components/shared/AppHeader'
import { useAdminSession } from '../features/auth/context/useAdminSession'
import { useSession } from '../features/auth/context/useSession'
import { paths } from '../routes/paths'
import './AdminLayout.css'

/** Secciones del menú. Al construir una vista nueva del admin, se agrega aquí */
const sections = [
  { to: paths.adminHome, label: 'Inicio', end: true },
  { to: paths.adminStudents, label: 'Estudiantes', end: false },
]

/** Marco común del área del administrador: encabezado y menú entre sus vistas (F12) */
function AdminLayout() {
  const session = useAdminSession()
  const { signOut, signingOut } = useSession()

  return (
    <main className="page">
      <AppHeader
        institution={session.tenant.name}
        userName={session.user.name}
        userDetail={session.user.role === 'owner' ? 'Propietario' : 'Administrador'}
        onLogout={signOut}
        signingOut={signingOut}
      />

      <nav className="admin-nav" aria-label="Secciones de administración">
        {sections.map((section) => (
          <NavLink key={section.to} to={section.to} end={section.end} className="admin-nav-link">
            {section.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </main>
  )
}

export default AdminLayout
