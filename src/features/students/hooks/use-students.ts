import { useEffect, useState } from 'react'
import { ApiError } from '../../../lib/api'
import { fetchStudents } from '../services/students-api'
import type { StudentList } from '../types/student'

/** Resultado de la última búsqueda que respondió, con el término que la produjo */
type Result =
  | { search: string; status: 'ready'; data: StudentList }
  | { search: string; status: 'error'; message: string }

/**
 * Estudiantes del módulo activo filtrados por `search` (RF-06).
 *
 * Mientras llega una búsqueda nueva se sigue mostrando la lista anterior
 * (`data`), así la tabla no parpadea en cada tecla.
 */
export function useStudents(token: string, search: string) {
  const [result, setResult] = useState<Result | null>(null)
  const [lastData, setLastData] = useState<StudentList | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetchStudents(token, search, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return
        setResult({ search, status: 'ready', data })
        setLastData(data)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const message = error instanceof ApiError ? error.message : 'No pudimos cargar los estudiantes.'
        setResult({ search, status: 'error', message })
      })
    return () => controller.abort()
  }, [token, search, reloadKey])

  function retry() {
    setResult(null)
    setReloadKey((key) => key + 1)
  }

  return {
    data: lastData,
    loading: result === null || result.search !== search,
    error: result?.status === 'error' && result.search === search ? result.message : null,
    retry,
  }
}
