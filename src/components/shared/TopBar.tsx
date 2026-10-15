import { useState } from 'react'
import Icon from './Icon'
import './TopBar.css'

type TopBarProps = {
  title: string
  subtitle?: string
  userName: string
  userDetail: string
  onLogout: () => Promise<void>
  signingOut: boolean
  /** Solo se muestra cuando hay un sidebar que abrir */
  onToggleNav?: () => void
}

/** Barra superior de las áreas con sesión: contexto, usuario y salida */
function TopBar({
  title,
  subtitle,
  userName,
  userDetail,
  onLogout,
  signingOut,
  onToggleNav,
}: TopBarProps) {
  const [leaving, setLeaving] = useState(false)

  async function handleLogout() {
    setLeaving(true)
    try {
      await onLogout()
    } finally {
      setLeaving(false)
    }
  }

  const busy = leaving || signingOut
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <header className="topbar">
      {onToggleNav && (
        <button
          aria-controls="sidebar-nav"
          aria-label="Abrir menú de secciones"
          className="topbar-burger"
          onClick={onToggleNav}
          type="button"
        >
          <Icon name="menu" size={20} />
        </button>
      )}

      <div className="topbar-context">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="topbar-user">
        <span className="topbar-avatar" aria-hidden="true">{initials}</span>
        <span className="topbar-identity">
          <strong>{userName}</strong>
          <span>{userDetail}</span>
        </span>
        <button
          className="topbar-logout"
          disabled={busy}
          onClick={() => void handleLogout()}
          type="button"
        >
          <Icon name="logout" size={16} />
          <span>{busy ? 'Saliendo…' : 'Salir'}</span>
        </button>
      </div>
    </header>
  )
}

export default TopBar
