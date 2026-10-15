import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import Sidebar, { type SidebarSection } from '../components/shared/Sidebar'
import TopBar from '../components/shared/TopBar'
import { useAdminSession } from '../features/auth/context/useAdminSession'
import { useSession } from '../features/auth/context/useSession'
import { paths } from '../routes/paths'
import './AdminLayout.css'

/** Secciones del menú. Al construir una vista nueva del admin, se agrega aquí */
const sections: SidebarSection[] = [
  { to: paths.adminHome, label: 'Inicio', icon: 'home', end: true, hint: 'Resumen del módulo' },
  { to: paths.adminStudents, label: 'Estudiantes', icon: 'users', hint: 'Lista y búsqueda' },
  { to: paths.adminAttendances, label: 'Asistencias', icon: 'grid', hint: 'Registrar y corregir' },
  { to: paths.adminModules, label: 'Módulos', icon: 'layers', hint: 'Importar y activar' },
  { to: paths.adminActivity, label: 'Actividad', icon: 'history', hint: 'Historial de acciones' },
]

/** Título de la barra superior según la ruta */
function titleFor(pathname: string): { title: string; subtitle?: string } {
  if (pathname.startsWith(paths.adminStudents)) {
    return { title: 'Estudiantes', subtitle: 'Lista del módulo activo' }
  }
  if (pathname.startsWith(paths.adminAttendances)) {
    return { title: 'Asistencias', subtitle: 'Vista general por estudiante y fecha' }
  }
  if (pathname.startsWith(paths.adminModules)) {
    return { title: 'Módulos académicos', subtitle: 'Importación, vista previa y activación' }
  }
  if (pathname.startsWith(paths.adminActivity)) {
    return { title: 'Actividad', subtitle: 'Historial de acciones del módulo activo' }
  }
  return { title: 'Panel de administración' }
}

/** Marco del área del administrador: sidebar fijo, barra superior y contenido */
function AdminLayout() {
  const session = useAdminSession()
  const { signOut, signingOut } = useSession()
  const location = useLocation()
  const [navOpen, setNavOpen] = useState(false)

  // Al navegar lo cierra el propio enlace del sidebar (`onClose`), no un efecto.
  // Acá solo queda Escape mientras el panel esté abierto
  useEffect(() => {
    if (!navOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNavOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navOpen])

  const { title, subtitle } = titleFor(location.pathname)

  return (
    <div className="admin-shell">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>

      <Sidebar
        institution={session.tenant.name}
        onClose={() => setNavOpen(false)}
        open={navOpen}
        sections={sections}
      />

      <div className="admin-main">
        <TopBar
          onLogout={signOut}
          onToggleNav={() => setNavOpen(true)}
          signingOut={signingOut}
          subtitle={subtitle}
          title={title}
          userDetail={session.user.role === 'owner' ? 'Propietario' : 'Administrador'}
          userName={session.user.name}
        />

        <main className="admin-content" id="contenido">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
