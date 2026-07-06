import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
})

// Injeta o token JWT em todos os requests autenticados
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Trata respostas de erro globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Sessão expirada: token presente mas rejeitado pelo backend
    if (error.response?.status === 401 && localStorage.getItem('access_token')) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

/**
 * Extrai a mensagem de erro legível de uma resposta de API.
 * Cobre os formatos retornados pelo FastAPI (string, lista de objetos, etc.).
 *
 * @param {unknown} err - Objeto de erro capturado em um catch
 * @param {string} fallback - Mensagem padrão se nenhuma for encontrada
 * @returns {string}
 */
export function getApiError(err, fallback = 'Ocorreu um erro. Tente novamente.') {
  const detail = err?.response?.data?.detail
  if (!detail) return fallback
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((d) => d?.msg ?? String(d)).join('; ')
  }
  return fallback
}

export default api
