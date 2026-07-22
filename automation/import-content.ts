import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fetchHydraRepacks } from './sources/hydra';
import { fetchRssRepacks, RssRepackItem } from './sources/rss';
import { fetchGameMetadata, decodeHtmlEntities } from './services/rawg';

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

// Leitura das Chaves de Ambiente enviadas pelo GitHub Secrets / .env.local
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SOFTURL_API_TOKEN = process.env.SOFTURL_API_TOKEN || '';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mundodoslinks.vercel.app';
const TELEGRAM_CHANNEL_URL = 'https://t.me/MundodosLinksPosts';

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
    console.log(`[TELEGRAM] Notificação de "${titulo}" enviada para simulação (Canal: ${TELEGRAM_CHANNEL_URL}).`);
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
${postUrl}

📢 *Canal Oficial:* ${TELEGRAM_CHANNEL_URL}`;

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

  let itemsToProcess = await fetchHydraRepacks(10);

  if (itemsToProcess.length === 0) {
    console.log('🔄 Alternando para ingestão completa via Feeds RSS Oficiais...');
    const rssItems: RssRepackItem[] = await fetchRssRepacks(30);
    itemsToProcess = rssItems.map(r => ({
      title: decodeHtmlEntities(r.title),
      slug: r.slug,
      uris: [r.magnetOrUrl],
      sourceGroup: r.sourceGroup,
      coverUrl: r.coverUrl,
      excerpt: r.excerpt,
      content: r.content,
    }));
  }

  if (itemsToProcess.length === 0) {
    console.log('ℹ️ Nenhum novo item encontrado nas fontes no momento.');
    return;
  }

  const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

  for (const item of itemsToProcess as any[]) {
    const cleanTitle = decodeHtmlEntities(item.title);
    console.log(`\n🔍 Processando item: "${cleanTitle}" [${item.sourceGroup}]`);

    // 1. Busca capas e metadados na Steam API / RAWG API se a capa do RSS não veio definida
    let coverUrl = item.coverUrl;
    let excerpt = item.excerpt;
    let content = item.content;
    let developer = item.sourceGroup;
    let title = cleanTitle;

    if (!coverUrl || coverUrl.includes('unsplash')) {
      console.log(`🎨 Enriquecendo metadados e capa via Steam / RAWG API...`);
      const gameInfo = await fetchGameMetadata(cleanTitle);
      if (gameInfo) {
        title = gameInfo.title || cleanTitle;
        coverUrl = gameInfo.coverUrl;
        excerpt = excerpt || gameInfo.excerpt;
        content = content || gameInfo.content;
        developer = gameInfo.developer || item.sourceGroup;
      }
    }

    coverUrl = coverUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80';
    excerpt = excerpt || `Repack verificado do jogo ${cleanTitle} por ${item.sourceGroup}.`;
    content = content || `Download verificado de ${cleanTitle} com alta velocidade. Liberado pelo grupo ${item.sourceGroup}.`;
    const downloadUrl = item.uris[0];

    // 2. Encurta o link via Softurl API
    console.log('🔗 Solicitando link monetizado na API do Softurl...');
    const publicUrl = await encurtarUrl(downloadUrl);
    await sleep(500);

    // 3. Salva ou atualiza no Supabase (se configurado)
    let postId = `local-${Date.now()}`;
    if (supabase) {
      // Checa se o post já existe no banco
      const { data: postExistente } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', item.slug)
        .maybeSingle();

      if (postExistente) {
        console.log(`🔄 [UPDATE] Atualizando registro existente no Supabase ID: ${postExistente.id}`);
        await supabase
          .from('posts')
          .update({
            title,
            excerpt,
            content,
            cover_url: coverUrl,
            developer,
            updated_at: new Date().toISOString(),
          })
          .eq('id', postExistente.id);

        postId = postExistente.id;

        // Atualiza link de download
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
            shortener_provider: 'softurl',
            status: 'active',
          });
        }

        console.log(`✅ Registro atualizado com sucesso no Supabase.`);
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
            status: 'published',
            published_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (errPost || !novoPost) {
          console.error(`[ERROR] Falha ao inserir post no Supabase:`, errPost?.message || errPost);
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
          console.error(`[ERROR] Falha ao salvar link de download:`, errLink?.message || errLink);
        } else {
          console.log(`✅ Novo registro inserido no Supabase com sucesso (ID: ${postId})`);
        }

        // Notifica o Telegram apenas para novos posts inseridos
        await notificarTelegram(title, item.slug, publicUrl, item.sourceGroup);
      }
    } else {
      console.log(`ℹ️ [DRY RUN] Item processado com sucesso:`);
      console.log(`   - Título: ${title}`);
      console.log(`   - Capa Captação: ${coverUrl}`);
      console.log(`   - Link: ${publicUrl}`);
    }

    await sleep(1000);
  }

  console.log('\n🎉 Esteira de automação concluída com sucesso!');
}

runImportPipeline().catch((err) => {
  console.error('❌ Erro crítico no pipeline:', err);
  process.exit(1);
});
