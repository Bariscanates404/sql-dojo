// Client-only PGlite engine: one in-memory Postgres instance per page load.
// All seed/query operations are serialized through a single chain so a query
// can never race a seed reload. The actual @electric-sql/pglite module is only
// imported in the browser (dynamic import), never on the server.
import type { PGlite } from '@electric-sql/pglite';

import { getSeed, type SeedDef } from './seeds';

export interface DisplayResult {
  fields: { name: string }[];
  // Pozisyonel: Postgres aynı adı taşıyan iki kolon döndürebilir (örn. iki kez last_name),
  // isim bazlı bir obje bu durumda ikinci değeri birinciye ezdirir.
  rows: unknown[][];
  affectedRows: number;
  statements: number;
  durationMs: number;
}

let dbPromise: Promise<PGlite> | null = null;
let currentSeedKey: string | null = null;
const seedCache = new Map<string, string>();

// --- operation queue (mutex) ---------------------------------------------
let opChain: Promise<unknown> = Promise.resolve();
function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = opChain.then(fn, fn);
  opChain = run.then(() => undefined, () => undefined);
  return run as Promise<T>;
}

async function createDb(): Promise<PGlite> {
  const { PGlite } = await import('@electric-sql/pglite');
  return new PGlite();
}

function getDb(): Promise<PGlite> {
  if (!dbPromise) dbPromise = createDb();
  return dbPromise;
}

async function fetchSeedSql(seed: SeedDef): Promise<string> {
  const cached = seedCache.get(seed.key);
  if (cached) return cached;
  const res = await fetch(seed.url);
  if (!res.ok) throw new Error(`Seed indirilemedi (${res.status}): ${seed.url}`);
  const sql = await res.text();
  seedCache.set(seed.key, sql);
  return sql;
}

async function applySeed(seed: SeedDef): Promise<void> {
  const db = await getDb();
  const sql = await fetchSeedSql(seed);
  // wipe everything, then reload — gives a clean DB without recreating the instance
  await db.exec('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
  await db.exec(sql);
  currentSeedKey = seed.key;
}

/** Load the seed if it isn't already the active one. */
export function ensureSeed(seedKey: string): Promise<void> {
  return enqueue(async () => {
    const seed = getSeed(seedKey);
    if (currentSeedKey === seed.key) return;
    await applySeed(seed);
  });
}

/** Force-reload the seed (the "↺ Sıfırla" button). */
export function resetSeed(seedKey: string): Promise<void> {
  return enqueue(() => applySeed(getSeed(seedKey)));
}

/** Run user SQL (may contain multiple statements / DDL) and return a display result. */
export function execSql(sql: string): Promise<DisplayResult> {
  return enqueue(async () => {
    const db = await getDb();
    const t0 = performance.now();
    const results = await db.exec(sql, { rowMode: 'array' });
    const durationMs = performance.now() - t0;
    // Show the last statement that produced columns (a SELECT / RETURNING);
    // otherwise the last statement (so DML/DDL reports affected rows).
    const withFields = [...results].reverse().find((r) => r.fields && r.fields.length > 0);
    const chosen = withFields ?? results[results.length - 1];
    return {
      fields: (chosen?.fields ?? []).map((f) => ({ name: f.name })),
      // exec()'in tip imzası rowMode'u yansıtmıyor (pglite .d.ts sınırlaması); asıl veri dizi.
      rows: (chosen?.rows ?? []) as unknown as unknown[][],
      affectedRows: chosen?.affectedRows ?? 0,
      statements: results.length,
      durationMs,
    };
  });
}

export interface TableInfo {
  table: string;
  columns: { name: string; type: string }[];
}

/** List tables + columns of the active seed (for the Deneme Tahtası sidebar). */
export function listTables(): Promise<TableInfo[]> {
  return enqueue(async () => {
    const db = await getDb();
    const res = await db.query<{ table_name: string; column_name: string; data_type: string }>(
      `SELECT table_name, column_name, data_type
       FROM information_schema.columns
       WHERE table_schema = 'public'
       ORDER BY table_name, ordinal_position`,
    );
    const map = new Map<string, { name: string; type: string }[]>();
    for (const r of res.rows) {
      if (!map.has(r.table_name)) map.set(r.table_name, []);
      map.get(r.table_name)!.push({ name: r.column_name, type: r.data_type });
    }
    return [...map.entries()].map(([table, columns]) => ({ table, columns }));
  });
}
