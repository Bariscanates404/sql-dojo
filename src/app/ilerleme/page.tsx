'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@ui/Button';
import { Card } from '@ui/Card';
import { loadQuestions } from '@lib/questions/load';
import { type Question, UNITS } from '@lib/questions/schema';
import { useQuestionProgressStore } from '@stores/questionProgressStore';

function Bar({ value, total }: { value: number; total: number }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/10">
      <div
        className="h-full rounded-full"
        style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--brand-from), var(--brand-to))' }}
      />
    </div>
  );
}

export default function IlerlemePage() {
  const [all, setAll] = useState<Question[]>([]);
  const stats = useQuestionProgressStore((s) => s.stats);
  const resetAll = useQuestionProgressStore((s) => s.resetAll);

  useEffect(() => {
    loadQuestions().then(setAll).catch(() => {});
  }, []);

  const data = useMemo(() => {
    const isCorrect = (id: string) => stats[id]?.bestResult === 'correct';
    const isAttempted = (id: string) => stats[id] && stats[id].bestResult !== 'unseen';
    const correct = all.filter((q) => isCorrect(q.id)).length;
    const attempted = all.filter((q) => isAttempted(q.id)).length;

    const byUnit = UNITS.map((u) => {
      const qs = all.filter((q) => q.unit === u);
      return { unit: u, total: qs.length, correct: qs.filter((q) => isCorrect(q.id)).length };
    }).filter((x) => x.total > 0);

    const concept = new Map<string, { total: number; correct: number }>();
    for (const q of all) {
      for (const c of q.conceptTags) {
        const e = concept.get(c) ?? { total: 0, correct: 0 };
        e.total++;
        if (isCorrect(q.id)) e.correct++;
        concept.set(c, e);
      }
    }
    const concepts = [...concept.entries()]
      .map(([name, e]) => ({ name, ...e, pct: e.total ? e.correct / e.total : 0 }))
      .filter((c) => c.total >= 2)
      .sort((a, b) => a.pct - b.pct);

    return { correct, attempted, total: all.length, byUnit, concepts };
  }, [all, stats]);

  if (all.length === 0) return <p className="text-sm text-muted">Yükleniyor…</p>;

  if (data.attempted === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-2xl font-bold">📊 İlerleme</h1>
        <p className="max-w-md text-muted">
          Henüz soru çözmedin. <strong>Sorular</strong>’a gidip birkaç soru çöz, ilerlemen ve kavram ustalığın burada belirsin.
        </p>
        <Link href="/sorular">
          <Button>Sorular’a git →</Button>
        </Link>
      </div>
    );
  }

  const weak = data.concepts.filter((c) => c.correct < c.total).slice(0, 8);
  const strong = data.concepts.filter((c) => c.correct === c.total);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📊 İlerleme</h1>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            if (confirm('Tüm ilerleme sıfırlansın mı? (geri alınamaz)')) resetAll();
          }}
        >
          ↺ Sıfırla
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="text-3xl font-extrabold gradient-text">{data.correct}/{data.total}</div>
          <div className="mt-1 text-sm text-muted">doğru çözülen soru</div>
        </Card>
        <Card className="p-5">
          <div className="text-3xl font-extrabold">{data.attempted}</div>
          <div className="mt-1 text-sm text-muted">denenen soru</div>
        </Card>
        <Card className="p-5">
          <div className="text-3xl font-extrabold">{Math.round((data.correct / data.total) * 100)}%</div>
          <div className="mt-1 text-sm text-muted">genel ustalık</div>
        </Card>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Ünite ilerlemesi</h2>
        <div className="flex flex-col gap-3">
          {data.byUnit.map((u) => (
            <div key={u.unit} className="flex items-center gap-3">
              <span className="w-10 shrink-0 font-mono text-sm">{u.unit}</span>
              <Bar value={u.correct} total={u.total} />
              <span className="w-14 shrink-0 text-right text-xs text-muted">
                {u.correct}/{u.total}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold">Çalışılacak kavramlar</h2>
          {weak.length === 0 ? (
            <p className="text-sm text-muted">Denediğin kavramların hepsinde tamsın 👏</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {weak.map((c) => (
                <li key={c.name} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                  <span className="font-mono">{c.name}</span>
                  <span className="text-muted">{c.correct}/{c.total} doğru</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="mb-3 text-lg font-semibold">Oturmuş kavramlar</h2>
          {strong.length === 0 ? (
            <p className="text-sm text-muted">Bir kavramın tamamını doğrularsan burada görünür.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {strong.map((c) => (
                <span key={c.name} className="chip">✓ {c.name}</span>
              ))}
            </div>
          )}
        </div>
      </section>

      <p className="text-xs text-muted">
        İlerleme şu an bu tarayıcıda saklanıyor (hesap yok). İleride hesap eklenince cihazlar arası senkronlanacak.
      </p>
    </div>
  );
}
