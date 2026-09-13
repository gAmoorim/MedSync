import { useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../utils'
import {
  LayoutDashboard, Calendar, Clock, User, Users,
  ClipboardList, BarChart2, LogOut, Menu, X, Stethoscope, ChevronRight
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: ReactNode
}

function getPacienteNav(): NavItem[] {
  return [
    { label: 'Início', href: '/paciente', icon: <LayoutDashboard size={18} /> },
    { label: 'Agendar Consulta', href: '/paciente/agendar', icon: <Calendar size={18} /> },
    { label: 'Minhas Consultas', href: '/paciente/consultas', icon: <ClipboardList size={18} /> },
    { label: 'Meu Perfil', href: '/paciente/perfil', icon: <User size={18} /> },
  ]
}

function getMedicoNav(): NavItem[] {
  return [
    { label: 'Início', href: '/medico', icon: <LayoutDashboard size={18} /> },
    { label: 'Agenda', href: '/medico/agenda', icon: <Calendar size={18} /> },
    { label: 'Consultas do Dia', href: '/medico/consultas', icon: <ClipboardList size={18} /> },
    { label: 'Horários', href: '/medico/horarios', icon: <Clock size={18} /> },
    { label: 'Meu Perfil', href: '/medico/perfil', icon: <User size={18} /> },
  ]
}

function getAdminNav(): NavItem[] {
  return [
    { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={18} /> },
    { label: 'Médicos', href: '/admin/medicos', icon: <Stethoscope size={18} /> },
    { label: 'Pacientes', href: '/admin/pacientes', icon: <Users size={18} /> },
    { label: 'Consultas', href: '/admin/consultas', icon: <ClipboardList size={18} /> },
    { label: 'Relatórios', href: '/admin/relatorios', icon: <BarChart2 size={18} /> },
  ]
}

interface SidebarProps {
  items: NavItem[]
  onClose?: () => void
}

function Sidebar({ items, onClose }: SidebarProps) {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const tipoLabel = {
    paciente: 'Paciente',
    medico: 'Médico',
    admin: 'Administrador',
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <Stethoscope size={16} className="text-white" />
          </div>
          <span className="font-semibold text-white tracking-tight">MedSync</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white lg:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-sm font-semibold text-white shrink-0">
            {usuario?.nome?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{usuario?.nome}</p>
            <p className="text-xs text-slate-400">{tipoLabel[usuario?.tipo ?? 'paciente']}</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        {items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href.split('/').length === 2}
            onClick={onClose}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-primary-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )}
          >
            {item.icon}
            <span>{item.label}</span>
            <ChevronRight size={14} className="ml-auto opacity-40" />
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-150"
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  )
}

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isPaciente, isMedico } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = isPaciente ? getPacienteNav() : isMedico ? getMedicoNav() : getAdminNav()

  return (
    <div className="flex h-full">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - mobile */}
      <div className={cn(
        'fixed inset-y-0 left-0 w-64 z-50 transform transition-transform duration-200 lg:hidden',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <Sidebar items={navItems} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Sidebar - desktop */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0">
        <Sidebar items={navItems} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="flex items-center gap-4 px-4 py-3 bg-white border-b border-slate-100 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-500 hover:text-slate-700">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-500 rounded-md flex items-center justify-center">
              <Stethoscope size={12} className="text-white" />
            </div>
            <span className="font-semibold text-slate-900 text-sm">MedSync</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
