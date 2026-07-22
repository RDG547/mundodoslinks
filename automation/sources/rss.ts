import axios from 'axios';

export interface RssRepackItem {
  title: string;
  slug: string;
  link: string;
  magnetOrUrl: string;
  pubDate: string;
  sourceGroup: 'FitGirl' | 'DODI';
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
 * Extrai os itens mais recentes dos feeds RSS oficiais do FitGirl e DODI
 */
export async function fetchRssRepacks(limitPerSource: number = 3): Promise<RssRepackItem[]> {
  const items: RssRepackItem[] = [];

  const feeds = [
    { group: 'FitGirl' as const, url: 'https://fitgirl-repacks.site/feed/' },
    { group: 'DODI' as const, url: 'https://dodi-repacks.site/feed/' },
  ];

  for (const feed of feeds) {
    try {
      console.log(`🌐 Lendo feed RSS oficial de ${feed.group}... (${feed.url})`);
      const response = await axios.get(feed.url, {
        timeout: 10000,
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
        const magnetMatch = itemXml.match(/(magnet:\?xt=urn:btih:[^\s"<>']+)/i);

        const rawTitle = titleMatch ? titleMatch[1].trim() : '';
        const itemLink = linkMatch ? linkMatch[1].trim() : '';
        const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();
        const magnetOrUrl = magnetMatch ? magnetMatch[1] : itemLink;

        if (rawTitle && itemLink) {
          items.push({
            title: rawTitle,
            slug: generateSlug(`${rawTitle}-${feed.group}`),
            link: itemLink,
            magnetOrUrl: magnetOrUrl,
            pubDate: pubDate,
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
