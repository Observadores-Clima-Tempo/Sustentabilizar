import api from '../lib/axios'

/**
 * Busca as perguntas ativas do checklist para o usuário autenticado.
 * @returns {Promise<Array>} ChecklistItemPublic[]
 */
export async function getChecklist() {
  const response = await api.get('/checklist')
  return response.data
}

/**
 * Envia todas as respostas do checklist de uma vez.
 * @param {Array} responses - [{ checklist_item_id, answer_value }]
 * @returns {Promise<Object>} { saved, score_from_checklist }
 */
export async function submitResponses(responses) {
  const response = await api.post('/checklist/responses', { responses })
  return response.data
}
