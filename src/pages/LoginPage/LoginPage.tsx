import LoginForm from '../../features/auth/components/LoginForm'
import AuthLayout from '../../layouts/AuthLayout'
import './LoginPage.css'
import type { LoginCredentials } from '../../features/auth/types/session'

type LoginPageProps = {
  tenant: string | null
  message?: string
  onLogin: (credentials: LoginCredentials, persistent: boolean) => Promise<void>
}

function LoginPage(props: LoginPageProps) {
  return (
    <AuthLayout>
      <div className="login-content">
        <div className="login-heading">
          <span className="login-kicker">Acceso institucional</span>
          <h1 id="login-title">Inicia sesión</h1>
          <p>Ingresa a tu espacio de control de asistencia.</p>
        </div>
        <LoginForm {...props} />
      </div>
    </AuthLayout>
  )
}

export default LoginPage
