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
          <span className="login-kicker">TE DAMOS LA BIENVENIDA</span>
          <h2>Inicia sesión</h2>
          <p>Ingresa tus datos para continuar a tu cuenta.</p>
        </div>
        <LoginForm {...props} />
      </div>
    </AuthLayout>
  )
}

export default LoginPage
