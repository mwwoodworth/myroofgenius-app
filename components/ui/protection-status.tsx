import { AlertTriangle, XCircle, CheckCircle, Loader2 } from 'lucide-react'
import clsx from 'clsx'

interface ProtectionStatusProps {
  status: 'protected' | 'warning' | 'danger' | 'calculating'
  message: string
  details?: string[]
  className?: string
}

export function ProtectionStatus({ status, message, details, className }: ProtectionStatusProps) {
  const icons = {
    protected: <CheckCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    danger: <XCircle className="w-5 h-5" />,
    calculating: <Loader2 className="w-5 h-5 animate-spin" />
  }

  const styles = {
    protected: 'bg-green-50 text-green-900 border-green-200',
    warning: 'bg-orange-50 text-orange-900 border-orange-200',
    danger: 'bg-red-50 text-red-900 border-red-200',
    calculating: 'bg-blue-50 text-blue-900 border-blue-200'
  }

  return (
    <div
      className={clsx(
        'rounded-lg border-2 p-4',
        styles[status],
        status !== 'calculating' && `protection-${status}`,
        className
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">{icons[status]}</div>
        <div className="flex-1">
          <p className="font-semibold">{message}</p>
          {details && details.length > 0 && (
            <ul className="mt-2 space-y-1">
              {details.map((detail, i) => (
                <li key={i} className="text-sm opacity-90">
                  • {detail}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
