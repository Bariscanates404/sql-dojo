'use client';

import { SqlRunner } from '@/components/sql/SqlRunner';
import { Button } from '@ui/Button';
import { SEEDS } from '@lib/db/seeds';
import { useScratchpadStore } from '@stores/scratchpadStore';
import { cn } from '@utils/cn';

import { TablesSidebar } from './TablesSidebar';

/** The global "Deneme Tahtası" — a bottom sheet that opens over any screen. */
export function Scratchpad() {
  const { open, presentation, seedKey, prefillSql, prefillNonce, close, togglePresentation, setSeedKey } =
    useScratchpadStore();

  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 flex animate-slide-up flex-col border-t border-border bg-surface shadow-2xl',
        presentation ? 'h-[88vh]' : 'h-[62vh]',
      )}
      role="dialog"
      aria-label="Deneme Tahtası"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold">⌨️ Deneme Tahtası</span>
          <label className="flex items-center gap-1 text-xs text-muted">
            seed
            <select
              value={seedKey}
              onChange={(e) => setSeedKey(e.target.value)}
              className="rounded-lg border border-border bg-background px-2 py-1 text-sm text-foreground"
            >
              {Object.values(SEEDS).map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={togglePresentation}>
            {presentation ? '🔎 Normal' : '🖥 Sunum'}
          </Button>
          <Button size="sm" variant="ghost" onClick={close}>
            ✕ Kapat <span className="text-xs opacity-60">Esc</span>
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-56 shrink-0 overflow-auto border-r border-border p-3 md:block">
          <TablesSidebar refreshKey={seedKey} />
        </aside>
        <div className="min-h-0 flex-1 overflow-auto p-4">
          <SqlRunner
            key={`${seedKey}:${prefillNonce}`}
            seedKey={seedKey}
            initialSql={prefillSql}
            fontSize={presentation ? 20 : 14}
          />
        </div>
      </div>
    </div>
  );
}
