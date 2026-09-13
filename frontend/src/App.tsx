import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { ProtectedRoute } from './routes/ProtectedRoute'

import LoginPage from './pages/auth/LoginPage'
import RegistroPage from './pages/auth/RegistroPage'

import PacienteDashboard from './pages/paciente/PacienteDashboard'
import AgendarConsultaPage from './pages/paciente/AgendarConsultaPage'
import ConsultasPacientePage from './pages/paciente/ConsultasPacientePage'
import DetalheConsultaPacientePage from './pages/paciente/DetalheConsultaPacientePage'
import PerfilPacientePage from './pages/paciente/PerfilPacientePage'

import MedicoDashboard from './pages/medico/MedicoDashboard'
import AgendaMedicoPage from './pages/medico/AgendaMedicoPage'
import ConsultasMedicoPage from './pages/medico/ConsultasMedicoPage'
import DetalheConsultaMedicoPage from './pages/medico/DetalheConsultaMedicoPage'
import HorariosMedicoPage from './pages/medico/HorariosMedicoPage'
import PerfilMedicoPage from './pages/medico/PerfilMedicoPage'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminMedicosPage from './pages/admin/AdminMedicosPage'
import AdminPacientesPage from './pages/admin/AdminPacientesPage'
import AdminConsultasPage from './pages/admin/AdminConsultasPage'
import AdminRelatoriosPage from './pages/admin/AdminRelatoriosPage'

function RootRedirect() {
  const { isAuthenticated, usuario } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  const redirects: Record<string, string> = { paciente: '/paciente', medico: '/medico', admin: '/admin' }
  return <Navigate to={redirects[usuario!.tipo]} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegistroPage />} />

      <Route element={<ProtectedRoute tipo="paciente" />}>
        <Route path="/paciente" element={<PacienteDashboard />} />
        <Route path="/paciente/agendar" element={<AgendarConsultaPage />} />
        <Route path="/paciente/consultas" element={<ConsultasPacientePage />} />
        <Route path="/paciente/consultas/:id" element={<DetalheConsultaPacientePage />} />
        <Route path="/paciente/perfil" element={<PerfilPacientePage />} />
      </Route>

      <Route element={<ProtectedRoute tipo="medico" />}>
        <Route path="/medico" element={<MedicoDashboard />} />
        <Route path="/medico/agenda" element={<AgendaMedicoPage />} />
        <Route path="/medico/consultas" element={<ConsultasMedicoPage />} />
        <Route path="/medico/consultas/:id" element={<DetalheConsultaMedicoPage />} />
        <Route path="/medico/horarios" element={<HorariosMedicoPage />} />
        <Route path="/medico/perfil" element={<PerfilMedicoPage />} />
      </Route>

      <Route element={<ProtectedRoute tipo="admin" />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/medicos" element={<AdminMedicosPage />} />
        <Route path="/admin/pacientes" element={<AdminPacientesPage />} />
        <Route path="/admin/consultas" element={<AdminConsultasPage />} />
        <Route path="/admin/relatorios" element={<AdminRelatoriosPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
