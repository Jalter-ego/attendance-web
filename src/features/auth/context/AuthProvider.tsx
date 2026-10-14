import { useMemo, type ReactNode } from 'react'
import { useAuth } from '../hooks/use-auth'
import { AuthContext, type AuthContextValue } from './auth-context'

type AuthProviderProps = {
  tenant: string | null
  children: ReactNode
}

/**
 * Llama a `useAuth` una sola vez y reparte su resultado por contexto.
 *
 * Con routing la sesión la necesitan varias pantallas y las guardas de ruta, y
 * `useAuth` mantiene estado propio (vencimiento del token, sincronización entre
 * pestañas, reintento sin conexión): llamarlo en cada componente crearía
 * instancias separadas que se pisarían. Por eso vive aquí arriba y el resto lo lee.
 */
function AuthProvider({ tenant, children }: AuthProviderProps) {
  const auth = useAuth(tenant)

  const value = useMemo<AuthContextValue>(() => ({ ...auth, tenant }), [auth, tenant])

  return <AuthContext value={value}>{children}</AuthContext>
}

export default AuthProvider
