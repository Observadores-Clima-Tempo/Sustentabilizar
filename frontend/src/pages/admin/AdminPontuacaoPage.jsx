import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getScoringConfig, updateScoringConfig } from '../../services/admin.service'

export default function AdminPontuacaoPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(null)
  const [saved, setSaved] = useState(false)
  const [serverError, setServerError] = useState('')

  const { isLoading, data } = useQuery({
    queryKey: ['admin', 'scoring-config'],
    queryFn: getScoringConfig,
  })

  useEffect(() => {
    if (data) {
      setForm({
        points_per_record_30d: data.points_per_record_30d,
        points_per_evidence: data.points_per_evidence,
        points_per_unique_type: data.points_per_unique_type,
      })
    }
  }, [data])

  const mutation = useMutation({
    mutationFn: updateScoringConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'scoring-config'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      setServerError('')
    },
    onError: (err) => {
      const detail = err?.response?.data?.detail
      setServerError(typeof detail === 'string' ? detail : 'Erro ao salvar configurações')
    },
  })

  function handleSubmit(e) {
    e.preventDefault()
    mutation.mutate(form)
  }

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: Math.max(0, Number(value)) }))
  }

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400 text-sm">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">⭐ Pontuação</h1>
        <p className="text-sm text-gray-500 mt-1">
          Parâmetros globais de pontuação por atividade
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campo 1 */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Pontos por registro (últimos 30 dias)
            </label>
            <p className="text-xs text-gray-400">
              Cada registro criado nos últimos 30 dias vale este número de pontos.
            </p>
            <input
              type="number"
              min="0"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={form.points_per_record_30d}
              onChange={(e) => handleChange('points_per_record_30d', e.target.value)}
            />
          </div>

          {/* Campo 2 */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Pontos extras por evidência
            </label>
            <p className="text-xs text-gray-400">
              Bônus por cada imagem de evidência vinculada a um registro.
            </p>
            <input
              type="number"
              min="0"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={form.points_per_evidence}
              onChange={(e) => handleChange('points_per_evidence', e.target.value)}
            />
          </div>

          {/* Campo 3 */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Pontos por tipo de resíduo distinto
            </label>
            <p className="text-xs text-gray-400">
              Bônus por diversidade — cada tipo diferente registrado nos últimos 30 dias.
            </p>
            <input
              type="number"
              min="0"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={form.points_per_unique_type}
              onChange={(e) => handleChange('points_per_unique_type', e.target.value)}
            />
          </div>

          {serverError && <p className="text-xs text-red-500">{serverError}</p>}

          {saved && (
            <p className="text-xs text-green-600 font-medium">✅ Configurações salvas com sucesso!</p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-3 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg text-sm transition-colors duration-150 disabled:bg-green-200"
          >
            {mutation.isPending ? 'Salvando...' : 'Salvar configurações'}
          </button>
        </form>
      </div>
    </div>
  )
}
