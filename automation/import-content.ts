import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { fetchHydraRepacks } from './sources/hydra';
import { fetchRssRepacks } from './sources/rss';
import { fetchGameMetadata, decodeHtmlEntities } from './services/rawg';

// Leitura das Chaves de Ambiente enviadas pelo GitHub Secrets / .env.local
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SOFTURL_API_TOKEN = process.env.SOFTURL_API_TOKEN || '';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mundodoslinks.vercel.app';

// Helper para evitar estouro de limite de requisições (Rate Limit)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Envia uma URL/Magnet para encurtamento na API do Softurl
 */
async function encurtarUrl(originalUrl: string): Promise<string> {
  if (!SOFTURL_API_TOKEN || SOFTURL_API_TOKEN === 'mock_softurl_token') {
    return originalUrl;
  }

  try {
    const encodedUrl = encodeURIComponent(originalUrl);
    const endpoint = `https://softurl.in/api?api=${SOFTURL_API_TOKEN}&url=${encodedUrl}`;
    const response = await axios.get(endpoint, { timeout: 10000 });

    if (response.data && response.data.status === 'success' && response.data.shortenedUrl) {
      return response.data.shortenedUrl;
    }
  } catch (err: any) {
    console.warn(`[WARN] Falha ao encurtar link: ${err.message}. Mantendo URL original.`);
  }
  return originalUrl;
}

/**
 * Notifica o canal do Telegram via Bot API
 */
async function notificarTelegram(titulo: string, slug: string, linkEncurtado: string, grupo: string) {
  if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN === 'mock_telegram_token' || !TELEGRAM_CHAT_ID) {
    console.log(`[TELEGRAM] Notificação de "${titulo}" ignorada (tokens de teste ativados).`);
    return;
  }

  try {
    const postUrl = `${SITE_URL}/post/${slug}`;
    const mensagem = 
`🚀 *NOVO REPACK DISPONÍVEL!*

📦 *${titulo}*
🏷️ *Grupo:* ${grupo}

⬇️ *Link Direto de Download / Magnet:*
${linkEncurtado}

🔗 *Acesse a publicação completa:*
${postUrl}`;

    const endpoint = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(endpoint, {
      chat_id: TELEGRAM_CHAT_ID,
      text: mensagem,
      parse_mode: 'Markdown',
      disable_web_page_preview: false,
    });
    console.log(`[TELEGRAM] Notificação enviada com sucesso para: ${titulo}`);
  } catch (err: any) {
    console.error(`[ERROR] Falha ao disparar mensagem no Telegram:`, err.response?.data || err.message);
  }
}

/**
 * Função principal do Pipeline de Importação Automatizada
 */
async function runImportPipeline() {
  console.log('🤖 Iniciando esteira automatizada de jogos e repacks (Hydra, Feeds RSS, Steam & RAWG API)...');

  // 1. Tenta buscar repacks da Hydra ou canal RSS como fallback
  let itemsToProcess = await fetchHydraRepacks(2);

  if (itemsToProcess.length === 0) {
    console.log('🔄 Alternando para ingestão via Feeds RSS Oficiais...');
    const rssItems = await fetchRssRepacks(3);
    itemsToProcess = rssItems.map(r => ({
      title: decodeHtmlEntities(r.title),
      slug: r.slug,
      uris: [r.magnetOrUrl],
      sourceGroup: r.sourceGroup,
    }));
  }

  if (itemsToProcess.length === 0) {
    console.log('ℹ️ Nenhum novo item encontrado nas fontes no momento.');
    return;
  }

  const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && SUPABASE_SERVICE_ROLE_KEY !== 'dummy-service-role-key')
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

  for (const item of itemsToProcess) {
    const cleanTitle = decodeHtmlEntities(item.title);
    console.log(`\n🔍 Processando item: "${cleanTitle}" [${item.sourceGroup}]`);

    // 2. Se o Supabase estiver conectado, checa se o post já existe
    if (supabase) {
      const { data: postExistente } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', item.slug)
        .maybeSingle();

      if (postExistente) {
        console.log(`[SKIP] O post "${cleanTitle}" já existe no banco de dados.`);
        continue;
      }
    }

    // 3. Busca capas e metadados na Steam API / RAWG API
    console.log(`🎨 Enriquecendo metadados e capa via Steam / RAWG API...`);
    const gameInfo = await fetchGameMetadata(cleanTitle);

    const title = gameInfo?.title || cleanTitle;
    const excerpt = gameInfo?.excerpt || `Repack por ${item.sourceGroup}. Download verificado.`;
    const content = gameInfo?.content || `Download verificado de ${cleanTitle} liberado pelo grupo ${item.sourceGroup}.`;
    const coverUrl = gameInfo?.coverUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80';
    const developer = gameInfo?.developer || item.sourceGroup;
    const downloadUrl = item.uris[0];

    // 4. Encurta o link via Softurl API
    console.log('🔗 Solicitando link monetizado na API do Softurl...');
    const publicUrl = await encurtarUrl(downloadUrl);
    await sleep(500);

    // 5. Salva no Supabase (se configurado)
    let postId = `local-${Date.now()}`;
    if (supabase) {
      const { data: novoPost, error: errPost } = await supabase
        .from('posts')
        .insert({
          title,
          slug: item.slug,
          excerpt,
          content,
          cover_url: coverUrl,
          developer,
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (errPost || !novoPost) {
        console.error(`[ERROR] Falha ao inserir post no Supabase:`, errPost);
        continue;
      }

      postId = novoPost.id;

      const { error: errLink } = await supabase.from('download_links').insert({
        post_id: postId,
        version: item.sourceGroup,
        original_url: downloadUrl,
        public_url: publicUrl,
        shortener_provider: 'softurl',
        status: 'active',
      });

      if (errLink) {
        console.error(`[ERROR] Falha ao salvar link de download:`, errLink);
      } else {
        console.log(`✅ Registro salvo no Supabase com sucesso (ID: ${postId})`);
      }
    } else {
      console.log(`ℹ️ [DRY RUN] Item processado com sucesso:`);
      console.log(`   - Título: ${title}`);
      console.log(`   - Capa Captação: ${coverUrl}`);
      console.log(`   - Link: ${publicUrl}`);
    }

    // 6. Notifica o Telegram
    await notificarTelegram(title, item.slug, publicUrl, item.sourceGroup);

    await sleep(1000);
  }

  console.log('\n🎉 Esteira de automação concluída com sucesso!');
}

runImportPipeline().catch((err) => {
  console.error('❌ Erro crítico no pipeline:', err);
  process.exit(1);
});
