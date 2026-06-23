import api from '../lib/axios'

// ─── Checklist ───────────────────────────────────────────────────

export async function listChecklistItems() {
  const { data } = await api.get('/admin/checklist')
  return data
}

export async function createChecklistItem(payload) {
  const { data } = await api.post('/admin/checklist', payload)
  return data
}

export async function updateChecklistItem(id, payload) {
  const { data } = await api.put(`/admin/checklist/${id}`, payload)
  return data
}

export async function deleteChecklistItem(id) {
  await api.delete(`/admin/checklist/${id}`)
}

// ─── Scoring Config ──────────────────────────────────────────────

export async function getScoringConfig() {
  const { data } = await api.get('/admin/scoring-config')
  return data
}

export async function updateScoringConfig(payload) {
  const { data } = await api.put('/admin/scoring-config', payload)
  return data
}

// ─── Certification Config ────────────────────────────────────────

export async function getCertificationConfig() {
  const { data } = await api.get('/admin/certification-config')
  return data
}

export async function updateCertificationConfig(payload) {
  const { data } = await api.put('/admin/certification-config', payload)
  return data
}

// ─── Waste Scoring ───────────────────────────────────────────────

export async function getWasteScoring() {
  const { data } = await api.get('/admin/waste-scoring')
  return data
}

export async function updateWasteScoring(items) {
  const { data } = await api.put('/admin/waste-scoring', { items })
  return data
}
