import api from '../lib/axios'

/**
 * Registra um novo usuário.
 * @param {Object} data - { name, email, cpf, password, city, state }
 * @returns {Promise<Object>} UserOut
 */
export async function register(data) {
  const response = await api.post('/auth/register', data)
  return response.data
}

/**
 * Autentica o usuário e retorna o token JWT.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ access_token: string, token_type: string }>}
 */
export async function login(email, password) {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

/**
 * Busca os dados do usuário autenticado.
 * Requer token no localStorage (injetado pelo interceptor do Axios).
 * @returns {Promise<Object>} UserOut
 */
export async function getMe() {
  const response = await api.get('/users/me')
  return response.data
}
