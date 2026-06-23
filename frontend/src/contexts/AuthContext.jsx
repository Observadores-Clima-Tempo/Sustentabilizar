import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getMe } from '../services/auth.service'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const queryClient = useQueryClient()

  // Ao montar, tenta restaurar a sessão se há token salvo
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }
    getMe()
      .then((userData) => setUser(userData))
      .catch(() => localStorage.removeItem('access_token'))
      .finally(() => setLoading(false))
  }, [])

  /**
   * Persiste o token e armazena os dados do usuário no contexto.
   * Limpa o cache antes de definir o novo usuário para evitar
   * que dados de uma sessão anterior vazem para a nova.
   */
  const signIn = useCallback((token, userData) => {
    queryClient.clear()
    localStorage.setItem('access_token', token)
    setUser(userData)
  }, [queryClient])

  /**
   * Remove o token, limpa o estado do usuário e descarta todo o
   * cache do React Query para que nenhum dado persista entre sessões.
   */
  const signOut = useCallback(() => {
    localStorage.removeItem('access_token')
    setUser(null)
    queryClient.clear()
  }, [queryClient])

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, isAdmin: user?.is_admin === true }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook para consumir o AuthContext.
 * Deve ser usado dentro de um <AuthProvider>.
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  }
  return ctx
}
