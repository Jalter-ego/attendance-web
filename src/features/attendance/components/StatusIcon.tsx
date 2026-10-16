import { Check, Clock, Dot, X, type LucideIcon } from 'lucide-react'
import type { SessionStatus } from '../types/attendance'

const icons: Record<SessionStatus, LucideIcon> = {
  present: Check,
  absent: X,
  pending: Clock,
  upcoming: Dot,
}

/**
 * Ícono de cada estado, el mismo en la grilla del admin, el inicio y el
 * historial del estudiante. Es decorativo: el nombre del estado va aparte.
 */
function StatusIcon({ status, size = 16 }: { status: SessionStatus; size?: number }) {
  const Icon = icons[status]
  return <Icon size={status === 'upcoming' ? size + 8 : size} strokeWidth={status === 'pending' ? 2 : 2.5} aria-hidden="true" />
}

export default StatusIcon
