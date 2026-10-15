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
  // PUT lo necesita la corrección de asistencias (RF-07)
  options: {
    method?: 'GET' | 'POST' | 'PUT'
    /** Se envía como JSON, salvo un `FormData` (importación de Excel), que va como multipart */
    body?: unknown
    token?: string
    signal?: AbortSignal
  } = {},
): Promise<unknown> {
  // Con FormData el navegador pone el Content-Type con el boundary: fijarlo a mano lo rompe
  const multipart = options.body instanceof FormData
  const headers = new Headers({ Accept: 'application/json' })
  if (options.body !== undefined && !multipart) headers.set('Content-Type', 'application/json')
  if (options.token) headers.set('Authorization', `Bearer ${options.token}`)

  let response: Response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: options.method || 'GET',
      headers,
      body: multipart ? options.body as FormData : options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: AbortSignal.any([
        // Subir un archivo puede tardar más que una consulta
        AbortSignal.timeout(multipart ? 60_000 : 12_000),
        ...(options.signal ? [options.signal] : []),
      ]),
    })
  } catch (error) {
    if (options.signal?.aborted) throw error
    throw new ApiError('No pudimos conectar con el servidor. Inténtalo de nuevo.', 0)
  }

  const data: unknown = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) throw errorFrom(response.status, data)
  return data
}

function errorFrom(status: number, data: unknown): ApiError {
  const message = data && typeof data === 'object' && 'message' in data ? data.message : null
  const detail = Array.isArray(message)
    ? message.filter((item): item is string => typeof item === 'string').join('. ')
    : message
  return new ApiError(
    typeof detail === 'string' && detail ? detail : 'No pudimos completar la solicitud. Inténtalo de nuevo.',
    status,
    importErrorsOf(data),
  )
}

/** Nombre de archivo del `Content-Disposition`, prefiriendo `filename*` en UTF-8 */
function filenameFrom(header: string | null): string | null {
  if (!header) return null
  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(header)
  if (encoded) {
    try {
      return decodeURIComponent(encoded[1].trim())
    } catch {
      /* header mal formado: se intenta el nombre simple */
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(header)
  return plain ? plain[1].trim() : null
}

/**
 * Descarga un archivo en lugar de JSON (RF-17).
 *
 * Va aparte de `apiRequest` porque ese parsea la respuesta como JSON. Un error
 * sí llega como JSON, así que en ese caso se lee igual y se lanza un ApiError.
 *
 * `filename` solo llega si el backend expone `Content-Disposition` por CORS;
 * si no, queda en null y quien llama pone un nombre por defecto.
 */
export async function apiDownload(
  path: string,
  options: { token?: string; signal?: AbortSignal } = {},
): Promise<{ blob: Blob; filename: string | null }> {
  const headers = new Headers()
  if (options.token) headers.set('Authorization', `Bearer ${options.token}`)

  let response: Response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      headers,
      signal: AbortSignal.any([
        AbortSignal.timeout(60_000),
        ...(options.signal ? [options.signal] : []),
      ]),
    })
  } catch (error) {
    if (options.signal?.aborted) throw error
    throw new ApiError('No pudimos conectar con el servidor. Inténtalo de nuevo.', 0)
  }

  if (!response.ok) {
    const data: unknown = await response.json().catch(() => null)
    throw errorFrom(response.status, data)
  }

  return {
    blob: await response.blob(),
    filename: filenameFrom(response.headers.get('Content-Disposition')),
  }
}
