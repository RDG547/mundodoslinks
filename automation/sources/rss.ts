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
  categoryName: string;
  categorySlug: string;
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

// Fallbacks de imagens de alta definição por categoria
const CATEGORY_COVERS = [
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
];

function getRandomCover(): string {
  return CATEGORY_COVERS[Math.floor(Math.random() * CATEGORY_COVERS.length)];
}

/**
 * Busca o link magnet direto navegando na página do post caso o RSS não tenha o magnet solto
 */
async function extractMagnetFromPage(pageUrl: string): Promise<string | null> {
  try {
    const res = await axios.get(pageUrl, {
      timeout: 8000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = res.data;
    const magnetMatch = html.match(/(magnet:\?xt=urn:btih:[^\s"<>']+)/i);
    if (magnetMatch) {
      return decodeHtmlEntities(magnetMatch[1]);
    }
    const torrentMatch = html.match(/(https?:\/\/[^\s"<>']+\.torrent)/i);
    if (torrentMatch) {
      return torrentMatch[1];
    }
  } catch {
    // Ignora se falhar
  }
  return null;
}

/**
 * Extrai lançamentos de múltiplos provedores com criação automática de categorias
 */
export async function fetchRssRepacks(maxItemsTotal: number = 100): Promise<RssRepackItem[]> {
  const items: RssRepackItem[] = [];

  const feeds = [
    { group: 'FitGirl' as const, url: 'https://fitgirl-repacks.site/feed/?paged=1', categoryName: 'Jogos Repacks', categorySlug: 'jogos-repacks' },
    { group: 'FitGirl' as const, url: 'https://fitgirl-repacks.site/feed/?paged=2', categoryName: 'Jogos Repacks', categorySlug: 'jogos-repacks' },
    { group: 'DODI' as const, url: 'https://dodi-repacks.site/feed/?paged=1', categoryName: 'Jogos Repacks', categorySlug: 'jogos-repacks' },
    { group: 'DODI' as const, url: 'https://dodi-repacks.site/feed/?paged=2', categoryName: 'Jogos Repacks', categorySlug: 'jogos-repacks' },
    { group: 'ElAmigos' as const, url: 'https://elamigos.site/feed/', categoryName: 'Jogos Indie', categorySlug: 'jogos-indie' },
    { group: 'FileHorse' as const, url: 'https://filehorse.com/feed/', categoryName: 'Softwares Livres', categorySlug: 'softwares-livres' },
    { group: 'PortableApps' as const, url: 'https://portableapps.com/node/feed', categoryName: 'Utilitários', categorySlug: 'utilitarios' },
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
        let magnetOrUrl = magnetMatch ? decodeHtmlEntities(magnetMatch[1]) : '';
        const htmlContent = contentMatch ? contentMatch[1] : '';

        if (IGNORED_TITLE_PATTERNS.some(p => p.test(rawTitle))) {
          continue;
        }

        const cleanedTitle = cleanTitle(rawTitle);

        if (cleanedTitle && itemLink) {
          // Se não encontrou o magnet no RSS XML, busca diretamente no HTML da página do post
          if (!magnetOrUrl || !magnetOrUrl.startsWith('magnet:')) {
            const pageMagnet = await extractMagnetFromPage(itemLink);
            magnetOrUrl = pageMagnet || itemLink;
          }

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

          if (!coverUrl) {
            coverUrl = getRandomCover();
          }

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
            categoryName: feed.categoryName,
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
