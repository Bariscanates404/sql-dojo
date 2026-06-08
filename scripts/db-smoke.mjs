// Node-side smoke test: proves campus_seed.sql loads into a real Postgres (PGlite)
// and that representative teaching queries run. Also reports values the lessons
// claim, so we can eyeball any seed<->content drift (content was authored before
// the engine existed, so the numbers are worth checking).
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function assert(cond, msg) {
  if (!cond) { console.error('  ✗ FAIL:', msg); process.exitCode = 1; }
  else { console.log('  ✓', msg); }
}

const seedSql = await readFile(path.join(root, 'content', 'seed', 'campus_seed.sql'), 'utf8');
const db = new PGlite();
await db.exec(seedSql);

console.log('\n--- Yapısal kontroller (motor + seed yüklendi mi) ---');
const tables = await db.query(
  `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`,
);
console.log('Tablolar:', tables.rows.map((r) => r.table_name).join(', '));
assert(tables.rows.length === 12, '12 tablo yüklendi');

const n = async (sql) => (await db.query(sql)).rows[0].n;
assert((await n('SELECT COUNT(*)::int AS n FROM students')) > 0, 'students dolu');

const joined = await db.query(`
  SELECT s.first_name, c.name
  FROM enrollments e
  JOIN students s ON s.id = e.student_id
  JOIN courses c ON c.id = e.course_id
  LIMIT 3`);
assert(joined.rows.length === 3, '3 tablolu JOIN çalışıyor');

console.log('\n--- İçerik tutarlılığı (derste yazılı sonuç vs gerçek) ---');
const checks = [
  ['students toplam', 'SELECT COUNT(*)::int AS n FROM students', null],
  ['COUNT(email) [U4 P2 der: 14]', 'SELECT COUNT(email)::int AS n FROM students', 14],
  ['COUNT(DISTINCT city) [U4 P3 der: 4]', 'SELECT COUNT(DISTINCT city)::int AS n FROM students', 4],
  ['products [U4 P1 der: 8]', 'SELECT COUNT(*)::int AS n FROM products', 8],
  ["completed orders [U4 P4 der: 8]", "SELECT COUNT(*)::int AS n FROM orders WHERE status = 'completed'", 8],
  ['COUNT(grade) [U4 P6 der: 16]', 'SELECT COUNT(grade)::int AS n FROM enrollments', 16],
];
for (const [label, sql, expected] of checks) {
  const got = await n(sql);
  const flag = expected == null ? '' : got === expected ? ' ✓ eşleşti' : `  ⚠ DRIFT (beklenen ${expected})`;
  console.log(`  ${label}: ${got}${flag}`);
}

console.log(process.exitCode ? '\nDB SMOKE: yapısal kontrol BAŞARISIZ' : '\nDB SMOKE: motor TAMAM ✓');
