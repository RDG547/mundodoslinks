import { fetchPublishedPosts, fetchPendingPosts } from '@/lib/supabase';
import { FileText, Clock, ShieldCheck, Send, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0; // Dynamic dashboard

export default async function AdminDashboardPage() {
  const published = await fetchPublishedPosts();
  const pending = await fetchPendingPosts();

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Publicados</span>
            <FileText className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{published.length}</p>
          <p className="text-[11px] text-slate-500">Softwares online no site</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Fila de Moderação</span>
            <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-amber-500 dark:text-amber-400">{pending.length}</p>
          <p className="text-[11px] text-slate-500">Aguardando revisão manual</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Segurança HMAC</span>
            <ShieldCheck className="w-4 h-4 text-sky-500 dark:text-sky-400" />
          </div>
          <p className="text-3xl font-extrabold text-sky-600 dark:text-sky-400">15 min</p>
          <p className="text-[11px] text-slate-500">Validade estrita por token</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Disparos Telegram</span>
            <Send className="w-4 h-4 text-sky-500 dark:text-sky-400" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">Ativo</p>
          <p className="text-[11px] text-slate-500">GitHub Actions Cron Job</p>
        </div>
      </div>

      {/* Moderation Alert Banner */}
      {pending.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-amber-600 dark:text-amber-300 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" /> Existem {pending.length} publicações pendentes de revisão!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Posts importados autonomamente aguardando sua aprovação para irem ao ar e serem enviados no Telegram.
            </p>
          </div>

          <Link
            href="/admin/pending"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-1.5 shrink-0"
          >
            <span>Ir para Revisão</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Recent Published Table Overview */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 transition-colors">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Últimos Posts Publicados</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px]">
              <tr>
                <th className="pb-3">Título</th>
                <th className="pb-3">Desenvolvedor</th>
                <th className="pb-3">Versão</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
              {published.slice(0, 5).map((post) => (
                <tr key={post.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition">
                  <td className="py-3 font-semibold text-slate-900 dark:text-white">{post.title}</td>
                  <td className="py-3">{post.developer}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{post.download_links?.[0]?.version || 'LTS'}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold">
                      Publicado
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
