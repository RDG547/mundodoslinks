'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Download, ShieldCheck, Tag, Code2 } from 'lucide-react';
import { Post } from '@/types/database';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(post.cover_url || null);
  const version = post.download_links?.[0]?.version || 'Versão Recente';
  const fallbackCover = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80';

  return (
    <Link
      href={`/post/${post.slug}`}
      className="glass-card rounded-2xl overflow-hidden flex flex-col group h-full transition-all duration-300 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 cursor-pointer"
    >
      {/* Cover Image Container with Perfect Fit */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-900 flex items-center justify-center p-1">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={post.title}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
            onError={() => setImgSrc(fallbackCover)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-slate-500">
            <Download className="w-12 h-12" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none"></div>

        {/* Category & Verified Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
          {post.category && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-900/85 backdrop-blur-md text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-md">
              <Tag className="w-3 h-3" />
              {post.category.name}
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 z-10">
          <span className="p-1.5 rounded-full bg-slate-900/85 backdrop-blur-md text-emerald-400 border border-emerald-500/30 shadow-md">
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

          <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 group-hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all group-hover:scale-105">
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
