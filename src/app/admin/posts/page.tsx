import { fetchPublishedPosts } from '@/lib/supabase';
import { FileText, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminPostsPage() {
  const posts = await fetchPublishedPosts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" /> Catálogo de Publicações Ativas
          </h2>
          <p className="text-xs text-slate-400">
            Gerencie os softwares ativos no banco de dados Supabase e verifique o estado dos links encurtados.
          </p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
              <tr>
                <th className="pb-3">Título / Slug</th>
                <th className="pb-3">Desenvolvedor</th>
                <th className="pb-3">Versão Ativa</th>
                <th className="pb-3">Provedor Encurtador</th>
                <th className="pb-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-900/50 transition">
                  <td className="py-3.5 font-semibold text-white">
                    <div>{post.title}</div>
                    <div className="text-[10px] text-slate-500 font-mono">/post/{post.slug}</div>
                  </td>
                  <td className="py-3.5">{post.developer}</td>
                  <td className="py-3.5 text-emerald-400 font-medium">
                    {post.download_links?.[0]?.version || 'LTS'}
                  </td>
                  <td className="py-3.5 text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Softurl API
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <Link
                      href={`/post/${post.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                    >
                      <span>Ver no Site</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
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
