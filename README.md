<div align="center">

<img src="https://img.shields.io/badge/MedSync-Sistema%20de%20Agendamento-06b6d4?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik00LjggMi40QTIuNCAyLjQgMCAwIDAgMi40IDQuOHYxNC40YTIuNCAyLjQgMCAwIDAgMi40IDIuNGgxNC40YTIuNCAyLjQgMCAwIDAgMi40LTIuNFY0LjhhMi40IDIuNCAwIDAgMC0yLjQtMi40SDQuOHoiLz48cGF0aCBkPSJNOCAxMmg4TTEyIDh2OCI+PC9wYXRoPjwvc3ZnPg==" alt="MedSync" />

# MedSync — Sistema de Agendamento para Clínicas

**Plataforma completa de agendamento médico com perfis para Paciente, Médico e Administrador.**

[![Node.js](https://img.shields.io/badge/Node.js-CommonJS-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=flat-square&logo=postgresql)](https://postgresql.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)

</div>

---

## 📋 Sobre o projeto

O **MedSync** é um sistema de agendamento médico fullstack desenvolvido como projeto de portfólio. A plataforma conecta pacientes, médicos e administradores em um ambiente moderno, seguro e intuitivo.

O sistema conta com uma **landing page institucional** que apresenta a clínica, suas especialidades e o processo de agendamento — além do **sistema interno** completo para os três perfis de usuário.

---

## ✨ Funcionalidades

### 👤 Paciente
- Criar conta e fazer login
- Visualizar horários disponíveis com filtro por especialidade e médico
- Agendar consultas com observações
- Cancelar consultas
- Consultar histórico de atendimentos
- Alterar dados pessoais e senha
- Receber e-mails de confirmação e cancelamento

### 🩺 Médico
- Visualizar agenda por período
- Ver pacientes agendados do dia
- Confirmar e concluir consultas com anotações médicas
- Definir horários de atendimento por dia da semana
- Gerenciar disponibilidade (vigência, intervalo entre slots)

### 🛡️ Administrador
- Cadastrar e inativar médicos
- Gerenciar pacientes
- Listar e cancelar consultas com motivo
- Relatório mensal de consultas (por status, especialidade e taxa de cancelamento)
- Relatório de desempenho por médico (taxa de ocupação)

---

## 🛠️ Stack

### Backend
| Tecnologia | Uso |
|---|---|
| Node.js (CommonJS) | Runtime |
| Express 5 | Framework HTTP |
| Knex.js | Query builder e migrations |
| PostgreSQL | Banco de dados |
| JWT | Autenticação |
| bcrypt | Criptografia de senhas |
| Nodemailer + Mailtrap | Envio de e-mails transacionais |

### Frontend
| Tecnologia | Uso |
|---|---|
| React 18 | Interface |
| Vite | Build tool |
| TypeScript | Tipagem |
| Tailwind CSS 3 | Estilização |
| React Router DOM 6 | Roteamento |
| React Hook Form + Zod | Formulários e validação |
| Axios | Requisições HTTP |

---

## 🗂️ Estrutura do projeto

```
medsync/
├── backend/
│   ├── src/
│   │   ├── controllers/        # Lógica de cada rota
│   │   ├── database/
│   │   │   ├── connection.js   # Configuração do Knex
│   │   │   └── querys/         # Funções de acesso ao banco
│   │   ├── middlewares/        # Auth JWT e autorização por perfil
│   │   ├── routers/            # Definição das rotas
│   │   ├── services/           # emailService (Nodemailer)
│   │   └── server.js
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── api/                # Serviços de comunicação com o backend
    │   ├── components/
    │   │   ├── landing/        # Navbar e seções da landing page
    │   │   ├── layout/         # AppLayout com sidebar responsiva
    │   │   └── ui/             # Componentes reutilizáveis (Button, Modal, Table...)
    │   ├── contexts/           # AuthContext e ToastContext
    │   ├── pages/
    │   │   ├── auth/           # Login, Registro, Recuperar/Resetar Senha
    │   │   ├── paciente/       # Dashboard, Agendar, Consultas, Perfil
    │   │   ├── medico/         # Dashboard, Agenda, Consultas, Horários, Perfil
    │   │   └── admin/          # Dashboard, Médicos, Pacientes, Consultas, Relatórios
    │   ├── routes/             # ProtectedRoute com controle por perfil
    │   ├── types/              # Tipagens TypeScript
    │   └── utils/              # Helpers de formatação e utilitários
    └── .env.example
```

---

## 🚀 Como rodar localmente

### Pré-requisitos
- Node.js 18+
- PostgreSQL rodando localmente

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/medsync.git
cd medsync
```

### 2. Configure e rode o backend

```bash
cd backend
npm install
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=medsync
JWT_PWD=sua_chave_jwt_secreta
FRONTEND_URL=http://localhost:5173
MAILTRAP_USER=seu_user_mailtrap
MAILTRAP_PASS=sua_senha_mailtrap
```

Crie o banco e rode o script SQL:

```bash
# Crie o banco no PostgreSQL
psql -U seu_usuario -c "CREATE DATABASE medsync;"

# Rode o script de criação das tabelas
psql -U seu_usuario -d medsync -f banco-clinica.sql
```

Inicie o servidor:

```bash
npm run dev
```

### 3. Configure e rode o frontend

```bash
cd ../frontend
npm install
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev
```

A aplicação estará disponível em **http://localhost:5173**.

---

## 🗄️ Banco de dados

```
usuarios           — base para todos os perfis (paciente, medico, admin)
pacientes          — dados complementares do paciente
medicos            — dados complementares do médico
especialidades     — tabela auxiliar de especialidades
horarios_atendimento — blocos de disponibilidade semanal do médico
consultas          — registro central de agendamentos
notificacoes_email — log de e-mails disparados
tokens_recuperacao — tokens para redefinição de senha
```

---

## 🔐 Autenticação e autorização

- Login retorna um token **JWT** com `id`, `nome` e `tipo` do usuário
- O token é enviado em todas as requisições via header `Authorization: Bearer <token>`
- Rotas protegidas verificam o token via middleware `auth`
- Cada perfil tem acesso apenas às suas próprias rotas (`/pacientes/*`, `/medicos/*`, `/admin/*`)
- No frontend, rotas são protegidas por `ProtectedRoute` com verificação de tipo

---

## 📧 E-mails transacionais

O sistema envia e-mails automáticos nos seguintes eventos:

| Evento | Destinatário |
|---|---|
| Consulta agendada | Paciente |
| Consulta confirmada pelo médico | Paciente |
| Consulta cancelada pelo paciente | Paciente |
| Consulta cancelada pelo admin | Paciente + Médico |
| Solicitação de recuperação de senha | Paciente |

Configurado com **Mailtrap** para ambiente de desenvolvimento (sandbox).

---

## 📸 Telas

| Landing Page | Dashboard Paciente | Agenda Médico | Relatórios Admin |
|---|---|---|---|
| Página institucional da clínica | Próximas consultas e atalhos | Visualização por período | Métricas mensais completas |

---

## 👨‍💻 Autor

Desenvolvido por **Gabriel** como projeto de portfólio fullstack.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Conectar-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/gamoorimr)
[![GitHub](https://img.shields.io/badge/GitHub-Perfil-181717?style=flat-square&logo=github)](https://github.com/gAmoorim)