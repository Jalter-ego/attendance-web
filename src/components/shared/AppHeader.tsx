import { ClipboardCheck, LogOut } from 'lucide-react'
import { initials } from '../../utils/initials'
import './AppHeader.css'

type AppHeaderProps = {
  institution: string
  /** Quién tiene la sesión abierta, y una segunda línea con su rol o su registro */
  userName: string
  userDetail: string
  onLogout: () => Promise<void>
  signingOut: boolean
}

/**
 * Encabezado del área del estudiante: marca e institución a la izquierda,
 * usuario y cierre de sesión a la derecha, igual que la barra del admin.
 */
function AppHeader({ institution, userName, userDetail, onLogout, signingOut }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header-brand">
        <span className="app-header-logo" aria-hidden="true"><ClipboardCheck size={18} strokeWidth={2.2} /></span>
        <div>
          <p className="app-header-product">Attendance<span>.</span></p>
          <p className="app-header-institution">{institution}</p>
        </div>
      </div>
      <div className="app-header-actions">
        <span className="avatar" aria-hidden="true">{initials(userName)}</span>
        <p className="app-header-user">
          <strong>{userName}</strong>
          <span>{userDetail}</span>
        </p>
        <button
          className="icon-button"
          type="button"
          onClick={() => void onLogout()}
          disabled={signingOut}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <LogOut size={17} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}

export default AppHeader
