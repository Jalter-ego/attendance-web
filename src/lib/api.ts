/** Una fila que hay que corregir en un Excel importado (RF-11, RF-12) */
export type ImportErrorRow = { row: number; field: string; message: string }

export class ApiError extends Error {
  status: number
  /** Filas del 422 de importación. Vacío en cualquier otro error */
  importErrors: ImportErrorRow[]

  constructor(message: string, status: number, importErrors: ImportErrorRow[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.importErrors = importErrors
  }
}

function importErrorsOf(data: unknown): ImportErrorRow[] {
  if (!data || typeof data !== 'object' || !('errors' in data)) return []
  const rows = (data as { errors: unknown }).errors
  if (!Array.isArray(rows)) return []
  return rows.filter(
    (row): row is ImportErrorRow =>
      row !== null &&
      typeof row === 'object' &&
      typeof (row as ImportErrorRow).row === 'number' &&
      typeof (row as ImportErrorRow).field === 'string' &&
      typeof (row as ImportErrorRow).message === 'string',
  )
}

const baseUrl = (import.meta.env?.VITE_API_URL || '/core/api/v1').replace(/\/$/, '')

export async function apiRequest(
  path: string,
  // PUT lo necesita la corrección de asistencias (RF-07). La importación de
  // Excel usa multipart y no pasa por aquí: requiere FormData sin Content-Type
  options: {
    method?: 'GET' | 'POST' | 'PUT'
    body?: unknown
    token?: string
    signal?: AbortSignal
  } = {},
): Promise<unknown> {
  const headers = new Headers({ Accept: 'application/json' })
  if (options.body !== undefined) headers.set('Content-Type', 'application/json')
  if (options.token) headers.set('Authorization', `Bearer ${options.token}`)

  let response: Response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: options.method || 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: AbortSignal.any([
        AbortSignal.timeout(12_000),
        ...(options.signal ? [options.signal] : []),
      ]),
    })
  } catch (error) {
    if (options.signal?.aborted) throw error
    throw new ApiError('No pudimos conectar con el servidor. Inténtalo de nuevo.', 0)
  }

  const data: unknown = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    const message = data && typeof data === 'object' && 'message' in data ? data.message : null
    const detail = Array.isArray(message)
      ? message.filter((item): item is string => typeof item === 'string').join('. ')
      : message
    throw new ApiError(
      typeof detail === 'string' && detail ? detail : 'No pudimos completar la solicitud. Inténtalo de nuevo.',
      response.status,
      importErrorsOf(data),
    )
  }
  return data
}
