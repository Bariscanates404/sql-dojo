'use client';

import { useScratchpadStore } from '@stores/scratchpadStore';

/** Always-present floating button to open the Deneme Tahtası (also ⌘K). */
export function ScratchpadFab() {
  const open = useScratchpadStore((s) => s.open);
  const toggle = useScratchpadStore((s) => s.toggle);

  if (open) return null;

  return (
    <button
      onClick={toggle}
      aria-label="Deneme Tahtası'nı aç"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-border bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg transition hover:opacity-90 active:scale-95"
    >
      ⌨️ Deneme Tahtası
      <kbd className="rounded bg-black/20 px-1.5 py-0.5 text-xs">⌘K</kbd>
    </button>
  );
}
