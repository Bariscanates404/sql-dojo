import { create } from 'zustand';

import { DEFAULT_SEED_KEY } from '@lib/db/seeds';

interface ScratchpadState {
  open: boolean;
  presentation: boolean;
  seedKey: string;
  prefillSql: string;
  prefillNonce: number;
  /** Open the panel; if `sql` is given, load it into the editor (bumps nonce to force a remount). */
  openPanel: (sql?: string) => void;
  close: () => void;
  toggle: () => void;
  togglePresentation: () => void;
  setSeedKey: (key: string) => void;
}

export const useScratchpadStore = create<ScratchpadState>((set) => ({
  open: false,
  presentation: false,
  seedKey: DEFAULT_SEED_KEY,
  prefillSql: '',
  prefillNonce: 0,
  openPanel: (sql) =>
    set((s) => ({
      open: true,
      prefillSql: sql ?? s.prefillSql,
      prefillNonce: sql !== undefined ? s.prefillNonce + 1 : s.prefillNonce,
    })),
  close: () => set({ open: false }),
  toggle: () => set((s) => ({ open: !s.open })),
  togglePresentation: () => set((s) => ({ presentation: !s.presentation })),
  setSeedKey: (key) => set({ seedKey: key }),
}));
