import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../lib/axios'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

const HOW_IT_WORKS = [
  {
    step: 1,
    icon: '📝',
    title: 'Crie sua conta',
    description:
      'Cadastre-se gratuitamente com seu CPF, cidade e dados pessoais em menos de 2 minutos.',
  },
  {
    step: 2,
    icon: '✅',
    title: 'Responda o diagnóstico',
    description:
      'Responda perguntas sobre seus hábitos atuais de reciclagem para conhecer seu ponto de partida.',
  },
  {
    step: 3,
    icon: '♻️',
    title: 'Registre seus resíduos',
    description:
      'Registre o tipo, peso e data de descarte dos seus resíduos. Adicione fotos como evidência.',
  },
  {
    step: 4,
    icon: '🏆',
    title: 'Conquiste a certificação',
    description:
      'Com base nos seus registros, você recebe uma certificação Bronze, Prata ou Ouro que comprova seu compromisso ambiental.',
  },
]

const CERTIFICATION_LEVELS_META = [
  {
    key: 'bronze',
    level: 'Bronze',
    icon: '🥉',
    borderClass: 'border-orange-400',
    iconBgClass: 'bg-orange-50',
    textColorClass: 'text-orange-700',
    criteria: [
      'Separação básica de recicláveis',
      'Pelo menos 3 registros mensais',
    ],
  },
  {
    key: 'prata',
    level: 'Prata',
    icon: '🥈',
    borderClass: 'border-gray-300',
    iconBgClass: 'bg-gray-100',
    textColorClass: 'text-gray-500',
    criteria: [
      'Separação consistente de recicláveis',
      'Pelo menos 8 registros mensais',
      'Evidências fotográficas comprovadas',
    ],
  },
  {
    key: 'ouro',
    level: 'Ouro',
    icon: '🥇',
    borderClass: 'border-amber-400',
    iconBgClass: 'bg-amber-50',
    textColorClass: 'text-amber-600',
    criteria: [
      'Descarte responsável de todos os tipos',
      'Frequência regular de registros',
      'Histórico comprovado de 3+ meses',
    ],
  },
]

const DEFAULT_THRESHOLDS = { bronze: 30, prata: 70, ouro: 120 }

export default function LandingPage() {
  const { data: publicConfig } = useQuery({
    queryKey: ['config', 'public'],
    queryFn: async () => {
      const { data } = await api.get('/config/public')
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 min
    retry: false,
  })

  const thresholds = publicConfig?.certification_thresholds ?? DEFAULT_THRESHOLDS

  const certificationLevels = CERTIFICATION_LEVELS_META.map((level) => ({
    ...level,
    minPoints: thresholds[level.key],
  }))
  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">♻️</span>
            <span className="text-xl font-bold text-green-700">Sustentabilizar</span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="md">
                Entrar
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="md">
                Começar
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="bg-green-50 py-24 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-sm font-medium px-4 py-2 rounded-full">
            <span aria-hidden="true">🌱</span>
            <span>Certificação ambiental gratuita para cidadãos</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Prove seu compromisso com o{' '}
            <span className="text-green-700">meio ambiente</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
            Registre seus resíduos recicláveis, acompanhe seu progresso e conquiste uma
            certificação que comprova sua responsabilidade ambiental.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/register">
              <Button variant="primary" size="lg" className="w-full sm:w-auto px-8">
                Criar minha conta grátis
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8">
                Já tenho conta
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-400">
            Gratuito para sempre · Sem cartão de crédito
          </p>
        </div>
      </section>

      {/* ── Como funciona ──────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-14">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-gray-900">Como funciona</h2>
            <p className="text-gray-500 text-lg">
              Quatro passos simples para a sua certificação
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-3xl">
                  {item.icon}
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-green-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {item.step}
                  </span>
                  <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Níveis de certificação ─────────────────────────── */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto space-y-14">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-gray-900">Níveis de certificação</h2>
            <p className="text-gray-500 text-lg">
              Avance de nível à medida que você melhora seus hábitos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {certificationLevels.map((cert) => (
              <Card
                key={cert.level}
                className={`p-6 border-2 ${cert.borderClass} space-y-5`}
              >
                {/* Header do card */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl ${cert.iconBgClass} flex items-center justify-center text-2xl`}
                  >
                    {cert.icon}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${cert.textColorClass}`}>
                      {cert.level}
                    </h3>
                    <p className="text-xs text-gray-400">{cert.minPoints}+ pontos</p>
                  </div>
                </div>

                {/* Critérios */}
                <ul className="space-y-2">
                  {cert.criteria.map((criterion, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true">
                        ✓
                      </span>
                      <span>{criterion}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ─────────────────────────────────────── */}
      <section className="bg-green-900 py-24 px-6">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <span className="text-5xl" aria-hidden="true">🌎</span>
          <h2 className="text-3xl font-bold text-white">
            Comece hoje a fazer a diferença
          </h2>
          <p className="text-green-200 text-lg leading-relaxed">
            Junte-se a quem já está transformando hábitos em certificação ambiental.
            É gratuito e leva menos de 5 minutos.
          </p>
          <Link to="/register">
            <Button
              variant="secondary"
              size="lg"
              className="mt-4 px-10 bg-white text-green-900 hover:bg-green-50 border-0 font-semibold"
            >
              Criar conta grátis
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="bg-green-950 py-6 px-6">
        <div className="max-w-6xl mx-auto text-center text-green-500 text-sm">
          © 2026 Sustentabilizar · Certificação ambiental para todos
        </div>
      </footer>
    </div>
  )
}
