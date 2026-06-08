import Link from 'next/link';

import { Card } from '@ui/Card';

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <section className="animate-fade-in">
        <h1 className="text-3xl font-bold">🥋 SQL Dojo</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Tarayıcında çalışan <strong>gerçek bir Postgres</strong> (PGlite) üzerinde, sıfırdan adım adım
          SQL öğren. Her örneği anında çalıştır, sonucu gör. Hiçbir kurulum yok.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/lessons">
          <Card className="h-full p-5 transition hover:border-primary">
            <div className="text-xl font-semibold">📚 Dersler</div>
            <p className="mt-1 text-sm text-muted">
              Ünite ünite müfredat: SELECT’ten window fonksiyonlarına. Anlatım, çözümlü örnekler ve
              pratik.
            </p>
          </Card>
        </Link>
        <Link href="/playground">
          <Card className="h-full p-5 transition hover:border-primary">
            <div className="text-xl font-semibold">⌨️ Deneme</div>
            <p className="mt-1 text-sm text-muted">
              Kampüs verisi üzerinde özgürce sorgu yaz, çalıştır, sıfırla. Her ekrandan{' '}
              <kbd className="rounded bg-foreground/10 px-1.5 py-0.5 text-xs">⌘K</kbd> ile de açılır.
            </p>
          </Card>
        </Link>
      </div>

      <p className="text-xs text-muted">
        Faz 0 · iskelet. PGlite + CodeMirror + Deneme Tahtası + ders renderer çalışıyor. Sırada
        Supabase auth + roller + ilerleme kaydı.
      </p>
    </div>
  );
}
