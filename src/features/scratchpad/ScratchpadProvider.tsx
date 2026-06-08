'use client';

import { useEffect } from 'react';

import { useScratchpadStore } from '@stores/scratchpadStore';

import { Scratchpad } from './Scratchpad';
import { ScratchpadFab } from './ScratchpadFab';

/** Mounted once in the root layout: the floating button, the panel, and the global ⌘K / Esc shortcuts. */
export function ScratchpadProvider() {
  const toggle = useScratchpadStore((s) => s.toggle);
  const close = useScratchpadStore((s) => s.close);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        toggle();
      } else if (e.key === 'Escape') {
        close();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle, close]);

  return (
    <>
      <ScratchpadFab />
      <Scratchpad />
    </>
  );
}
