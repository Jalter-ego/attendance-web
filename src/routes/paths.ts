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
  adminModuleDetail: '/admin/modulos/:moduleId',
} as const

/** Ruta del detalle de un módulo (RF-13, RF-16) */
export function modulePath(moduleId: string): string {
  return paths.adminModuleDetail.replace(':moduleId', encodeURIComponent(moduleId))
}

/** A dónde va cada rol después de iniciar sesión. Las claves son `session.type` */
export const homeByType = {
  admin: paths.adminHome,
  student: paths.studentHome,
} as const
