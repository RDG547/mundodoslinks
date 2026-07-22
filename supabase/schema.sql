-- ============================================================
-- SCHEMAS & DATABASE INITIALIZATION FOR MUNDO DOS LINKS
-- PostgreSQL / Supabase
-- ============================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela Principal de Publicações (Posts)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_url TEXT,
  developer TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('imported', 'pending_review', 'approved', 'published', 'rejected')) DEFAULT 'pending_review',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Links de Download
CREATE TABLE IF NOT EXISTS download_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  version TEXT,
  original_url TEXT NOT NULL,
  public_url TEXT NOT NULL, -- Link encurtado via Softurl
  shortener_provider TEXT DEFAULT 'softurl',
  status TEXT CHECK (status IN ('active', 'broken', 'pending')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Registro de Divulgações no Telegram
CREATE TABLE IF NOT EXISTS telegram_publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  chat_id TEXT NOT NULL,
  message_id TEXT,
  status TEXT DEFAULT 'sent',
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices para alta performance de consulta
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_download_links_post_id ON download_links(post_id);

-- RLS (Row Level Security) - Leitura pública para posts publicados
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_publications ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso Público para leitura (com remoção preventiva para idempotência)
DROP POLICY IF EXISTS "Leitura pública de posts publicados" ON posts;
CREATE POLICY "Leitura pública de posts publicados" ON posts
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Leitura pública de categorias" ON categories;
CREATE POLICY "Leitura pública de categorias" ON categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Leitura pública de links de download ativos" ON download_links;
CREATE POLICY "Leitura pública de links de download ativos" ON download_links
  FOR SELECT USING (status = 'active');

-- Políticas de Inserção e Atualização para Automação / API
DROP POLICY IF EXISTS "Inserção de posts" ON posts;
CREATE POLICY "Inserção de posts" ON posts
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Atualização de posts" ON posts;
CREATE POLICY "Atualização de posts" ON posts
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Inserção de links de download" ON download_links;
CREATE POLICY "Inserção de links de download" ON download_links
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Inserção de publicações telegram" ON telegram_publications;
CREATE POLICY "Inserção de publicações telegram" ON telegram_publications
  FOR INSERT WITH CHECK (true);

-- Inserções Iniciais de Teste (Categorias Padrão)
INSERT INTO categories (name, slug) VALUES
  ('Softwares Libres', 'softwares-livres'),
  ('Jogos Indiegames', 'jogos-indie'),
  ('Utilitários & Ferramentas', 'utilitarios'),
  ('Mídias Autorizadas', 'midias-autorizadas')
ON CONFLICT (slug) DO NOTHING;
