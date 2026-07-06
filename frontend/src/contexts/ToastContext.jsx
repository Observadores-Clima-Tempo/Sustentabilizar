import { createContext, useCallback, useContext, useState } from 'react'
import { ToastContainer } from '../components/ui/Toast'

const ToastContext = createContext(null)

let nextId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = ++nextId
      setToasts((prev) => [...prev, { id, message, type }])
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration)
      }
      return id
    },
    [dismiss],
  )

  const toast = {
    success: (msg, opts) => addToast(msg, 'success', opts?.duration ?? 4000),
    error: (msg, opts) => addToast(msg, 'error', opts?.duration ?? 5000),
    info: (msg, opts) => addToast(msg, 'info', opts?.duration ?? 4000),
    warning: (msg, opts) => addToast(msg, 'warning', opts?.duration ?? 4500),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

/**
 * Hook para exibir notificações toast.
 * Deve ser usado dentro de <ToastProvider>.
 *
 * @example
 * const toast = useToast()
 * toast.success('Registro salvo!')
 * toast.error('Erro ao salvar.')
 * toast.warning('Verifique os dados.')
 * toast.info('Processando...')
 */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast deve ser usado dentro de <ToastProvider>')
  return ctx
}
