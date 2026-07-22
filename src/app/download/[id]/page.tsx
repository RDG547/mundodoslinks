'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchPostById } from '@/lib/supabase';
import { Post } from '@/types/database';
import { ShieldCheck, Download, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function DownloadPage() {
  const params = useParams();
  const id = params?.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlockedUrl, setUnlockedUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    fetchPostById(id).then((data) => {
      setPost(data);
      setLoading(false);
    });
  }, [id]);

  const handleUnlock = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const genRes = await fetch('/api/gerar-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const genData = await genRes.json();
      if (!genRes.ok || !genData.success) {
        throw new Error(genData.erro || 'Erro ao gerar token HMAC.');
      }

      const valRes = await fetch(genData.validateUrl);
      const valData = await valRes.json();

      if (!valRes.ok || !valData.liberado) {
        throw new Error(valData.erro || 'Falha na validação do token.');
      }

      setUnlockedUrl(valData.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro na requisição.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !post) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400">
        <ArrowLeft className="w-4 h-4" /> Voltar ao início
      </Link>

      <div className="glass-panel rounded-3xl p-8 border border-slate-200 dark:border-slate-800 space-y-6 text-center transition-colors">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center glow-emerald">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{post?.title || 'Download Solicitado'}</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Desenvolvedor: {post?.developer || 'Desenvolvedor Autorizado'}</p>
        </div>

        <div className="bg-slate-100 dark:bg-slate-900/80 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          {unlockedUrl ? (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Download Liberado com HMAC Token!
              </div>

              <a
                href={unlockedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition"
              >
                <Download className="w-5 h-5" />
                <span>Iniciar Download Agora</span>
              </a>
            </div>
          ) : (
            <button
              onClick={handleUnlock}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              <span>Gerar e Validar Link de Download</span>
            </button>
          )}

          {errorMsg && (
            <p className="text-xs text-red-600 dark:text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">{errorMsg}</p>
          )}
        </div>
      </div>
    </div>
  );
}
