import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getWasteScoring, updateWasteScoring } from '../../services/admin.service'

const WASTE_TYPE_LABELS = {
  papel:      { label: 'Papel',       emoji: '📄' },
  plastico:   { label: 'Plástico',    emoji: '♻️' },
  vidro:      { label: 'Vidro',       emoji: '🫙' },
  metal:      { label: 'Metal',       emoji: '🔩' },
  organico:   { label: 'Orgânico',    emoji: '🌿' },
  eletronico: { label: 'Eletrônico',  emoji: '💻' },
  perigoso:   { label: 'Perigoso',    emoji: '⚠️' },
  outro:      { label: 'Outro',       emoji: '📦' },
}

export default function AdminResiduosPage() {
  const queryClient = useQueryClient()
  const [rows, setRows] = useState([])
  const [saved, setSaved] = useState(false)
  const [serverError, setServerError] = useState('')

  const { isLoading, data: wasteData } = useQuery({
    queryKey: ['admin', 'waste-scoring'],
    queryFn: getWasteScoring,
  })

  useEffect(() => {
    if (wasteData) setRows(wasteData.map((d) => ({ ...d })))
  }, [wasteData])

  const mutation = useMutation({
    mutationFn: (items) => updateWasteScoring(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'waste-scoring'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      setServerError('')
    },
    onError: (err) => {
      const detail = err?.response?.data?.detail
      setServerError(typeof detail === 'string' ? detail : 'Erro ao salvar')
    },
  })

  function handleChange(wasteType, value) {
    setRows((prev) =>
      prev.map((r) =>
        r.waste_type === wasteType
          ? { ...r, points_per_kg: Math.max(0, Number(value)) }
          : r
      )
    )
  }

  function handleSubmit(e) {
    e.preventDefault()
    mutation.mutate(
      rows.map((r) => ({ waste_type: r.waste_type, points_per_kg: r.points_per_kg }))
    )
  }

  if (isLoading || rows.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400 text-sm">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">♻️ Resíduos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure a pontuação por quilograma para cada tipo de resíduo
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit}>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Tipo
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Pts / kg
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => {
                const meta = WASTE_TYPE_LABELS[row.waste_type] || { label: row.waste_type, emoji: '📦' }
                return (
                  <tr key={row.waste_type} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{meta.emoji}</span>
                        <span className="font-medium text-gray-900">{meta.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 justify-end">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          className="w-24 px-2.5 py-1.5 rounded-lg border border-gray-300 text-sm text-right focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          value={row.points_per_kg}
                          onChange={(e) => handleChange(row.waste_type, e.target.value)}
                        />
                        <span className="text-xs text-gray-400">pts</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="px-4 py-4 border-t border-gray-100">
            {serverError && <p className="text-xs text-red-500 mb-3">{serverError}</p>}
            {saved && (
              <p className="text-xs text-green-600 font-medium mb-3">
                ✅ Pontuações salvas com sucesso!
              </p>
            )}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full py-2.5 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg text-sm transition-colors duration-150 disabled:bg-green-200"
            >
              {mutation.isPending ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
