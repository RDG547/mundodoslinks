import axios from 'axios';

export interface HydraRepackItem {
  title: string;
  slug: string;
  uris: string[];
  uploadDate?: string;
  fileSize?: string;
  sourceGroup: 'FitGirl' | 'DODI' | 'SteamRip';
}

const HYDRA_FEEDS = [
  {
    group: 'FitGirl' as const,
    urls: [
      'https://raw.githubusercontent.com/hydralinks/sources/main/fitgirl.json',
      'https://hydralinks.cloud/sources/fitgirl.json'
    ]
  },
  {
    group: 'DODI' as const,
    urls: [
      'https://raw.githubusercontent.com/hydralinks/sources/main/dodi.json',
      'https://hydralinks.cloud/sources/dodi.json'
    ]
  },
  {
    group: 'SteamRip' as const,
    urls: [
      'https://raw.githubusercontent.com/hydralinks/sources/main/steamrip.json',
      'https://hydralinks.cloud/sources/steamrip.json'
    ]
  },
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Baixa os feeds JSON descentralizados do Hydra com suporte a User-Agent e fallbacks
 */
export async function fetchHydraRepacks(limitPerSource: number = 2): Promise<HydraRepackItem[]> {
  const allItems: HydraRepackItem[] = [];

  for (const feed of HYDRA_FEEDS) {
    let success = false;
    for (const url of feed.urls) {
      if (success) break;

      try {
        console.log(`🌐 Buscando lançamentos do grupo ${feed.group}... (${url})`);
        const response = await axios.get(url, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*'
          }
        });

        const rawList = response.data?.downloads || (Array.isArray(response.data) ? response.data : []);
        if (Array.isArray(rawList) && rawList.length > 0) {
          const recent = rawList.slice(0, limitPerSource);

          for (const item of recent) {
            const itemTitle = item.title || item.name;
            const uris = item.uris || (item.url ? [item.url] : item.magnet ? [item.magnet] : []);

            if (itemTitle && uris && uris.length > 0) {
              allItems.push({
                title: itemTitle,
                slug: generateSlug(`${itemTitle}-${feed.group}`),
                uris: uris,
                uploadDate: item.uploadDate || item.fileDate || new Date().toISOString(),
                fileSize: item.fileSize || item.file_size || 'N/A',
                sourceGroup: feed.group,
              });
            }
          }
          success = true;
        }
      } catch (err: any) {
        console.warn(`[WARN] Tativa na URL (${url}) falhou: ${err.message}`);
      }
    }
  }

  return allItems;
}
