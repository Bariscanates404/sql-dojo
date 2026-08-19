'use client';

import { SchemaPanel } from '@/components/db/SchemaPanel';
import { useScratchpadStore } from '@stores/scratchpadStore';

/** refreshKey changes (e.g. seed switch) trigger a re-read of the schema. */
export function TablesSidebar({ refreshKey }: { refreshKey: string }) {
  const openPanel = useScratchpadStore((s) => s.openPanel);

  return (
    <div className="text-sm">
      <div className="mb-2 font-semibold text-muted">Tablolar</div>
      <SchemaPanel
        refreshKey={refreshKey}
        onPick={(table) => openPanel(`SELECT * FROM ${table} LIMIT 20;`)}
      />
    </div>
  );
}
