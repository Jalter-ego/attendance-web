import { useEffect, useRef, type ReactNode } from 'react'
import './ConfirmDialog.css'

export type DialogAction = { label: string; onSelect: () => void; tone?: 'primary' | 'danger' }

type ConfirmDialogProps = {
  open: boolean
  title: string
  children: ReactNode
  actions: DialogAction[]
  onCancel: () => void
}

/**
 * Diálogo modal de confirmación sobre `<dialog>` nativo: atrapa el foco, se
 * cierra con Escape y devuelve el foco al elemento que lo abrió.
 */
function ConfirmDialog({ open, title, children, actions, onCancel }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="confirm-dialog"
      aria-labelledby="confirm-dialog-title"
      onCancel={(event) => { event.preventDefault(); onCancel() }}
    >
      <h2 id="confirm-dialog-title">{title}</h2>
      <div className="confirm-dialog-body">{children}</div>
      <div className="confirm-dialog-actions">
        <button className="confirm-dialog-action confirm-dialog-cancel" type="button" onClick={onCancel}>
          Cancelar
        </button>
        {actions.map((action) => (
          <button
            key={action.label}
            className={`confirm-dialog-action confirm-dialog-action--${action.tone ?? 'primary'}`}
            type="button"
            onClick={action.onSelect}
          >
            {action.label}
          </button>
        ))}
      </div>
    </dialog>
  )
}

export default ConfirmDialog
