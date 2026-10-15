import Icon from '../../components/shared/Icon'
import TopBar from '../../components/shared/TopBar'
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
    <div className="student-shell">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>

      <TopBar
        onLogout={onLogout}
        signingOut={signingOut}
        subtitle={session.tenant.name}
        title="Mi asistencia"
        userDetail={`Registro ${session.student.registrationNumber}`}
        userName={session.student.fullName}
      />

      <main className="page" id="contenido">
        {state.status === 'loading' && (
          <p className="page-status" role="status">Cargando tu asistencia…</p>
        )}

        {state.status === 'error' && (
          <div className="page-error" role="alert">
            <p>{state.message}</p>
            <button className="secondary-button" type="button" onClick={retry}>
              <Icon name="history" size={16} />
              Volver a intentar
            </button>
          </div>
        )}

        {state.status === 'ready' && (
          <AttendanceHistory
            feedback={feedback}
            history={state.history}
            marking={marking}
            onMark={() => void mark()}
          />
        )}
      </main>
    </div>
  )
}

export default StudentAttendancePage
