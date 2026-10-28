import { Check } from 'lucide-react'
import { useStore } from '../../state/store'

export function Toast() {
  const { toast } = useStore()
  if (!toast) return null

  return (
    <div className="toast" role="status" aria-live="polite" key={toast.id}>
      <span className="toast__icon">
        <Check size={14} strokeWidth={2.2} />
      </span>
      <span className="toast__text">
        <strong>{toast.message}</strong>
        {toast.detail && <span>{toast.detail}</span>}
      </span>
      <span className="toast__timer" aria-hidden="true" />
    </div>
  )
}
