import Link from 'next/link';
import { ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 mt-16 py-10 transition-colors">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-3 md:col-span-2">
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
              MUNDO<span className="text-emerald-500 dark:text-emerald-400">DOS</span>LINKS
            </span>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md">
              Portal seguro e automatizado para catálogo de softwares livres, freewares, utilitários e jogos de código aberto. Links validados com proteção temporária HMAC.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" /> 100% Livre de Malware e Verificado
            </div>
          </div>

          <div>
            <h4 className="text-slate-900 dark:text-white font-semibold text-sm mb-3 uppercase tracking-wider">Navegação</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition">Início</Link></li>
              <li><Link href="/categoria/softwares-livres" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition">Softwares Livres</Link></li>
              <li><Link href="/categoria/jogos-indie" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition">Jogos Indie</Link></li>
              <li><Link href="/admin" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition">Painel Administrativo</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Mundo dos Links. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1">
            Desenvolvido com <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> para a comunidade Open Source.
          </p>
        </div>
      </div>
    </footer>
  );
}
