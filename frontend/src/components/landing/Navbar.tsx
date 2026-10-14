import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Stethoscope, Sun, Moon } from 'lucide-react'
import { cn } from '../../utils'

const links = [
  { label: 'Início', href: '#inicio' },
  { label: 'Serviços', href: '#especialidades' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Contato', href: '#contato' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev)
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollTo = (href: string) => {
    setOpen(false)

    const element = document.querySelector(href)

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-navy-950/95 backdrop-blur-md shadow-lg shadow-black/20'
          : 'bg-transparent'
      )}
    >
      <div className="container-lg">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <button
            type="button"
            onClick={() => scrollTo('#inicio')}
            className="flex items-center gap-2.5 group"
            aria-label="Voltar ao início"
          >
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center group-hover:bg-cyan-400 transition-colors">
              <Stethoscope size={16} className="text-white" />
            </div>

            <span className="font-bold text-white text-lg tracking-tight">
              Med<span className="text-cyan-400">Sync</span>
            </span>
          </button>

          {/* Navegação desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => scrollTo(link.href)}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Ações desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label={
                darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'
              }
              title={
                darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'
              }
              className="p-2 rounded-xl text-white/80 hover:text-cyan-300 hover:bg-white/10 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <Link
              to="/login"
              className="text-sm font-semibold text-white/80 hover:text-white transition-colors px-4 py-2"
            >
              Entrar
            </Link>

            <Link to="/registro" className="btn-primary btn-sm">
              Criar conta
            </Link>
          </div>

          {/* Botões mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label={
                darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'
              }
              title={
                darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'
              }
              className="p-2 rounded-xl text-white/80 hover:text-cyan-300 hover:bg-white/10 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              type="button"
              className="text-white p-2"
              onClick={() => setOpen((prev) => !prev)}
              aria-label={open ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={open}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      <div
        className={cn(
          'lg:hidden overflow-hidden transition-all duration-300 bg-navy-950/98 backdrop-blur-md border-t border-white/5',
          open ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="container-lg py-4 flex flex-col gap-1">
          {links.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => scrollTo(link.href)}
              className="text-left text-sm font-medium text-white/70 hover:text-white py-3 px-3 rounded-xl hover:bg-white/5 transition-all"
            >
              {link.label}
            </button>
          ))}

          <div className="border-t border-white/10 mt-3 pt-3 flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="text-sm font-semibold text-white/80 py-3 px-3 rounded-xl hover:bg-white/5 transition-all"
            >
              Entrar
            </Link>

            <Link
              to="/registro"
              onClick={() => setOpen(false)}
              className="btn-primary btn-sm text-center"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}