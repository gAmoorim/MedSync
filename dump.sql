-- Banco de Dados

-- =======================
-- USUARIOS
-- =======================

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('paciente', 'medico', 'admin')),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ===============================
-- ESPECIALIDADES
-- ===============================

CREATE TABLE especialidades (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);

-- ============================================================
-- MEDICOS
-- Dados complementares dos usuários do tipo 'medico'
-- ============================================================

CREATE TABLE medicos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    especialidade_id INTEGER NOT NULL REFERENCES especialidades(id) ON DELETE RESTRICT,
    crm VARCHAR(20) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PACIENTES
-- Dados complementares dos usuários do tipo 'paciente'
-- ============================================================

CREATE TABLE pacientes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    data_nascimento  DATE NOT NULL,
    atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- HORARIOS_ATENDIMENTO
-- ============================================================

CREATE TABLE horarios_atendimento (
    id SERIAL PRIMARY KEY,
    medico_id INTEGER NOT NULL REFERENCES medicos(id) ON DELETE CASCADE,
    dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    intervalo_minutos SMALLINT NOT NULL CHECK (intervalo_minutos > 0),
    data_inicio_vigencia  DATE NOT NULL,
    data_fim_vigencia DATE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_hora_fim_maior CHECK (hora_fim > hora_inicio),
    CONSTRAINT chk_vigencia CHECK (data_fim_vigencia IS NULL OR data_fim_vigencia >= data_inicio_vigencia)
);


-- ============================================================
-- CONSULTAS
-- Registro central de cada agendamento realizado
-- ============================================================

CREATE TABLE consultas (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE RESTRICT,
    medico_id INTEGER NOT NULL REFERENCES medicos(id) ON DELETE RESTRICT,
    horario_atendimento_id INTEGER  REFERENCES horarios_atendimento(id) ON DELETE SET NULL,
    data DATE NOT NULL,
    hora_inicio TIME  NOT NULL,
    hora_fim TIME  NOT NULL,
    status  VARCHAR(20)  NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'confirmada', 'concluida', 'cancelada')),
    observacoes TEXT,
    anotacoes_medico TEXT,
    motivo_cancelamento TEXT,
    data_hora_conclusao TIMESTAMP,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_hora_fim_consulta CHECK (hora_fim > hora_inicio)
);

-- ============================================================
-- NOTIFICACOES_EMAIL
-- Log de todos os e-mails disparados pelo sistema
-- ============================================================

CREATE TABLE notificacoes_email (
    id            SERIAL PRIMARY KEY,
    consulta_id   INTEGER      REFERENCES consultas(id) ON DELETE SET NULL,
    destinatario  VARCHAR(150) NOT NULL,
    tipo          VARCHAR(50)  NOT NULL CHECK (tipo IN ('confirmacao_agendamento', 'confirmacao_consulta', 'cancelamento_paciente', 'cancelamento_admin', 'lembrete')),
    enviado       BOOLEAN      NOT NULL DEFAULT FALSE,
    enviado_em    TIMESTAMP,
    erro          TEXT,
    criado_em     TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- =====================
-- DADOS INICIAIS
-- =====================

-- Especialidades médicas comuns
INSERT INTO especialidades (nome) VALUES
    ('Clínica Geral'),
    ('Cardiologia'),
    ('Dermatologia'),
    ('Ortopedia'),
    ('Pediatria'),
    ('Ginecologia'),
    ('Neurologia'),
    ('Oftalmologia'),
    ('Psiquiatria'),
    ('Urologia');

INSERT INTO usuarios (nome, email, senha, tipo) VALUES
    ('Administrador', 'admin@clinica.com', 'senhahash', 'admin');