import type { QStat } from '@stores/questionProgressStore';

import type { Question } from './schema';

export interface QFilters {
  units: string[];
  difficulties: number[];
  types: string[];
}

export function filterQuestions(all: Question[], f: QFilters): Question[] {
  return all.filter(
    (q) =>
      (f.units.length === 0 || f.units.includes(q.unit)) &&
      (f.difficulties.length === 0 || f.difficulties.includes(q.difficulty)) &&
      (f.types.length === 0 || f.types.includes(q.type)),
  );
}

// Ağırlık: yeni soru > zayıf (yanlış/hatalı) > kısmi > bilinen. Cevabı görülmüş hafif öne gelir (tekrar).
function weight(q: Question, stat: QStat | undefined): number {
  if (!stat || stat.bestResult === 'unseen') return 4;
  let w = 0.3;
  if (stat.bestResult === 'wrong' || stat.bestResult === 'error') w = 3;
  else if (stat.bestResult === 'partial') w = 1.5;
  if (stat.solutionViewed) w += 0.5;
  return w;
}

/** Ağırlıklı rastgele seçim; mümkünse son görülenleri atlar (ezber önleme). */
export function pickNext(
  pool: Question[],
  stats: Record<string, QStat>,
  recentIds: string[],
): Question | null {
  if (pool.length === 0) return null;
  const fresh = pool.filter((q) => !recentIds.includes(q.id));
  const list = fresh.length > 0 ? fresh : pool;

  const weights = list.map((q) => weight(q, stats[q.id]));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < list.length; i++) {
    r -= weights[i];
    if (r <= 0) return list[i];
  }
  return list[list.length - 1];
}
