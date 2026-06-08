'use client';

import { useEffect, useState } from 'react';

import { Button } from '@ui/Button';
import { useSqlRunner } from '@hooks/useSqlRunner';

import { QueryResultView } from './QueryResultView';
import { SqlEditor } from './SqlEditor';

interface SqlRunnerProps {
  seedKey: string;
  initialSql?: string;
  fontSize?: number;
  showReset?: boolean;
}

/** The one editor+run+result core reused everywhere (playground, scratchpad, examples). */
export function SqlRunner({ seedKey, initialSql = '', fontSize = 14, showReset = true }: SqlRunnerProps) {
  const [sqlText, setSqlText] = useState(initialSql);
  const { ready, running, result, error, run, reset } = useSqlRunner(seedKey);

  useEffect(() => {
    setSqlText(initialSql);
  }, [initialSql]);

  return (
    <div className="flex flex-col gap-3">
      <SqlEditor value={sqlText} onChange={setSqlText} onRun={() => run(sqlText)} fontSize={fontSize} />
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => run(sqlText)} disabled={!ready || running} size="sm">
          {running ? 'Çalışıyor…' : '▶ Çalıştır'}
          <span className="text-xs opacity-60">⌘↵</span>
        </Button>
        {showReset && (
          <Button onClick={reset} disabled={!ready || running} variant="secondary" size="sm">
            ↺ Sıfırla
          </Button>
        )}
        {!ready && <span className="text-xs text-muted">Veritabanı hazırlanıyor…</span>}
      </div>
      <QueryResultView result={result} error={error} />
    </div>
  );
}
