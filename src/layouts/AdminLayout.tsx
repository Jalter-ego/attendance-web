import {
  CalendarCheck,
  ClipboardCheck,
  History,
  Layers,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import BrandBackdrop from '../components/shared/BrandBackdrop'
import { useAdminSession } from '../features/auth/context/useAdminSession'
import { useSession } from '../features/auth/context/useSession'
import { useModules } from '../features/modules/hooks/use-modules'
import { modulePath, paths } from '../routes/paths'
import { initials } from '../utils/initials'
import type { AdminOutletContext } from './admin-outlet'
import './AdminLayout.css'

type Section = { to: string; label: string; icon: LucideIcon; end: boolean }

/** Menú agrupado. Al construir una vista nueva del admin, se agrega aquí */
const groups: { title: string; sections: Section[] }[] = [
  {
    title: 'General',
    sections: [
      { to: paths.adminHome, label: 'Inicio', icon: LayoutDashboard, end: true },
      { to: paths.adminAttendances, label: 'Asistencias', icon: CalendarCheck, end: false },
      { to: paths.adminStudents, label: 'Estudiantes', icon: Users, end: false },
    ],
  },
  {
    title: 'Administración',
    sections: [
      { to: paths.adminModules, label: 'Módulos', icon: Layers, end: false },
      { to: paths.adminActivity, label: 'Actividad', icon: History, end: false },
    ],
  },
]

const allSections = groups.flatMap((group) => group.sections)

/**
 * Marco común del área del administrador (F12): barra lateral con la institución,
 * el módulo activo (todo el sistema gira alrededor de él, RN-01) y el menú, y una
 * barra superior con el título de la sección y la sesión.
 */
function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const session = useAdminSession()
  const { signOut, signingOut } = useSession()
  const { pathname } = useLocation()
  const modules = useModules(session.accessToken)
  const active = modules.state.status === 'ready'
    ? modules.state.data.find((module) => module.status === 'active') ?? null
    : null
  const current = allSections.find((section) => (section.end ? pathname === section.to : pathname.startsWith(section.to)))

  const context: AdminOutletContext = { modules }

  useEffect(() => {
    function revealCurrentSection() {
      const nav = navRef.current
      const link = nav?.querySelector<HTMLElement>('[aria-current="page"]')
      if (!nav || !link || nav.scrollWidth <= nav.clientWidth) return
      nav.scrollLeft = Math.max(0, link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2)
    }
    revealCurrentSection()
    window.addEventListener('resize', revealCurrentSection)
    return () => window.removeEventListener('resize', revealCurrentSection)
  }, [pathname])

  return (
    <div className={`app-shell${sidebarCollapsed ? ' is-sidebar-collapsed' : ''}`}>
      <a className="skip-link" href="#main-content">Ir al contenido</a>
      <aside className="app-sidebar" aria-label="Navegación principal">
        <div className="sidebar-brand">
          <span className="sidebar-logo" aria-hidden="true"><ClipboardCheck size={18} strokeWidth={2.2} /></span>
          <div className="sidebar-brand-copy">
            <p className="sidebar-product">Attendance<span>.</span></p>
            <p className="sidebar-institution">{session.tenant.name}</p>
          </div>
        </div>

        <nav className="sidebar-nav" id="admin-navigation" ref={navRef} aria-label="Secciones de administración">
          {groups.map((group) => (
            <div className="sidebar-group" key={group.title}>
              <p className="eyebrow sidebar-group-title">{group.title}</p>
              {group.sections.map(({ to, label, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end} className="sidebar-link" aria-label={label} title={sidebarCollapsed ? label : undefined}>
                  <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                  <span className="sidebar-link-label">{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-module">
          <span className="sidebar-module-label"><span className="sidebar-module-dot" />Módulo activo</span>
          {modules.state.status === 'loading' ? (
            <span className="sidebar-module-empty">Cargando…</span>
          ) : active ? (
            <Link className="sidebar-module-name" to={modulePath(active.id)}>{active.name}</Link>
          ) : (
            <Link className="sidebar-module-empty" to={paths.adminModules}>
              {modules.state.status === 'error' ? 'No se pudo cargar' : 'Seleccionar un módulo'}
            </Link>
          )}
        </div>
      </aside>

      <div className="app-content">
        <BrandBackdrop className="admin-backdrop brand-backdrop--workspace" />
        <header className="app-topbar">
          <div className="app-topbar-context">
            <button
              className="sidebar-toggle"
              type="button"
              onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
              aria-expanded={!sidebarCollapsed}
              aria-controls="admin-navigation"
              aria-label={sidebarCollapsed ? 'Expandir menú' : 'Contraer menú'}
              title={sidebarCollapsed ? 'Expandir menú' : 'Contraer menú'}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
            <span className="app-topbar-area">Administración</span>
            <span className="app-topbar-divider" aria-hidden="true">/</span>
            <span className="app-topbar-title">{current?.label ?? 'Panel'}</span>
          </div>
          <div className="app-topbar-user">
            <span className="avatar" aria-hidden="true">{initials(session.user.name)}</span>
            <p>
              <strong>{session.user.name}</strong>
              <span>{session.user.role === 'owner' ? 'Propietario' : 'Administrador'}</span>
            </p>
            <button
              className="icon-button"
              type="button"
              onClick={() => void signOut()}
              disabled={signingOut}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut size={17} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className="app-main" id="main-content" tabIndex={-1}>
          <Outlet context={context} />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
