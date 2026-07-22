import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fetchRssRepacks, RssRepackItem } from './sources/rss';
import { fetchGameMetadata, decodeHtmlEntities } from './services/rawg';
import { cleanTitle, translateToPtBr } from './services/translator';

// Carrega variáveis do arquivo .env.local se estiver rodando via CLI local sem GitHub Actions
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    for (const line of envConfig.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...values] = trimmed.split('=');
        const val = values.join('=').trim();
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = val;
        }
      }
    }
  }
} catch {
  // Ignora se não houver .env.local
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Função principal do Pipeline de Importação Massiva com Tradução PT-BR e Links Diretos
 */
async function runImportPipeline() {
  console.log('🤖 Iniciando esteira de raspagem com links diretos, títulos limpos e tradução PT-BR...');

  const rssItems: RssRepackItem[] = await fetchRssRepacks(100);

  if (rssItems.length === 0) {
    console.log('ℹ️ Nenhum item encontrado nas fontes no momento.');
    return;
  }

  console.log(`\n📦 Total de itens capturados nas fontes: ${rssItems.length}`);

  const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

  // Carrega categorias do Supabase para vincular os posts
  const categoryMap = new Map<string, string>();
  if (supabase) {
    const { data: dbCategories } = await supabase.from('categories').select('id, slug');
    if (dbCategories) {
      for (const cat of dbCategories) {
        categoryMap.set(cat.slug, cat.id);
      }
    }
  }

  let countProcessed = 0;
  for (const item of rssItems) {
    countProcessed++;
    const formattedTitle = cleanTitle(item.title);
    console.log(`\n[${countProcessed}/${rssItems.length}] 🔍 Processando: "${formattedTitle}" [${item.sourceGroup}]`);

    let coverUrl = item.coverUrl;
    let excerpt = translateToPtBr(item.excerpt || '');
    let content = translateToPtBr(item.content || '');
    let developer = item.sourceGroup;
    let title = formattedTitle;

    if (!coverUrl || coverUrl.includes('unsplash')) {
      const gameInfo = await fetchGameMetadata(formattedTitle);
      if (gameInfo) {
        title = cleanTitle(gameInfo.title || formattedTitle);
        coverUrl = gameInfo.coverUrl;
        excerpt = excerpt || translateToPtBr(gameInfo.excerpt);
        content = content || translateToPtBr(gameInfo.content);
        developer = gameInfo.developer || item.sourceGroup;
      }
    }

    coverUrl = coverUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80';
    excerpt = excerpt || `Download verificado do aplicativo/jogo ${title} fornecido por ${item.sourceGroup}.`;
    content = content || `Download verificado de ${title} com alta velocidade. Liberado pelo provedor ${item.sourceGroup}.`;
    
    // 1. DESATIVADO LINK ENCURTADO POR ENQUANTO (Usando link direto/magnet)
    const downloadUrl = item.magnetOrUrl;
    const publicUrl = downloadUrl; 

    // Obtém a categoria
    const categoryId = categoryMap.get(item.categorySlug) || categoryMap.get('softwares-livres') || categoryMap.get('jogos-indie');

    // Salva ou Atualiza no Supabase
    let postId = `local-${Date.now()}`;
    if (supabase) {
      const { data: postExistente } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', item.slug)
        .maybeSingle();

      if (postExistente) {
        console.log(`🔄 [UPDATE] Atualizando registro no Supabase (ID: ${postExistente.id}) com título limpo e PT-BR...`);
        await supabase
          .from('posts')
          .update({
            title,
            excerpt,
            content,
            cover_url: coverUrl,
            developer,
            category_id: categoryId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', postExistente.id);

        postId = postExistente.id;

        const { data: linkExistente } = await supabase
          .from('download_links')
          .select('id')
          .eq('post_id', postId)
          .maybeSingle();

        if (linkExistente) {
          await supabase
            .from('download_links')
            .update({
              version: item.sourceGroup,
              original_url: downloadUrl,
              public_url: publicUrl,
            })
            .eq('id', linkExistente.id);
        } else {
          await supabase.from('download_links').insert({
            post_id: postId,
            version: item.sourceGroup,
            original_url: downloadUrl,
            public_url: publicUrl,
            shortener_provider: 'direct',
            status: 'active',
          });
        }
        console.log(`✅ Registro ${title} atualizado com sucesso!`);
      } else {
        const { data: novoPost, error: errPost } = await supabase
          .from('posts')
          .insert({
            title,
            slug: item.slug,
            excerpt,
            content,
            cover_url: coverUrl,
            developer,
            category_id: categoryId,
            status: 'published',
            published_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (errPost || !novoPost) {
          console.error(`[ERROR] Falha ao inserir no Supabase:`, errPost?.message || errPost);
          continue;
        }

        postId = novoPost.id;

        await supabase.from('download_links').insert({
          post_id: postId,
          version: item.sourceGroup,
          original_url: downloadUrl,
          public_url: publicUrl,
          shortener_provider: 'direct',
          status: 'active',
        });

        console.log(`✅ Novo registro ${title} inserido no Supabase (ID: ${postId})`);
      }
    } else {
      console.log(`ℹ️ [DRY RUN] Item processado: ${title}`);
    }

    await sleep(200);
  }

  console.log('\n🎉 Esteira concluída com sucesso!');
}

runImportPipeline().catch((err) => {
  console.error('❌ Erro crítico no pipeline:', err);
  process.exit(1);
});
