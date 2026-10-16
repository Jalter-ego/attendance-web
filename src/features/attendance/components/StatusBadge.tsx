import type { SessionStatus } from '../types/attendance'
import { statusLabel } from '../utils/format'
import StatusIcon from './StatusIcon'

/** Estado con el mismo ícono que la grilla del admin, seguido de su nombre */
function StatusBadge({ status }: { status: SessionStatus }) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      <StatusIcon status={status} size={14} />
      {statusLabel[status]}
    </span>
  )
}

export default StatusBadge
