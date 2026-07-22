import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { fetchPostById, MOCK_POSTS } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const token = searchParams.get('token');
  const expires = searchParams.get('expires');
  const CHAVE_SECRETA = process.env.MINHA_CHAVE_CRIPTO || 'super-secret-hmac-key-mundo-dos-links-2026';

  if (!id || !token || !expires) {
    return NextResponse.json(
      { liberado: false, erro: 'Parâmetros ausentes na solicitação.' }, 
      { status: 400 }
    );
  }

  // 1. Checagem de expiração (15 minutos = 900.000 ms)
  const agora = Date.now();
  const tempoDecorrido = agora - parseInt(expires, 10);
  if (isNaN(tempoDecorrido) || tempoDecorrido > 15 * 60 * 1000) {
    return NextResponse.json(
      { liberado: false, erro: 'O link de acesso expirou por tempo (TTL de 15 minutos).' }, 
      { status: 401 }
    );
  }

  // 2. Validação Matemática da Assinatura HMAC (Impede alteração do ID ou do tempo)
  const hashEsperado = crypto
    .createHmac('sha256', CHAVE_SECRETA)
    .update(`${id}-${expires}`)
    .digest('hex');

  if (token !== hashEsperado) {
    return NextResponse.json(
      { liberado: false, erro: 'Token de segurança inválido ou adulterado.' }, 
      { status: 403 }
    );
  }

  // 3. Buscar URL de Download correspondente
  const post = await fetchPostById(id);
  const downloadLink = post?.download_links?.[0]?.public_url || 
    MOCK_POSTS.find(p => p.id === id)?.download_links?.[0]?.public_url ||
    `https://softurl.co/download/${id}`;

  return NextResponse.json({
    liberado: true,
    url: downloadLink,
    version: post?.download_links?.[0]?.version || 'Última versão',
    title: post?.title || 'Download Solicitado'
  });
}
