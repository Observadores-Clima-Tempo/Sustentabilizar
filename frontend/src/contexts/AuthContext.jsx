import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getMe } from '../services/auth.service'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

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
   * Chamado logo após login ou register bem-sucedido.
   */
  const signIn = useCallback((token, userData) => {
    localStorage.setItem('access_token', token)
    setUser(userData)
  }, [])

  /**
   * Remove o token e limpa o estado do usuário (logout).
   */
  const signOut = useCallback(() => {
    localStorage.removeItem('access_token')
    setUser(null)
  }, [])

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
