import Link from 'next/link';
import { LayoutDashboard, Clock, FileText, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      {/* Top Admin Sub-header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 dark:text-white text-base">Painel de Moderação & Automação</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Mundo dos Links - Admin Core</p>
          </div>
        </div>

        <Link
          href="/"
          className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition flex items-center gap-1.5 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Site Público</span>
        </Link>
      </div>

      {/* Admin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Navigation Sidebar */}
        <aside className="md:col-span-3 glass-panel rounded-2xl p-4 border border-slate-200 dark:border-slate-800/80 h-fit space-y-2 transition-colors">
          <nav className="space-y-1">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Visão Geral</span>
            </Link>

            <Link
              href="/admin/pending"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>Fila de Revisão</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30">
                Pendente
              </span>
            </Link>

            <Link
              href="/admin/posts"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              <FileText className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Todos os Posts</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="md:col-span-9 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
