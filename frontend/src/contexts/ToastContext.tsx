import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'
import { cn } from '../utils'

type Kind = 'success' | 'error'
interface Toast { id: number; kind: Kind; msg: string }

interface Ctx { success: (m: string) => void; error: (m: string) => void }
const ToastCtx = createContext<Ctx | null>(null)

let n = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const add = useCallback((kind: Kind, msg: string) => {
    const id = ++n
    setToasts(p => [...p, { id, kind, msg }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4500)
  }, [])

  const remove = (id: number) => setToasts(p => p.filter(t => t.id !== id))

  return (
    <ToastCtx.Provider value={{ success: m => add('success', m), error: m => add('error', m) }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border',
              'animate-fade-up',
              t.kind === 'success'
                ? 'bg-white border-emerald-100'
                : 'bg-white border-red-100'
            )}
          >
            {t.kind === 'success'
              ? <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              : <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            }
            <p className="text-sm text-slate-700 flex-1 leading-snug">{t.msg}</p>
            <button onClick={() => remove(t.id)} className="text-slate-300 hover:text-slate-500 shrink-0">
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => {
  const c = useContext(ToastCtx)
  if (!c) throw new Error('useToast must be inside ToastProvider')
  return c
}
