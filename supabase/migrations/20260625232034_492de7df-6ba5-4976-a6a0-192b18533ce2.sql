
-- Função para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- CLIENTES
CREATE TABLE public.clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  empresa text,
  telefone text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clientes TO anon, authenticated;
GRANT ALL ON public.clientes TO service_role;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public access clientes" ON public.clientes FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER trg_clientes_updated BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- MOTORES
CREATE TABLE public.motores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  marca text,
  modelo text,
  potencia text,
  tensao text,
  rpm text,
  polos text,
  frequencia text,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.motores TO anon, authenticated;
GRANT ALL ON public.motores TO service_role;
ALTER TABLE public.motores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public access motores" ON public.motores FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER trg_motores_updated BEFORE UPDATE ON public.motores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SERVICOS (catálogo)
CREATE TABLE public.servicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao text NOT NULL,
  preco_padrao numeric(12,2) NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.servicos TO anon, authenticated;
GRANT ALL ON public.servicos TO service_role;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public access servicos" ON public.servicos FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER trg_servicos_updated BEFORE UPDATE ON public.servicos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ORCAMENTOS
CREATE SEQUENCE public.orcamentos_numero_seq START 1000;

CREATE TABLE public.orcamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero integer NOT NULL DEFAULT nextval('public.orcamentos_numero_seq'),
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  motor_id uuid REFERENCES public.motores(id) ON DELETE SET NULL,
  motor_snapshot jsonb,
  cliente_snapshot jsonb,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  desconto numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('rascunho','pendente','aprovado','recusado')),
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER SEQUENCE public.orcamentos_numero_seq OWNED BY public.orcamentos.numero;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orcamentos TO anon, authenticated;
GRANT USAGE ON SEQUENCE public.orcamentos_numero_seq TO anon, authenticated;
GRANT ALL ON public.orcamentos TO service_role;
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public access orcamentos" ON public.orcamentos FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER trg_orcamentos_updated BEFORE UPDATE ON public.orcamentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ITENS DO ORCAMENTO
CREATE TABLE public.itens_orcamento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id uuid NOT NULL REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  servico_id uuid REFERENCES public.servicos(id) ON DELETE SET NULL,
  descricao text NOT NULL,
  quantidade numeric(12,2) NOT NULL DEFAULT 1,
  valor_unitario numeric(12,2) NOT NULL DEFAULT 0,
  valor_total numeric(12,2) NOT NULL DEFAULT 0,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.itens_orcamento TO anon, authenticated;
GRANT ALL ON public.itens_orcamento TO service_role;
ALTER TABLE public.itens_orcamento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public access itens" ON public.itens_orcamento FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_itens_orcamento_id ON public.itens_orcamento(orcamento_id);

-- CONFIGURACOES (single-row)
CREATE TABLE public.configuracoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_nome text,
  empresa_cnpj text,
  empresa_telefone text,
  empresa_email text,
  empresa_endereco text,
  logo_url text,
  rodape text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.configuracoes TO anon, authenticated;
GRANT ALL ON public.configuracoes TO service_role;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public access config" ON public.configuracoes FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER trg_config_updated BEFORE UPDATE ON public.configuracoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed catalogo padrão de serviços
INSERT INTO public.servicos (descricao, preco_padrao) VALUES
  ('Rebobinamento', 0),
  ('Troca de rolamentos', 0),
  ('Pintura', 0),
  ('Balanceamento', 0),
  ('Limpeza', 0),
  ('Revisão completa', 0),
  ('Usinagem', 0);

INSERT INTO public.configuracoes (empresa_nome, rodape) VALUES ('Sua Empresa', 'Orçamento válido por 15 dias.');
