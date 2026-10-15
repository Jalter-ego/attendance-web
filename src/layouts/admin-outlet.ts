import { useOutletContext } from 'react-router'
import type { useModules } from '../features/modules/hooks/use-modules'

/**
 * Lo que `AdminLayout` comparte con sus vistas. La lista de módulos vive en el
 * layout porque la barra lateral muestra el activo: quien lo cambie recarga esta
 * misma lista para que la barra no quede desactualizada.
 */
export type AdminOutletContext = { modules: ReturnType<typeof useModules> }

export function useAdminOutlet() {
  return useOutletContext<AdminOutletContext>()
}
