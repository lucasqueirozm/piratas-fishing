-- Rodar no Supabase: SQL Editor → New query → colar e executar

CREATE TABLE IF NOT EXISTS orders (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  status        text          NOT NULL DEFAULT 'pending',
  customer      jsonb         NOT NULL,
  items         jsonb         NOT NULL,
  subtotal      numeric(10,2) NOT NULL,
  shipping      numeric(10,2) NOT NULL DEFAULT 0,
  total         numeric(10,2) NOT NULL,
  preference_id text,
  payment_id    text,
  mp_status     text,
  tracking_code text,
  created_at    timestamptz   NOT NULL DEFAULT now(),
  updated_at    timestamptz   NOT NULL DEFAULT now()
);

-- Índices para o painel admin (ordenar por data, filtrar por status)
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx     ON orders (status);

-- Bloquear acesso público (só o service_role key acessa)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Garantir acesso ao service_role (chave do servidor)
GRANT ALL PRIVILEGES ON TABLE orders TO service_role;

-- Adicionar coluna tracking_code em tabelas existentes (seguro rodar múltiplas vezes)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_code text;
