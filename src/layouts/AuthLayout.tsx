import type { ReactNode } from 'react'
import { ClipboardCheck } from 'lucide-react'
import './AuthLayout.css'

type AuthLayoutProps = {
  children: ReactNode
}

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="auth-layout">
      <div className="auth-brand"><ClipboardCheck size={27} strokeWidth={1.8} aria-hidden="true" /><span>Attendance<span>.</span></span></div>
      <section className="auth-panel" aria-labelledby="login-title">{children}</section>
    </main>
  )
}

export default AuthLayout
