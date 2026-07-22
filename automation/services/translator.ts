/**
 * Serviço de Tradução Integrado para Português do Brasil (PT-BR)
 */

const PHRASE_DICTIONARY: Record<string, string> = {
  'Upcoming Repacks': 'Próximos Lançamentos',
  'Weekly Digest': 'Resumo Semanal',
  'Repack Features': 'Recursos do Repack',
  'Based on': 'Baseado na versão',
  '100% Lossless & MD5 Perfect': '100% Sem perdas e MD5 Perfeito (arquivos idênticos aos originais)',
  'NOTHING ripped, NOTHING re-encoded': 'Nada removido, nada re-codificado',
  'Significantly smaller archive size': 'Tamanho de download significativamente reduzido',
  'Installation takes': 'Instalação estimada em',
  'After-install integrity check': 'Verificação automática de integridade pós-instalação',
  'HDD space after installation': 'Espaço livre em disco necessário:',
  'Language can be changed in game settings': 'Idioma alterável nas opções do jogo',
  'Repack uses XTool library': 'Repack otimizado com a biblioteca XTool',
  'At least 2 GB of free RAM': 'Requer no mínimo 2 GB de RAM livre para instalação',
  'Game Description': 'Descrição do Jogo',
  'Welcome Survivor': 'Bem-vindo, Sobrevivente!',
  'Openworld Third Person': 'Mundo Aberto em Terceira Pessoa',
  'Action Adventure Survival game': 'Jogo de Ação, Aventura e Sobrevivência',
  'Download verified': 'Download verificado com alta velocidade e segurança.',
  'Software for video recording and live streaming': 'Software para gravação de vídeo e transmissão ao vivo.',
  'Digital Deluxe Edition': 'Edição Digital Deluxe',
  'Premium Edition': 'Edição Premium',
  'Complete Edition': 'Edição Completa',
  'Ultimate Edition': 'Edição Ultimate',
  'Bonus Content': 'Conteúdo Bônus Incluso',
  'Selective Download': 'Download Seletivo Disponível',
  'Multiplayer': 'Suporte a Multijogador',
  'All DLCs': 'Todas as DLCs Inclusas',
};

/**
 * Traduz descrições e resumos para Português do Brasil (PT-BR)
 */
export function translateToPtBr(text: string): string {
  if (!text) return '';

  let translated = text;

  // Substitui frases do dicionário
  for (const [english, portuguese] of Object.entries(PHRASE_DICTIONARY)) {
    const regex = new RegExp(english.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'gi');
    translated = translated.replace(regex, portuguese);
  }

  // Traduções contextuais de palavras chave soltas
  translated = translated
    .replace(/\bgame\b/gi, 'jogo')
    .replace(/\bgames\b/gi, 'jogos')
    .replace(/\bdownload\b/gi, 'download')
    .replace(/\bsoftware\b/gi, 'programa')
    .replace(/\bfree\b/gi, 'gratuito')
    .replace(/\bopen source\b/gi, 'código aberto')
    .replace(/\bfeatures\b/gi, 'recursos')
    .replace(/\bsurvival\b/gi, 'sobrevivência')
    .replace(/\baction\b/gi, 'ação')
    .replace(/\badventure\b/gi, 'aventura')
    .replace(/\bminutes\b/gi, 'minutos')
    .replace(/\bdepending on your system\b/gi, 'dependendo do seu sistema')
    .replace(/\brequired for installing\b/gi, 'necessário para a instalação')
    .replace(/\bpost-apocalyptic\b/gi, 'pós-apocalíptico')
    .replace(/\bcity\b/gi, 'cidade')
    .replace(/\bworld\b/gi, 'mundo')
    .replace(/\bhuman\b/gi, 'humana')
    .replace(/\bcapacity\b/gi, 'capacidade')
    .replace(/\bsurvival\b/gi, 'sobrevivência');

  return translated;
}
