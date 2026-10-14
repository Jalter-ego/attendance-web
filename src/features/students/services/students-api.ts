import { ApiError, apiRequest } from '../../../lib/api.ts'
import type { StudentList, StudentRow } from '../types/student.ts'

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

function isStudentRow(value: unknown): value is StudentRow {
  return record(value) && ['id', 'registrationNumber', 'fullName', 'email'].every((key) => typeof value[key] === 'string')
}

export async function fetchStudents(token: string, search: string, signal?: AbortSignal): Promise<StudentList> {
  const query = search ? `?${new URLSearchParams({ search })}` : ''
  const data = await apiRequest(`/students${query}`, { token, signal })
  if (
    record(data) && record(data.module) && typeof data.module.name === 'string'
    && typeof data.total === 'number' && Array.isArray(data.students) && data.students.every(isStudentRow)
  ) {
    return data as StudentList
  }
  throw new ApiError('La respuesta del servidor no es válida. Inténtalo de nuevo.', 502)
}
