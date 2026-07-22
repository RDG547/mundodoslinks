import Link from 'next/link';
import Image from 'next/image';
import { Download, ShieldCheck, Tag, Code2 } from 'lucide-react';
import { Post } from '@/types/database';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const version = post.download_links?.[0]?.version || 'Versão Recente';

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col group h-full transition-colors">
      {/* Cover Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-200 dark:bg-slate-900">
        {post.cover_url ? (
          <Image
            src={post.cover_url}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 text-slate-400 dark:text-slate-600">
            <Download className="w-12 h-12" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 dark:from-[#090d16] via-transparent to-transparent"></div>

        {/* Category & Verified Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {post.category && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {post.category.name}
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <span className="p-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <Code2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>{post.developer}</span>
          </div>

          <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
            {post.title}
          </h3>

          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        </div>

        {/* Action Button & Version */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800">
            {version}
          </span>

          <Link
            href={`/post/${post.slug}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
