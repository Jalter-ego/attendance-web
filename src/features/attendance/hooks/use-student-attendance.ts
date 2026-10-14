import { useEffect, useState } from 'react'
import { ApiError } from '../../../lib/api'
import { fetchMyHistory, markAttendance } from '../services/attendance-api'
import type { AttendanceHistory } from '../types/attendance'
import { formatMarkedAt } from '../utils/format'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; history: AttendanceHistory }

export type Feedback = { type: 'success' | 'error'; text: string }

function messageOf(error: unknown): string {
  return error instanceof ApiError ? error.message : 'No pudimos completar la solicitud. Inténtalo de nuevo.'
}

/**
 * Historial del estudiante (RF-05) y la acción de marcar (RF-03).
 *
 * La fila `pending` es la de hoy sin marca, así que el historial alcanza para
 * saber si se puede marcar. Después de marcar se vuelve a pedir, también si el
 * API respondió 409 o 422: en ambos casos lo que se muestra ya no está al día.
 */
export function useStudentAttendance(token: string) {
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [reloadKey, setReloadKey] = useState(0)
  const [marking, setMarking] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetchMyHistory(token, controller.signal)
      .then((history) => {
        if (!controller.signal.aborted) setState({ status: 'ready', history })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        // Si ya había datos se conservan: solo falló la actualización
        setState((previous) => previous.status === 'ready' ? previous : { status: 'error', message: messageOf(error) })
      })
    return () => controller.abort()
  }, [token, reloadKey])

  function retry() {
    setState({ status: 'loading' })
    setReloadKey((key) => key + 1)
  }

  async function mark() {
    if (marking) return
    setMarking(true)
    setFeedback(null)
    try {
      const result = await markAttendance(token)
      setFeedback({ type: 'success', text: `Asistencia registrada a las ${formatMarkedAt(result.markedAt)}.` })
    } catch (error) {
      setFeedback({ type: 'error', text: messageOf(error) })
    } finally {
      setMarking(false)
      setReloadKey((key) => key + 1)
    }
  }

  return { state, marking, feedback, mark, retry }
}
