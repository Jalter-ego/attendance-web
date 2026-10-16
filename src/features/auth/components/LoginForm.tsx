import type { FormEvent } from 'react'
import { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import RoleSelector from './RoleSelector'
import type { UserRole } from '../types/user-role'
import type { LoginCredentials } from '../types/session'
import { isTenantSlug } from '../utils/tenant'

type LoginFormProps = {
  tenant: string | null
  message?: string
  onLogin: (credentials: LoginCredentials, persistent: boolean) => Promise<void>
}

function LoginForm({ tenant, message, onLogin }: LoginFormProps) {
  const passwordId = useId()
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>('student')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    const form = new FormData(event.currentTarget)
    const slug = (tenant || String(form.get('tenant') || '')).trim().toLowerCase()
    if (!isTenantSlug(slug)) {
      setError('Ingresa el identificador de tu institución, usando letras, números o guiones.')
      return
    }
    const identifier = String(form.get('identifier') || '').trim()
    setError('')
    setSubmitting(true)
    try {
      await onLogin(selectedRole === 'admin'
        ? { type: 'admin', tenant: slug, email: identifier, password: String(form.get('password') || '') }
        : { type: 'student', tenant: slug, identifier }, form.get('remember') === 'on')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No pudimos iniciar sesión. Inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit} aria-busy={submitting}>
      {(error || message) && <p className="form-feedback" role="alert">{error || message}</p>}
      {tenant ? (
        <p className="tenant-note">Institución: <strong>{tenant}</strong></p>
      ) : (
        <label className="form-field">
          <span>Institución</span>
          <span className="input-wrap">
            <input
              autoComplete="organization"
              defaultValue={import.meta.env.VITE_DEFAULT_TENANT || ''}
              name="tenant"
              placeholder="Identificador de tu institución, p. ej. demo"
              required
              disabled={submitting}
              maxLength={60}
            />
          </span>
        </label>
      )}
      <fieldset className="role-fieldset" disabled={submitting}>
        <legend>Ingresa como</legend>
        <RoleSelector
          selectedRole={selectedRole}
          onRoleChange={(role) => { setSelectedRole(role); setPasswordVisible(false); setError('') }}
        />
      </fieldset>

      <label className="form-field">
        <span>{selectedRole === 'admin' ? 'Correo electrónico' : 'Correo electrónico o número de registro'}</span>
        <span className="input-wrap">
          <input
            autoComplete="username"
            name="identifier"
            placeholder={selectedRole === 'admin' ? 'nombre@institucion.edu' : 'nombre@institucion.edu o 1001'}
            type={selectedRole === 'admin' ? 'email' : 'text'}
            required
            disabled={submitting}
          />
        </span>
      </label>

      {selectedRole === 'admin' && (
        <div className="form-field">
          <label htmlFor={passwordId}>Contraseña</label>
          <div className="input-wrap">
            <input id={passwordId} autoComplete="current-password" name="password" placeholder="Ingresa tu contraseña"
              type={passwordVisible ? 'text' : 'password'} required disabled={submitting} />
            <button className="password-toggle" type="button" aria-label={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={passwordVisible} onClick={() => setPasswordVisible((visible) => !visible)} disabled={submitting}>
              {passwordVisible ? <EyeOff size={18} strokeWidth={1.7} aria-hidden="true" /> : <Eye size={18} strokeWidth={1.7} aria-hidden="true" />}
            </button>
          </div>
        </div>
      )}

        <div className="form-options">
          <label className="remember-option">
            <input name="remember" type="checkbox" defaultChecked disabled={submitting} />
            <span>Mantener sesión en este dispositivo</span>
          </label>
        </div>

      <button className="submit-button" type="submit" disabled={submitting}>
        {submitting ? 'Ingresando…' : 'Iniciar sesión'}
      </button>

      <p className="form-note">
        ¿Necesitas ayuda? Contacta al administrador de tu institución.
      </p>
    </form>
  )
}

export default LoginForm
