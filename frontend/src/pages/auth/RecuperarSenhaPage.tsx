import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Stethoscope, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { solicitarRecuperacao } from '../../api'
import { useToast } from '../../contexts/ToastContext'
import { Button, Input } from '../../components/ui'
import { getErr } from '../../utils'

const schema = z.object({ email: z.string().email('E-mail inválido') })
type F = z.infer<typeof schema>

export default function RecuperarSenhaPage() {
  const { error } = useToast()
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<F>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (d: F) => {
    try { await solicitarRecuperacao(d.email); setSent(true) }
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
          {sent ? (
            <div className="text-center py-2">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-navy-900 mb-2">E-mail enviado!</h2>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Caso este e-mail esteja cadastrado, você receberá as instruções em breve. Verifique também o spam.
              </p>
              <Link to="/login">
                <Button variant="secondary" className="w-full">
                  <ArrowLeft size={15} /> Voltar ao login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="w-11 h-11 bg-navy-950 rounded-xl flex items-center justify-center mb-4">
                  <Mail size={20} className="text-cyan-400" />
                </div>
                <h2 className="text-xl font-bold text-navy-900">Recuperar senha</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Informe seu e-mail e enviaremos um link para redefinir sua senha.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="E-mail cadastrado" type="email" placeholder="seu@email.com"
                  error={errors.email?.message} {...register('email')} />
                <Button type="submit" className="w-full" loading={isSubmitting}>
                  Enviar link de recuperação
                </Button>
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
