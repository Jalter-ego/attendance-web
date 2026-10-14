import LoginForm from '../features/auth/components/LoginForm'
import AuthLayout from '../layouts/AuthLayout'
import './LoginPage.css'

function LoginPage() {
  return (
    <AuthLayout>
      <div className="login-content">
        <div className="login-heading">
          <span className="login-kicker">TE DAMOS LA BIENVENIDA</span>
          <h2>Inicia sesión</h2>
          <p>Ingresa tus datos para continuar a tu cuenta.</p>
        </div>
        <LoginForm />
      </div>
    </AuthLayout>
  )
}

export default LoginPage
