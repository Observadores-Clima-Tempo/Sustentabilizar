import { useEffect, useState } from 'react'
import { Button } from './ui/Button'

const DISMISS_KEY = 'pwa_install_dismissed_date'

function wasDismissedToday() {
  const stored = localStorage.getItem(DISMISS_KEY)
  if (!stored) return false
  return stored === new Date().toDateString()
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (wasDismissedToday()) return

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    const onInstalled = () => {
      setVisible(false)
      setDeferredPrompt(null)
    }
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setVisible(false)
    }
    setDeferredPrompt(null)
  }

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, new Date().toDateString())
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.10)] flex items-center gap-3 animate-slide-up"
      role="dialog"
      aria-label="Instalar aplicativo"
    >
      <img
        src="/logo.svg"
        alt="Logo Sustentabilizar"
        className="w-10 h-10 flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 leading-tight">
          Instale o Sustentabilizar
        </p>
        <p className="text-xs text-gray-500 mt-0.5 leading-snug">
          Acesse rapidamente pelo seu celular
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={handleDismiss}>
          Agora não
        </Button>
        <Button variant="primary" size="sm" onClick={handleInstall}>
          Instalar
        </Button>
      </div>
    </div>
  )
}
