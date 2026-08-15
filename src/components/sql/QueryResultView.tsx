'use client';

import { useEffect, useState } from 'react';

import type { SqlError } from '@lib/db/errors';
import type { DisplayResult } from '@lib/db/pglite';
import { cn } from '@utils/cn';

function renderCell(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

interface QueryResultViewProps {
  result: DisplayResult | null;
  error: SqlError | null;
}

export function QueryResultView({ result, error }: QueryResultViewProps) {
  if (error) {
    return <SqlErrorView error={error} />;
  }

  if (!result) {
    return (
      <p className="text-sm text-muted">
        Sonuç burada görünecek. Sorguyu yazıp <strong>Çalıştır</strong>’a (veya ⌘↵) bas.
      </p>
    );
  }

  if (result.fields.length === 0) {
    return (
      <p className="text-sm text-ok">
        Komut çalıştı. Etkilenen satır: {result.affectedRows}
        {result.statements > 1 ? ` · ${result.statements} ifade` : ''}.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-2 text-xs text-muted">
        {result.rows.length} satır · {result.durationMs.toFixed(1)} ms
      </div>
      <div className="max-h-[45vh] overflow-auto rounded-xl border border-border">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0">
            <tr>
              {result.fields.map((f, i) => (
                <th
                  key={i}
                  className="whitespace-nowrap border-b border-border bg-surface px-3 py-2 text-left font-semibold"
                >
                  {f.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, i) => (
              <tr key={i} className="odd:bg-foreground/[0.025]">
                {result.fields.map((_f, j) => {
                  const v = row[j];
                  const isNull = v === null || v === undefined;
                  return (
                    <td
                      key={j}
                      className={cn(
                        'whitespace-nowrap border-b border-border px-3 py-1.5 font-mono',
                        isNull && 'italic text-muted',
                      )}
                    >
                      {renderCell(v)}
                    </td>
                  );
                })}
              </tr>
            ))}
            {result.rows.length === 0 && (
              <tr>
                <td colSpan={result.fields.length} className="px-3 py-3 text-center text-muted">
                  0 satır döndü
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// İki kademeli hata gösterimi:
//   Kademe 1 (her zaman): gerçek Postgres hata mesajı + SQLSTATE — gerçek araçlardaki gibi.
//   Kademe 2 (butonla):   anlaşılır "ne demek + şunu yap" açıklaması, öğrenci gerçek
//                         mesajı çözemezse açar.
function SqlErrorView({ error }: { error: SqlError }) {
  const [showHelp, setShowHelp] = useState(false);
  // Yeni bir hata gelince yardımı kapat: öğrenci önce gerçek mesajla yüzleşsin.
  useEffect(() => setShowHelp(false), [error.message]);

  const f = error.friendly;
  return (
    <div className="flex flex-col gap-2">
      {/* Kademe 1: gerçek SQL hatası */}
      <div className="rounded-xl border border-danger/40 bg-danger/10 p-3">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-danger">⚠ SQL hatası</span>
          {error.code && (
            <span className="rounded bg-danger/15 px-1.5 py-0.5 font-mono text-[11px] text-danger">{error.code}</span>
          )}
        </div>
        <p className="whitespace-pre-wrap font-mono text-sm text-danger">{error.message}</p>
        {error.dbHint && (
          <p className="mt-1 whitespace-pre-wrap font-mono text-xs text-danger/80">Hint: {error.dbHint}</p>
        )}
      </div>

      {/* Kademe 2: anlaşılır açıklama (talep üzerine) */}
      {showHelp ? (
        <div className="rounded-xl border border-accent/40 bg-accent/5 p-3 text-sm">
          <div className="mb-1 font-semibold text-accent">💡 {f.title}</div>
          <p className="leading-relaxed text-foreground/90">{f.what}</p>
          <p className="mt-2 leading-relaxed">
            <span className="font-semibold text-accent">Şunu yap: </span>
            <span className="text-foreground/90">{f.fix}</span>
          </p>
        </div>
      ) : (
        <button
          onClick={() => setShowHelp(true)}
          className="self-start rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition hover:border-accent/50 hover:text-foreground"
        >
          🤔 Anlamadım, bu hata ne demek?
        </button>
      )}
    </div>
  );
}
