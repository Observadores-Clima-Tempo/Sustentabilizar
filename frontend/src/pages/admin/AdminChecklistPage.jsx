import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createChecklistItem,
  deleteChecklistItem,
  listChecklistItems,
  updateChecklistItem,
} from '../../services/admin.service'

const ANSWER_TYPE_LABELS = {
  yes_no: 'Sim/Não',
  multiple_choice: 'Múltipla escolha',
  scale_1_5: 'Escala 1–5',
}

const DEFAULT_YES_NO_OPTIONS = [
  { value: 'sim', label: 'Sim', points: 10 },
  { value: 'nao', label: 'Não', points: 0 },
]

const DEFAULT_SCALE_OPTIONS = [
  { value: '1', label: '1 — Muito baixo', points: 0 },
  { value: '2', label: '2', points: 3 },
  { value: '3', label: '3', points: 5 },
  { value: '4', label: '4', points: 8 },
  { value: '5', label: '5 — Muito alto', points: 10 },
]

function emptyForm() {
  return {
    question_text: '',
    answer_type: 'yes_no',
    options: DEFAULT_YES_NO_OPTIONS,
    order: 0,
    is_active: true,
    profile_type: 'pessoa_fisica',
  }
}

export default function AdminChecklistPage() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [serverError, setServerError] = useState('')

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['admin', 'checklist'],
    queryFn: listChecklistItems,
  })

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editingItem
        ? updateChecklistItem(editingItem.id, payload)
        : createChecklistItem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'checklist'] })
      closeModal()
    },
    onError: (err) => {
      const detail = err?.response?.data?.detail
      setServerError(typeof detail === 'string' ? detail : 'Erro ao salvar')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteChecklistItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'checklist'] })
      setDeleteConfirm(null)
    },
  })

  function openCreate() {
    setEditingItem(null)
    setForm(emptyForm())
    setServerError('')
    setShowModal(true)
  }

  function openEdit(item) {
    setEditingItem(item)
    setForm({
      question_text: item.question_text,
      answer_type: item.answer_type,
      options: Array.isArray(item.options) ? item.options : [],
      order: item.order,
      is_active: item.is_active,
      profile_type: item.profile_type,
    })
    setServerError('')
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingItem(null)
    setServerError('')
  }

  function handleAnswerTypeChange(type) {
    let options = form.options
    if (type === 'yes_no') options = DEFAULT_YES_NO_OPTIONS
    if (type === 'scale_1_5') options = DEFAULT_SCALE_OPTIONS
    if (type === 'multiple_choice') options = [{ value: '', label: '', points: 0 }]
    setForm((f) => ({ ...f, answer_type: type, options }))
  }

  function updateOption(idx, field, value) {
    setForm((f) => {
      const opts = [...f.options]
      opts[idx] = { ...opts[idx], [field]: field === 'points' ? Number(value) : value }
      return { ...f, options: opts }
    })
  }

  function addOption() {
    setForm((f) => ({
      ...f,
      options: [...f.options, { value: '', label: '', points: 0 }],
    }))
  }

  function removeOption(idx) {
    setForm((f) => ({
      ...f,
      options: f.options.filter((_, i) => i !== idx),
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    saveMutation.mutate(form)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📋 Diagnóstico</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie as perguntas do checklist inicial
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-green-700 hover:bg-green-800 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors duration-150"
        >
          + Nova pergunta
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Carregando...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            Nenhuma pergunta cadastrada.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Ord.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Pergunta</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Pts máx</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{item.order}</td>
                  <td className="px-4 py-3 text-gray-900 max-w-xs">
                    <p className="truncate">{item.question_text}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {ANSWER_TYPE_LABELS[item.answer_type] || item.answer_type}
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-medium">{item.points_max}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.is_active
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {item.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openEdit(item)}
                        className="text-xs text-green-700 hover:text-green-900 font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(item)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        Desativar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal criar/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingItem ? 'Editar pergunta' : 'Nova pergunta'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Texto */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Texto da pergunta
                </label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={form.question_text}
                  onChange={(e) => setForm((f) => ({ ...f, question_text: e.target.value }))}
                  required
                />
              </div>

              {/* Tipo de resposta */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de resposta
                </label>
                <select
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={form.answer_type}
                  onChange={(e) => handleAnswerTypeChange(e.target.value)}
                >
                  <option value="yes_no">Sim/Não</option>
                  <option value="multiple_choice">Múltipla escolha</option>
                  <option value="scale_1_5">Escala 1–5</option>
                </select>
              </div>

              {/* Opções */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Alternativas
                  </label>
                  {form.answer_type === 'multiple_choice' && (
                    <button
                      type="button"
                      onClick={addOption}
                      className="text-xs text-green-700 font-medium hover:text-green-900"
                    >
                      + Adicionar
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {form.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                        placeholder="Label"
                        value={opt.label}
                        onChange={(e) => updateOption(idx, 'label', e.target.value)}
                        disabled={form.answer_type !== 'multiple_choice'}
                      />
                      <input
                        type="number"
                        min="0"
                        className="w-20 px-2.5 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                        placeholder="Pts"
                        value={opt.points}
                        onChange={(e) => updateOption(idx, 'points', e.target.value)}
                      />
                      {form.answer_type === 'multiple_choice' && form.options.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOption(idx)}
                          className="text-red-400 hover:text-red-600 text-lg leading-none"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Ordem + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Ordem</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={form.order}
                    onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={form.is_active ? 'true' : 'false'}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, is_active: e.target.value === 'true' }))
                    }
                  >
                    <option value="true">Ativa</option>
                    <option value="false">Inativa</option>
                  </select>
                </div>
              </div>

              {serverError && (
                <p className="text-xs text-red-500">{serverError}</p>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex-1 py-2.5 rounded-lg bg-green-700 hover:bg-green-800 text-white text-sm font-medium transition-colors disabled:bg-green-200"
                >
                  {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmação de desativação */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Desativar pergunta?</h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{deleteConfirm.question_text}</p>
            <p className="text-xs text-gray-400 mb-6">A pergunta não será excluída, apenas desativada.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm.id)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
              >
                {deleteMutation.isPending ? 'Desativando...' : 'Desativar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
