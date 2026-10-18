import type { ReactNode } from 'react'
import { ClipboardCheck } from 'lucide-react'
import BrandBackdrop from '../components/shared/BrandBackdrop'
import './AuthLayout.css'

type AuthLayoutProps = {
  children: ReactNode
}

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="auth-layout">
      <BrandBackdrop className="auth-decoration" />

      <div className="auth-composition">
        <div className="auth-intro">
          <div className="auth-brand">
            <ClipboardCheck size={46} strokeWidth={1.7} aria-hidden="true" />
            <p>Attendance<span>.</span></p>
          </div>
          <p className="auth-welcome">¡Te damos la bienvenida!</p>
          <p className="auth-intro-description">
            Un espacio para organizar tus clases y llevar el control de asistencia de tu institución.
          </p>
        </div>

        <section className="auth-panel" aria-labelledby="login-title">{children}</section>
      </div>
    </main>
  )
}

export default AuthLayout
