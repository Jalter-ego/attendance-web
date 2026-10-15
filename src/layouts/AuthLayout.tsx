import type { ReactNode } from 'react'
import Icon from '../components/shared/Icon'
import './AuthLayout.css'

type AuthLayoutProps = {
  children: ReactNode
}

const highlights = [
  {
    icon: 'check' as const,
    title: 'Marca en un toque',
    text: 'El día de clase, un botón registra tu asistencia con la hora real.',
  },
  {
    icon: 'grid' as const,
    title: 'Todo a la vista',
    text: 'Asistencias y faltas del módulo activo, por estudiante y por fecha.',
  },
  {
    icon: 'history' as const,
    title: 'Cada cambio queda',
    text: 'Las correcciones se registran con usuario, fecha y valor anterior.',
  },
]

/**
 * Marco del acceso: panel de marca a la izquierda y formulario a la derecha.
 *
 * Por debajo de 900px el panel se oculta en lugar de apilarse: en un teléfono
 * lo único que importa es el formulario, y apilarlo lo empujaría fuera de vista.
 */
function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <aside className="auth-brand" aria-hidden="true">
        <div className="auth-brand-top">
          <span className="auth-brand-mark">
            <Icon name="check" size={18} />
          </span>
          <span className="auth-brand-name">Control de Asistencia</span>
        </div>

        <div className="auth-brand-body">
          <h2>Registro y control de asistencia por módulo académico.</h2>
          <ul>
            {highlights.map((item) => (
              <li key={item.title}>
                <span className="auth-brand-icon">
                  <Icon name={item.icon} size={16} />
                </span>
                <span>
                  <strong>{item.title}</strong>
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="auth-brand-foot">
          Un módulo activo a la vez. La información de los anteriores se conserva.
        </p>
      </aside>

      <main className="auth-panel">{children}</main>
    </div>
  )
}

export default AuthLayout
