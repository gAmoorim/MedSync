import { forwardRef, type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { Loader2, X, AlertTriangle } from 'lucide-react'
import { cn } from '../../utils'

/* Button */
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type BtnSize = 'sm' | 'md' | 'lg'
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant; size?: BtnSize; loading?: boolean; children: ReactNode
}
export const Button = forwardRef<HTMLButtonElement, BtnProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, disabled, ...p }, ref) => {
    const v: Record<BtnVariant, string> = {
      primary: 'bg-cyan-500 text-white hover:bg-cyan-600 shadow-sm shadow-cyan-500/20',
      secondary: 'bg-white text-navy-800 border border-slate-200 hover:bg-slate-50',
      ghost: 'text-slate-600 hover:bg-slate-100',
      danger: 'bg-red-500 text-white hover:bg-red-600',
    }
    const s: Record<BtnSize, string> = { sm: 'px-3 py-1.5 text-xs rounded-lg', md: 'px-5 py-2.5 text-sm rounded-xl', lg: 'px-7 py-3.5 text-base rounded-xl' }
    return (
      <button ref={ref} disabled={disabled || loading}
        className={cn('inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none', v[variant], s[size], className)}
        {...p}
      >
        {loading && <Loader2 size={15} className="animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

/* Input */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; hint?: string }
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...p }, ref) => {
    const iid = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && <label htmlFor={iid} className="app-label">{label}</label>}
        <input ref={ref} id={iid} className={cn('app-input', error && 'app-input-error', className)} {...p} />
        {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

/* Select */
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string; error?: string; options: { value: string | number; label: string }[]; placeholder?: string
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...p }, ref) => {
    const sid = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && <label htmlFor={sid} className="app-label">{label}</label>}
        <select ref={ref} id={sid} className={cn('app-input', error && 'app-input-error', className)} {...p}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

/* Textarea */
interface TAProps extends TextareaHTMLAttributes<HTMLTextAreaElement> { label?: string; error?: string }
export const Textarea = forwardRef<HTMLTextAreaElement, TAProps>(
  ({ label, error, className, id, ...p }, ref) => {
    const tid = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && <label htmlFor={tid} className="app-label">{label}</label>}
        <textarea ref={ref} id={tid} rows={3} className={cn('app-input resize-none', error && 'app-input-error', className)} {...p} />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

/* Badge */
export function Badge({ cls, children }: { cls: string; children: ReactNode }) {
  return <span className={cls}>{children}</span>
}

/* Card */
export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return <div className={cn('app-card p-6', onClick && 'cursor-pointer hover:shadow-md transition-shadow', className)} onClick={onClick}>{children}</div>
}

/* Loading */
export function Spinner({ text = 'Carregando...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
      <Loader2 size={30} className="animate-spin text-cyan-500" />
      <p className="text-sm">{text}</p>
    </div>
  )
}

/* Empty */
export function Empty({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">📭</div>
      <p className="font-semibold text-slate-700">{title}</p>
      {desc && <p className="text-sm text-slate-400">{desc}</p>}
      {action}
    </div>
  )
}

/* Error */
export function Err({ msg, onRetry }: { msg?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
        <AlertTriangle size={24} className="text-red-500" />
      </div>
      <p className="font-semibold text-slate-700">Algo deu errado</p>
      {msg && <p className="text-sm text-slate-400">{msg}</p>}
      {onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>Tentar novamente</Button>}
    </div>
  )
}

/* Modal */
export function Modal({ open, onClose, title, children, maxW = 'max-w-lg' }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; maxW?: string
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-white rounded-2xl shadow-2xl w-full', maxW)}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

/* Confirm */
export function Confirm({ open, onClose, onConfirm, title, desc, label = 'Confirmar', loading, danger = true }: {
  open: boolean; onClose: () => void; onConfirm: () => void
  title: string; desc: string; label?: string; loading?: boolean; danger?: boolean
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxW="max-w-sm">
      <p className="text-sm text-slate-500 mb-6">{desc}</p>
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>{label}</Button>
      </div>
    </Modal>
  )
}

/* Stat Card */
export function StatCard({ label, value, icon, accent = false }: { label: string; value: string | number; icon: ReactNode; accent?: boolean }) {
  return (
    <div className={cn('app-card p-5 flex items-center gap-4', accent && 'border-cyan-200')}>
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', accent ? 'bg-cyan-50 text-cyan-600' : 'bg-slate-100 text-slate-500')}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-navy-900">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}
