// Seed registry. Each seed is a Postgres script fetched and loaded into PGlite.
// Faz 0: a single "Kampüs" universe. Later: per-lesson subset seeds.
export interface SeedDef {
  key: string;
  label: string;
  url: string;
}

export const SEEDS: Record<string, SeedDef> = {
  campus: {
    key: 'campus',
    label: 'Kampüs (tam veri)',
    url: '/content/seed/campus_seed.sql',
  },
};

export const DEFAULT_SEED_KEY = 'campus';

export function getSeed(key: string): SeedDef {
  return SEEDS[key] ?? SEEDS[DEFAULT_SEED_KEY];
}
