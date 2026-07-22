/**
 * Serviço de Sanitização de HTML, Limpeza de Títulos e Tradução Completa PT-BR
 */

/**
 * Decodifica entidades HTML simples e duplamente codificadas (ex: &lt;div class=&quot;...)
 */
export function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  let s = str;
  // Aplica duas passagens para garantir decodificação de HTML duplamente escapado
  for (let i = 0; i < 2; i++) {
    s = s
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#039;/gi, "'")
      .replace(/&#8217;/gi, "'")
      .replace(/&#8211;/gi, '–')
      .replace(/&#038;/gi, '&')
      .replace(/&amp;/gi, '&');
  }
  return s;
}

/**
 * Remove qualquer tag HTML, scripts e estilos, retornando texto limpo
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  const decoded = decodeHtmlEntities(html);
  return decoded
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Limpa e padroniza títulos de jogos e programas
 */
export function cleanTitle(rawTitle: string): string {
  let title = decodeHtmlEntities(rawTitle);

  // Remove ruídos de feeds e prefixos
  title = title
    .replace(/^New:\s*/gi, '') // Remove "New: "
    .replace(/\s*Released$/gi, '') // Remove " Released"
    .replace(/^\d+[-_\s]*/, '') // Remove prefixos de ID 2147-, 756-
    .replace(/\[\s*(DODI|FitGirl|ElAmigos)\s*Repack\s*\]/gi, '') // Remove tags de grupo
    .replace(/\(From\s*[\d.]+\s*GB\)/gi, '') // Remove tamanho em GB
    .replace(/\s*,\s*Portable Edition\s+(Nightly|Stable|ESR)?\s*\d+(\.\d+)*/gi, ' Portable')
    .replace(/\s*\([^)]*(web browser|secure instant messaging|audio player|lightweight media player|disk defragmentation|virtual meetings|portable app packaging|Scan to PDF|Unicode character|markdown note taker|advanced text editor)[^)]*\)/gi, '')
    .trim();

  return title;
}

/**
 * Dicionário de Tradução de Frases e Termos Frequentes para Português (PT-BR)
 */
const SENTENCE_TRANSLATIONS: [RegExp, string][] = [
  [/A new version of (.*?) has been released\./gi, 'Uma nova versão do $1 foi lançada e já está disponível para download.'],
  [/allows you to run (.*?) portably for virtual meetings, video chat, screen sharing, and more\./gi, 'permite executar o $1 de forma portátil para reuniões virtuais, chamada de vídeo, compartilhamento de tela e muito mais.'],
  [/It's packaged as a portable app so you communicate on the go/gi, 'Vem empacotado como um aplicativo portátil para você usar em qualquer computador.'],
  [/It's released as freeware for personal and business use\./gi, 'Disponibilizado como software gratuito para uso pessoal e comercial.'],
  [/Update automatically or/gi, 'Atualize automaticamente ou'],
  [/Upcoming Repacks/gi, 'Próximos Lançamentos'],
  [/Weekly Digest/gi, 'Resumo Semanal'],
  [/Repack Features/gi, 'Recursos do Repack'],
  [/Based on/gi, 'Baseado na versão'],
  [/100% Lossless & MD5 Perfect/gi, '100% Sem perdas e com MD5 Perfeito (arquivos idênticos aos originais)'],
  [/NOTHING ripped, NOTHING re-encoded/gi, 'Nenhum conteúdo removido ou recodificado'],
  [/Significantly smaller archive size/gi, 'Tamanho de download significativamente reduzido e otimizado'],
  [/Installation takes/gi, 'Tempo estimado de instalação:'],
  [/After-install integrity check/gi, 'Verificação automática de integridade pós-instalação'],
  [/HDD space after installation/gi, 'Espaço livre em disco exigido:'],
  [/Language can be changed in game settings/gi, 'Idioma alterável diretamente nas opções do jogo'],
  [/At least 2 GB of free RAM required for installing/gi, 'Mínimo de 2 GB de RAM livre necessário para instalação'],
  [/Game Description/gi, 'Sobre o Jogo'],
  [/Welcome Survivor/gi, 'Bem-vindo, Sobrevivente!'],
  [/Openworld Third Person Action Adventure Survival game/gi, 'Jogo de Ação, Aventura e Sobrevivência em Terceira Pessoa em Mundo Aberto'],
  [/Digital Deluxe Edition/gi, 'Edição Digital Deluxe'],
  [/Premium Edition/gi, 'Edição Premium'],
  [/Complete Edition/gi, 'Edição Completa'],
  [/Ultimate Edition/gi, 'Edição Ultimate'],
  [/Bonus Content/gi, 'Conteúdo Bônus Incluso'],
  [/Selective Download/gi, 'Download Seletivo Disponível'],
  [/Multiplayer/gi, 'Suporte a Multijogador Online'],
  [/All DLCs/gi, 'Todas as expansões (DLCs) Inclusas'],
  [/web browser/gi, 'Navegador de Internet'],
  [/secure instant messaging/gi, 'Mensageiro Instantâneo Seguro'],
  [/lightweight media player/gi, 'Reprodutor de Mídia Leve'],
  [/audio player/gi, 'Reprodutor de Áudio'],
  [/Scan to PDF with OCR/gi, 'Digitalização para PDF com OCR'],
  [/InnoSetup inspector and extractor/gi, 'Extrator e Inspetor de Arquivos InnoSetup'],
  [/markdown note taker/gi, 'Bloco de Notas em Markdown'],
  [/advanced text editor/gi, 'Editor de Texto Avançado'],
  [/disk defragmentation/gi, 'Desfragmentador de Disco'],
];

/**
 * Traduz descrições e resumos para Português do Brasil (PT-BR)
 */
export function translateToPtBr(rawText: string): string {
  if (!rawText) return '';

  let text = stripHtml(rawText);

  for (const [pattern, replacement] of SENTENCE_TRANSLATIONS) {
    text = text.replace(pattern, replacement);
  }

  // Traduções de vocabulário complementar
  text = text
    .replace(/\bgame\b/gi, 'jogo')
    .replace(/\bgames\b/gi, 'jogos')
    .replace(/\bsoftware\b/gi, 'programa')
    .replace(/\bfree\b/gi, 'gratuito')
    .replace(/\bopen source\b/gi, 'código aberto')
    .replace(/\bfeatures\b/gi, 'recursos')
    .replace(/\bsurvival\b/gi, 'sobrevivência')
    .replace(/\baction\b/gi, 'ação')
    .replace(/\badventure\b/gi, 'aventura')
    .replace(/\bminutes\b/gi, 'minutos')
    .replace(/\bdepending on your system\b/gi, 'dependendo da configuração do seu PC');

  return text.trim();
}
