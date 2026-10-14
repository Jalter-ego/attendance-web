import { createContext } from 'react'
import type { useAuth } from '../hooks/use-auth'

/* El contexto solo transporta lo que ya devuelve `useAuth`.
 * El tipo se deriva del hook, así que si su firma cambia, esto cambia con ella
 * y TypeScript avisa en lugar de quedar desincronizado.
 */
export type AuthContextValue = ReturnType<typeof useAuth> & {
  /** Tenant resuelto del subdominio, o null si hay que pedirlo en el formulario */
  tenant: string | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)
