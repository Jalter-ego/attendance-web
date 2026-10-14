import './AppHeader.css'

type AppHeaderProps = {
  institution: string
  /** Quién tiene la sesión abierta, y una segunda línea con su rol o su registro */
  userName: string
  userDetail: string
  onLogout: () => Promise<void>
  signingOut: boolean
}

/** Encabezado de las áreas con sesión: institución, usuario y cierre de sesión */
function AppHeader({ institution, userName, userDetail, onLogout, signingOut }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div>
        <p className="app-header-brand">CONTROL DE ASISTENCIA</p>
        <p className="app-header-institution">{institution}</p>
      </div>
      <div className="app-header-actions">
        <p className="app-header-user">
          <strong>{userName}</strong>
          <span>{userDetail}</span>
        </p>
        <button className="app-header-logout" type="button" onClick={() => void onLogout()} disabled={signingOut}>
          {signingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
        </button>
      </div>
    </header>
  )
}

export default AppHeader
