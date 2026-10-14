import type { FormEvent } from 'react'
import { useState } from 'react'
import RoleSelector from './RoleSelector'
import type { UserRole } from '../types/user-role'

function LoginForm() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <fieldset className="role-fieldset">
        <legend>Ingresa como</legend>
        <RoleSelector
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
        />
      </fieldset>

      <label className="form-field">
        <span>Correo electrónico</span>
        <span className="input-wrap">
          <input
            autoComplete="email"
            name="email"
            placeholder="nombre@institucion.edu"
            type="email"
          />
        </span>
      </label>

      {selectedRole === 'admin' && (
        <label className="form-field">
          <span>Contraseña</span>
          <span className="input-wrap">
              <input
                autoComplete="current-password"
                name="password"
              placeholder="Ingresa tu contraseña"
              type="password"
            />
          </span>
        </label>
      )}

      {selectedRole === 'admin' && (
        <div className="form-options">
          <label className="remember-option">
            <input name="remember" type="checkbox" />
            <span>Recordarme</span>
          </label>
          <button className="text-button" type="button">
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      )}

      <button className="submit-button" type="submit">
        Iniciar sesión
      </button>

      <p className="form-note">
        ¿Necesitas ayuda?{' '}
        <button className="text-button" type="button">
          Contacta a soporte
        </button>
      </p>
    </form>
  )
}

export default LoginForm
