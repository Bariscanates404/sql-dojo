'use client';

import { useEffect, useMemo, useState } from 'react';

import { QuestionCard } from '@/components/questions/QuestionCard';
import { Button } from '@ui/Button';
import { Card } from '@ui/Card';
import { loadQuestions } from '@lib/questions/load';
import { filterQuestions, pickNext, type QFilters } from '@lib/questions/select';
import { DIFFICULTY_LABEL, type Question, UNITS } from '@lib/questions/schema';
import { useQuestionProgressStore } from '@stores/questionProgressStore';
import { cn } from '@utils/cn';

const TYPE_LABEL: Record<string, string> = { write_sql: 'SQL yaz', multiple_choice: 'Çoktan seçmeli' };

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-sm transition',
        active ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-foreground/30',
      )}
    >
      {children}
    </button>
  );
}

export default function SorularPage() {
  const [all, setAll] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [units, setUnits] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<number[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [phase, setPhase] = useState<'setup' | 'active'>('setup');
  const [current, setCurrent] = useState<Question | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const [nonce, setNonce] = useState(0);
  const [answered, setAnswered] = useState(0);

  const stats = useQuestionProgressStore((s) => s.stats);
  const record = useQuestionProgressStore((s) => s.record);

  useEffect(() => {
    loadQuestions().then(setAll).catch((e) => setError(String(e)));
  }, []);

  const filters: QFilters = useMemo(() => ({ units, difficulties, types }), [units, difficulties, types]);
  const pool = useMemo(() => filterQuestions(all, filters), [all, filters]);

  const availUnits = useMemo(() => UNITS.filter((u) => all.some((q) => q.unit === u)), [all]);
  const availDiff = useMemo(() => [1, 2, 3, 4].filter((d) => all.some((q) => q.difficulty === d)), [all]);
  const availTypes = useMemo(() => [...new Set(all.map((q) => q.type))], [all]);

  const toggle = <T,>(list: T[], v: T, set: (x: T[]) => void) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  function start() {
    const next = pickNext(pool, stats, []);
    if (!next) return;
    setCurrent(next);
    setRecent([next.id]);
    setNonce((n) => n + 1);
    setAnswered(0);
    setPhase('active');
  }

  function next() {
    const nextQ = pickNext(pool, stats, recent.slice(-4));
    setCurrent(nextQ);
    if (nextQ) setRecent((r) => [...r, nextQ.id]);
    setNonce((n) => n + 1);
  }

  if (error) return <p className="text-sm text-danger">{error}</p>;

  if (phase === 'active') {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Bu oturumda yanıtlanan: {answered}</span>
          <Button size="sm" variant="ghost" onClick={() => setPhase('setup')}>← Filtrelere dön</Button>
        </div>
        {current ? (
          <Card className="p-5">
            <QuestionCard
              key={`${current.id}:${nonce}`}
              question={current}
              onGraded={(r) => {
                record(current.id, r);
                setAnswered((a) => a + 1);
              }}
              onNext={next}
            />
          </Card>
        ) : (
          <p className="text-sm text-muted">Bu filtrede başka soru kalmadı. Filtreleri genişlet.</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">📝 Sorular</h1>
        <p className="mt-1 text-sm text-muted">
          Kapsamı seç, rastgele soru çöz. Her soru gerçek Postgres üzerinde otomatik değerlendirilir.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <div>
          <div className="mb-1 text-sm font-semibold">Ünite kapsamı {units.length > 0 && <span className="text-muted">({units.length} seçili)</span>}</div>
          <div className="flex flex-wrap gap-2">
            {availUnits.map((u) => (
              <Chip key={u} active={units.includes(u)} onClick={() => toggle(units, u, setUnits)}>{u}</Chip>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1 text-sm font-semibold">Zorluk</div>
          <div className="flex flex-wrap gap-2">
            {availDiff.map((d) => (
              <Chip key={d} active={difficulties.includes(d)} onClick={() => toggle(difficulties, d, setDifficulties)}>
                {DIFFICULTY_LABEL[d]}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1 text-sm font-semibold">Tip</div>
          <div className="flex flex-wrap gap-2">
            {availTypes.map((t) => (
              <Chip key={t} active={types.includes(t)} onClick={() => toggle(types, t, setTypes)}>{TYPE_LABEL[t] ?? t}</Chip>
            ))}
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <Button onClick={start} disabled={pool.length === 0}>Başla →</Button>
        <span className="text-sm text-muted">
          Seçilen kapsamda <strong>{pool.length}</strong> soru
          {units.length + difficulties.length + types.length === 0 && ' (filtre yok = tüm banka)'}
        </span>
      </div>
    </div>
  );
}
