import type { AdminUser, AuthSession, Student, Tenant } from '../types/session.ts'

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

function strings(value: unknown, keys: string[]): value is Record<string, string> {
  return record(value) && keys.every((key) => typeof value[key] === 'string' && value[key].length > 0)
}

export function isAdminUser(value: unknown): value is AdminUser {
  return strings(value, ['id', 'name', 'email', 'role']) && ['owner', 'admin'].includes(value.role)
}

export function isStudent(value: unknown): value is Student {
  return strings(value, ['id', 'registrationNumber', 'fullName', 'email'])
}

function isTenant(value: unknown): value is Tenant {
  return strings(value, ['id', 'name', 'slug'])
}

// Reading claims is only a local expiry/consistency check. The API verifies the JWT in /auth/me.
export function parseSession(value: unknown, expectedTenant?: string | null): AuthSession | null {
  if (!record(value) || typeof value.accessToken !== 'string' || !isTenant(value.tenant)) return null
  if (expectedTenant && value.tenant.slug !== expectedTenant) return null

  try {
    const parts = value.accessToken.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const claims: unknown = JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, '=')))
    if (!record(claims) || typeof claims.exp !== 'number' || !Number.isFinite(claims.exp)) return null
    const expiresAt = claims.exp * 1000
    if (expiresAt <= Date.now() || claims.tenantId !== value.tenant.id || claims.type !== value.type) return null

    const base = { accessToken: value.accessToken, expiresAt, tenant: value.tenant }
    if (value.type === 'admin' && isAdminUser(value.user)
      && claims.sub === value.user.id && claims.role === value.user.role) {
      return { ...base, type: 'admin', user: value.user }
    }
    if (value.type === 'student' && isStudent(value.student) && strings(value.module, ['id', 'name'])
      && claims.sub === value.student.id && claims.moduleId === value.module.id) {
      return { ...base, type: 'student', student: value.student, module: { id: value.module.id, name: value.module.name } }
    }
  } catch {
    return null
  }
  return null
}

export const SESSION_KEY = 'attendance.auth.v1'

export function clearSession(): void {
  for (const name of ['localStorage', 'sessionStorage'] as const) {
    try { window[name].removeItem(SESSION_KEY) } catch { /* Storage may be disabled by the browser. */ }
  }
}

export function saveSession(session: AuthSession, persistent: boolean): void {
  clearSession()
  window[persistent ? 'localStorage' : 'sessionStorage'].setItem(SESSION_KEY, JSON.stringify(session))
}

export function readSession(expectedTenant: string | null): { session: AuthSession; persistent: boolean } | null {
  for (const name of ['localStorage', 'sessionStorage'] as const) {
    try {
      const saved = window[name].getItem(SESSION_KEY)
      if (!saved) continue
      const session = parseSession(JSON.parse(saved), expectedTenant)
      if (session) return { session, persistent: name === 'localStorage' }
      window[name].removeItem(SESSION_KEY)
    } catch {
      try { window[name].removeItem(SESSION_KEY) } catch { /* Storage unavailable. */ }
    }
  }
  return null
}
