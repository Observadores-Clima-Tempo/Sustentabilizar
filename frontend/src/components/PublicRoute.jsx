import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * Envolve rotas públicas (/, /login, /register).
 * Se o usuário já estiver autenticado, redireciona para /dashboard.
 * Aguarda o estado de autenticação ser restaurado antes de decidir.
 */
export default function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-sm">Carregando...</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
