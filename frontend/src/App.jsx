import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import PublicRoute from './components/PublicRoute'
import AdminRoute from './components/AdminRoute'
import DashboardLayout from './components/DashboardLayout'
import AdminLayout from './components/AdminLayout'
import { AuthProvider } from './contexts/AuthContext'
import NotFoundPage from './pages/NotFoundPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ChecklistPage from './pages/ChecklistPage'
import DashboardPage from './pages/DashboardPage'
import NovoRegistroPage from './pages/NovoRegistroPage'
import EvidenciaPage from './pages/EvidenciaPage'
import RegistrosPage from './pages/RegistrosPage'
import RegistroDetalhe from './pages/RegistroDetalhe'
import CertificadoPage from './pages/CertificadoPage'
import PerfilPage from './pages/PerfilPage'
import AdminChecklistPage from './pages/admin/AdminChecklistPage'
import AdminPontuacaoPage from './pages/admin/AdminPontuacaoPage'
import AdminCertificacaoPage from './pages/admin/AdminCertificacaoPage'
import AdminResiduosPage from './pages/admin/AdminResiduosPage'
import PWAInstallPrompt from './components/PWAInstallPrompt'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas — redirecionam para /dashboard se já autenticado */}
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Checklist — rota privada fora do DashboardLayout (tela própria) */}
          <Route
            path="/checklist"
            element={
              <PrivateRoute>
                <ChecklistPage />
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
            <Route path="/certificado" element={<CertificadoPage />} />
            <Route path="/perfil" element={<PerfilPage />} />
          </Route>

          {/* Painel Admin */}
          <Route
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route path="/admin" element={<Navigate to="/admin/checklist" replace />} />
            <Route path="/admin/checklist" element={<AdminChecklistPage />} />
            <Route path="/admin/pontuacao" element={<AdminPontuacaoPage />} />
            <Route path="/admin/certificacao" element={<AdminCertificacaoPage />} />
            <Route path="/admin/residuos" element={<AdminResiduosPage />} />
          </Route>

          {/* 404 — rota não encontrada */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      <PWAInstallPrompt />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

