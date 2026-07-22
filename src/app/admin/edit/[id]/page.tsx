'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save, Loader2, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function AdminEditPostPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [developer, setDeveloper] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [slug, setSlug] = useState('');

  useEffect(() => {
    if (!id) return;

    async function loadPost() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*, download_links(*)')
          .eq('id', id)
          .single();

        if (error || !data) {
          setErrorMsg('Post não encontrado no banco de dados.');
          setLoading(false);
          return;
        }

        setTitle(data.title || '');
        setSlug(data.slug || '');
        setExcerpt(data.excerpt || '');
        setContent(data.content || '');
        setCoverUrl(data.cover_url || '');
        setDeveloper(data.developer || '');

        if (data.download_links && data.download_links.length > 0) {
          setOriginalUrl(data.download_links[0].original_url || '');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Erro ao carregar dados.');
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setErrorMsg(null);

    try {
      // 1. Atualiza dados do Post no Supabase
      const { error: postErr } = await supabase
        .from('posts')
        .update({
          title,
          excerpt,
          content,
          cover_url: coverUrl,
          developer,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (postErr) {
        throw new Error(`Erro ao atualizar post: ${postErr.message}`);
      }

      // 2. Atualiza o Link de Download
      const { data: existingLink } = await supabase
        .from('download_links')
        .select('id')
        .eq('post_id', id)
        .maybeSingle();

      if (existingLink) {
        await supabase
          .from('download_links')
          .update({
            original_url: originalUrl,
            public_url: originalUrl,
          })
          .eq('id', existingLink.id);
      } else {
        await supabase.from('download_links').insert({
          post_id: id,
          original_url: originalUrl,
          public_url: originalUrl,
          shortener_provider: 'direct',
          status: 'active',
        });
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/admin/posts"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para Gerenciador de Posts
      </Link>

      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Editar Publicação</h1>
            <p className="text-xs text-slate-400 font-mono">ID: {id}</p>
          </div>

          <Link
            href={`/post/${slug}`}
            target="_blank"
            className="text-xs text-emerald-400 hover:underline"
          >
            Ver no site
          </Link>
        </div>

        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Publicação e link de download atualizados com sucesso!</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase text-slate-400">Título da Publicação</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-slate-400">Desenvolvedor / Grupo</label>
              <input
                type="text"
                value={developer}
                onChange={(e) => setDeveloper(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-slate-400 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5" /> URL da Imagem de Capa
              </label>
              <input
                type="text"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase text-slate-400">Link Direto de Download / Magnet</label>
            <input
              type="text"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="https://... ou magnet:?xt=..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-emerald-400 font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase text-slate-400">Resumo Curto (Exibido no Card)</label>
            <textarea
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase text-slate-400">Descrição Detalhada (PT-BR)</label>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/admin/posts')}
              className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
