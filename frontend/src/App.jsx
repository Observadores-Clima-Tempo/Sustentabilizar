import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import { AuthProvider } from './contexts/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rotas privadas — Etapa 3+ */}
          <Route
            path="/checklist"
            element={
              <PrivateRoute>
                <div className="min-h-screen flex items-center justify-center bg-gray-100">
                  <p className="text-gray-500 text-sm">
                    Checklist — implementado na Etapa 3
                  </p>
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/*"
            element={
              <PrivateRoute>
                <div className="min-h-screen flex items-center justify-center bg-gray-100">
                  <p className="text-gray-500 text-sm">
                    Dashboard — implementado na Etapa 3
                  </p>
                </div>
              </PrivateRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
