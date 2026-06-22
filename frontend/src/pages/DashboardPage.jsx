import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Saudação */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1 capitalize">{today}</p>
      </div>

      {/* Boas-vindas placeholder — será substituído na Etapa 4 com dados reais */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🌱</span>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Bem-vindo ao seu painel</h2>
            <p className="text-sm text-gray-500">
              Registre seus resíduos e acompanhe sua certificação ambiental.
            </p>
          </div>
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
            to="/registros"
            className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg text-center text-sm border border-gray-300 transition-colors duration-200"
          >
            📋 Ver registros
          </Link>
        </div>
      </div>

      {/* Certificação e estatísticas — serão implementados na Etapa 4 */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <p className="text-sm text-green-700">
          💡 Complete o <strong>diagnóstico inicial</strong> para obter sua certificação ambiental.
          As estatísticas do dashboard serão exibidas após a Etapa 4.
        </p>
      </div>
    </div>
  )
}
