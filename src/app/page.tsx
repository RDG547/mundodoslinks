import { fetchPublishedPosts, fetchCategories } from '@/lib/supabase';
import PostCard from '@/components/PostCard';
import Link from 'next/link';
import { Sparkles, Download, Zap, Send, Layers, SearchX, ChevronLeft, ChevronRight } from 'lucide-react';

export const revalidate = 60; // On-demand ISR / 60 segundos revalidation

interface HomePageProps {
  searchParams?: {
    search?: string;
    page?: string;
  };
}

const POSTS_PER_PAGE = 20;

export default async function HomePage({ searchParams }: HomePageProps) {
  let allPosts = await fetchPublishedPosts();
  const categories = await fetchCategories();

  const searchQuery = searchParams?.search?.toLowerCase().trim() || '';
  const currentPage = Math.max(1, parseInt(searchParams?.page || '1', 10));

  // Filtro Dinâmico em Tempo Real
  if (searchQuery) {
    allPosts = allPosts.filter((post) =>
      post.title.toLowerCase().includes(searchQuery) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery)) ||
      (post.developer && post.developer.toLowerCase().includes(searchQuery))
    );
  }

  // Paginação a cada 20 posts
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE) || 1;
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = allPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

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
            Acesse lançamentos e atualizações com máxima velocidade de download direto, verificação antivírus e notificação instantânea via Telegram.
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
              href="https://t.me/MundodosLinksPosts"
              target="_blank"
              className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-sky-600 dark:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm transition flex items-center gap-2 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Canal do Telegram</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Filter Pills (Buscadas do Banco) */}
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
          {categories.map((cat) => (
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
            <Zap className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
            {searchQuery ? `Resultados da busca: "${searchQuery}"` : 'Lançamentos & Destaques'}
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800">
            {totalPosts} {totalPosts === 1 ? 'item disponível' : 'itens disponíveis'} (Página {validPage} de {totalPages})
          </span>
        </div>

        {paginatedPosts.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-2xl space-y-3">
            <SearchX className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Nenhum programa ou jogo encontrado</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Tente buscar por termos mais genéricos ou explore as categorias.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* Paginação a cada 20 Posts */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-8 border-t border-slate-200 dark:border-slate-800">
            <Link
              href={`/?page=${validPage - 1}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1 ${
                validPage <= 1
                  ? 'pointer-events-none opacity-40 border-slate-300 dark:border-slate-800 text-slate-400'
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-emerald-500'
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </Link>

            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Página {validPage} / {totalPages}
            </span>

            <Link
              href={`/?page=${validPage + 1}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1 ${
                validPage >= totalPages
                  ? 'pointer-events-none opacity-40 border-slate-300 dark:border-slate-800 text-slate-400'
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-emerald-500'
              }`}
            >
              Próxima <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
