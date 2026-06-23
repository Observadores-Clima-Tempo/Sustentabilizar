import api from '../lib/axios'

/**
 * Busca a certificação atual do usuário autenticado.
 * Retorna nível, pontuação total, composição e critérios avaliados.
 * @returns {Promise<Object>} CertificationOut
 */
export async function getMyCertification() {
  const response = await api.get('/certification/me')
  return response.data
}
