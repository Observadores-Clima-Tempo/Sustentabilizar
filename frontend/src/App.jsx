import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import PublicRoute from './components/PublicRoute'
import DashboardLayout from './components/DashboardLayout'
import { AuthProvider } from './contexts/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import NovoRegistroPage from './pages/NovoRegistroPage'
import EvidenciaPage from './pages/EvidenciaPage'
import RegistrosPage from './pages/RegistrosPage'
import RegistroDetalhe from './pages/RegistroDetalhe'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas — redirecionam para /dashboard se já autenticado */}
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Rotas privadas — Etapa 3+ */}
          <Route
            path="/checklist"
            element={
              <PrivateRoute>
                <div className="min-h-screen flex items-center justify-center bg-gray-100">
                  <p className="text-gray-500 text-sm">
                    Checklist — implementado na Etapa 4
                  </p>
                </div>
              </PrivateRoute>
            }
          />

          {/* Dashboard com layout de sidebar */}
          <Route
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/registros" element={<RegistrosPage />} />
            <Route path="/registros/:id" element={<RegistroDetalhe />} />
            <Route path="/novo" element={<NovoRegistroPage />} />
            <Route path="/evidencia/:recordId" element={<EvidenciaPage />} />
            {/* Placeholders para Etapa 4 */}
            <Route
              path="/certificado"
              element={
                <div className="flex items-center justify-center py-16">
                  <p className="text-gray-500 text-sm">Certificado — implementado na Etapa 4</p>
                </div>
              }
            />
            <Route
              path="/perfil"
              element={
                <div className="flex items-center justify-center py-16">
                  <p className="text-gray-500 text-sm">Perfil — implementado na Etapa 4</p>
                </div>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

