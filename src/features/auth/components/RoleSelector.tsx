import type { UserRole } from '../types/user-role'

type RoleSelectorProps = {
  selectedRole: UserRole
  onRoleChange: (role: UserRole) => void
}

const roles: { value: UserRole; label: string; description: string }[] = [
  {
    value: 'admin',
    label: 'Administrador',
    description: 'Gestiona tu institución',
  },
  {
    value: 'student',
    label: 'Estudiante',
    description: 'Consulta tu asistencia',
  },
]

function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
  return (
    <div className="role-selector" role="group" aria-label="Tipo de usuario">
      {roles.map((role) => (
        <button
          aria-pressed={selectedRole === role.value}
          className={`role-option${selectedRole === role.value ? ' is-selected' : ''}`}
          key={role.value}
          onClick={() => onRoleChange(role.value)}
          type="button"
        >
          <span className="role-copy">
            <span className="role-label">{role.label}</span>
            <span className="role-description">{role.description}</span>
          </span>
          <span className="role-radio" aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}

export default RoleSelector
