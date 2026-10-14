import type { SessionStatus } from '../types/attendance'
import { statusLabel } from '../utils/format'

function StatusBadge({ status }: { status: SessionStatus }) {
  return <span className={`status-badge status-badge--${status}`}>{statusLabel[status]}</span>
}

export default StatusBadge
