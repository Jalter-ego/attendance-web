import { useEffect, useState } from 'react'
import { ApiError } from '../../../lib/api'
import { fetchOverview, updateAttendance } from '../services/attendance-admin-api'
import type { AttendanceOverview, OverviewRecord } from '../types/admin'
import { formatClassDate, statusLabel } from '../utils/format'
import type { Feedback } from './use-student-attendance'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: AttendanceOverview }

export function cellKey(studentId: string, sessionId: string): string {
  return `${studentId}:${sessionId}`
}

function messageOf(error: unknown): string {
  return error instanceof ApiError ? error.message : 'No pudimos completar la solicitud. Inténtalo de nuevo.'
}

/**
 * Asistencia de todo el módulo activo (RF-08) y su corrección (RF-07).
 *
 * Se pide el módulo completo una sola vez y los filtros se aplican en el
 * navegador: así las listas de fechas y estudiantes para filtrar salen de los
 * mismos datos. Tras corregir una celda se actualiza en el lugar con la respuesta
 * del API, sin volver a pedir todo.
 */
export function useAttendanceOverview(token: string) {
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [reloadKey, setReloadKey] = useState(0)
  const [saving, setSaving] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetchOverview(token, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ status: 'ready', data })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState((previous) => previous.status === 'ready' ? previous : { status: 'error', message: messageOf(error) })
      })
    return () => controller.abort()
  }, [token, reloadKey])

  function retry() {
    setState({ status: 'loading' })
    setReloadKey((key) => key + 1)
  }

  async function change(target: OverviewRecord, status: 'present' | 'absent') {
    const key = cellKey(target.student.id, target.session.id)
    if (saving) return
    setSaving(key)
    setFeedback(null)
    try {
      const result = await updateAttendance(token, {
        studentId: target.student.id,
        classSessionId: target.session.id,
        status,
      })
      setState((previous) => {
        if (previous.status !== 'ready') return previous
        const records = previous.data.records.map((item) =>
          cellKey(item.student.id, item.session.id) === key
            ? { ...item, status: result.status, markedAt: result.markedAt, source: result.changed ? 'admin' as const : item.source }
            : item,
        )
        return { status: 'ready', data: { ...previous.data, records } }
      })
      const date = formatClassDate(target.session.classDate).toLowerCase()
      setFeedback({
        type: 'success',
        text: result.changed
          ? `${target.student.fullName}: ${statusLabel[result.status]} el ${date}.`
          : `${target.student.fullName} ya tenía ${statusLabel[result.status]} el ${date}. No se cambió nada.`,
      })
    } catch (error) {
      setFeedback({ type: 'error', text: messageOf(error) })
      // 404 o 409: lo que se muestra ya no coincide con el servidor
      if (error instanceof ApiError && [404, 409].includes(error.status)) setReloadKey((k) => k + 1)
    } finally {
      setSaving(null)
    }
  }

  return { state, saving, feedback, change, retry }
}
