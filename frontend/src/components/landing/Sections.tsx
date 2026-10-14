
import { Link } from 'react-router-dom'
import {
  Calendar, CheckCircle, ArrowRight, ChevronRight,
  Mail, Phone, MapPin, Stethoscope, Heart, Brain,
  Bone, Eye, Baby, Activity, Clock, Star, Quote,
  ShieldCheck, Award, Users,
} from 'lucide-react'

/* ── HERO ─────────────────────────────────────────────────── */
export function Hero() {
  const scrollTo = (href: string) =>
    document.querySelector(href)?.scrollIntoView({
      behavior: 'smooth',
    })

  return (
    <section
      id="inicio"
      className="relative flex min-h-[calc(100svh-64px)] items-center overflow-hidden bg-navy-950"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[120px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-cyan-600/5 blur-[80px]"
      />

      <div className="container-lg relative z-10 w-full py-12 sm:py-16 lg:py-10">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:justify-between lg:gap-12 xl:gap-16">
          <div className="w-full min-w-0 flex-1">
            <h1 className="mb-5 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-[5.3rem]">
              Cuidando de você
              <br />
              com <span className="text-gradient">excelência</span>
              <br />
              e dedicação
            </h1>

            <p className="mb-7 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base lg:mb-8">
              Atendimento médico humanizado com especialistas de alto nível.
              Agende sua consulta online de forma rápida, fácil e segura.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link
                to="/registro"
                className="btn-primary btn-lg group w-full justify-center sm:w-auto"
              >
                Agendar consulta
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <button
                onClick={() => scrollTo('#especialidades')}
                className="btn-outline btn-lg w-full justify-center sm:w-auto"
              >
                Nossas especialidades
              </button>
            </div>
          </div>

          <div className="hidden w-full shrink-0 flex-col gap-4 sm:max-w-md lg:flex lg:w-[340px] xl:w-[380px] 2xl:w-[400px]">
            <div className="glass rounded-2xl p-7 shadow-2xl sm:p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500">
                  <Calendar size={15} className="text-white" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    Consulta agendada
                  </p>
                  <p className="text-xs text-white/40">
                    Dr. Carlos Mendes · Cardiologia
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  ['Data', 'Qua, 16 Jul 2026'],
                  ['Horário', '14:30 – 15:00'],
                  ['Status', 'Confirmada'],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="text-white/40">{label}</span>
                    <span
                      className={
                        value === 'Confirmada'
                          ? 'font-semibold text-cyan-400'
                          : 'text-right text-white/70'
                      }
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4">
                <CheckCircle size={13} className="shrink-0 text-cyan-400" />
                <p className="text-xs text-white/40">
                  Confirmação enviada por e-mail
                </p>
              </div>
            </div>

            <div className="glass rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                  <Star size={13} className="text-emerald-400" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-white">
                    Avaliação recente
                  </p>
                  <div className="mt-0.5 flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={9}
                        className="fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                </div>

                <p className="ml-auto text-xs text-white/40">5.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── ESPECIALIDADES ───────────────────────────────────────── */
const especialidades = [
  {
    icon: <Heart size={24} />,
    nome: 'Cardiologia',
    desc: 'Diagnóstico e tratamento de doenças do coração e sistema cardiovascular.',
  },
  {
    icon: <Brain size={24} />,
    nome: 'Neurologia',
    desc: 'Cuidado de doenças do sistema nervoso central e periférico.',
  },
  {
    icon: <Bone size={24} />,
    nome: 'Ortopedia',
    desc: 'Tratamento de lesões e doenças do sistema músculo-esquelético.',
  },
  {
    icon: <Eye size={24} />,
    nome: 'Oftalmologia',
    desc: 'Saúde ocular completa, desde consultas de rotina a cirurgias.',
  },
  {
    icon: <Baby size={24} />,
    nome: 'Pediatria',
    desc: 'Acompanhamento integral da saúde de crianças e adolescentes.',
  },
  {
    icon: <Activity size={24} />,
    nome: 'Clínica Geral',
    desc: 'Atendimento primário, prevenção e encaminhamento especializado.',
  },
  {
    icon: <Stethoscope size={24} />,
    nome: 'Dermatologia',
    desc: 'Diagnóstico e tratamento de doenças da pele, cabelo e unhas.',
  },
  {
    icon: <ShieldCheck size={24} />,
    nome: 'Ginecologia',
    desc: 'Saúde integral da mulher em todas as fases da vida.',
  },
]

export function Especialidades() {
  return (
    <section id="especialidades" className="section bg-sky-50/80">
      <div className="container-lg">
        <div className="mb-14 text-center">
          <p className="section-label mb-3">O que oferecemos</p>
          <h2 className="section-title mb-4">Nossas Especialidades</h2>
          <p className="section-sub mx-auto max-w-xl">
            Contamos com uma equipe multidisciplinar de especialistas para
            cuidar da sua saúde de forma completa e humanizada.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {especialidades.map((especialidade) => (
            <div
              key={especialidade.nome}
              className="group cursor-default rounded-2xl border border-sky-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-navy-950 text-cyan-400 transition-all duration-300 group-hover:bg-cyan-500 group-hover:text-white">
                {especialidade.icon}
              </div>

              <h3 className="mb-2 font-bold text-navy-900">
                {especialidade.nome}
              </h3>
              <p className="text-sm leading-relaxed text-slate-500">
                {especialidade.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/registro"
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-600 transition-colors hover:text-cyan-700"
          >
            Agendar consulta <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ── SOBRE NÓS ────────────────────────────────────────────── */
const valores = [
  {
    icon: <Heart size={18} />,
    titulo: 'Humanização',
    desc: 'Cada paciente é único. Nosso atendimento é personalizado e acolhedor.',
  },
  {
    icon: <Award size={18} />,
    titulo: 'Excelência',
    desc: 'Profissionais altamente qualificados e equipamentos de última geração.',
  },
  {
    icon: <ShieldCheck size={18} />,
    titulo: 'Segurança',
    desc: 'Protocolos rigorosos para garantir a sua segurança em cada consulta.',
  },
  {
    icon: <Users size={18} />,
    titulo: 'Equipe',
    desc: 'Mais de 20 especialistas dedicados ao cuidado da sua saúde.',
  },
]

export function Sobre() {
  return (
    <section id="sobre" className="section bg-white">
      <div className="container-lg">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="section-label mb-3">Sobre nós</p>
            <h2 className="section-title mb-6">
              Mais de 15 anos
              <br />
              cuidando de vidas
            </h2>

            <p className="mb-5 leading-relaxed text-slate-500">
              A Clínica MedSync nasceu com uma missão clara: oferecer
              atendimento médico de excelência com a humanidade que cada
              paciente merece. Desde 2009, somos referência em saúde no Ceará,
              combinando tecnologia de ponta com o cuidado genuíno pelos
              nossos pacientes.
            </p>

            <p className="leading-relaxed text-slate-500">
              Nossa equipe é formada por médicos especialistas com formação
              nas melhores instituições do Brasil e do exterior, comprometidos
              com seu bem-estar e qualidade de vida.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {valores.map((valor) => (
              <div
                key={valor.titulo}
                className="rounded-2xl border border-sky-100 bg-sky-50/70 p-6 transition-colors hover:bg-sky-50"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-navy-950 text-cyan-400">
                  {valor.icon}
                </div>

                <h3 className="mb-2 font-bold text-navy-900">
                  {valor.titulo}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  {valor.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── COMO AGENDAR ─────────────────────────────────────────── */
const passos = [
  {
    n: '01',
    titulo: 'Crie sua conta',
    desc: 'Cadastre-se rapidamente com nome, e-mail e CPF. É gratuito e leva menos de 2 minutos.',
  },
  {
    n: '02',
    titulo: 'Escolha a especialidade',
    desc: 'Selecione a especialidade e veja os médicos disponíveis com horários em tempo real.',
  },
  {
    n: '03',
    titulo: 'Confirme o agendamento',
    desc: 'Escolha o horário que melhor se encaixa na sua rotina e confirme com um clique.',
  },
  {
    n: '04',
    titulo: 'Receba a confirmação',
    desc: 'Um e-mail com todos os detalhes é enviado automaticamente. É só comparecer!',
  },
]

export function ComoAgendar() {
  return (
    <section
      id="como-funciona"
      className="section relative overflow-hidden bg-navy-950"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-1/4 top-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-[100px]"
      />

      <div className="container-lg relative z-10">
        <div className="mb-14 text-center">
          <p className="section-label mb-3">Simples e rápido</p>
          <h2 className="section-title-light mb-4">
            Como agendar sua consulta
          </h2>
          <p className="mx-auto max-w-xl text-lg text-white/50">
            Do cadastro à consulta em menos de 2 minutos, direto pelo site.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {passos.map((passo, index) => (
            <div key={passo.n} className="relative">
              {index < passos.length - 1 && (
                <div
                  aria-hidden="true"
                  className="absolute left-full top-8 z-10 hidden h-px w-full bg-gradient-to-r from-white/10 to-transparent lg:block"
                />
              )}

              <div className="glass relative h-full rounded-2xl p-6">
                <p className="mb-4 text-5xl font-black leading-none text-cyan-400/40">
                  {passo.n}
                </p>
                <h3 className="mb-2 font-bold text-white">
                  {passo.titulo}
                </h3>
                <p className="text-sm leading-relaxed text-white/60">
                  {passo.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/registro"
            className="btn-primary btn-lg group inline-flex"
          >
            Agendar agora
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ── DEPOIMENTOS ──────────────────────────────────────────── */
const depoimentos = [
  {
    nome: 'Ana Paula Rodrigues',
    especialidade: 'Paciente de Cardiologia',
    texto:
      'Atendimento impecável desde o agendamento até a consulta. O Dr. Carlos é extremamente atencioso e dedicado. Me sinto muito segura sendo paciente aqui.',
  },
  {
    nome: 'Roberto Alves',
    especialidade: 'Paciente de Ortopedia',
    texto:
      'Agendei pelo site em menos de 2 minutos. A clínica é moderna, limpa e os profissionais são muito competentes. Já indiquei para toda a minha família.',
  },
  {
    nome: 'Mariana Costa',
    especialidade: 'Paciente de Pediatria',
    texto:
      'Minha filha sempre foi muito assustada com médicos, mas a Dra. Fernanda conquistou sua confiança desde a primeira consulta. Gratidão pelo carinho.',
  },
]

export function Depoimentos() {
  return (
    <section className="section bg-sky-50/80">
      <div className="container-lg">
        <div className="mb-14 text-center">
          <p className="section-label mb-3">O que dizem nossos pacientes</p>
          <h2 className="section-title mb-4">
            Quem nos escolhe,
            <br />
            volta sempre
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {depoimentos.map((depoimento) => (
            <div
              key={depoimento.nome}
              className="relative flex flex-col rounded-2xl border border-sky-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-900/5"
            >
              <Quote size={28} className="mb-4 text-cyan-300" />

              <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-600">
                “{depoimento.texto}”
              </p>

              <div className="mt-auto flex items-center gap-3 border-t border-sky-100 pt-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-950 text-sm font-bold text-cyan-400">
                  {depoimento.nome.charAt(0)}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-navy-900">
                    {depoimento.nome}
                  </p>
                  <p className="text-xs text-slate-400">
                    {depoimento.especialidade}
                  </p>
                </div>

                <div
                  className="ml-auto flex shrink-0 gap-0.5"
                  aria-label="5 de 5 estrelas"
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={11}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── HORÁRIOS DE FUNCIONAMENTO ────────────────────────────── */
const horarios = [
  { dia: 'Segunda a Sexta', hora: '07:00 – 20:00' },
  { dia: 'Sábado', hora: '08:00 – 14:00' },
  { dia: 'Domingo e Feriados', hora: 'Fechado' },
]

export function Funcionamento() {
  return (
    <section className="section bg-white">
      <div className="container-lg">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="section-label mb-3">Atendimento</p>
            <h2 className="section-title mb-4">
              Horários de
              <br />
              funcionamento
            </h2>

            <p className="mb-8 leading-relaxed text-slate-500">
              Estamos disponíveis nos principais horários para atender você
              com conforto e pontualidade. Agende com antecedência para
              garantir seu horário preferido.
            </p>

            <div className="space-y-3">
              {horarios.map((horario) => {
                const fechado = horario.hora === 'Fechado'

                return (
                  <div
                    key={horario.dia}
                    className={`flex items-center justify-between gap-3 rounded-xl border p-4 ${
                      fechado
                        ? 'border-slate-200 bg-slate-50'
                        : 'border-sky-100 bg-sky-50/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Clock
                        size={16}
                        className={
                          fechado ? 'text-slate-300' : 'text-cyan-600'
                        }
                      />
                      <span className="text-sm font-medium text-navy-900">
                        {horario.dia}
                      </span>
                    </div>

                    <span
                      className={`text-sm font-semibold ${
                        fechado ? 'text-slate-400' : 'text-cyan-700'
                      }`}
                    >
                      {horario.hora}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-navy-950 p-8 lg:p-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-cyan-500/10 blur-[60px]"
            />

            <div className="relative z-10">
              <p className="section-label mb-4">Agendamento online</p>
              <h3 className="mb-4 text-2xl font-bold text-white">
                Agende sua consulta sem sair de casa
              </h3>
              <p className="mb-8 text-sm leading-relaxed text-white/60">
                Acesse nossa plataforma, escolha a especialidade, médico e
                horário. Receba a confirmação por e-mail em instantes.
              </p>

              <Link
                to="/registro"
                className="btn-primary btn-md group inline-flex w-full justify-center"
              >
                Criar conta gratuita
                <ChevronRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <p className="mt-3 text-center text-xs text-white/40">
                Já tem conta?{' '}
                <Link
                  to="/login"
                  className="text-cyan-400 hover:underline"
                >
                  Entrar
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── CONTATO ──────────────────────────────────────────────── */
const contatos = [
  {
    icon: <Phone size={20} />,
    label: 'Telefone',
    value: '(85) 3333-4444',
    sub: 'Seg–Sex, 7h–20h',
  },
  {
    icon: <Mail size={20} />,
    label: 'E-mail',
    value: 'contato@medsync.com.br',
    sub: 'Respondemos em até 24h',
  },
  {
    icon: <MapPin size={20} />,
    label: 'Endereço',
    value: 'Av. Santos Dumont, 1000',
    sub: 'Fortaleza – CE, 60150-160',
  },
]

export function Contato() {
  return (
    <section id="contato" className="section bg-sky-50/80">
      <div className="container-lg">
        <div className="mb-14 text-center">
          <p className="section-label mb-3">Fale conosco</p>
          <h2 className="section-title mb-4">Entre em contato</h2>
          <p className="section-sub mx-auto max-w-md">
            Estamos aqui para esclarecer suas dúvidas e ajudar você a cuidar
            melhor da sua saúde.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
          {contatos.map((contato) => (
            <div
              key={contato.label}
              className="flex flex-col items-center gap-3 rounded-2xl border border-sky-100 bg-white p-7 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-950 text-cyan-400">
                {contato.icon}
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {contato.label}
                </p>
                <p className="text-sm font-bold text-navy-900">
                  {contato.value}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {contato.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── FOOTER ───────────────────────────────────────────────── */
const linksNavegacao = [
  ['#inicio', 'Início'],
  ['#especialidades', 'Especialidades'],
  ['#sobre', 'Sobre nós'],
  ['#contato', 'Contato'],
]

const contatosFooter = [
  { icon: <Phone size={13} />, texto: '(85) 3333-4444' },
  { icon: <Mail size={13} />, texto: 'contato@medsync.com.br' },
  {
    icon: <MapPin size={13} />,
    texto: 'Av. Santos Dumont, 1000 – Fortaleza',
  },
]

export function Footer() {
  const scrollTo = (href: string) =>
    document.querySelector(href)?.scrollIntoView({
      behavior: 'smooth',
    })

  return (
    <footer className="border-t border-white/5 bg-navy-950">
      <div className="container-lg py-12">
        <div className="mb-10 grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500">
                <Stethoscope size={15} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Med<span className="text-cyan-400">Sync</span>
              </span>
            </div>

            <p className="max-w-xs text-sm leading-relaxed text-white/50">
              Clínica médica especializada em oferecer atendimento humanizado
              e de excelência em Fortaleza, CE.
            </p>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/60">
              Navegação
            </p>

            <div className="flex flex-col gap-2">
              {linksNavegacao.map(([href, label]) => (
                <button
                  key={href}
                  onClick={() => scrollTo(href)}
                  className="text-left text-sm text-white/50 transition-colors hover:text-cyan-400"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/60">
              Contato
            </p>

            <div className="flex flex-col gap-2.5">
              {contatosFooter.map((contato) => (
                <div
                  key={contato.texto}
                  className="flex items-center gap-2 text-sm text-white/50"
                >
                  <span className="shrink-0 text-cyan-400">
                    {contato.icon}
                  </span>
                  <span>{contato.texto}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-center text-xs text-white/40">
            © {new Date().getFullYear()} Clínica MedSync. Todos os direitos
            reservados. 
            <br /> Este é um projeto fictício desenvolvido para fins de portfólio. Não representa uma clínica real.
          </p>

          <Link
            to="/login"
            className="text-xs text-white/50 transition-colors hover:text-cyan-400"
          >
            Acesso ao sistema →
          </Link>
        </div>
      </div>
    </footer>
  )
}