import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Lock, Save } from 'lucide-react'
import { getPacientePerfil, atualizarPacientePerfil, alterarSenhaPaciente } from '../../api'
import { useToast } from '../../contexts/ToastContext'
import { Button, Input, Spinner, Err } from '../../components/ui'
import { formatCPF, getErr } from '../../utils'
import type { Paciente } from '../../types'

const perfilSchema = z.object({
  nome: z.string().min(3), telefone: z.string().min(10),
  data_nascimento: z.string().min(1),
})
const senhaSchema = z.object({
  senha_atual: z.string().min(1),
  nova_senha: z.string().min(6),
  confirmar_nova_senha: z.string(),
}).refine(d => d.nova_senha === d.confirmar_nova_senha, { message: 'Senhas não conferem', path: ['confirmar_nova_senha'] })

type PF = z.infer<typeof perfilSchema>
type SF = z.infer<typeof senhaSchema>

export default function PerfilPacientePage() {
  const { success, error } = useToast()
  const [p, setP] = useState<Paciente | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(false)

  const pf = useForm<PF>({ resolver: zodResolver(perfilSchema) })
  const sf = useForm<SF>({ resolver: zodResolver(senhaSchema) })

  useEffect(() => {
    getPacientePerfil().then(d => { setP(d); pf.reset({ nome: d.nome, telefone: d.telefone, data_nascimento: d.data_nascimento?.split('T')[0] }) })
      .catch(() => setErr(true)).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  if (err) return <Err />

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Meu Perfil</h1>
        <p className="text-slate-400 text-sm mt-1">Gerencie suas informações pessoais</p>
      </div>

      {/* Info card */}
      <div className="app-card p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-navy-950 flex items-center justify-center text-cyan-400 text-xl font-bold shrink-0">
          {p?.nome?.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-navy-900">{p?.nome}</p>
          <p className="text-sm text-slate-400">{p?.email}</p>
          <p className="text-xs text-slate-300 mt-0.5">CPF: {p?.cpf ? formatCPF(p.cpf) : '-'}</p>
        </div>
      </div>

      {/* Perfil form */}
      <div className="app-card p-6">
        <h2 className="font-bold text-navy-900 mb-5 flex items-center gap-2"><User size={16} /> Dados pessoais</h2>
        <form onSubmit={pf.handleSubmit(async d => { try { await atualizarPacientePerfil(d); success('Perfil atualizado!') } catch (e) { error(getErr(e)) } })} className="space-y-4">
          <Input label="Nome completo" error={pf.formState.errors.nome?.message} {...pf.register('nome')} />
          <Input label="Telefone" error={pf.formState.errors.telefone?.message} {...pf.register('telefone')} />
          <Input label="Data de nascimento" type="date" error={pf.formState.errors.data_nascimento?.message} {...pf.register('data_nascimento')} />
          <div className="flex justify-end">
            <Button type="submit" size="sm" loading={pf.formState.isSubmitting}><Save size={14} /> Salvar</Button>
          </div>
        </form>
      </div>

      {/* Senha form */}
      <div className="app-card p-6">
        <h2 className="font-bold text-navy-900 mb-5 flex items-center gap-2"><Lock size={16} /> Alterar senha</h2>
        <form onSubmit={sf.handleSubmit(async d => { try { await alterarSenhaPaciente(d); success('Senha alterada!'); sf.reset() } catch (e) { error(getErr(e)) } })} className="space-y-4">
          <Input label="Senha atual" type="password" error={sf.formState.errors.senha_atual?.message} {...sf.register('senha_atual')} />
          <Input label="Nova senha" type="password" hint="Mínimo 6 caracteres" error={sf.formState.errors.nova_senha?.message} {...sf.register('nova_senha')} />
          <Input label="Confirmar nova senha" type="password" error={sf.formState.errors.confirmar_nova_senha?.message} {...sf.register('confirmar_nova_senha')} />
          <div className="flex justify-end">
            <Button type="submit" variant="secondary" size="sm" loading={sf.formState.isSubmitting}><Lock size={14} /> Alterar</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
