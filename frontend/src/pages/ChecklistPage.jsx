import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getChecklist, submitResponses } from '../services/checklist.service'

const LEVEL_LABELS = {
  sem_nivel: { label: 'Sem nível', icon: '🌱', color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200' },
  bronze: { label: 'Bronze', icon: '🥉', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-400' },
  prata: { label: 'Prata', icon: '🥈', color: 'text-slate-500', bg: 'bg-slate-100 border-slate-400' },
  ouro: { label: 'Ouro', icon: '🥇', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-400' },
}

function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div className="mb-8">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-500 font-medium">Pergunta {current} de {total}</span>
        <span className="text-green-700 font-semibold">{pct}% concluído</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-600 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function QuestionCard({ item, selected, onSelect }) {
  const typeLabels = {
    yes_no: 'SIM / NÃO',
    multiple_choice: 'MÚLTIPLA ESCOLHA',
    scale_1_5: 'ESCALA DE 1 A 5',
  }

  const options = Array.isArray(item.options) ? item.options : []

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      {/* Badge tipo + pontos */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full uppercase tracking-wide">
          {typeLabels[item.answer_type] || item.answer_type}
        </span>
        <span className="text-xs text-gray-400">
          Vale até <strong className="text-gray-600">{item.points_max} ponto{item.points_max !== 1 ? 's' : ''}</strong>
        </span>
      </div>

      {/* Texto da pergunta */}
      <h2 className="text-lg font-semibold text-gray-900 mb-6 leading-snug">
        {item.question_text}
      </h2>

      {/* Opções */}
      {item.answer_type === 'yes_no' && (
        <div className="grid grid-cols-2 gap-3">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className={`py-4 rounded-xl border-2 text-sm font-medium transition-all duration-150 ${
                selected === opt.value
                  ? 'border-green-600 bg-green-50 text-green-800'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50'
              }`}
            >
              {opt.value === 'sim' ? '✅' : '❌'} {opt.label}
            </button>
          ))}
        </div>
      )}

      {item.answer_type === 'multiple_choice' && (
        <div className="space-y-2">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className={`w-full text-left py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-150 ${
                selected === opt.value
                  ? 'border-green-600 bg-green-50 text-green-800'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {item.answer_type === 'scale_1_5' && (
        <div>
          <div className="grid grid-cols-5 gap-2 mb-2">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onSelect(opt.value)}
                className={`py-4 rounded-xl border-2 text-sm font-semibold transition-all duration-150 ${
                  selected === opt.value
                    ? 'border-green-600 bg-green-50 text-green-800'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                {opt.value}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
            <span>Muito baixo</span>
            <span>Muito alto</span>
          </div>
        </div>
      )}
    </div>
  )
}

function ResultScreen({ result, onGoToDashboard }) {
  const level = result?.level || 'sem_nivel'
  const levelInfo = LEVEL_LABELS[level] || LEVEL_LABELS.sem_nivel
  const score = result?.score_from_checklist || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-5xl mb-3">{levelInfo.icon}</div>
        <h1 className="text-2xl font-bold text-gray-900">Diagnóstico concluído!</h1>
        <p className="text-sm text-gray-500 mt-1">Veja seu resultado abaixo</p>
      </div>

      {/* Score card */}
      <div className={`border-2 rounded-xl p-6 text-center ${levelInfo.bg}`}>
        <p className="text-sm font-medium text-gray-500 mb-1">Pontuação obtida no diagnóstico</p>
        <p className="text-5xl font-bold text-gray-900 mb-2">{score}</p>
        <p className="text-sm text-gray-500">pontos</p>

        <div className="mt-4 inline-flex items-center gap-2">
          <span className={`text-lg font-semibold ${levelInfo.color}`}>
            {levelInfo.icon} {levelInfo.label}
          </span>
        </div>
      </div>

      {/* Próximos passos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Próximos passos</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold mt-0.5">✓</span>
            Registre seus resíduos regularmente para acumular mais pontos
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold mt-0.5">✓</span>
            Adicione evidências fotográficas a cada registro
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold mt-0.5">✓</span>
            Diversifique os tipos de resíduos descartados corretamente
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold mt-0.5">✓</span>
            Acompanhe seu certificado e evolua de nível
          </li>
        </ul>
      </div>

      <button
        onClick={onGoToDashboard}
        className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
      >
        🏠 Ir para o Dashboard →
      </button>
    </div>
  )
}

export default function ChecklistPage() {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({}) // { itemId: answerValue }
  const [submitResult, setSubmitResult] = useState(null)

  const queryClient = useQueryClient()

  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ['checklist'],
    queryFn: getChecklist,
  })

  const mutation = useMutation({
    mutationFn: submitResponses,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['certification'] })
      setSubmitResult(data)
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Carregando diagnóstico...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-500 text-sm">Erro ao carregar o diagnóstico. Tente novamente.</p>
      </div>
    )
  }

  if (submitResult !== null) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <ResultScreen
            result={submitResult}
            onGoToDashboard={() => navigate('/dashboard')}
          />
        </div>
      </div>
    )
  }

  const currentItem = items[currentIndex]
  const isFirst = currentIndex === 0
  const isLast = currentIndex === items.length - 1
  const selectedAnswer = currentItem ? answers[currentItem.id] : undefined
  const canProceed = !!selectedAnswer

  const handleSelect = (value) => {
    setAnswers((prev) => ({ ...prev, [currentItem.id]: value }))
  }

  const handleNext = () => {
    if (isLast) {
      // Submete todas as respostas
      const responses = Object.entries(answers).map(([checklist_item_id, answer_value]) => ({
        checklist_item_id,
        answer_value,
      }))
      mutation.mutate(responses)
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }

  const handleBack = () => {
    if (!isFirst) setCurrentIndex((i) => i - 1)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">Nenhuma pergunta disponível no momento.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-green-700 text-sm font-medium hover:underline"
          >
            Ir para o Dashboard →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-2xl">🌱</span>
            <span className="text-lg font-bold text-gray-900">Diagnóstico Ambiental</span>
          </div>
          <p className="text-sm text-gray-500">
            Responda as perguntas abaixo para obter sua certificação inicial
          </p>
        </div>

        {/* Barra de progresso */}
        <ProgressBar current={currentIndex + 1} total={items.length} />

        {/* Card da pergunta */}
        {currentItem && (
          <QuestionCard
            item={currentItem}
            selected={selectedAnswer}
            onSelect={handleSelect}
          />
        )}

        {/* Hint */}
        {!canProceed && (
          <p className="text-center text-xs text-gray-400 mt-3">
            Selecione uma opção para continuar
          </p>
        )}

        {/* Navegação */}
        <div className="flex gap-3 mt-4">
          {!isFirst && (
            <button
              onClick={handleBack}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-300 text-sm transition-colors duration-200"
            >
              ← Voltar
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed || mutation.isPending}
            className="flex-1 bg-green-700 hover:bg-green-800 text-white font-medium py-3 px-4 rounded-lg text-sm transition-colors duration-200 disabled:bg-green-200 disabled:cursor-not-allowed"
          >
            {mutation.isPending
              ? 'Enviando...'
              : isLast
              ? 'Concluir diagnóstico ✓'
              : 'Próxima →'}
          </button>
        </div>

        {mutation.isError && (
          <p className="text-center text-xs text-red-500 mt-3">
            Erro ao enviar respostas. Tente novamente.
          </p>
        )}
      </div>
    </div>
  )
}
