import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/providers/ThemeProvider';

export const metadata: Metadata = {
  title: 'Mundo dos Links | Download Seguro de Softwares, Jogos e Utilitários',
  description: 'Portal automatizado de download de softwares livres, freewares, jogos indie e mídias autorizadas com máxima velocidade e verificação de segurança.',
  keywords: ['download software', 'freeware', 'open source', 'jogos indie', 'mundo dos links', 'download seguro'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 antialiased selection:bg-emerald-500 selection:text-black transition-colors duration-300">
        <ThemeProvider>
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
