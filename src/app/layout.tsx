import type { Metadata } from 'next';
import Link from 'next/link';

import { ScratchpadProvider } from '@features/scratchpad/ScratchpadProvider';

import './globals.css';

export const metadata: Metadata = {
  title: 'SQL Dojo',
  description: 'Adım adım, tarayıcıda gerçek Postgres ile SQL öğren.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <header className="sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-extrabold tracking-tight">
              🥋 <span className="gradient-text">SQL Dojo</span>
            </Link>
            <nav className="flex gap-5 text-sm">
              <Link href="/lessons" className="hover:text-primary">
                Dersler
              </Link>
              <Link href="/sorular" className="hover:text-primary">
                Sorular
              </Link>
              <Link href="/playground" className="hover:text-primary">
                Deneme
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        <ScratchpadProvider />
      </body>
    </html>
  );
}
