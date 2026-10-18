import AppHeader from '../../components/shared/AppHeader'
import BrandBackdrop from '../../components/shared/BrandBackdrop'
import PageHeading from '../../components/shared/PageHeading'
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
      <BrandBackdrop className="student-backdrop brand-backdrop--workspace" />
      <div className="student-header-wrap">
        <AppHeader
          institution={session.tenant.name}
          userName={session.student.fullName}
          userDetail={`Registro ${session.student.registrationNumber}`}
          onLogout={onLogout}
          signingOut={signingOut}
        />
      </div>
      <main className="page student-main">
        {state.status !== 'ready' && <PageHeading title="Mi asistencia" description={session.module.name} />}
        {state.status === 'loading' && <p className="page-status" role="status">Cargando tu asistencia…</p>}

        {state.status === 'error' && (
          <div className="page-error" role="alert">
            <p>{state.message}</p>
            <button className="secondary-button" type="button" onClick={retry}>Volver a intentar</button>
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
    </div>
  )
}

export default StudentAttendancePage
