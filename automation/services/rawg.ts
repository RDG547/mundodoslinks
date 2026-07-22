import axios from 'axios';

export interface GameMetadata {
  title: string;
  excerpt: string;
  content: string;
  coverUrl: string;
  developer: string;
  categorySlug: string;
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
 * Busca capas e detalhes na Steam Store API (Livre, Gratuito e sem necessidade de API Key)
 */
async function fetchSteamMetadata(cleanQuery: string): Promise<GameMetadata | null> {
  try {
    const steamUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(cleanQuery)}&l=portuguese&cc=BR`;
    const response = await axios.get(steamUrl, { timeout: 7000 });

    if (response.data && response.data.items && response.data.items.length > 0) {
      const game = response.data.items[0];
      const appId = game.id;
      const headerCover = `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`;

      return {
        title: game.name || cleanQuery,
        excerpt: `Jogo oficial disponível no catálogo Steam. Lançamento e atualizações de PC.`,
        content: `Confira ${game.name}. Encontrado no catálogo oficial de jogos para PC. Preço original Steam: ${game.price ? (game.price.final / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Gratuito / Promocional'}.`,
        coverUrl: headerCover,
        developer: 'Steam Distribution',
        categorySlug: 'jogos-indie',
      };
    }
  } catch (err: any) {
    console.warn(`[Steam API] Falha na busca por "${cleanQuery}": ${err.message}`);
  }
  return null;
}

/**
 * Busca capas em alta definição e informações do jogo na RAWG API com Fallback automático para a Steam Store API
 */
export async function fetchGameMetadata(gameTitle: string): Promise<GameMetadata | null> {
  const decodedTitle = decodeHtmlEntities(gameTitle);
  
  // Limpa o título do jogo removendo versões como "v1.0", "Repack", números de release no início
  const cleanQuery = decodedTitle
    .replace(/^\d+[-_\s]*/, '') // remove números de release como 2293- ou 756-
    .replace(/v?\d+(\.\d+)+[a-z]?/gi, '')
    .replace(/\b(repack|build|fitgirl|dodi|steamrip|deluxe|edition|multi\d+|dlcs?|multiplayer|all dlcs)\b/gi, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/[-_]/g, ' ')
    .trim();

  const apiKey = process.env.RAWG_API_KEY;

  if (apiKey) {
    try {
      const url = `https://api.rawg.io/api/games?search=${encodeURIComponent(cleanQuery)}&page_size=1&key=${apiKey}`;
      const response = await axios.get(url, { timeout: 8000 });

      if (response.data && response.data.results && response.data.results.length > 0) {
        const game = response.data.results[0];
        return {
          title: game.name || cleanQuery,
          excerpt: `Lançamento em ${game.released || 'recentemente'}. Avaliação: ${game.rating || 4.5}/5`,
          content: `Confira ${game.name}. Gêneros: ${game.genres?.map((g: any) => g.name).join(', ') || 'Ação / Aventura'}.`,
          coverUrl: game.background_image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
          developer: game.developers?.[0]?.name || 'PC Gaming Release',
          categorySlug: 'jogos-indie',
        };
      }
    } catch (err: any) {
      console.warn(`[RAWG API] Tativa por chave falhou (${err.message}). Alternando para Steam Store API...`);
    }
  }

  // Fallback 100% gratuito e sem API Key: Steam Store Search API
  const steamResult = await fetchSteamMetadata(cleanQuery);
  if (steamResult) return steamResult;

  // Fallback de segurança se nenhuma API retornar resultado
  return {
    title: decodedTitle,
    excerpt: `Download do jogo de PC verificado com alta velocidade.`,
    content: `Conteúdo completo com links diretos e magnet torrents verificados.`,
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    developer: 'PC Release',
    categorySlug: 'jogos-indie',
  };
}
