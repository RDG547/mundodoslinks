import axios from 'axios';

export interface RssRepackItem {
  title: string;
  slug: string;
  link: string;
  magnetOrUrl: string;
  pubDate: string;
  coverUrl?: string;
  excerpt?: string;
  content?: string;
  sourceGroup: 'FitGirl' | 'DODI';
}

/**
 * Decodifica entidades HTML comuns como &#8211; e &#038;
 */
export function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#8211;/g, '–')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Limpa o título do jogo removendo prefixos de id (ex: 2147-, 756-), sufixos de grupo ([DODI Repack])
 */
export function cleanGameTitle(rawTitle: string): string {
  let title = decodeHtmlEntities(rawTitle);
  title = title
    .replace(/^\d+[-_\s]*/, '') // Remove 2147- ou 756-
    .replace(/\[\s*(DODI|FitGirl)\s*Repack\s*\]/gi, '') // Remove [DODI Repack]
    .replace(/\(From\s*[\d.]+\s*GB\)/gi, '') // Remove (From 90.7 GB)
    .trim();
  return title;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Títulos a ignorar por não serem lançamentos de jogos
 */
const IGNORED_TITLE_PATTERNS = [
  /upcoming\s+repacks/i,
  /weekly\s+digest/i,
  /updates\s+digest/i,
  /site\s+news/i,
  /modding\s+guide/i,
];

/**
 * Extrai TODOS os lançamentos dos feeds RSS oficiais do FitGirl e DODI com capas e descrições completas
 */
export async function fetchRssRepacks(limitPerSource: number = 30): Promise<RssRepackItem[]> {
  const items: RssRepackItem[] = [];

  const feeds = [
    { group: 'FitGirl' as const, url: 'https://fitgirl-repacks.site/feed/' },
    { group: 'DODI' as const, url: 'https://dodi-repacks.site/feed/' },
  ];

  for (const feed of feeds) {
    try {
      console.log(`🌐 Lendo todos os lançamentos do feed RSS oficial de ${feed.group}... (${feed.url})`);
      const response = await axios.get(feed.url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/xml, application/xml, application/rss+xml, */*'
        }
      });

      const xml = response.data;
      const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

      let count = 0;
      for (const itemXml of itemMatches) {
        if (count >= limitPerSource) break;

        const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
        const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
        const pubDateMatch = itemXml.match(/<pubDate>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/pubDate>/i);
        const contentMatch = itemXml.match(/<content:encoded>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content:encoded>/i) ||
                             itemXml.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
        const magnetMatch = itemXml.match(/(magnet:\?xt=urn:btih:[^\s"<>']+)/i);

        const rawTitle = titleMatch ? titleMatch[1].trim() : '';
        const itemLink = linkMatch ? linkMatch[1].trim() : '';
        const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();
        const magnetOrUrl = magnetMatch ? magnetMatch[1] : itemLink;
        const htmlContent = contentMatch ? contentMatch[1] : '';

        // Ignora posts que não sejam lançamentos de jogos
        if (IGNORED_TITLE_PATTERNS.some(p => p.test(rawTitle))) {
          continue;
        }

        const cleanedTitle = cleanGameTitle(rawTitle);

        if (cleanedTitle && itemLink) {
          // 1. Tenta extrair a capa original diretamente do HTML do post RSS
          let coverUrl: string | undefined = undefined;
          
          // Checa se há referência ao Steam App ID na URL do trailer ou imagens
          const steamAppMatch = htmlContent.match(/steamstatic\.com\/(?:store_item_assets\/)?steam\/apps\/(\d+)/i) ||
                                htmlContent.match(/store_trailers\/(\d+)/i);
          if (steamAppMatch) {
            const appId = steamAppMatch[1];
            coverUrl = `https://shared.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`;
          } else {
            // Procura a primeira imagem válida no HTML
            const imgMatch = htmlContent.match(/<img[^>]+src=["'](https?:\/\/[^"'\s]+)["']/i);
            if (imgMatch && !imgMatch[1].includes('torrent-stats') && !imgMatch[1].includes('icon-32x32')) {
              coverUrl = imgMatch[1];
            }
          }

          // 2. Extrai parágrafos de descrição limpos do HTML
          const textParagraphs = htmlContent
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

          const excerpt = textParagraphs.substring(0, 200) + '...';

          items.push({
            title: cleanedTitle,
            slug: generateSlug(`${cleanedTitle}-${feed.group}`),
            link: itemLink,
            magnetOrUrl: magnetOrUrl,
            pubDate: pubDate,
            coverUrl,
            excerpt,
            content: textParagraphs.substring(0, 1000),
            sourceGroup: feed.group,
          });
          count++;
        }
      }
    } catch (err: any) {
      console.warn(`[WARN] Falha ao consultar feed RSS ${feed.group}: ${err.message}`);
    }
  }

  return items;
}
