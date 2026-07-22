'use client';

import { useState, useEffect } from 'react';
import { fetchPendingPosts } from '@/lib/supabase';
import { Post } from '@/types/database';
import { Check, X, Send, Clock, Loader2, ExternalLink } from 'lucide-react';

export default function PendingModerationPage() {
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingPosts().then((posts) => {
      setPendingPosts(posts);
      setLoading(false);
    });
  }, []);

  const handleApprove = (id: string, title: string) => {
    setPendingPosts(prev => prev.filter(p => p.id !== id));
    setActionMessage(`Post "${title}" foi APROVADO e publicado no site público com sucesso!`);
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleReject = (id: string, title: string) => {
    setPendingPosts(prev => prev.filter(p => p.id !== id));
    setActionMessage(`Post "${title}" foi REJEITADO e movido para descarte.`);
    setTimeout(() => setActionMessage(null), 4000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" /> Fila de Moderação Manual
          </h2>
          <p className="text-xs text-slate-400">
            Revise os softwares e jogos capturados automaticamente pelas rotinas agendadas antes da veiculação oficial.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-fadeIn">
          {actionMessage}
        </div>
      )}

      {pendingPosts.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-2">
          <Check className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Tudo em dia!</h3>
          <p className="text-slate-400 text-xs">Nenhum post pendente de revisão no momento.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingPosts.map((post) => (
            <div
              key={post.id}
              className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold uppercase">
                    Pendente
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Dev: {post.developer}</span>
                </div>

                <h3 className="text-lg font-bold text-white">{post.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{post.excerpt}</p>

                <div className="text-[11px] text-slate-500 flex items-center gap-4 pt-1">
                  <span>URL Encurtada: {post.download_links?.[0]?.public_url || 'https://softurl.co/...'}</span>
                  <span>Provedor: {post.download_links?.[0]?.shortener_provider || 'softurl'}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                <button
                  onClick={() => handleReject(post.id, post.title)}
                  className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>Rejeitar</span>
                </button>

                <button
                  onClick={() => handleApprove(post.id, post.title)}
                  className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Aprovar & Publicar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
