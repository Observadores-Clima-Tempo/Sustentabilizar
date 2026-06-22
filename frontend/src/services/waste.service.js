import api from '../lib/axios'

/**
 * Cria um novo registro de resíduo.
 * @param {Object} data - { waste_type, weight_kg, volume_liters?, collection_frequency, collection_date, notes? }
 * @returns {Promise<Object>} WasteRecordOut
 */
export async function createRecord(data) {
  const response = await api.post('/waste-records/', data)
  return response.data
}

/**
 * Lista todos os registros de resíduos do usuário autenticado.
 * @returns {Promise<Array>} WasteRecordOut[]
 */
export async function listRecords() {
  const response = await api.get('/waste-records/')
  return response.data
}

/**
 * Busca um registro de resíduo específico pelo ID.
 * @param {string} recordId - UUID do registro
 * @returns {Promise<Object>} WasteRecordOut
 */
export async function getRecord(recordId) {
  const response = await api.get(`/waste-records/${recordId}`)
  return response.data
}
