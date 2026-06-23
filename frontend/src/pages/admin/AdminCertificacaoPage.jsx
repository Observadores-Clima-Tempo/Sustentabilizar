import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getCertificationConfig, updateCertificationConfig } from '../../services/admin.service'

export default function AdminCertificacaoPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(null)
  const [saved, setSaved] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [serverError, setServerError] = useState('')

  const { data } = useQuery({
    queryKey: ['admin', 'certification-config'],
    queryFn: getCertificationConfig,
  })

  useEffect(() => {
    if (data) setForm({ bronze: data.bronze, prata: data.prata, ouro: data.ouro })
  }, [data])

  const mutation = useMutation({
    mutationFn: updateCertificationConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'certification-config'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      setServerError('')
    },
    onError: (err) => {
      const detail = err?.response?.data?.detail
      setServerError(typeof detail === 'string' ? detail : 'Erro ao salvar limiares')
    },
  })

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: Math.max(0, Number(value)) }))
    setValidationError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!(form.bronze < form.prata && form.prata < form.ouro)) {
      setValidationError('Os limiares devem ser crescentes: Bronze < Prata < Ouro')
      return
    }
    mutation.mutate(form)
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400 text-sm">Carregando...</p>
      </div>
    )
  }

  const levels = [
    {
      key: 'bronze',
      label: 'Bronze',
      emoji: '🥉',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-300',
      bgColor: 'bg-amber-50',
    },
    {
      key: 'prata',
      label: 'Prata',
      emoji: '🥈',
      textColor: 'text-gray-500',
      borderColor: 'border-gray-300',
      bgColor: 'bg-gray-50',
    },
    {
      key: 'ouro',
      label: 'Ouro',
      emoji: '🥇',
      textColor: 'text-yellow-600',
      borderColor: 'border-yellow-400',
      bgColor: 'bg-yellow-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🏆 Certificação</h1>
        <p className="text-sm text-gray-500 mt-1">
          Defina a pontuação mínima para cada nível de certificação
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {levels.map((level) => (
            <div key={level.key} className={`flex items-center gap-4 p-4 rounded-xl border-2 ${level.borderColor} ${level.bgColor}`}>
              <div className="flex items-center gap-2 w-28 flex-shrink-0">
                <span className="text-2xl">{level.emoji}</span>
                <span className={`font-semibold text-base ${level.textColor}`}>{level.label}</span>
              </div>
              <div className="flex-1 space-y-0.5">
                <label className="block text-xs font-medium text-gray-500">
                  Pontuação mínima
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    className="w-28 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={form[level.key]}
                    onChange={(e) => handleChange(level.key, e.target.value)}
                  />
                  <span className="text-xs text-gray-400">pontos</span>
                </div>
              </div>
            </div>
          ))}

          {validationError && (
            <p className="text-xs text-red-500">{validationError}</p>
          )}
          {serverError && <p className="text-xs text-red-500">{serverError}</p>}
          {saved && (
            <p className="text-xs text-green-600 font-medium">✅ Limiares salvos com sucesso!</p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-3 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg text-sm transition-colors duration-150 disabled:bg-green-200"
          >
            {mutation.isPending ? 'Salvando...' : 'Salvar limiares'}
          </button>
        </form>
      </div>
    </div>
  )
}
