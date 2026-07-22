import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    // Validação básica dos parâmetros de entrada
    if (!id) {
      return NextResponse.json(
        { erro: 'O parâmetro "id" é obrigatório.' },
        { status: 400 }
      );
    }

    const secretKey = process.env.MINHA_CHAVE_CRIPTO;
    const softurlToken = process.env.SOFTURL_API_TOKEN;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mundodoslinks.vercel.app';

    if (!secretKey || !softurlToken) {
      console.error('Variáveis de ambiente MINHA_CHAVE_CRIPTO ou SOFTURL_API_TOKEN não foram configuradas.');
      return NextResponse.json(
        { erro: 'Erro de configuração no servidor.' },
        { status: 500 }
      );
    }

    // 1. Gera o timestamp atual em milissegundos
    const timestamp = Date.now().toString();

    // 2. Calcula a assinatura HMAC SHA-256 combinando ID e Timestamp
    const token = crypto
      .createHmac('sha256', secretKey)
      .update(`${id}-${timestamp}`)
      .digest('hex');

    // 3. Monta a URL de retorno para onde o encurtador deve redirecionar o usuário
    const returnUrl = `${siteUrl}/post/${id}?token=${token}&expires=${timestamp}`;

    // 4. Codifica a URL de destino (URL Encode) para evitar quebras nos parâmetros da API
    const encodedReturnUrl = encodeURIComponent(returnUrl);
    const softurlEndpoint = `https://softurl.in/api?api=${softurlToken}&url=${encodedReturnUrl}`;

    // 5. Dispara a requisição HTTP para a API do Softurl
    const response = await fetch(softurlEndpoint, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 0 }, // Não guardar cache da rota na Vercel
    });

    const data = await response.json();

    if (data && data.status === 'success' && data.shortenedUrl) {
      return NextResponse.json({
        sucesso: true,
        urlEncurtada: data.shortenedUrl,
      });
    }

    // Fallback de segurança: Se a API externa falhar, devolve a URL original com os tokens
    console.warn('API do Softurl não retornou sucesso. Aplicando fallback.');
    return NextResponse.json({
      sucesso: false,
      urlEncurtada: returnUrl,
    });

  } catch (error: any) {
    console.error('Erro na rota /api/gerar-link:', error.message);
    return NextResponse.json(
      { erro: 'Falha interna ao processar a requisição de link.' },
      { status: 500 }
    );
  }
}
