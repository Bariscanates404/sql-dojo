'use client';

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
  error: string | null;
}

export function QueryResultView({ result, error }: QueryResultViewProps) {
  if (error) {
    return (
      <div className="whitespace-pre-wrap rounded-xl border border-danger/40 bg-danger/10 p-3 font-mono text-sm text-danger">
        {error}
      </div>
    );
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
              {result.fields.map((f) => (
                <th
                  key={f.name}
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
                {result.fields.map((f) => {
                  const v = row[f.name];
                  const isNull = v === null || v === undefined;
                  return (
                    <td
                      key={f.name}
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
