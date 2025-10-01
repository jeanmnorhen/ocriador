-- ### ARQUIVO DE SETUP DO BANCO DE DADOS PARA O PROJETO "OCRIADOR" ###
-- Execute este script no seu editor de SQL do Supabase.

-- 1. Tabela de Projetos
-- Armazena a informação principal de cada animação.
CREATE TABLE IF NOT EXISTS projetos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  duracao_total INT DEFAULT 300, -- e.g., in frames
  palco_id UUID -- pode ser nulo inicialmente
);
COMMENT ON TABLE projetos IS 'Armazena cada projeto de animação.';

-- 2. Tabela de Palcos
-- Define os cenários com seus diferentes planos de fundo.
CREATE TABLE IF NOT EXISTS palcos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  plano_fundo_url TEXT,
  plano_meio_url TEXT,
  plano_principal_url TEXT,
  plano_frente_url TEXT
);
COMMENT ON TABLE palcos IS 'Define os cenários (palcos) e seus planos de imagem.';

-- Adiciona a referência de palco_id em projetos
ALTER TABLE projetos
ADD CONSTRAINT fk_palco
FOREIGN KEY (palco_id)
REFERENCES palcos(id)
ON DELETE SET NULL;

-- 3. Tabela de Personagens
-- Define os modelos de personagens com suas partes e pivôs.
CREATE TABLE IF NOT EXISTS personagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  sprite_id_cabeca TEXT,
  sprite_id_tronco TEXT,
  sprite_id_braco_esq TEXT,
  sprite_id_braco_dir TEXT,
  sprite_id_perna_esq TEXT,
  sprite_id_perna_dir TEXT,
  pontos_pivo JSONB -- Armazena todos os pontos de pivô em um único JSON
);
COMMENT ON TABLE personagens IS 'Modelos de personagens, suas partes e pontos de pivô.';

-- 4. Tabela de Objetos
-- Define objetos genéricos que podem ser usados na cena.
CREATE TABLE IF NOT EXISTS objetos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  sprite_id TEXT,
  movimento_permitido BOOLEAN DEFAULT TRUE
);
COMMENT ON TABLE objetos IS 'Objetos genéricos para uso nas animações.';

-- 5. Tabela de Keyframes
-- O coração da animação, armazena a pose de cada elemento em um ponto no tempo.
CREATE TYPE tipo_elemento AS ENUM ('personagem', 'objeto');

CREATE TABLE IF NOT EXISTS keyframes (
  id BIGSERIAL PRIMARY KEY,
  projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  tempo_frame INT NOT NULL,
  elemento_id UUID NOT NULL,
  tipo tipo_elemento NOT NULL,
  dados_pose JSONB NOT NULL -- {x, y, rotation, scale, z-index, parts: { ... }}
);
COMMENT ON TABLE keyframes IS 'Armazena a pose de um elemento em um determinado frame.';
-- Adiciona um índice para acelerar a busca de keyframes por projeto
CREATE INDEX IF NOT EXISTS idx_keyframes_projeto ON keyframes(projeto_id);


-- ### POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS) ###
-- Garante que os usuários só possam acessar seus próprios dados.

-- Habilita RLS para todas as tabelas
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE palcos ENABLE ROW LEVEL SECURITY;
ALTER TABLE personagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE objetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyframes ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela 'projetos'
CREATE POLICY "Usuários podem criar seus próprios projetos."
  ON projetos FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem ver seus próprios projetos."
  ON projetos FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar seus próprios projetos."
  ON projetos FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar seus próprios projetos."
  ON projetos FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para a tabela 'palcos'
CREATE POLICY "Usuários podem criar seus próprios palcos."
  ON palcos FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem ver seus próprios palcos."
  ON palcos FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar seus próprios palcos."
  ON palcos FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar seus próprios palcos."
  ON palcos FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para a tabela 'personagens'
CREATE POLICY "Usuários podem criar seus próprios personagens."
  ON personagens FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem ver seus próprios personagens."
  ON personagens FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar seus próprios personagens."
  ON personagens FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar seus próprios personagens."
  ON personagens FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para a tabela 'objetos'
CREATE POLICY "Usuários podem criar seus próprios objetos."
  ON objetos FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem ver seus próprios objetos."
  ON objetos FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar seus próprios objetos."
  ON objetos FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar seus próprios objetos."
  ON objetos FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para a tabela 'keyframes'
-- A lógica aqui é que se um usuário tem acesso a um projeto, ele tem acesso aos keyframes.
CREATE POLICY "Usuários podem criar keyframes para seus projetos."
  ON keyframes FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM projetos WHERE id = projeto_id));
CREATE POLICY "Usuários podem ver keyframes de seus projetos."
  ON keyframes FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM projetos WHERE id = projeto_id));
CREATE POLICY "Usuários podem atualizar keyframes de seus projetos."
  ON keyframes FOR UPDATE
  USING (auth.uid() = (SELECT user_id FROM projetos WHERE id = projeto_id));
CREATE POLICY "Usuários podem deletar keyframes de seus projetos."
  ON keyframes FOR DELETE
  USING (auth.uid() = (SELECT user_id FROM projetos WHERE id = projeto_id));
