import api from '../lib/axios'

/**
 * Faz upload de uma imagem como evidência de um registro de resíduo.
 * @param {File} file - Arquivo de imagem (JPEG ou PNG, máx. 10 MB)
 * @param {string} recordId - UUID do registro de resíduo
 * @returns {Promise<Object>} EvidenceOut
 */
export async function uploadEvidence(file, recordId) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post(`/evidence/upload?record_id=${recordId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}
