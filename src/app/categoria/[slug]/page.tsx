import { fetchPublishedPosts, MOCK_CATEGORIES } from '@/lib/supabase';
import PostCard from '@/components/PostCard';
import Link from 'next/link';
import { Tag, ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export const revalidate = 60;

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = MOCK_CATEGORIES.find(c => c.slug === params.slug);
  if (!category) {
    notFound();
  }

  const allPosts = await fetchPublishedPosts();
  const categoryPosts = allPosts.filter(p => p.category?.slug === params.slug || p.category_id === category.id);

  return (
    <div className="space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="glass-panel rounded-3xl p-8 border border-slate-200 dark:border-slate-800 space-y-2 transition-colors">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
          <Tag className="w-3.5 h-3.5" /> Categoria
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{category.name}</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Exibindo {categoryPosts.length} {categoryPosts.length === 1 ? 'item' : 'itens'} nesta categoria.
        </p>
      </div>

      {categoryPosts.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-2xl">
          <p className="text-slate-500 dark:text-slate-400">Nenhum programa postado nesta categoria ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
