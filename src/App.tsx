import LoginPage from './pages/LoginPage/LoginPage'
import DashboardPage from './pages/DashboardPage/DashboardPage'
import AuthLayout from './layouts/AuthLayout'
import { tenantFromHostname } from './features/auth/utils/tenant'
import { useAuth } from './features/auth/hooks/use-auth'

const tenant = tenantFromHostname(window.location.hostname, import.meta.env.VITE_TENANT_BASE_DOMAIN)

function App() {
  const { state, signIn, signOut, signingOut, retry } = useAuth(tenant)

  if (state.status === 'checking') {
    return <AuthLayout><p role="status">Comprobando tu sesión…</p></AuthLayout>
  }
  if (state.status === 'offline') {
    return (
      <AuthLayout>
        <div className="login-content">
          <h2>No pudimos conectar</h2>
          <p className="form-feedback" role="alert">{state.message}</p>
          <button className="submit-button" type="button" onClick={retry}>Volver a intentar</button>
          <button className="text-button" type="button" onClick={() => void signOut()} disabled={signingOut}>
            {signingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </button>
        </div>
      </AuthLayout>
    )
  }
  if (state.status === 'authenticated') {
    return <DashboardPage session={state.session} onLogout={signOut} signingOut={signingOut} />
  }
  return <LoginPage tenant={tenant} message={state.message} onLogin={signIn} />
}

export default App
