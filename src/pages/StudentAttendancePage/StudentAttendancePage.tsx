import AttendanceHistory from '../../features/attendance/components/AttendanceHistory'
import { useStudentAttendance } from '../../features/attendance/hooks/use-student-attendance'
import type { StudentSession } from '../../features/auth/types/session'
import './StudentAttendancePage.css'

type StudentAttendancePageProps = {
  session: StudentSession
  onLogout: () => Promise<void>
  signingOut: boolean
}

/** Área del estudiante: marcar la asistencia de hoy (RF-03) y ver su historial (RF-05) */
function StudentAttendancePage({ session, onLogout, signingOut }: StudentAttendancePageProps) {
  const { state, marking, feedback, mark, retry } = useStudentAttendance(session.accessToken)

  return (
    <main className="student-page">
      <header className="student-header">
        <div>
          <p className="student-brand">CONTROL DE ASISTENCIA</p>
          <p className="student-institution">{session.tenant.name}</p>
        </div>
        <div className="student-header-actions">
          <p className="student-identity">
            <strong>{session.student.fullName}</strong>
            <span>Registro {session.student.registrationNumber}</span>
          </p>
          <button className="student-logout" type="button" onClick={() => void onLogout()} disabled={signingOut}>
            {signingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </button>
        </div>
      </header>

      {state.status === 'loading' && <p className="student-status" role="status">Cargando tu asistencia…</p>}

      {state.status === 'error' && (
        <div className="student-error" role="alert">
          <p>{state.message}</p>
          <button className="student-retry" type="button" onClick={retry}>Volver a intentar</button>
        </div>
      )}

      {state.status === 'ready' && (
        <AttendanceHistory
          history={state.history}
          marking={marking}
          feedback={feedback}
          onMark={() => void mark()}
        />
      )}
    </main>
  )
}

export default StudentAttendancePage
