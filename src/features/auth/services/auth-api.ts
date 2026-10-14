import { ApiError, apiRequest } from '../../../lib/api.ts'
import { isAdminUser, isStudent, parseSession } from './session.ts'
import type { AuthSession, LoginCredentials } from '../types/session.ts'

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const { type, ...body } = credentials
  const data = await apiRequest(`/auth/${type}/login`, { method: 'POST', body })
  const session = parseSession(
    data && typeof data === 'object' ? { ...data, type } : null,
    credentials.tenant,
  )
  if (!session) throw new ApiError('La respuesta de acceso no corresponde a esta institución o no es válida.', 401)
  return session
}

export async function validateSession(session: AuthSession, signal?: AbortSignal): Promise<AuthSession> {
  const data = await apiRequest('/auth/me', { token: session.accessToken, signal })
  if (data && typeof data === 'object' && 'type' in data && data.type === session.type) {
    if (session.type === 'admin' && 'user' in data && isAdminUser(data.user) && data.user.id === session.user.id) {
      return { ...session, user: data.user }
    }
    if (session.type === 'student' && 'student' in data && isStudent(data.student) && data.student.id === session.student.id) {
      return { ...session, student: data.student }
    }
  }
  throw new ApiError('La sesión ya no es válida. Inicia sesión de nuevo.', 401)
}

export async function logout(session: AuthSession): Promise<void> {
  await apiRequest('/auth/logout', { method: 'POST', token: session.accessToken })
}
