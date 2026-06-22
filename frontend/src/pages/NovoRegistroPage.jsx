import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { createRecord } from '../services/waste.service'

const WASTE_TYPES = [
  { value: 'papel', label: 'Papel', icon: '📄' },
  { value: 'plastico', label: 'Plástico', icon: '🧴' },
  { value: 'vidro', label: 'Vidro', icon: '🫙' },
  { value: 'metal', label: 'Metal', icon: '🔩' },
  { value: 'organico', label: 'Orgânico', icon: '🥬' },
  { value: 'eletronico', label: 'Eletrônico', icon: '📱' },
  { value: 'perigoso', label: 'Perigoso', icon: '⚠️' },
  { value: 'outro', label: 'Outro', icon: '📦' },
]

const FREQUENCIES = [
  { value: 'diaria', label: 'Diária' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'quinzenal', label: 'Quinzenal' },
  { value: 'mensal', label: 'Mensal' },
  { value: 'esporadica', label: 'Esporádica' },
]

export default function NovoRegistroPage() {
  const navigate = useNavigate()

  const [wasteType, setWasteType] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [volumeLiters, setVolumeLiters] = useState('')
  const [frequency, setFrequency] = useState('')
  const [collectionDate, setCollectionDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState({})

  const mutation = useMutation({
    mutationFn: createRecord,
    onSuccess: (data) => {
      navigate(`/evidencia/${data.id}`)
    },
  })

  function validate() {
    const newErrors = {}
    if (!wasteType) newErrors.wasteType = 'Selecione um tipo de resíduo'
    if (!weightKg || parseFloat(weightKg) <= 0) newErrors.weightKg = 'Informe um peso válido (> 0)'
    if (!frequency) newErrors.frequency = 'Selecione a frequência de coleta'
    if (!collectionDate) newErrors.collectionDate = 'Informe a data de coleta'
    return newErrors
  }

  function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})

    mutation.mutate({
      waste_type: wasteType,
      weight_kg: parseFloat(weightKg),
      volume_liters: volumeLiters ? parseFloat(volumeLiters) : null,
      collection_frequency: frequency,
      collection_date: collectionDate,
      notes: notes || null,
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Novo registro</h1>
        <p className="text-sm text-gray-500 mt-1">Registre o resíduo que você gerou ou descartou.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de resíduo */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de resíduo <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-4 gap-3">
            {WASTE_TYPES.map(({ value, label, icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setWasteType(value)}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border text-xs font-medium transition-all duration-150 ${
                  wasteType === value
                    ? 'border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{icon}</span>
                {label}
              </button>
            ))}
          </div>
          {errors.wasteType && (
            <p className="mt-2 text-xs text-red-500">{errors.wasteType}</p>
          )}
        </div>

        {/* Peso e Volume */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Peso (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0.001"
                step="0.001"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="Ex: 2.5"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow duration-150"
              />
              {errors.weightKg && (
                <p className="text-xs text-red-500">{errors.weightKg}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Volume (dm³) <span className="text-gray-400 font-normal">— opcional</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={volumeLiters}
                onChange={(e) => setVolumeLiters(e.target.value)}
                placeholder="Ex: 10"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow duration-150"
              />
            </div>
          </div>
        </div>

        {/* Frequência e Data */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Frequência <span className="text-red-500">*</span>
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow duration-150"
              >
                <option value="">Selecione...</option>
                {FREQUENCIES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.frequency && (
                <p className="text-xs text-red-500">{errors.frequency}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Data de coleta <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={collectionDate}
                onChange={(e) => setCollectionDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow duration-150"
              />
              {errors.collectionDate && (
                <p className="text-xs text-red-500">{errors.collectionDate}</p>
              )}
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Observações <span className="text-gray-400 font-normal">— opcional</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Descreva o resíduo, condições de descarte, ponto de coleta, etc."
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow duration-150"
            />
          </div>
        </div>

        {/* Erro da mutação */}
        {mutation.isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <p className="text-sm text-red-600">
              {mutation.error?.response?.data?.detail || 'Erro ao salvar registro. Tente novamente.'}
            </p>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/registros')}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-300 text-sm transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex-1 bg-green-700 hover:bg-green-800 text-white font-medium py-3 px-4 rounded-lg text-sm transition-colors duration-200 disabled:bg-green-200 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? 'Salvando...' : 'Salvar e adicionar evidência →'}
          </button>
        </div>
      </form>
    </div>
  )
}
