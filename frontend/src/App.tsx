import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { ProtectedRoute } from './routes/ProtectedRoute'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegistroPage from './pages/auth/RegistroPage'
import RecuperarSenhaPage from './pages/auth/RecuperarSenhaPage'
import ResetarSenhaPage from './pages/auth/ResetarSenhaPage'

import PacienteDashboard from './pages/paciente/PacienteDashboard'
import AgendarPage from './pages/paciente/AgendarPage'
import ConsultasPacientePage from './pages/paciente/ConsultasPacientePage'
import DetalheConsultaPaciente from './pages/paciente/DetalheConsultaPaciente'
import PerfilPacientePage from './pages/paciente/PerfilPacientePage'

import {
  MedicoDashboard, AgendaMedicoPage, ConsultasMedicoPage,
  DetalheConsultaMedicoPage, HorariosMedicoPage, PerfilMedicoPage
} from './pages/medico/MedicoPages'

import {
  AdminDashboard, AdminMedicosPage, AdminPacientesPage,
  AdminConsultasPage, AdminRelatoriosPage
} from './pages/admin/AdminPages'

function RootRedirect() {
  const { isAuthenticated, usuario } = useAuth()
  if (!isAuthenticated) return <Navigate to="/" replace />
  const r: Record<string, string> = { paciente: '/app/paciente', medico: '/app/medico', admin: '/app/admin' }
  return <Navigate to={r[usuario!.tipo]} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegistroPage />} />
      <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
      <Route path="/resetar-senha" element={<ResetarSenhaPage />} />
      <Route path="/app" element={<RootRedirect />} />

      <Route element={<ProtectedRoute tipo="paciente" />}>
        <Route path="/app/paciente" element={<PacienteDashboard />} />
        <Route path="/app/paciente/agendar" element={<AgendarPage />} />
        <Route path="/app/paciente/consultas" element={<ConsultasPacientePage />} />
        <Route path="/app/paciente/consultas/:id" element={<DetalheConsultaPaciente />} />
        <Route path="/app/paciente/perfil" element={<PerfilPacientePage />} />
      </Route>

      <Route element={<ProtectedRoute tipo="medico" />}>
        <Route path="/app/medico" element={<MedicoDashboard />} />
        <Route path="/app/medico/agenda" element={<AgendaMedicoPage />} />
        <Route path="/app/medico/consultas" element={<ConsultasMedicoPage />} />
        <Route path="/app/medico/consultas/:id" element={<DetalheConsultaMedicoPage />} />
        <Route path="/app/medico/horarios" element={<HorariosMedicoPage />} />
        <Route path="/app/medico/perfil" element={<PerfilMedicoPage />} />
      </Route>

      <Route element={<ProtectedRoute tipo="admin" />}>
        <Route path="/app/admin" element={<AdminDashboard />} />
        <Route path="/app/admin/medicos" element={<AdminMedicosPage />} />
        <Route path="/app/admin/pacientes" element={<AdminPacientesPage />} />
        <Route path="/app/admin/consultas" element={<AdminConsultasPage />} />
        <Route path="/app/admin/relatorios" element={<AdminRelatoriosPage />} />
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
