import type { AdminSession } from '../types/session'
import { useSession } from './useSession'

/**
 * Sesión del administrador, para las pantallas bajo `<ProtectedRoute allow="admin">`.
 *
 * La guarda ya garantiza que hay una sesión de admin; esto solo le da a
 * TypeScript el tipo angosto para no repetir la comprobación en cada página.
 */
export function useAdminSession(): AdminSession {
  const { state } = useSession()
  if (state.status !== 'authenticated' || state.session.type !== 'admin') {
    throw new Error('useAdminSession debe usarse dentro del área del administrador')
  }
  return state.session
}
