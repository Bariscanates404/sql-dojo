'use client';

import { useEffect, useState } from 'react';

import { QueryResultView } from '@/components/sql/QueryResultView';
import { SqlEditor } from '@/components/sql/SqlEditor';
import { Button } from '@ui/Button';
import { toSqlError, type SqlError } from '@lib/db/errors';
import { ensureSeed, execSandboxed, execSql, type DisplayResult } from '@lib/db/pglite';
import { gradeQuestion, type GradeResult } from '@lib/questions/grade';
import { SchemaPanel } from '@/components/db/SchemaPanel';
import { DIFFICULTY_DESC, DIFFICULTY_LABEL, type Question } from '@lib/questions/schema';
import { cn } from '@utils/cn';

interface Props {
  question: Question;
  onGraded: (r: { result: GradeResult['result']; solutionViewed: boolean; hintsUsed: number }) => void;
  onNext: () => void;
}

const RESULT_STYLE: Record<GradeResult['result'], string> = {
  correct: 'border-ok/50 bg-ok/10',
  partial: 'border-accent/50 bg-accent/10',
  wrong: 'border-danger/40 bg-danger/10',
  error: 'border-danger/40 bg-danger/10',
};
const RESULT_LABEL: Record<GradeResult['result'], string> = {
  correct: '✅ Doğru',
  partial: '🟡 Kısmen doğru',
  wrong: '❌ Yanlış',
  error: '⚠️ Çalışmadı',
};

export function QuestionCard({ question: q, onGraded, onNext }: Props) {
  const [schemaOpen, setSchemaOpen] = useState(true);
  // Panel, ilgili tablo bulunamayınca BİR KEZ kendini kapatır. Bayrak olmasaydı
  // öğrenci paneli her açtığında anında yeniden kapanır, yani açamazdı.
  const [autoCollapsed, setAutoCollapsed] = useState(false);
  // Bozuk sorgu / boşluk şablonu varsa editör dolu başlar (bkz. schema.starterSql).
  const [sql, setSql] = useState(q.starterSql ?? '');
  const [choiceIndex, setChoiceIndex] = useState<number | null>(null);
  const [runResult, setRunResult] = useState<DisplayResult | null>(null);
  const [runError, setRunError] = useState<SqlError | null>(null);
  const [grade, setGrade] = useState<GradeResult | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [solutionShown, setSolutionShown] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    ensureSeed('campus').catch(() => {});
  }, []);

  const isSql = q.type === 'write_sql';
  // verifySql dolu = soru veriyi değiştiriyor; hem Çalıştır hem Gönder
  // BEGIN...ROLLBACK içinde koşar, kum havuzu bozulmaz.
  const mutating = q.assessment?.verifySql;

  async function run() {
    setBusy(true);
    setRunError(null);
    try {
      setRunResult(mutating ? await execSandboxed(sql, mutating) : await execSql(sql));
    } catch (e) {
      setRunError(toSqlError(e));
      setRunResult(null);
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    setBusy(true);
    try {
      const g = await gradeQuestion(q, isSql ? { sql } : { choiceIndex: choiceIndex ?? -1 });
      setGrade(g);
      onGraded({ result: g.result, solutionViewed: solutionShown, hintsUsed: hintsShown });
    } finally {
      setBusy(false);
    }
  }

  const maxHints = q.tr.hint2 ? 2 : 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-lg bg-foreground/5 px-2 py-1 font-mono">{q.unit}</span>
        <span
          className="cursor-help rounded-lg bg-foreground/5 px-2 py-1"
          title={DIFFICULTY_DESC[q.difficulty]}
        >
          {DIFFICULTY_LABEL[q.difficulty]}
        </span>
        {q.conceptTags.slice(0, 4).map((t) => (
          <span key={t} className="rounded-lg bg-primary/10 px-2 py-1 text-primary">{t}</span>
        ))}
      </div>

      <p className="-mt-2 text-xs text-muted">{DIFFICULTY_DESC[q.difficulty]}</p>

      <div>
        <h2 className="text-lg font-semibold">{q.tr.title}</h2>
        <p className="mt-1 whitespace-pre-wrap leading-relaxed text-foreground/90">{q.tr.prompt}</p>
      </div>

      {isSql ? (
        <>
          {/* Sorgu yazarken sutun adlarini bilmek sart; ogrenci tabloyu ezberlemek
              zorunda kalmasin diye sema burada, sorunun hemen altinda duruyor. */}
          <div className="rounded-xl border border-border bg-surface">
            <button
              onClick={() => setSchemaOpen((o) => !o)}
              className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold"
            >
              <span>🗂️ {schemaOpen ? 'Bu sorunun tabloları' : 'Tabloları göster'}</span>
              <span className="text-xs text-muted">{schemaOpen ? 'gizle' : 'göster'}</span>
            </button>
            {schemaOpen && (
              <div className="border-t border-border px-3 py-2.5">
                <SchemaPanel
                  onNoMatch={(no) => {
                    if (no && !autoCollapsed) {
                      setAutoCollapsed(true);
                      setSchemaOpen(false);
                    }
                  }}
                  // Başlangıç SQL'i de öğrencinin GÖRDÜĞÜ metindir; hata avı sorularında
                  // tablo adı yalnızca orada geçiyor ve o sorularda panel 12 tablonun
                  // hepsini gösteriyordu. Cevabın SQL'ine bakmıyoruz, o ipucu olurdu.
                  relevantTo={`${q.tr.title} ${q.tr.prompt} ${q.starterSql ?? ''}`}
                  onPick={(table) => setSql((cur) => (cur.trim() ? cur : `SELECT * FROM ${table} LIMIT 10;`))}
                />
              </div>
            )}
          </div>

          {mutating && (
            <p className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-accent">
              🛡️ Bu soru veriyi <strong>değiştiren</strong> bir komut istiyor. Gönül rahatlığıyla dene:
              çalıştırdığın her şey otomatik geri alınıyor, kum havuzu bozulmuyor. Keşfetmek için
              serbestçe <code>SELECT</code> de yazabilirsin.
            </p>
          )}

          <SqlEditor value={sql} onChange={setSql} onRun={run} minHeight="120px" />

          {/* Editör boşken Çalıştır ve Gönder kapalı. Sebebini yazmazsak öğrenci
              gri butonlara bakıp "sorgu çalıştıramıyorum" diye düşünüyor;
              kapalı bir düğme, sebebini söylemediği sürece bozuk görünür. */}
          {!sql.trim() && (
            <p className="text-xs text-muted">
              ✍️ Sorguyu yukarıdaki kutuya yaz; yazmaya başlayınca <strong>Çalıştır</strong> ve{' '}
              <strong>Gönder</strong> düğmeleri açılır. Sütun adlarını yukarıdaki tablo listesinden
              alabilirsin.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="secondary" onClick={run} disabled={busy || !sql.trim()} title={!sql.trim() ? 'Önce sorguyu yaz' : 'Sorguyu çalıştır'}>
              ▶ Çalıştır <span className="text-xs opacity-60">⌘↵</span>
            </Button>
            <Button size="sm" onClick={submit} disabled={busy || !sql.trim()} title={!sql.trim() ? 'Önce sorguyu yaz' : 'Cevabını değerlendir'}>
              Gönder &amp; değerlendir
            </Button>
            <div className="flex-1" />
            {hintsShown < maxHints && (
              <Button size="sm" variant="ghost" onClick={() => setHintsShown((h) => h + 1)}>
                💡 İpucu {maxHints > 1 ? `${hintsShown + 1}/${maxHints}` : ''}
              </Button>
            )}
            {!solutionShown && (
              <Button size="sm" variant="ghost" onClick={() => setSolutionShown(true)}>
                🔑 Çözümü gör
              </Button>
            )}
          </div>
          {runResult?.sandboxView === 'after' && (
            <p className="text-xs text-muted">
              📋 Komutun <strong>sonrasındaki</strong> tablo durumu (komutun kendisi satır
              döndürmediği için tablonun son hâli gösteriliyor).
            </p>
          )}
          {(runResult || runError) && <QueryResultView result={runResult} error={runError} />}
        </>
      ) : (
        <div className="flex flex-col gap-2">
          {(q.choices ?? []).map((c, i) => {
            const chosen = choiceIndex === i;
            const reveal = grade != null;
            const correct = i === q.correctIndex;
            return (
              <button
                key={i}
                onClick={() => !reveal && setChoiceIndex(i)}
                disabled={reveal}
                className={cn(
                  'rounded-xl border px-4 py-3 text-left transition',
                  chosen && !reveal && 'border-primary bg-primary/10',
                  !chosen && !reveal && 'border-border hover:border-foreground/30',
                  reveal && correct && 'border-ok/60 bg-ok/10',
                  reveal && chosen && !correct && 'border-danger/50 bg-danger/10',
                  reveal && !chosen && !correct && 'border-border opacity-60',
                )}
              >
                {c}
              </button>
            );
          })}
          {!grade && (
            <div className="mt-1 flex gap-2">
              <Button size="sm" onClick={submit} disabled={busy || choiceIndex === null}>
                Gönder
              </Button>
            </div>
          )}
        </div>
      )}

      {hintsShown >= 1 && <Hint label="İpucu 1" text={q.tr.hint1} />}
      {hintsShown >= 2 && q.tr.hint2 && <Hint label="İpucu 2" text={q.tr.hint2} />}

      {solutionShown && (
        <div className="rounded-xl border border-border bg-surface p-3 text-sm">
          <div className="mb-1 font-semibold">🔑 Çözüm</div>
          <p className="whitespace-pre-wrap text-foreground/90">{q.tr.answerExplanation}</p>
          {q.assessment && (
            <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-background p-2 font-mono text-xs">
              {q.assessment.referenceSql}
            </pre>
          )}
        </div>
      )}

      {grade && (
        <div className={cn('rounded-xl border p-4', RESULT_STYLE[grade.result])}>
          <div className="mb-2 flex items-center justify-between">
            <span className="font-semibold">{RESULT_LABEL[grade.result]}</span>
            <span className="text-xs text-muted">puan {Math.round(grade.score * 100)}/100</span>
          </div>
          <dl className="space-y-1 text-sm">
            <Row k="Ne doğru?" v={grade.whatCorrect} />
            <Row k="Ne farklı?" v={grade.whatDifferent} />
            <Row k="Nereye bak?" v={grade.whereToLook} />
          </dl>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={onNext}>Sonraki soru →</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Hint({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl border border-accent/40 bg-accent/5 px-3 py-2 text-sm">
      <span className="font-semibold text-accent">💡 {label}: </span>
      {text}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <dt className="min-w-24 shrink-0 font-medium text-muted">{k}</dt>
      <dd className="whitespace-pre-wrap">{v}</dd>
    </div>
  );
}
