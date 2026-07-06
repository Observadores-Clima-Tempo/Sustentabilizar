const TYPE_STYLES = {
  success: {
    bar: 'bg-green-500',
    icon: '✅',
  },
  error: {
    bar: 'bg-red-500',
    icon: '❌',
  },
  warning: {
    bar: 'bg-amber-400',
    icon: '⚠️',
  },
  info: {
    bar: 'bg-blue-500',
    icon: 'ℹ️',
  },
}

function ToastItem({ toast, onDismiss }) {
  const styles = TYPE_STYLES[toast.type] || TYPE_STYLES.info

  return (
    <div className="flex items-start gap-3 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Barra colorida lateral */}
      <div className={`w-1 self-stretch flex-shrink-0 ${styles.bar}`} />

      <span className="text-base flex-shrink-0 mt-3.5">{styles.icon}</span>

      <p className="flex-1 text-sm text-gray-800 leading-snug py-3.5 pr-2">
        {toast.message}
      </p>

      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 mt-3 mr-3 text-gray-400 hover:text-gray-600 text-xl leading-none transition-colors duration-150"
        aria-label="Fechar notificação"
      >
        ×
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  )
}
