import { ApiError, apiRequest } from '../../../lib/api.ts'
import type { ActivationResult, ModuleDetail, ModuleSummary } from '../types/module.ts'

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

function isSummary(value: unknown): value is ModuleSummary {
  return record(value) && typeof value.id === 'string' && typeof value.name === 'string'
    && ['draft', 'active', 'archived'].includes(value.status as string)
    && typeof value.studentsCount === 'number' && typeof value.sessionsCount === 'number'
}

function invalidResponse(): ApiError {
  return new ApiError('La respuesta del servidor no es válida. Inténtalo de nuevo.', 502)
}

export async function listModules(token: string, signal?: AbortSignal): Promise<ModuleSummary[]> {
  const data = await apiRequest('/modules', { token, signal })
  if (Array.isArray(data) && data.every(isSummary)) return data
  throw invalidResponse()
}

export async function createModule(token: string, name: string): Promise<ModuleSummary> {
  const data = await apiRequest('/modules', { method: 'POST', token, body: { name } })
  if (isSummary(data)) return data
  throw invalidResponse()
}

export async function fetchModule(token: string, id: string, signal?: AbortSignal): Promise<ModuleDetail> {
  const data = await apiRequest(`/modules/${encodeURIComponent(id)}`, { token, signal })
  if (isSummary(data) && Array.isArray((data as ModuleDetail).students) && Array.isArray((data as ModuleDetail).sessions)) {
    return data as ModuleDetail
  }
  throw invalidResponse()
}

export type ImportKind = 'students' | 'sessions'

/**
 * RF-11 / RF-12: reemplaza lo cargado en el borrador por el contenido del Excel.
 * Si el archivo tiene errores el API responde 422 sin guardar nada, y las filas
 * a corregir llegan en `ApiError.importErrors`.
 */
export async function importExcel(token: string, moduleId: string, kind: ImportKind, file: File): Promise<number> {
  const body = new FormData()
  body.append('file', file)
  const data = await apiRequest(`/modules/${encodeURIComponent(moduleId)}/${kind}/import`, { method: 'POST', token, body })
  if (record(data) && typeof data.imported === 'number') return data.imported
  throw invalidResponse()
}

export async function activateModule(token: string, id: string): Promise<ActivationResult> {
  const data = await apiRequest(`/modules/${encodeURIComponent(id)}/activate`, {
    method: 'POST',
    token,
    body: { confirm: true },
  })
  if (isSummary(data)) return data as ActivationResult
  throw invalidResponse()
}
