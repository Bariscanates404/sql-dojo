'use client';

import { useEffect, useState } from 'react';

import { listTables, type TableInfo } from '@lib/db/pglite';
import { useScratchpadStore } from '@stores/scratchpadStore';

/** refreshKey changes (e.g. seed switch) trigger a re-read of the schema. */
export function TablesSidebar({ refreshKey }: { refreshKey: string }) {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const openPanel = useScratchpadStore((s) => s.openPanel);

  useEffect(() => {
    let active = true;
    listTables()
      .then((t) => active && setTables(t))
      .catch(() => active && setTables([]));
    return () => {
      active = false;
    };
  }, [refreshKey]);

  return (
    <div className="text-sm">
      <div className="mb-2 font-semibold text-muted">Tablolar</div>
      <ul className="flex flex-col gap-3">
        {tables.map((t) => (
          <li key={t.table}>
            <button
              onClick={() => openPanel(`SELECT * FROM ${t.table} LIMIT 20;`)}
              className="font-mono font-semibold hover:text-primary"
              title="Bu tabloyu sorgula"
            >
              {t.table}
            </button>
            <ul className="mt-0.5 pl-3 text-xs text-muted">
              {t.columns.map((c) => (
                <li key={c.name} className="font-mono">
                  {c.name} <span className="opacity-60">{c.type}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
        {tables.length === 0 && <li className="text-xs text-muted">Yükleniyor…</li>}
      </ul>
    </div>
  );
}
