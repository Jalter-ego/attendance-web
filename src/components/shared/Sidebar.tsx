import { NavLink } from 'react-router'
import Icon, { type IconName } from './Icon'
import './Sidebar.css'

export type SidebarSection = {
  to: string
  label: string
  icon: IconName
  end?: boolean
  /** Línea de apoyo bajo la etiqueta */
  hint?: string
}

type SidebarProps = {
  sections: SidebarSection[]
  institution: string
  /** Abierto en móvil, donde el sidebar entra como panel */
  open: boolean
  onClose: () => void
}

/**
 * Navegación principal del administrador.
 *
 * En pantallas anchas queda fija a la izquierda; por debajo de 960px se
 * convierte en un panel que entra desde el borde, con un velo que lo cierra.
 * Material Adaptive recomienda ese cambio a partir de pantalla grande.
 */
function Sidebar({ sections, institution, open, onClose }: SidebarProps) {
  return (
    <>
      {/* El velo solo existe cuando el panel está abierto, para no tapar clics */}
      {open && <div className="sidebar-scrim" onClick={onClose} />}

      <aside className={`sidebar${open ? ' is-open' : ''}`} id="sidebar-nav">
        <div className="sidebar-brand">
          <span className="sidebar-mark" aria-hidden="true">
            <Icon name="check" size={16} />
          </span>
          <span className="sidebar-brand-text">
            <strong>Asistencia</strong>
            <span title={institution}>{institution}</span>
          </span>
        </div>

        <nav className="sidebar-nav" aria-label="Secciones de administración">
          {sections.map((section) => (
            <NavLink
              className="sidebar-link"
              end={section.end}
              key={section.to}
              onClick={onClose}
              to={section.to}
            >
              <Icon name={section.icon} size={18} />
              <span className="sidebar-link-text">
                {section.label}
                {section.hint && <span className="sidebar-link-hint">{section.hint}</span>}
              </span>
            </NavLink>
          ))}
        </nav>

        <p className="sidebar-foot">
          Módulo académico activo. Los datos de módulos anteriores se conservan.
        </p>
      </aside>
    </>
  )
}

export default Sidebar
