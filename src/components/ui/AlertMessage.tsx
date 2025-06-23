interface AlertMessageProps {
  type: 'error' | 'success' | 'warning' | 'info'
  message: string
  className?: string
}

export default function AlertMessage({ type, message, className = '' }: AlertMessageProps) {
  const styles = {
    error: 'bg-red-50 border-red-400 text-red-700',
    success: 'bg-green-50 border-green-400 text-green-700',
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-700',
    info: 'bg-blue-50 border-blue-400 text-blue-700'
  }

  return (
    <div className={`border-l-4 p-4 ${styles[type]} ${className}`}>
      <div className="flex">
        <div className="ml-3">
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  )
} 