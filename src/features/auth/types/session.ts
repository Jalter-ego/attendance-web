export type Tenant = { id: string; name: string; slug: string }
export type AdminUser = { id: string; name: string; email: string; role: 'owner' | 'admin' }
export type Student = { id: string; registrationNumber: string; fullName: string; email: string }
export type AcademicModule = { id: string; name: string }

type SessionBase = { accessToken: string; expiresAt: number; tenant: Tenant }
export type AdminSession = SessionBase & { type: 'admin'; user: AdminUser }
export type StudentSession = SessionBase & { type: 'student'; student: Student; module: AcademicModule }
export type AuthSession = AdminSession | StudentSession

export type LoginCredentials =
  | { type: 'admin'; tenant: string; email: string; password: string }
  | { type: 'student'; tenant: string; identifier: string }
