import { BrowserRouter } from 'react-router'
import AuthProvider from './features/auth/context/AuthProvider'
import { useSession } from './features/auth/context/useSession'
import { tenantFromHostname } from './features/auth/utils/tenant'
import AuthLayout from './layouts/AuthLayout'
import AppRouter from './routes/AppRouter'

const tenant = tenantFromHostname(window.location.hostname, import.meta.env.VITE_TENANT_BASE_DOMAIN)

/**
 * `checking` y `offline` son estados de toda la aplicación, no de una ruta: se
 * resuelven antes de entregar el control al router, que así solo ve `guest` o
 * `authenticated`.
 */
function AppShell() {
  const { state, signOut, signingOut, retry } = useSession()

  if (state.status === 'checking') {
    return (
      <AuthLayout>
        <p role="status">Comprobando tu sesión…</p>
      </AuthLayout>
    )
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

  return <AppRouter />
}

function App() {
  return (
    <AuthProvider tenant={tenant}>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
