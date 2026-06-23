import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { getRecord } from '../services/waste.service'

const WASTE_LABELS = {
  papel: { label: 'Papel', icon: '📄' },
  plastico: { label: 'Plástico', icon: '🧴' },
  vidro: { label: 'Vidro', icon: '🫙' },
  metal: { label: 'Metal', icon: '🔩' },
  organico: { label: 'Orgânico', icon: '🥬' },
  eletronico: { label: 'Eletrônico', icon: '📱' },
  perigoso: { label: 'Perigoso', icon: '⚠️' },
  outro: { label: 'Outro', icon: '📦' },
}

const FREQUENCY_LABELS = {
  diaria: 'Diária',
  semanal: 'Semanal',
  quinzenal: 'Quinzenal',
  mensal: 'Mensal',
  esporadica: 'Esporádica',
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function formatDateTime(isoStr) {
  if (!isoStr) return '—'
  return new Date(isoStr).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function RegistroDetalhe() {
  const { id } = useParams()
  const { user } = useAuth()

  const { data: record, isLoading, isError } = useQuery({
    queryKey: ['waste-record', user?.id, id],
    queryFn: () => getRecord(id),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-gray-500">Carregando registro...</p>
      </div>
    )
  }

  if (isError || !record) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-sm text-red-600">Registro não encontrado ou erro ao carregar.</p>
        <Link to="/registros" className="mt-3 inline-block text-sm text-green-700 hover:underline">
          ← Voltar para registros
        </Link>
      </div>
    )
  }

  const typeInfo = WASTE_LABELS[record.waste_type] || { label: record.waste_type, icon: '📦' }
  const evidences = record.evidences ?? []

  const details = [
    { label: 'Tipo de resíduo', value: `${typeInfo.icon} ${typeInfo.label}` },
    { label: 'Peso', value: `${parseFloat(record.weight_kg).toFixed(3)} kg` },
    {
      label: 'Volume',
      value: record.volume_liters ? `${parseFloat(record.volume_liters).toFixed(2)} dm³` : '—',
    },
    { label: 'Frequência de coleta', value: FREQUENCY_LABELS[record.collection_frequency] || record.collection_frequency },
    { label: 'Data de coleta', value: formatDate(record.collection_date) },
    { label: 'Registrado em', value: formatDateTime(record.created_at) },
    { label: 'Observações', value: record.notes || '—' },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Link
        to="/registros"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 hover:underline underline-offset-2"
      >
        ← Voltar para registros
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
            {typeInfo.icon}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{typeInfo.label}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{formatDate(record.collection_date)}</p>
          </div>
        </div>
      </div>

      {/* Detalhes do registro */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Detalhes do registro</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          {details.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
              <dd className="mt-1 text-sm text-gray-900">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Evidências */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            Evidências ({evidences.length})
          </h2>
          <Link
            to={`/evidencia/${record.id}`}
            className="text-sm text-green-700 hover:text-green-800 font-medium hover:underline underline-offset-2"
          >
            + Adicionar
          </Link>
        </div>

        {evidences.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-2xl mb-2">📎</p>
            <p className="text-sm text-gray-500">Nenhuma evidência anexada.</p>
            <Link
              to={`/evidencia/${record.id}`}
              className="mt-3 inline-block bg-green-700 hover:bg-green-800 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors duration-200"
            >
              Adicionar evidência
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {evidences.map((ev) => (
              <div key={ev.id} className="group">
                <a
                  href={`http://localhost:8000${ev.file_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={`http://localhost:8000${ev.file_url}`}
                    alt={ev.file_name}
                    className="w-full h-28 object-cover rounded-lg border border-gray-200 group-hover:opacity-90 transition-opacity"
                  />
                </a>
                <p className="mt-1 text-xs text-gray-600 truncate">{ev.file_name}</p>
                <p className="text-xs text-gray-400">{formatDateTime(ev.captured_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
