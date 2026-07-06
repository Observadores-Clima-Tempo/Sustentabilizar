import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-6">🌿</div>

        <h1 className="text-8xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">
          Página não encontrada
        </h2>
        <p className="text-sm text-gray-500 mb-10 leading-relaxed">
          A página que você procura não existe ou foi movida para outro endereço.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors duration-200"
          >
            🏠 Ir ao Dashboard
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium px-5 py-2.5 rounded-lg text-sm border border-gray-300 transition-colors duration-200"
          >
            ← Página inicial
          </Link>
        </div>
      </div>
    </div>
  )
}
