'use client';

import Link from 'next/link';
import { Download, ShieldCheck, Send, LayoutDashboard, Search, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/providers/ThemeProvider';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200 dark:border-slate-800/80 transition-colors">
      <div className="container mx-auto px-4 max-w-7xl h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Download className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
              MUNDO<span className="text-emerald-500 dark:text-emerald-400">DOS</span>LINKS
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 -mt-1 font-medium tracking-wider uppercase flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500 dark:text-emerald-400" /> Links Verificados
            </span>
          </div>
        </Link>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar programas, jogos ou utilitários..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-full text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Navigation & Action Links */}
        <nav className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            title={theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 transition-all flex items-center justify-center shadow-sm"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 fill-indigo-600/20" />
            )}
          </button>

          <Link
            href="https://t.me/MundodosLinksPosts"
            target="_blank"
            className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Telegram Bot</span>
          </Link>

          <Link
            href="/admin"
            className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Painel Admin</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
