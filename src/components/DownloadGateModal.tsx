'use client';

import { X, ShieldCheck, Download, ExternalLink, CheckCircle2 } from 'lucide-react';

interface DownloadGateModalProps {
  postId: string;
  postTitle: string;
  directUrl?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DownloadGateModal({
  postTitle,
  directUrl,
  isOpen,
  onClose,
}: DownloadGateModalProps) {
  if (!isOpen) return null;

  const downloadTarget = directUrl || '#';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Download Direto Verificado</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">{postTitle}</p>
        </div>

        {/* Download Action Box */}
        <div className="bg-slate-100 dark:bg-slate-900/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span>Link Direto sem Encurtadores</span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Antivírus & Safe
            </span>
          </div>

          <div className="space-y-4 text-center">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Download Pronto para Iniciar!
            </div>

            <a
              href={downloadTarget}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 hover:scale-[1.02] transition"
            >
              <Download className="w-5 h-5" />
              <span>Iniciar Download Direto / Magnet</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
          <p>O encurtador está desativado. Download direto verificado sem anúncios.</p>
        </div>
      </div>
    </div>
  );
}
