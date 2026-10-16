import { CalendarCheck, Download, Search, X } from 'lucide-react'
import { useState } from 'react'
import PageHeading from '../../components/shared/PageHeading'
import EmptyState from '../../components/shared/EmptyState'
import ConfirmDialog, { type DialogAction } from '../../components/shared/ConfirmDialog'
import AttendanceGrid from '../../features/attendance/components/AttendanceGrid'
import { useAttendanceExport } from '../../features/attendance/hooks/use-attendance-export'
import { cellKey, useAttendanceOverview } from '../../features/attendance/hooks/use-attendance-overview'
import type { OverviewRecord, OverviewStudent } from '../../features/attendance/types/admin'
import type { ClassSession } from '../../features/attendance/types/attendance'
import StatusIcon from '../../features/attendance/components/StatusIcon'
import { formatClassDate, statusLabel } from '../../features/attendance/utils/format'
import { useAdminSession } from '../../features/auth/context/useAdminSession'
import './AttendancesPage.css'

/** Vista general de asistencias (RF-08) con corrección por celda (RF-07) */
function AttendancesPage() {
  const session = useAdminSession()
  const { state, saving, feedback, change, retry } = useAttendanceOverview(session.accessToken)
  const exporter = useAttendanceExport(session.accessToken)
  const [dateFilter, setDateFilter] = useState('')
  const [studentFilter, setStudentFilter] = useState('')
  const [editing, setEditing] = useState<OverviewRecord | null>(null)

  if (state.status === 'loading') return <section><PageHeading title="Asistencias" description="Consulta y corrige la asistencia del módulo activo." /><p className="page-status" role="status">Cargando asistencias…</p></section>
  if (state.status === 'error') {
    return (
      <section><PageHeading title="Asistencias" description="Consulta y corrige la asistencia del módulo activo." />
        <div className="page-error" role="alert"><p>{state.message}</p><button className="secondary-button" type="button" onClick={retry}>Volver a intentar</button></div>
      </section>
    )
  }

  const { data } = state
  // Fechas y estudiantes salen de los registros, en el orden en que los manda el API
  const allSessions = [...new Map(data.records.map((r) => [r.session.id, r.session])).values()]
    .sort((a, b) => a.classDate.localeCompare(b.classDate))
  const allStudents = [...new Map(data.records.map((r) => [r.student.id, r.student])).values()]
    .sort((a, b) => a.fullName.localeCompare(b.fullName))
  const records = new Map(data.records.map((r) => [cellKey(r.student.id, r.session.id), r]))

  const term = studentFilter.trim().toLowerCase()
  const sessions: ClassSession[] = dateFilter ? allSessions.filter((s) => s.classDate === dateFilter) : allSessions
  const students: OverviewStudent[] = term
    ? allStudents.filter((s) => s.fullName.toLowerCase().includes(term) || s.registrationNumber.toLowerCase().startsWith(term))
    : allStudents

  const visible = students.flatMap((student) =>
    sessions.map((s) => records.get(cellKey(student.id, s.id))).filter((r): r is OverviewRecord => r !== undefined),
  )
  const total = (status: OverviewRecord['status']) => visible.filter((r) => r.status === status).length
  const cards = [
    { label: 'Asistencias', value: total('present'), tone: 'present' },
    { label: 'Faltas', value: total('absent'), tone: 'absent' },
    { label: 'Pendientes hoy', value: total('pending'), tone: 'pending' },
    { label: 'Próximas', value: total('upcoming'), tone: 'upcoming' },
  ]

  // El API filtra el export por `studentId`, pero el buscador de arriba es texto
  // libre: solo se puede trasladar cuando deja un único estudiante a la vista.
  // Con varios, el archivo trae a todos y se avisa debajo del botón
  const onlyStudent = term && students.length === 1 ? students[0] : null
  const exportMismatch = term.length > 0 && students.length > 1
  const exportScope = [
    dateFilter ? formatClassDate(dateFilter).toLowerCase() : 'todas las fechas',
    onlyStudent ? onlyStudent.fullName : 'todos los estudiantes',
  ].join(' · ')

  function choose(status: 'present' | 'absent') {
    if (!editing) return
    const target = editing
    setEditing(null)
    void change(target, status)
  }

  const actions: DialogAction[] = !editing ? [] : [
    ...(editing.status !== 'present' ? [{ label: 'Marcar Presente', onSelect: () => choose('present') }] : []),
    ...(editing.status !== 'absent' ? [{ label: 'Marcar Falta', onSelect: () => choose('absent'), tone: 'danger' as const }] : []),
  ]

  return (
    <section aria-labelledby="attendances-title">
      <PageHeading id="attendances-title" title="Asistencias" description={data.module.name} actions={
        <div className="attendances-export">
          <button
            className="secondary-button"
            type="button"
            onClick={() => void exporter.exportTo({
              date: dateFilter || undefined,
              studentId: onlyStudent?.id,
            })}
            disabled={exporter.exporting || sessions.length === 0 || students.length === 0}
          >
            <Download size={15} strokeWidth={2} aria-hidden="true" />
            {exporter.exporting ? 'Generando…' : 'Descargar Excel'}
          </button>
          <span className="attendances-export-scope">{exportScope}</span>
        </div>
      } />

      <dl className="summary-grid attendance-summary">
        {cards.map((card) => (
          <div className={`summary-card summary-card--${card.tone}`} key={card.label}><dt>{card.label}</dt><dd>{card.value}</dd></div>
        ))}
      </dl>

      <div className="workspace-panel attendance-panel">
        <header className="panel-heading"><div><h2>Registro de asistencia</h2><p>Un registro por estudiante y fecha de clase.</p></div><span className="count-label">{students.length} estudiantes · {sessions.length} fechas</span></header>
      <div className="attendances-filters panel-toolbar">
        <label className="filter-field">
          <span>Fecha</span>
          <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}>
            <option value="">Todas las fechas</option>
            {allSessions.map((s) => (
              <option key={s.id} value={s.classDate}>
                {formatClassDate(s.classDate)}{s.classDate === data.today ? ' (hoy)' : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="filter-field">
          <span>Estudiante</span>
          <span className="search-field">
            <Search size={15} aria-hidden="true" />
            <input
            type="search"
            value={studentFilter}
            onChange={(event) => setStudentFilter(event.target.value)}
            placeholder="Nombre o número de registro"
            autoComplete="off"
          />
          </span>
        </label>
        {(dateFilter || studentFilter) && <button className="secondary-button" type="button" onClick={() => { setDateFilter(''); setStudentFilter('') }}><X size={14} aria-hidden="true" />Quitar filtros</button>}
      </div>

      {exporter.feedback && (
        <p
          className={`page-feedback page-feedback--${exporter.feedback.type}`}
          role={exporter.feedback.type === 'error' ? 'alert' : 'status'}
        >
          {exporter.feedback.text}
        </p>
      )}

      {exportMismatch && (
        <p className="attendances-export-note">
          El archivo incluye a todos los estudiantes: la búsqueda por texto no se puede aplicar a la
          descarga. Déjala en un solo estudiante si quieres exportarlo aparte.
        </p>
      )}

      {feedback && (
        <p className={`page-feedback page-feedback--${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>
          {feedback.text}
        </p>
      )}

      {allSessions.length === 0 || allStudents.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="Sin registros de asistencia" description="El módulo activo todavía no tiene estudiantes o fechas de clase." />
      ) : students.length === 0 ? (
        <EmptyState icon={Search} title="Sin coincidencias" description={`Ningún estudiante coincide con «${studentFilter.trim()}».`} actions={<button className="secondary-button" type="button" onClick={() => setStudentFilter('')}>Ver todos los estudiantes</button>} />
      ) : (
        <>
          <AttendanceGrid
            students={students}
            sessions={sessions}
            records={records}
            today={data.today}
            saving={saving}
            onEdit={setEditing}
          />
          <div className="attendances-legend">
            <ul aria-label="Significado de las marcas">
              {(['present', 'absent', 'pending', 'upcoming'] as const).map((status) => (
                <li key={status}>
                  <span className={`grid-mark grid-mark--${status}`} aria-hidden="true"><StatusIcon status={status} size={13} /></span>
                  {statusLabel[status]}
                </li>
              ))}
              <li>
                <span className="grid-mark grid-mark--present is-edited" aria-hidden="true"><StatusIcon status="present" size={13} /></span>
                Corregida por un administrador
              </li>
            </ul>
            <p>Haz clic en una marca para corregirla. Las fechas que aún no llegan no se pueden editar.</p>
          </div>
        </>
      )}

      </div>

      <ConfirmDialog
        open={editing !== null}
        title="Corregir asistencia"
        actions={actions}
        onCancel={() => setEditing(null)}
      >
        {editing && (
          <>
            <p><strong>{editing.student.fullName}</strong> · Registro {editing.student.registrationNumber}</p>
            <p>{formatClassDate(editing.session.classDate)}, {editing.session.startTime} – {editing.session.endTime}</p>
            <p>Estado actual: <strong>{statusLabel[editing.status]}</strong>. El cambio queda registrado en el historial de actividad.</p>
          </>
        )}
      </ConfirmDialog>
    </section>
  )
}

export default AttendancesPage
