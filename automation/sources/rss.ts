import axios from 'axios';
import { cleanTitle, translateToPtBr, stripHtml, decodeHtmlEntities } from '../services/translator';

export interface RssRepackItem {
  title: string;
  slug: string;
  link: string;
  magnetOrUrl: string;
  pubDate: string;
  coverUrl?: string;
  excerpt?: string;
  content?: string;
  categorySlug: 'jogos-repacks' | 'jogos-indie' | 'softwares-livres' | 'utilitarios';
  sourceGroup: 'FitGirl' | 'DODI' | 'ElAmigos' | 'FileHorse' | 'PortableApps';
}

function generateSlug(title: string, group: string): string {
  const clean = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `${clean}-${group.toLowerCase()}`;
}

const IGNORED_TITLE_PATTERNS = [
  /upcoming\s+repacks/i,
  /weekly\s+digest/i,
  /updates\s+digest/i,
  /site\s+news/i,
  /modding\s+guide/i,
  /a\s+call\s+for\s+donations/i,
];

/**
 * Extrai lançamentos de múltiplos provedores (FitGirl, DODI, ElAmigos, FileHorse, PortableApps)
 */
export async function fetchRssRepacks(maxItemsTotal: number = 100): Promise<RssRepackItem[]> {
  const items: RssRepackItem[] = [];

  const feeds = [
    // Jogos (WordPress paginado)
    { group: 'FitGirl' as const, url: 'https://fitgirl-repacks.site/feed/?paged=1', categorySlug: 'jogos-repacks' as const },
    { group: 'FitGirl' as const, url: 'https://fitgirl-repacks.site/feed/?paged=2', categorySlug: 'jogos-repacks' as const },
    { group: 'DODI' as const, url: 'https://dodi-repacks.site/feed/?paged=1', categorySlug: 'jogos-repacks' as const },
    { group: 'DODI' as const, url: 'https://dodi-repacks.site/feed/?paged=2', categorySlug: 'jogos-repacks' as const },
    { group: 'ElAmigos' as const, url: 'https://elamigos.site/feed/', categorySlug: 'jogos-indie' as const },
    // Softwares & Utilitários
    { group: 'FileHorse' as const, url: 'https://filehorse.com/feed/', categorySlug: 'softwares-livres' as const },
    { group: 'PortableApps' as const, url: 'https://portableapps.com/node/feed', categorySlug: 'utilitarios' as const },
  ];

  for (const feed of feeds) {
    if (items.length >= maxItemsTotal) break;

    try {
      console.log(`🌐 Lendo feed de ${feed.group}... (${feed.url})`);
      const response = await axios.get(feed.url, {
        timeout: 12000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/xml, application/xml, application/rss+xml, */*'
        }
      });

      const xml = response.data;
      const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

      for (const itemXml of itemMatches) {
        if (items.length >= maxItemsTotal) break;

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

        if (IGNORED_TITLE_PATTERNS.some(p => p.test(rawTitle))) {
          continue;
        }

        const cleanedTitle = cleanTitle(rawTitle);

        if (cleanedTitle && itemLink) {
          // Extrai capa do HTML ou Steam App ID
          let coverUrl: string | undefined = undefined;
          const steamAppMatch = htmlContent.match(/steamstatic\.com\/(?:store_item_assets\/)?steam\/apps\/(\d+)/i) ||
                                htmlContent.match(/store_trailers\/(\d+)/i);
          if (steamAppMatch) {
            const appId = steamAppMatch[1];
            coverUrl = `https://shared.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`;
          } else {
            const decodedHtml = decodeHtmlEntities(htmlContent);
            const imgMatch = decodedHtml.match(/<img[^>]+src=["'](https?:\/\/[^"'\s]+)["']/i);
            if (imgMatch && !imgMatch[1].includes('torrent-stats') && !imgMatch[1].includes('icon-32x32')) {
              coverUrl = imgMatch[1];
            }
          }

          // Converte HTML em texto limpo e traduz para PT-BR
          const textClean = stripHtml(htmlContent);
          const ptExcerpt = translateToPtBr(textClean.substring(0, 220)) + '...';
          const ptContent = translateToPtBr(textClean.substring(0, 1500));

          items.push({
            title: cleanedTitle,
            slug: generateSlug(cleanedTitle, feed.group),
            link: itemLink,
            magnetOrUrl: magnetOrUrl,
            pubDate: pubDate,
            coverUrl,
            excerpt: ptExcerpt,
            content: ptContent,
            categorySlug: feed.categorySlug,
            sourceGroup: feed.group,
          });
        }
      }
    } catch (err: any) {
      console.warn(`[WARN] Falha ao consultar feed ${feed.group}: ${err.message}`);
    }
  }

  return items;
}
