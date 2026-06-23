import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { getMyCertification } from '../services/certification.service'

const LEVEL_INFO = {
  sem_nivel: {
    label: 'Sem certificação',
    icon: '🌱',
    textColor: 'text-gray-500',
    badgeBg: 'bg-gray-50',
    badgeBorder: 'border-gray-200',
    cardBorder: 'border-gray-200',
    motivational: 'Complete o diagnóstico e registre seus resíduos para obter sua certificação!',
  },
  bronze: {
    label: 'Bronze',
    icon: '🥉',
    textColor: 'text-amber-700',
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-300',
    cardBorder: 'border-amber-300',
    motivational: 'Ótimo começo! Continue registrando para evoluir para o nível Prata.',
  },
  prata: {
    label: 'Prata',
    icon: '🥈',
    textColor: 'text-gray-500',
    badgeBg: 'bg-gray-100',
    badgeBorder: 'border-gray-300',
    cardBorder: 'border-gray-300',
    motivational: 'Excelente! Você está no caminho certo. O nível Ouro está próximo!',
  },
  ouro: {
    label: 'Ouro',
    icon: '🥇',
    textColor: 'text-yellow-600',
    badgeBg: 'bg-yellow-50',
    badgeBorder: 'border-yellow-400',
    cardBorder: 'border-yellow-400',
    motivational: 'Parabéns! Você alcançou o nível máximo de certificação ambiental!',
  },
}

const LEVELS_ORDER = ['sem_nivel', 'bronze', 'prata', 'ouro']

function LevelMedal({ level, currentLevel, score, minScore }) {
  const info = LEVEL_INFO[level]
  const isCurrent = level === currentLevel
  const isAchieved = LEVELS_ORDER.indexOf(currentLevel) >= LEVELS_ORDER.indexOf(level) && level !== 'sem_nivel'

  if (level === 'sem_nivel') return null

  return (
    <div
      className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
        isCurrent
          ? `${info.badgeBg} ${info.badgeBorder} shadow-sm`
          : isAchieved
          ? `${info.badgeBg} ${info.badgeBorder} opacity-80`
          : 'bg-gray-50 border-gray-200 opacity-50'
      }`}
    >
      <span className="text-3xl mb-1">{info.icon}</span>
      <span className={`text-sm font-semibold ${isAchieved ? info.textColor : 'text-gray-400'}`}>
        {info.label}
      </span>
      <span className="text-xs text-gray-400 mt-0.5">≥ {minScore} pts</span>
      {isCurrent && (
        <span className="mt-2 text-xs font-semibold text-white bg-green-600 px-2 py-0.5 rounded-full">
          Atual
        </span>
      )}
    </div>
  )
}

export default function CertificadoPage() {
  const { user } = useAuth()

  const { data: cert, isLoading, isError } = useQuery({
    queryKey: ['certification', user?.id],
    queryFn: getMyCertification,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-gray-400 text-sm">Carregando certificado...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-red-500 text-sm">Erro ao carregar certificação. Tente novamente.</p>
      </div>
    )
  }

  const level = cert?.level || 'sem_nivel'
  const info = LEVEL_INFO[level] || LEVEL_INFO.sem_nivel
  const thresholds = cert?.thresholds || { bronze: 30, prata: 70, ouro: 120 }

  // Calcula progresso para o próximo nível
  const currentIdx = LEVELS_ORDER.indexOf(level)
  const nextLevel = LEVELS_ORDER[currentIdx + 1]
  const nextLevelInfo = nextLevel ? LEVEL_INFO[nextLevel] : null
  const nextLevelMin = nextLevel ? thresholds[nextLevel] : null
  const pointsToNext = nextLevelMin ? Math.max(0, nextLevelMin - (cert?.total_score || 0)) : 0
  const progressPct = nextLevelMin
    ? Math.min(100, Math.round(((cert?.total_score || 0) / nextLevelMin) * 100))
    : 100

  const emittedDate = cert?.valid_from
    ? new Date(cert.valid_from).toLocaleDateString('pt-BR')
    : new Date().toLocaleDateString('pt-BR')

  const maskedCpf = user?.cpf
    ? user.cpf.replace(/(\d{3})\.\d{3}\.(\d{3})-(\d{2})/, '$1.***.**$2-$3')
    : '—'

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meu Certificado</h1>
        <p className="text-sm text-gray-500 mt-1">
          Certificação baseada nas suas práticas ambientais registradas
        </p>
      </div>

      {/* Card principal do certificado */}
      <div className={`bg-white rounded-xl border-2 ${info.cardBorder} shadow-sm p-6`}>
        <div className="text-center">
          {/* Badge CERTIFICADO AMBIENTAL */}
          <span className="inline-block text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-4 py-1 rounded-full uppercase tracking-widest mb-4">
            Certificado Ambiental
          </span>

          {/* Ícone + nível */}
          <div className="text-6xl mb-2">{info.icon}</div>
          <h2 className={`text-3xl font-bold ${info.textColor} mb-1`}>{info.label}</h2>
          <p className="text-4xl font-bold text-gray-900 mb-1">{cert?.total_score || 0}</p>
          <p className="text-sm text-gray-400 mb-4">pontos totais</p>

          {/* Dados do usuário */}
          <div className="border-t border-gray-100 pt-4 text-sm text-gray-600 space-y-1">
            <p className="font-semibold text-gray-900 text-base">{user?.name}</p>
            <p className="text-gray-400">CPF: {maskedCpf}</p>
            <p className="text-gray-400">Emitido em: {emittedDate}</p>
          </div>

          {/* Mensagem motivacional */}
          <p className="mt-4 text-sm text-gray-500 italic">{info.motivational}</p>
        </div>
      </div>

      {/* Progressão de níveis */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Progressão de níveis</h2>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <LevelMedal level="bronze" currentLevel={level} score={cert?.total_score || 0} minScore={thresholds.bronze} />
          <LevelMedal level="prata" currentLevel={level} score={cert?.total_score || 0} minScore={thresholds.prata} />
          <LevelMedal level="ouro" currentLevel={level} score={cert?.total_score || 0} minScore={thresholds.ouro} />
        </div>

        {nextLevel && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progresso para {nextLevelInfo?.label}</span>
              <span>{cert?.total_score || 0} / {nextLevelMin} pts</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {pointsToNext > 0 && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Faltam <strong className="text-gray-700">{pointsToNext} pontos</strong> para o nível{' '}
                <strong className={nextLevelInfo?.textColor}>{nextLevelInfo?.label}</strong>
              </p>
            )}
          </div>
        )}

        {!nextLevel && level === 'ouro' && (
          <p className="text-xs text-center text-yellow-600 font-medium mt-2">
            🏆 Você atingiu o nível máximo!
          </p>
        )}
      </div>

      {/* Detalhamento da pontuação */}
      {cert?.criteria && cert.criteria.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Detalhamento da pontuação</h2>
          <p className="text-xs text-gray-400 mb-4">De onde vieram os seus pontos</p>
          <div className="space-y-2">
            {cert.criteria.map((c, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${
                  c.points_earned > 0 ? 'bg-green-50' : 'bg-gray-50'
                }`}
              >
                <span className="text-lg flex-shrink-0">{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${c.points_earned > 0 ? 'text-gray-800' : 'text-gray-400'}`}>
                    {c.label}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{c.description}</p>
                </div>
                <span
                  className={`text-sm font-bold flex-shrink-0 ${
                    c.points_earned > 0 ? 'text-green-700' : 'text-gray-300'
                  }`}
                >
                  {c.points_earned > 0 ? `+${c.points_earned}` : '0'} pts
                </span>
              </div>
            ))}

            {/* Linha total */}
            <div className="flex items-center justify-between px-3 py-3 border-t-2 border-gray-200 mt-2">
              <span className="text-sm font-bold text-gray-900">Total</span>
              <span className="text-lg font-bold text-green-700">{cert.total_score} pts</span>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <Link
        to="/novo"
        className="block w-full bg-green-700 hover:bg-green-800 text-white font-medium py-3 px-4 rounded-lg text-center text-sm transition-colors duration-200"
      >
        ➕ Adicionar mais registros para evoluir
      </Link>
    </div>
  )
}
