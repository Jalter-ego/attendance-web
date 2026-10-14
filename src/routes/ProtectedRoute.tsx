import { Navigate, Outlet, useLocation } from 'react-router'
import { useSession } from '../features/auth/context/useSession'
import type { AuthSession } from '../features/auth/types/session'
import { homeByType, paths } from './paths'

type ProtectedRouteProps = {
  /** Tipo de sesión que puede entrar. El otro se manda a su propia área */
  allow: AuthSession['type']
}

/**
 * Cierra las rutas privadas.
 *
 * Mientras `useAuth` comprueba el token guardado (`checking`) no se decide nada:
 * redirigir antes de saber si hay sesión expulsaría a quien sí la tiene. Los
 * estados `checking` y `offline` los pinta `App`, que envuelve al router.
 */
function ProtectedRoute({ allow }: ProtectedRouteProps) {
  const { state } = useSession()
  const location = useLocation()

  if (state.status !== 'authenticated') {
    // `state.from` deja volver a donde quería entrar después del login
    return <Navigate to={paths.login} replace state={{ from: location.pathname }} />
  }

  if (state.session.type !== allow) {
    return <Navigate to={homeByType[state.session.type]} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
