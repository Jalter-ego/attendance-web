import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

type EmptyStateProps = { icon: LucideIcon; title: string; description: string; actions?: ReactNode }

function EmptyState({ icon: Icon, title, description, actions }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      <span className="empty-state-icon"><Icon size={24} strokeWidth={1.5} aria-hidden="true" /></span>
      <h3>{title}</h3>
      <p>{description}</p>
      {actions && <div className="empty-state-actions">{actions}</div>}
    </div>
  )
}

export default EmptyState
