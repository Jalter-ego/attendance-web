import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useAdminSession } from '../../features/auth/context/useAdminSession'
import { useStudents } from '../../features/students/hooks/use-students'
import './StudentsPage.css'

const SEARCH_DELAY_MS = 300

/** Lista de estudiantes del módulo activo con buscador (RF-06) */
function StudentsPage() {
  const session = useAdminSession()
  // El término vive en la URL (?q=) para que la búsqueda sobreviva a una recarga
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('q') ?? ''
  const [text, setText] = useState(search)
  const { data, loading, error, retry } = useStudents(session.accessToken, search)

  useEffect(() => {
    const term = text.trim()
    if (term === search) return
    const timer = window.setTimeout(() => {
      setSearchParams(term ? { q: term } : {}, { replace: true })
    }, SEARCH_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [text, search, setSearchParams])

  return (
    <section aria-labelledby="students-title">
      <h2 className="page-title" id="students-title">{data ? data.module.name : 'Módulo activo'}</h2>

      <div className="students-toolbar">
        <label className="students-search">
          <span className="visually-hidden">Buscar estudiante</span>
          <input
            type="search"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Buscar por nombre o número de registro"
            autoComplete="off"
          />
        </label>
        {data && (
          <p className="students-count" aria-live="polite">
            {data.total === 1 ? '1 estudiante' : `${data.total} estudiantes`}
            {search && ' encontrados'}
          </p>
        )}
      </div>

      {error ? (
        <div className="page-error" role="alert">
          <p>{error}</p>
          <button className="secondary-button" type="button" onClick={retry}>Volver a intentar</button>
        </div>
      ) : !data ? (
        <p className="page-status" role="status">Cargando estudiantes…</p>
      ) : data.students.length === 0 ? (
        <p className="students-empty">
          {search ? `Ningún estudiante coincide con «${search}».` : 'El módulo activo no tiene estudiantes.'}
        </p>
      ) : (
        <div className={`students-table-wrap${loading ? ' is-loading' : ''}`} aria-busy={loading}>
          <table className="students-table">
            <thead>
              <tr>
                <th scope="col">Registro</th>
                <th scope="col">Nombre</th>
                <th scope="col">Correo</th>
              </tr>
            </thead>
            <tbody>
              {data.students.map((student) => (
                <tr key={student.id}>
                  <td className="students-registration">{student.registrationNumber}</td>
                  <td>{student.fullName}</td>
                  <td className="students-email">{student.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default StudentsPage
