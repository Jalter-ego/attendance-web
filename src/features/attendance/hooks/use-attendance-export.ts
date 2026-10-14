import { useState } from 'react'
import { ApiError } from '../../../lib/api'
import { saveBlob } from '../../../utils/download'
import { downloadAttendances, type ExportFilters } from '../services/attendance-admin-api'

export type ExportFeedback = { type: 'success' | 'error'; text: string }

/** Descarga del Excel de asistencias (RF-17) */
export function useAttendanceExport(token: string) {
  const [exporting, setExporting] = useState(false)
  const [feedback, setFeedback] = useState<ExportFeedback | null>(null)

  async function exportTo(filters: ExportFilters) {
    if (exporting) return
    setExporting(true)
    setFeedback(null)
    try {
      const { blob, filename } = await downloadAttendances(token, filters)
      saveBlob(blob, filename)
      setFeedback({ type: 'success', text: `Se descargó «${filename}».` })
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof ApiError
          ? error.message
          : 'No pudimos generar el archivo. Inténtalo de nuevo.',
      })
    } finally {
      setExporting(false)
    }
  }

  return { exporting, feedback, exportTo, dismiss: () => setFeedback(null) }
}
