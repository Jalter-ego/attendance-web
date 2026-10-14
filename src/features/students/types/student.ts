export type StudentRow = { id: string; registrationNumber: string; fullName: string; email: string }

/** `GET /students?search=` (RF-06): estudiantes del módulo activo */
export type StudentList = {
  module: { id: string; name: string }
  total: number
  students: StudentRow[]
}
