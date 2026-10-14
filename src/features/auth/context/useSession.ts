import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from './auth-context'

/**
 * Lee la sesión del contexto.
 *
 * `useAuth` es el motor y se instancia una sola vez en `<AuthProvider>`;
 * las pantallas y las guardas usan esto.
 */
export function useSession(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useSession debe usarse dentro de <AuthProvider>')
  }
  return context
}
