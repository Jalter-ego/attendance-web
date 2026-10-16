import { ArrowDown, ArrowUp, ArrowUpDown, ArrowUpRight, ChevronLeft, ChevronRight, Search, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import PageHeading from '../../components/shared/PageHeading'
import EmptyState from '../../components/shared/EmptyState'
import { useAdminSession } from '../../features/auth/context/useAdminSession'
import { useStudents } from '../../features/students/hooks/use-students'
import { modulePath } from '../../routes/paths'
import { initials } from '../../utils/initials'
import './StudentsPage.css'

const SEARCH_DELAY_MS = 300
const PAGE_SIZE = 20
const collator = new Intl.Collator('es', { numeric: true, sensitivity: 'base' })
type SortField = 'registrationNumber' | 'fullName'

function StudentsPage() {
  const session = useAdminSession()
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('q') ?? ''
  const [input, setInput] = useState({ search, value: search })
  // Una navegación del historial debe actualizar también el campo de búsqueda.
  const text = input.search === search ? input.value : search
  if (input.search !== search) setInput({ search, value: search })
  const { data, loading, error, retry } = useStudents(session.accessToken, search)
  const [pagination, setPagination] = useState({ search, page: 1 })
  const [sort, setSort] = useState<{ field: SortField; direction: 'asc' | 'desc' }>({ field: 'fullName', direction: 'asc' })

  useEffect(() => {
    const term = text.trim()
    if (term === search) return
    const timer = window.setTimeout(() => {
      setSearchParams((params) => {
        if (term) params.set('q', term)
        else params.delete('q')
        return params
      }, { replace: true })
    }, SEARCH_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [text, search, setSearchParams])

  const students = [...(data?.students ?? [])].sort((a, b) => {
    const compared = collator.compare(a[sort.field], b[sort.field])
    return sort.direction === 'asc' ? compared : -compared
  })
  const pageCount = Math.max(1, Math.ceil(students.length / PAGE_SIZE))
  const page = pagination.search === search ? Math.min(pagination.page, pageCount) : 1
  const offset = (page - 1) * PAGE_SIZE
  const visibleStudents = students.slice(offset, offset + PAGE_SIZE)

  function clearSearch() {
    setInput({ search, value: '' })
    setSearchParams((params) => {
      params.delete('q')
      return params
    }, { replace: true })
  }

  function toggleSort(field: SortField) {
    setSort({ field, direction: sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc' })
    setPagination({ search, page: 1 })
  }

  function sortIcon(field: SortField) {
    if (sort.field !== field) return <ArrowUpDown size={13} aria-hidden="true" />
    return sort.direction === 'asc' ? <ArrowUp size={13} aria-hidden="true" /> : <ArrowDown size={13} aria-hidden="true" />
  }

  return (
    <section className="students-page" aria-labelledby="students-title">
      <PageHeading id="students-title" title="Estudiantes" description="Consulta los estudiantes inscritos en el módulo activo." actions={data && (
          <Link className="students-module-link" to={modulePath(data.module.id)}>
            Ver módulo <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        )} />

      <div className="students-panel">
        <div className="students-panel-heading">
          <div>
            <span className="students-module-label">Módulo activo</span>
            <h2>{data?.module.name ?? 'Listado de estudiantes'}</h2>
          </div>
          <span className="students-scope">Estudiantes inscritos</span>
        </div>

        <div className="students-toolbar">
          <label className="students-search search-field">
            <span className="visually-hidden">Buscar estudiante por nombre o número de registro</span>
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={text}
              onChange={(event) => setInput({ search, value: event.target.value })}
              placeholder="Buscar por nombre o registro"
              autoComplete="off"
            />
          </label>
          {text && (
            <button className="students-clear" type="button" onClick={clearSearch}>
              <X size={14} aria-hidden="true" /> Limpiar búsqueda
            </button>
          )}
          <p className="students-result-count" role="status">
            {loading ? 'Buscando…' : error || !data ? '' : `${data.total} ${data.total === 1 ? 'estudiante' : 'estudiantes'}${search ? data.total === 1 ? ' encontrado' : ' encontrados' : ''}`}
          </p>
        </div>

        {error ? (
          <div className="page-error students-error" role="alert">
            <p>{error}</p>
            <button className="secondary-button" type="button" onClick={retry}>Volver a intentar</button>
          </div>
        ) : !data ? (
          <p className="students-loading" role="status">Cargando estudiantes…</p>
        ) : students.length === 0 ? (
          <EmptyState icon={Users} title={search ? 'Sin coincidencias' : 'Aún no hay estudiantes'}
            description={search ? `No encontramos estudiantes para «${search}». Prueba con otro nombre o registro.` : 'Los estudiantes aparecerán aquí cuando se carguen en el módulo activo.'}
            actions={search && <button className="secondary-button" type="button" onClick={clearSearch}>Ver todos los estudiantes</button>} />
        ) : (
          <div className={`ledger-wrap${loading ? ' is-loading' : ''}`} aria-busy={loading} tabIndex={0} role="region" aria-label="Listado de estudiantes">
            <table className="ledger students-table">
              <caption className="visually-hidden">Estudiantes de {data.module.name}</caption>
              <thead>
                <tr>
                  <th scope="col" aria-sort={sort.field === 'registrationNumber' ? sort.direction === 'asc' ? 'ascending' : 'descending' : 'none'}>
                    <button className="students-sort" type="button" onClick={() => toggleSort('registrationNumber')}>Registro {sortIcon('registrationNumber')}</button>
                  </th>
                  <th scope="col" aria-sort={sort.field === 'fullName' ? sort.direction === 'asc' ? 'ascending' : 'descending' : 'none'}>
                    <button className="students-sort" type="button" onClick={() => toggleSort('fullName')}>Estudiante {sortIcon('fullName')}</button>
                  </th>
                  <th scope="col">Correo electrónico</th>
                </tr>
              </thead>
              <tbody>
                {visibleStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="students-registration">{student.registrationNumber}</td>
                    <td><div className="students-person"><span className="students-avatar" aria-hidden="true">{initials(student.fullName)}</span><span className="students-name">{student.fullName}</span></div></td>
                    <td className="students-email">{student.email || 'Sin correo registrado'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && !error && students.length > 0 && (
          <div className="students-pagination">
            <p>{offset + 1}–{Math.min(offset + PAGE_SIZE, students.length)} de {students.length} {students.length === 1 ? 'estudiante' : 'estudiantes'}</p>
            <nav aria-label="Páginas de estudiantes">
              <span>Página {page} de {pageCount}</span>
              <button className="icon-button" type="button" aria-label="Página anterior" disabled={page <= 1 || loading} onClick={() => setPagination({ search, page: page - 1 })}><ChevronLeft size={17} aria-hidden="true" /></button>
              <button className="icon-button" type="button" aria-label="Página siguiente" disabled={page >= pageCount || loading} onClick={() => setPagination({ search, page: page + 1 })}><ChevronRight size={17} aria-hidden="true" /></button>
            </nav>
          </div>
        )}
      </div>
    </section>
  )
}

export default StudentsPage
