import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type QResult = 'correct' | 'partial' | 'wrong' | 'error';

export interface QStat {
  attempts: number;
  bestResult: QResult | 'unseen';
  lastSeenAt: number;
  solutionViewed: boolean;
  hintsUsed: number;
}

const RANK: Record<string, number> = { unseen: -1, error: 0, wrong: 1, partial: 2, correct: 3 };

interface QProgressState {
  stats: Record<string, QStat>;
  record: (questionId: string, r: { result: QResult; solutionViewed: boolean; hintsUsed: number }) => void;
  resetAll: () => void;
}

export const useQuestionProgressStore = create<QProgressState>()(
  persist(
    (set) => ({
      stats: {},
      record: (questionId, r) =>
        set((state) => {
          const prev = state.stats[questionId];
          const best =
            !prev || RANK[r.result] > RANK[prev.bestResult] ? r.result : prev.bestResult;
          return {
            stats: {
              ...state.stats,
              [questionId]: {
                attempts: (prev?.attempts ?? 0) + 1,
                bestResult: best,
                lastSeenAt: Date.now(),
                solutionViewed: (prev?.solutionViewed ?? false) || r.solutionViewed,
                hintsUsed: Math.max(prev?.hintsUsed ?? 0, r.hintsUsed),
              },
            },
          };
        }),
      resetAll: () => set({ stats: {} }),
    }),
    { name: 'sql-dojo-question-progress' },
  ),
);
