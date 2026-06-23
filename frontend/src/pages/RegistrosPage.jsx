import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { listRecords } from '../services/waste.service'

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

const FILTER_TABS = [
  { value: 'todos', label: 'Todos', icon: '🗂️' },
  ...Object.entries(WASTE_LABELS).map(([value, { label, icon }]) => ({ value, label, icon })),
]

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function RegistrosPage() {
  const [activeFilter, setActiveFilter] = useState('todos')
  const { user } = useAuth()

  const { data: records = [], isLoading, isError } = useQuery({
    queryKey: ['waste-records', user?.id],
    queryFn: listRecords,
  })

  const filtered =
    activeFilter === 'todos'
      ? records
      : records.filter((r) => r.waste_type === activeFilter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus registros</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {records.length} {records.length === 1 ? 'registro' : 'registros'} no total
          </p>
        </div>
        <Link
          to="/novo"
          className="bg-green-700 hover:bg-green-800 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors duration-200"
        >
          ➕ Novo
        </Link>
      </div>

      {/* Cápsulas de filtro */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILTER_TABS.map(({ value, label, icon }) => (
          <button
            key={value}
            onClick={() => setActiveFilter(value)}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
              activeFilter === value
                ? 'bg-green-700 border-green-700 text-white shadow-sm'
                : 'bg-white border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700'
            }`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Estado de carregamento */}
      {isLoading && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-sm text-gray-500">Carregando registros...</p>
        </div>
      )}

      {/* Erro */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-600">Erro ao carregar registros. Tente novamente.</p>
        </div>
      )}

      {/* Lista vazia */}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-2xl mb-2">📭</p>
          <p className="text-sm font-medium text-gray-700">Nenhum registro encontrado</p>
          <p className="text-xs text-gray-500 mt-1">
            {activeFilter === 'todos'
              ? 'Comece registrando seu primeiro resíduo.'
              : `Nenhum registro do tipo "${WASTE_LABELS[activeFilter]?.label}".`}
          </p>
          <Link
            to="/novo"
            className="mt-4 inline-block bg-green-700 hover:bg-green-800 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors duration-200"
          >
            Criar primeiro registro
          </Link>
        </div>
      )}

      {/* Cards de registros */}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((record) => {
            const typeInfo = WASTE_LABELS[record.waste_type] || { label: record.waste_type, icon: '📦' }
            const evidenceCount = record.evidences?.length ?? 0

            return (
              <Link
                key={record.id}
                to={`/registros/${record.id}`}
                className="block bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md hover:border-gray-300 transition-all duration-150"
              >
                <div className="flex items-start gap-4">
                  {/* Ícone do tipo */}
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                    {typeInfo.icon}
                  </div>

                  {/* Informações principais */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {typeInfo.label}
                      </span>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatDate(record.collection_date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-600">
                        ⚖️ {parseFloat(record.weight_kg).toFixed(3)} kg
                      </span>
                      {record.volume_liters && (
                        <span className="text-xs text-gray-600">
                          📦 {parseFloat(record.volume_liters).toFixed(2)} dm³
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      {evidenceCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                          ✅ {evidenceCount} {evidenceCount === 1 ? 'evidência' : 'evidências'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-xs font-medium">
                          ⚠️ Sem evidência
                        </span>
                      )}
                    </div>

                    {record.notes && (
                      <p className="text-xs text-gray-500 mt-2 truncate">{record.notes}</p>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
