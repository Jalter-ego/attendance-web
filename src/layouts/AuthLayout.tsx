import type { ReactNode } from 'react'
import './AuthLayout.css'

type AuthLayoutProps = {
  children: ReactNode
}

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="auth-layout">
      <section className="auth-panel">{children}</section>
    </main>
  )
}

export default AuthLayout
