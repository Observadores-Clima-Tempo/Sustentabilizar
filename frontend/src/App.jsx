import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Rotas de auth — implementadas na Etapa 2 */}
        <Route
          path="/login"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <p className="text-gray-500">Tela de Login — implementada na Etapa 2</p>
            </div>
          }
        />
        <Route
          path="/register"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <p className="text-gray-500">Tela de Cadastro — implementada na Etapa 2</p>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
