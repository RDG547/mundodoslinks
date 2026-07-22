'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { fetchPostBySlug } from '@/lib/supabase';
import { Post } from '@/types/database';
import DownloadGateModal from '@/components/DownloadGateModal';
import { Download, ShieldCheck, Tag, Calendar, User, ArrowLeft, CheckCircle, Cpu } from 'lucide-react';

export default function PostDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;

    fetchPostBySlug(slug).then((data) => {
      setPost(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    notFound();
  }

  const mainLink = post.download_links?.[0];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar para todos os links</span>
      </Link>

      {/* Main Detail Header */}
      <div className="glass-panel rounded-3xl p-6 md:p-10 border border-slate-200 dark:border-slate-800 space-y-8 transition-colors">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cover Image */}
          <div className="lg:col-span-5 relative h-72 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {post.cover_url ? (
              <Image
                src={post.cover_url}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
                <Download className="w-16 h-16" />
              </div>
            )}
          </div>

          {/* Details & Action */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              {post.category && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  {post.category.name}
                </span>
              )}

              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Links HMAC Verificados
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {post.title}
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed">
              {post.excerpt}
            </p>

            {/* Quick Metadata Info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Desenvolvedor
                </span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{post.developer}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" /> Versão
                </span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{mainLink?.version || 'LTS'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Publicado
                </span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {new Date(post.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {/* Main Action Trigger Button */}
            <div className="pt-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/25 hover:scale-[1.02] transition flex items-center justify-center gap-3"
              >
                <Download className="w-5 h-5" />
                <span>Baixar {post.title}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Technical Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 glass-panel rounded-3xl p-6 md:p-8 space-y-4 transition-colors">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
            Sobre o Programa
          </h2>
          <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed space-y-4 whitespace-pre-line">
            {post.content}
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 space-y-4 h-fit transition-colors">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
            Destaques de Segurança
          </h3>
          <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>Verificado livre de vírus, trojans ou adwares.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>Link direto encurtado via Softurl API.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>Token com validade temporária HMAC (15 min).</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Download Gate Modal */}
      <DownloadGateModal
        postId={post.id}
        postTitle={post.title}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
