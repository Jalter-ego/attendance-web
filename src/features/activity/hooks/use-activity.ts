import { useEffect, useState } from 'react'
import { ApiError } from '../../../lib/api'
import { fetchActivity } from '../services/activity-api'
import type { ActivityFilters, ActivityPage } from '../types/activity'

export const PAGE_SIZE = 25

type Result =
  | { key: string; status: 'ready'; data: ActivityPage }
  | { key: string; status: 'error'; message: string }

/**
 * Una página del historial con los filtros dados (RF-10). Los filtros se aplican
 * en el servidor porque el historial crece sin límite. Mientras llega la página
 * nueva se sigue mostrando la anterior.
 */
export function useActivity(token: string, filters: ActivityFilters) {
  const key = `${filters.studentId}|${filters.date}|${filters.page}`
  const [result, setResult] = useState<Result | null>(null)
  const [lastData, setLastData] = useState<ActivityPage | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const [studentId, date, page] = key.split('|')
    fetchActivity(token, { studentId, date, limit: PAGE_SIZE, offset: (Number(page) - 1) * PAGE_SIZE }, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return
        setResult({ key, status: 'ready', data })
        setLastData(data)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const message = error instanceof ApiError ? error.message : 'No pudimos cargar el historial.'
        setResult({ key, status: 'error', message })
      })
    return () => controller.abort()
  }, [token, key, reloadKey])

  return {
    data: lastData,
    loading: result === null || result.key !== key,
    error: result?.status === 'error' && result.key === key ? result.message : null,
    retry: () => {
      setResult(null)
      setReloadKey((value) => value + 1)
    },
  }
}
