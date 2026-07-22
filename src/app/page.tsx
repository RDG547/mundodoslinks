import { fetchPublishedPosts, MOCK_CATEGORIES } from '@/lib/supabase';
import PostCard from '@/components/PostCard';
import Link from 'next/link';
import { Sparkles, Download, Zap, Send, Layers } from 'lucide-react';

export const revalidate = 60; // On-demand ISR / 60 seconds revalidation

export default async function HomePage() {
  const posts = await fetchPublishedPosts();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden glass-panel p-8 md:p-14 border border-slate-200 dark:border-slate-800/80 shadow-2xl transition-colors">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Portal Automatizado & Links Verificados</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Softwares Livres, Jogos & Utilitários em <span className="bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">Um Só Lugar</span>
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl">
            Acesse lançamentos e atualizações com máxima velocidade de download, links protegidos por HMAC com validade temporária e notificação instantânea via Telegram.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#posts-grid"
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Explorar Downloads</span>
            </a>

            <Link
              href="https://t.me"
              target="_blank"
              className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-sky-600 dark:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm transition flex items-center gap-2 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Canal no Telegram</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Filter Pills */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-500 dark:text-emerald-400" /> Categorias Populares
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
          >
            Todos os Links
          </Link>
          {MOCK_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/categoria/${cat.slug}`}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500/40 hover:text-emerald-500 dark:hover:text-emerald-400 text-xs font-semibold transition shadow-sm"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Main Posts Grid */}
      <section id="posts-grid" className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-emerald-500 dark:text-emerald-400" /> Lançamentos & Destaques
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {posts.length} {posts.length === 1 ? 'item encontrado' : 'itens encontrados'}
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-2xl">
            <p className="text-slate-500 dark:text-slate-400">Nenhum programa publicado no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
