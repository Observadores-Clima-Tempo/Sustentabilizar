import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { getMyCertification } from '../services/certification.service'
import { listRecords } from '../services/waste.service'

const LEVEL_INFO = {
  sem_nivel: { label: 'Sem certificação', icon: '🌱', textColor: 'text-gray-400', badgeBg: 'bg-gray-50', badgeBorder: 'border-gray-200' },
  bronze: { label: 'Bronze', icon: '🥉', textColor: 'text-orange-700', badgeBg: 'bg-orange-50', badgeBorder: 'border-orange-400' },
  prata: { label: 'Prata', icon: '🥈', textColor: 'text-slate-500', badgeBg: 'bg-slate-100', badgeBorder: 'border-slate-400' },
  ouro: { label: 'Ouro', icon: '🥇', textColor: 'text-amber-600', badgeBg: 'bg-amber-50', badgeBorder: 'border-amber-400' },
}

const LEVELS_ORDER = ['sem_nivel', 'bronze', 'prata', 'ouro']

const WASTE_TYPE_LABELS = {
  papel: 'Papel', plastico: 'Plástico', vidro: 'Vidro', metal: 'Metal',
  organico: 'Orgânico', eletronico: 'Eletrônico', perigoso: 'Perigoso', outro: 'Outro',
}
const WASTE_TYPE_ICONS = {
  papel: '📄', plastico: '🧴', vidro: '🫙', metal: '🔩',
  organico: '🌿', eletronico: '📱', perigoso: '⚠️', outro: '📦',
}

export default function DashboardPage() {
  const { user } = useAuth()

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const { data: cert } = useQuery({
    queryKey: ['certification', user?.id],
    queryFn: getMyCertification,
  })

  const { data: records = [] } = useQuery({
    queryKey: ['waste-records', user?.id],
    queryFn: listRecords,
  })

  const level = cert?.level || 'sem_nivel'
  const levelInfo = LEVEL_INFO[level] || LEVEL_INFO.sem_nivel
  const thresholds = cert?.thresholds || { bronze: 30, prata: 70, ouro: 120 }

  // Próximo nível
  const currentIdx = LEVELS_ORDER.indexOf(level)
  const nextLevel = LEVELS_ORDER[currentIdx + 1]
  const nextLevelMin = nextLevel ? thresholds[nextLevel] : null
  const pointsToNext = nextLevelMin ? Math.max(0, nextLevelMin - (cert?.total_score || 0)) : 0
  const progressPct = nextLevelMin
    ? Math.min(100, Math.round(((cert?.total_score || 0) / nextLevelMin) * 100))
    : 100

  // Estatísticas
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)
  const records30d = records.filter((r) => new Date(r.created_at) >= cutoff)
  const uniqueTypes = new Set(records.map((r) => r.waste_type)).size
  const recentRecords = [...records]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Saudação */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1 capitalize">{today}</p>
      </div>

      {/* Card de certificação */}
      <div className={`bg-white rounded-xl border-2 ${levelInfo.badgeBorder} shadow-sm p-6`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full border mb-3 ${levelInfo.badgeBg} ${levelInfo.badgeBorder} ${levelInfo.textColor}`}>
              {levelInfo.icon} {levelInfo.label}
            </div>
            <p className="text-4xl font-bold text-gray-900">{cert?.total_score ?? 0}</p>
            <p className="text-sm text-gray-400 mt-0.5">pontos totais</p>
          </div>
          <Link
            to="/certificado"
            className="flex-shrink-0 text-xs text-green-700 hover:text-green-800 font-medium hover:underline"
          >
            Ver certificado →
          </Link>
        </div>

        {/* Barra de progresso */}
        {nextLevel && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progresso para {LEVEL_INFO[nextLevel]?.label}</span>
              <span>{cert?.total_score ?? 0} / {nextLevelMin}</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {pointsToNext > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Faltam <strong className="text-gray-600">{pointsToNext} pontos</strong> para{' '}
                <span className={LEVEL_INFO[nextLevel]?.textColor}>{LEVEL_INFO[nextLevel]?.label}</span>
              </p>
            )}
          </div>
        )}

        {level === 'sem_nivel' && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-green-700">
              💡 Complete o{' '}
              <Link to="/checklist" className="font-semibold underline">
                diagnóstico inicial
              </Link>{' '}
              para começar a acumular pontos.
            </p>
          </div>
        )}
      </div>

      {/* 3 stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{records30d.length}</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-tight">Registros (30d)</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{records.length}</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-tight">Total de registros</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{uniqueTypes}</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-tight">Tipos de resíduo</p>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Ações rápidas</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/novo"
            className="flex-1 bg-green-700 hover:bg-green-800 text-white font-medium py-3 px-4 rounded-lg text-center text-sm transition-colors duration-200"
          >
            ➕ Novo registro
          </Link>
          <Link
            to="/certificado"
            className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg text-center text-sm border border-gray-300 transition-colors duration-200"
          >
            🏅 Ver certificado
          </Link>
        </div>
      </div>

      {/* Últimos registros */}
      {recentRecords.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Últimos registros</h2>
            <Link to="/registros" className="text-xs text-green-700 hover:underline font-medium">
              Ver todos →
            </Link>
          </div>
          <div className="space-y-3">
            {recentRecords.map((record) => (
              <Link
                key={record.id}
                to={`/registros/${record.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150"
              >
                <span className="text-xl flex-shrink-0">
                  {WASTE_TYPE_ICONS[record.waste_type] || '📦'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {WASTE_TYPE_LABELS[record.waste_type] || record.waste_type}
                  </p>
                  <p className="text-xs text-gray-400">
                    {parseFloat(record.weight_kg).toFixed(2)} kg ·{' '}
                    {new Date(record.collection_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {(record.evidences?.length || 0) > 0 ? (
                  <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 flex-shrink-0">
                    {record.evidences.length} evidência{record.evidences.length !== 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex-shrink-0">
                    Sem evidência
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {records.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-700">
            🌱 Nenhum registro ainda. Clique em{' '}
            <Link to="/novo" className="font-semibold underline">
              Novo registro
            </Link>{' '}
            para começar!
          </p>
        </div>
      )}
    </div>
  )
}
