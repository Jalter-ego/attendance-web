import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router'
import { useSession } from '../features/auth/context/useSession'
import type { LoginCredentials } from '../features/auth/types/session'
import AdminLayout from '../layouts/AdminLayout'
import AdminHomePage from '../pages/AdminHomePage/AdminHomePage'
import LoginPage from '../pages/LoginPage/LoginPage'
import StudentAttendancePage from '../pages/StudentAttendancePage/StudentAttendancePage'
import StudentsPage from '../pages/StudentsPage/StudentsPage'
import ProtectedRoute from './ProtectedRoute'
import { homeByType, paths } from './paths'

/* Los envoltorios leen el contexto y pasan las props que `LoginPage` y
 * `StudentAttendancePage` esperan. Las páginas del admin leen la sesión con
 * `useAdminSession` y comparten el marco de `AdminLayout`.
 */

function LoginRoute() {
  const { state, signIn, tenant } = useSession()
  const navigate = useNavigate()
  const location = useLocation()

  if (state.status === 'authenticated') {
    // Vuelve a donde quería entrar, si la guarda lo mandó aquí
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from ?? homeByType[state.session.type]} replace />
  }

  async function handleLogin(credentials: LoginCredentials, persistent: boolean) {
    await signIn(credentials, persistent)
    const from = (location.state as { from?: string } | null)?.from
    navigate(from ?? homeByType[credentials.type], { replace: true })
  }

  return (
    <LoginPage
      tenant={tenant}
      message={state.status === 'guest' ? state.message : undefined}
      onLogin={handleLogin}
    />
  )
}

function StudentAttendanceRoute() {
  const { state, signOut, signingOut } = useSession()
  if (state.status !== 'authenticated' || state.session.type !== 'student') return null

  return <StudentAttendancePage session={state.session} onLogout={signOut} signingOut={signingOut} />
}

/** Manda a cada quien a su área, o al login si no hay sesión */
function RootRedirect() {
  const { state } = useSession()
  return (
    <Navigate
      to={state.status === 'authenticated' ? homeByType[state.session.type] : paths.login}
      replace
    />
  )
}

function AppRouter() {
  return (
    <Routes>
      <Route path={paths.login} element={<LoginRoute />} />

      {/* Área del estudiante (RF-03, RF-05) */}
      <Route element={<ProtectedRoute allow="student" />}>
        <Route path={paths.studentHome} element={<StudentAttendanceRoute />} />
      </Route>

      {/* Área del administrador (RF-06 … RF-13) */}
      <Route element={<ProtectedRoute allow="admin" />}>
        <Route element={<AdminLayout />}>
          <Route path={paths.adminHome} element={<AdminHomePage />} />
          <Route path={paths.adminStudents} element={<StudentsPage />} />
        </Route>
      </Route>

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  )
}

export default AppRouter
