/** Rutas de la aplicación en un solo lugar, para no repetir strings */
export const paths = {
  login: '/login',

  // Estudiante (RF-03, RF-05)
  studentHome: '/mi-asistencia',

  // Administrador (RF-06 … RF-13)
  adminHome: '/admin',
  adminStudents: '/admin/estudiantes',
  adminAttendances: '/admin/asistencias',
  adminActivity: '/admin/actividad',
  adminModules: '/admin/modulos',
} as const

/** A dónde va cada rol después de iniciar sesión. Las claves son `session.type` */
export const homeByType = {
  admin: paths.adminHome,
  student: paths.studentHome,
} as const
