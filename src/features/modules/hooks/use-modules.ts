import { useEffect, useState } from 'react'
import { ApiError } from '../../../lib/api'
import { fetchModule, listModules } from '../services/modules-api'
import type { ModuleDetail, ModuleSummary } from '../types/module'

type LoadState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: T }

function messageOf(error: unknown): string {
  return error instanceof ApiError ? error.message : 'No pudimos cargar la información. Inténtalo de nuevo.'
}

/**
 * Carga con `load` y la repite al llamar `reload`. Mientras se recarga se sigue
 * mostrando lo anterior, así una importación no deja la pantalla en blanco.
 */
function useResource<T>(load: (signal: AbortSignal) => Promise<T>, key: string) {
  const [state, setState] = useState<LoadState<T>>({ status: 'loading' })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ status: 'ready', data })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState((previous) => previous.status === 'ready' ? previous : { status: 'error', message: messageOf(error) })
      })
    return () => controller.abort()
    // `load` cambia en cada render; lo que decide cuándo volver a pedir es `key`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, reloadKey])

  return {
    state,
    reload: () => setReloadKey((value) => value + 1),
    retry: () => {
      setState({ status: 'loading' })
      setReloadKey((value) => value + 1)
    },
  }
}

export function useModules(token: string) {
  return useResource<ModuleSummary[]>((signal) => listModules(token, signal), token)
}

export function useModuleDetail(token: string, id: string) {
  return useResource<ModuleDetail>((signal) => fetchModule(token, id, signal), `${token}:${id}`)
}
