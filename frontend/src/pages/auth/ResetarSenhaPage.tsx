import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Stethoscope, Lock, ArrowLeft, Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react'
import { resetarSenha } from '../../api'
import { useToast } from '../../contexts/ToastContext'
import { Button } from '../../components/ui'
import { getErr } from '../../utils'

const schema = z.object({
  nova_senha: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmar_nova_senha: z.string().min(1, 'Confirme a nova senha'),
}).refine(d => d.nova_senha === d.confirmar_nova_senha, {
  message: 'As senhas não conferem', path: ['confirmar_nova_senha'],
})
type F = z.infer<typeof schema>

export default function ResetarSenhaPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { error } = useToast()
  const [showA, setShowA] = useState(false)
  const [showB, setShowB] = useState(false)
  const [ok, setOk] = useState(false)
  const token = params.get('token')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<F>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (d: F) => {
    if (!token) return
    try { await resetarSenha({ token, ...d }); setOk(true) }
    catch (e) { error(getErr(e)) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <div className="w-7 h-7 bg-cyan-500 rounded-lg flex items-center justify-center">
            <Stethoscope size={13} className="text-white" />
          </div>
          <span className="font-bold text-navy-900">Med<span className="text-cyan-500">Sync</span></span>
        </Link>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          {!token ? (
            <div className="text-center py-2">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-navy-900 mb-2">Link inválido</h2>
              <p className="text-sm text-slate-400 mb-6">Este link é inválido ou incompleto. Solicite um novo.</p>
              <Link to="/recuperar-senha"><Button className="w-full">Solicitar novo link</Button></Link>
            </div>
          ) : ok ? (
            <div className="text-center py-2">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-navy-900 mb-2">Senha redefinida!</h2>
              <p className="text-sm text-slate-400 mb-6">Faça login com sua nova senha.</p>
              <Button className="w-full" onClick={() => navigate('/login')}>Ir para o login</Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="w-11 h-11 bg-navy-950 rounded-xl flex items-center justify-center mb-4">
                  <Lock size={20} className="text-cyan-400" />
                </div>
                <h2 className="text-xl font-bold text-navy-900">Nova senha</h2>
                <p className="text-slate-400 text-sm mt-1">Escolha uma senha com ao menos 6 caracteres.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {[
                  { name: 'nova_senha' as const, label: 'Nova senha', show: showA, setShow: setShowA },
                  { name: 'confirmar_nova_senha' as const, label: 'Confirmar nova senha', show: showB, setShow: setShowB },
                ].map(({ name, label, show, setShow }) => (
                  <div key={name} className="flex flex-col gap-1.5">
                    <label className="app-label">{label}</label>
                    <div className="relative">
                      <input type={show ? 'text' : 'password'} placeholder="••••••••"
                        className={`app-input pr-10 ${errors[name] ? 'app-input-error' : ''}`}
                        {...register(name)} />
                      <button type="button" onClick={() => setShow(!show)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {show ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors[name] && <p className="text-xs text-red-500">{errors[name]?.message}</p>}
                  </div>
                ))}

                <Button type="submit" className="w-full" loading={isSubmitting}>Redefinir senha</Button>
              </form>

              <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-slate-400 hover:text-slate-600 mt-5 transition-colors">
                <ArrowLeft size={14} /> Voltar ao login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
