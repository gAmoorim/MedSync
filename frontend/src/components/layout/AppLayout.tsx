import { useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../utils'
import {
  LayoutDashboard, Calendar, ClipboardList, User, Users,
  Clock, BarChart2, LogOut, Menu, X, Stethoscope, ChevronRight
} from 'lucide-react'

type NavItem = { label: string; href: string; icon: ReactNode }

function getNav(tipo: string): NavItem[] {
  if (tipo === 'paciente') return [
    { label: 'Início', href: '/app/paciente', icon: <LayoutDashboard size={17} /> },
    { label: 'Agendar', href: '/app/paciente/agendar', icon: <Calendar size={17} /> },
    { label: 'Consultas', href: '/app/paciente/consultas', icon: <ClipboardList size={17} /> },
    { label: 'Perfil', href: '/app/paciente/perfil', icon: <User size={17} /> },
  ]
  if (tipo === 'medico') return [
    { label: 'Início', href: '/app/medico', icon: <LayoutDashboard size={17} /> },
    { label: 'Agenda', href: '/app/medico/agenda', icon: <Calendar size={17} /> },
    { label: 'Consultas', href: '/app/medico/consultas', icon: <ClipboardList size={17} /> },
    { label: 'Horários', href: '/app/medico/horarios', icon: <Clock size={17} /> },
    { label: 'Perfil', href: '/app/medico/perfil', icon: <User size={17} /> },
  ]
  return [
    { label: 'Dashboard', href: '/app/admin', icon: <LayoutDashboard size={17} /> },
    { label: 'Médicos', href: '/app/admin/medicos', icon: <Stethoscope size={17} /> },
    { label: 'Pacientes', href: '/app/admin/pacientes', icon: <Users size={17} /> },
    { label: 'Consultas', href: '/app/admin/consultas', icon: <ClipboardList size={17} /> },
    { label: 'Relatórios', href: '/app/admin/relatorios', icon: <BarChart2 size={17} /> },
  ]
}

function Sidebar({ items, onClose }: { items: NavItem[]; onClose?: () => void }) {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const tipos: Record<string, string> = { paciente: 'Paciente', medico: 'Médico', admin: 'Administrador' }

  return (
    <div className="flex flex-col h-full bg-navy-950">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-cyan-500 rounded-lg flex items-center justify-center">
            <Stethoscope size={13} className="text-white" />
          </div>
          <span className="font-bold text-white tracking-tight">Med<span className="text-cyan-400">Sync</span></span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white/40 hover:text-white lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* User */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {usuario?.nome?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{usuario?.nome}</p>
            <p className="text-xs text-white/40">{tipos[usuario?.tipo ?? 'paciente']}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        {items.map(item => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href.split('/').length === 3}
            onClick={onClose}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            )}
          >
            {item.icon}
            <span>{item.label}</span>
            <ChevronRight size={13} className="ml-auto opacity-30" />
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-white/5">
        <button
          onClick={() => { logout(); navigate('/login') }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut size={17} />
          Sair
        </button>
      </div>
    </div>
  )
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { usuario } = useAuth()
  const [open, setOpen] = useState(false)
  const items = getNav(usuario?.tipo ?? 'paciente')

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Mobile sidebar */}
      <div className={cn('fixed inset-y-0 left-0 w-64 z-50 transform transition-transform duration-200 lg:hidden', open ? 'translate-x-0' : '-translate-x-full')}>
        <Sidebar items={items} onClose={() => setOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-60 shrink-0">
        <Sidebar items={items} />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100 lg:hidden shrink-0">
          <button onClick={() => setOpen(true)} className="text-slate-500 hover:text-slate-700 p-1">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cyan-500 rounded-md flex items-center justify-center">
              <Stethoscope size={11} className="text-white" />
            </div>
            <span className="font-bold text-navy-900 text-sm">Med<span className="text-cyan-500">Sync</span></span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
