'use client';

import { useCallback, useEffect, useState } from 'react';

import { ensureSeed, execSql, type DisplayResult, resetSeed } from '@lib/db/pglite';
import { toSqlError, type SqlError } from '@lib/db/errors';

export interface SqlRunnerState {
  ready: boolean;
  running: boolean;
  result: DisplayResult | null;
  error: SqlError | null;
  run: (sql: string) => Promise<void>;
  reset: () => Promise<void>;
}

/** Shared core used by the playground, lesson examples, and the Deneme Tahtası. */
export function useSqlRunner(seedKey: string): SqlRunnerState {
  const [ready, setReady] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<DisplayResult | null>(null);
  const [error, setError] = useState<SqlError | null>(null);

  useEffect(() => {
    let active = true;
    setReady(false);
    ensureSeed(seedKey)
      .then(() => { if (active) setReady(true); })
      .catch((e) => { if (active) setError(toSqlError(e)); });
    return () => { active = false; };
  }, [seedKey]);

  const run = useCallback(async (sql: string) => {
    if (!sql.trim()) return;
    setRunning(true);
    setError(null);
    try {
      setResult(await execSql(sql));
    } catch (e) {
      setError(toSqlError(e));
      setResult(null);
    } finally {
      setRunning(false);
    }
  }, []);

  const reset = useCallback(async () => {
    setRunning(true);
    setError(null);
    try {
      await resetSeed(seedKey);
      setResult(null);
    } catch (e) {
      setError(toSqlError(e));
    } finally {
      setRunning(false);
    }
  }, [seedKey]);

  return { ready, running, result, error, run, reset };
}
