import Link from 'next/link';

import { Card } from '@ui/Card';

const features = [
  {
    href: '/lessons',
    icon: '📚',
    title: 'Dersler',
    desc: 'Ünite ünite müfredat: SELECT’ten window fonksiyonlarına. Anlatım, çözümlü örnekler ve pratik.',
    tone: 'var(--brand-from)',
  },
  {
    href: '/sorular',
    icon: '📝',
    title: 'Sorular',
    desc: 'Ünite ve zorluk seç, rastgele soru çöz. Gerçek Postgres üzerinde anında, otomatik değerlendirilir.',
    tone: 'var(--brand-to)',
  },
  {
    href: '/playground',
    icon: '⌨️',
    title: 'Deneme',
    desc: 'Kampüs verisinde özgürce sorgu yaz, çalıştır, sıfırla. Her ekrandan ⌘K ile de açılır.',
    tone: 'var(--accent)',
  },
];

const stats = ['16 ders', '245 soru', '12 tablo', '0 kurulum'];

export default function Home() {
  return (
    <div className="flex flex-col gap-12">
      <section className="animate-fade-in pt-6 text-center sm:pt-12">
        <span className="chip mx-auto">🐘 Tarayıcıda gerçek Postgres · PGlite</span>
        <h1 className="mt-6 text-5xl font-extrabold tracking-tight sm:text-6xl">
          <span className="gradient-text">SQL Dojo</span> <span aria-hidden>🥋</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-muted">
          Sıfırdan, adım adım SQL öğren. Her sorguyu anında çalıştır, sonucu gör. Kurulum yok, sunucu yok.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {stats.map((s) => (
            <span key={s} className="chip">
              {s}
            </span>
          ))}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        {features.map((f) => (
          <Link key={f.href} href={f.href} className="group">
            <Card className="card-lift h-full p-6">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                style={{ background: `color-mix(in srgb, ${f.tone} 16%, transparent)` }}
              >
                {f.icon}
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-lg font-semibold">
                {f.title}
                <span className="opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100">→</span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.desc}</p>
            </Card>
          </Link>
        ))}
      </div>

      <p className="text-center text-xs text-muted">
        16 ünite ders · 245 otomatik değerlendirilen soru · gerçek Postgres (PGlite) · CodeMirror editör.
      </p>
    </div>
  );
}
