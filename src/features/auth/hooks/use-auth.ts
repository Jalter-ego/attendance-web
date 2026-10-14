import { useEffect, useState } from 'react'
import { ApiError } from '../../../lib/api'
import { login, logout, validateSession } from '../services/auth-api'
import { clearSession, readSession, saveSession, SESSION_KEY } from '../services/session'
import type { AuthSession, LoginCredentials } from '../types/session'

type AuthState =
  | { status: 'guest'; message?: string }
  | { status: 'checking'; session: AuthSession; persistent: boolean }
  | { status: 'offline'; session: AuthSession; persistent: boolean; message: string }
  | { status: 'authenticated'; session: AuthSession }

export function useAuth(tenant: string | null) {
  const [state, setState] = useState<AuthState>(() => {
    const saved = readSession(tenant)
    return saved ? { status: 'checking', ...saved } : { status: 'guest' }
  })
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (state.status !== 'checking') return
    const controller = new AbortController()
    validateSession(state.session, controller.signal).then((session) => {
      if (controller.signal.aborted) return
      setState({ status: 'authenticated', session })
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return
      if (error instanceof ApiError && [401, 403, 404].includes(error.status)) {
        clearSession()
        setState({ status: 'guest', message: 'Tu sesión ya no está disponible. Inicia sesión de nuevo.' })
      } else {
        setState({ ...state, status: 'offline', message: 'No pudimos comprobar tu sesión. Revisa la conexión e inténtalo de nuevo.' })
      }
    })
    return () => controller.abort()
  }, [state])

  useEffect(() => {
    if (state.status === 'guest') return
    const expiresAt = state.session.expiresAt
    function expire() {
      if (Date.now() >= expiresAt) {
        clearSession()
        setState({ status: 'guest', message: 'Tu sesión venció. Inicia sesión de nuevo.' })
      }
    }
    const timer = window.setTimeout(expire, Math.min(Math.max(0, expiresAt - Date.now()), 2_147_483_647))
    window.addEventListener('focus', expire)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('focus', expire)
    }
  }, [state])

  useEffect(() => {
    function syncLogout(event: StorageEvent) {
      if (event.storageArea === window.localStorage && (event.key === SESSION_KEY || event.key === null)) {
        const saved = readSession(tenant)
        setState(saved ? { status: 'checking', ...saved } : { status: 'guest' })
      }
    }
    window.addEventListener('storage', syncLogout)
    return () => window.removeEventListener('storage', syncLogout)
  }, [tenant])

  async function signIn(credentials: LoginCredentials, persistent: boolean) {
    const session = await login(credentials)
    try {
      saveSession(session, persistent)
    } catch {
      throw new Error('Permite el almacenamiento de este sitio en el navegador para mantener tu sesión.')
    }
    setState({ status: 'authenticated', session })
  }

  async function signOut() {
    if (state.status === 'guest' || signingOut) return
    setSigningOut(true)
    clearSession()
    setState({ status: 'guest' })
    try {
      await logout(state.session)
    } catch {
      // Always discard the local token, even if the activity log cannot be reached.
    } finally {
      setSigningOut(false)
    }
  }

  function retry() {
    if (state.status === 'offline') setState({ ...state, status: 'checking' })
  }

  return { state, signIn, signOut, signingOut, retry }
}
