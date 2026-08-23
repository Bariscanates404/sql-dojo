// qa:teach — "ogretilmeden sorulan ozellik" kapisi.
//
// Neden var: Barish uc kez ayni sinif kusuru bildirdi (SAVEPOINT, LEFT, ORDER BY):
// soru bir SQL ozelligini istiyor ama o ozellik mufredatta o noktaya kadar hic
// gosterilmemis. Elle yakalanamaz, cunku her yeni soru bu riski tasiyor.
//
// KURAL: bir ozellik ancak dersin GERCEK SQL'inde (kod blogu ya da `inline kod`)
// geciyorsa ogretilmis sayilir. Duz metindeki ileri atif ("ileride LEFT JOIN
// gorecegiz") ogretim DEGILDIR; ilk surum bu ayrimi yapmayinca LEFT'i kacirmisti.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const idx = JSON.parse(await readFile(path.join(root, 'public/content/lessons/index.json'), 'utf8'));

const lessonSql = {};
for (const m of idx) {
  const md = await readFile(path.join(root, 'content/lessons', m.file), 'utf8');
  const fences = [...md.matchAll(/```sql\n([\s\S]*?)```/g)].map((x) => x[1]);
  const inline = [...md.matchAll(/`([^`\n]+)`/g)].map((x) => x[1]);
  lessonSql[m.prefix] = (fences.join('\n') + '\n' + inline.join('\n')).toUpperCase();
}
const upTo = {};
let acc = '';
for (const m of idx) { acc += '\n' + lessonSql[m.prefix]; upTo[m.prefix] = acc; }

const qs = [];
for (const f of (await readdir(path.join(root, 'content/questions'))).sort())
  qs.push(...JSON.parse(await readFile(path.join(root, 'content/questions', f), 'utf8')));

const FN = /\b([A-Z_]{3,})\s*\(/g;
const KW = /\b(LEFT JOIN|RIGHT JOIN|INNER JOIN|GROUP BY|ORDER BY|PARTITION BY|NOT EXISTS|NOT IN|IS NULL|IS NOT NULL|UNION ALL|EXCEPT|INTERSECT|SAVEPOINT|ROLLBACK TO|HAVING|EXISTS|DISTINCT|BETWEEN|ILIKE|LIKE|OFFSET|LIMIT|CASCADE|TRUNCATE|RETURNING|WITH|CASE|CAST|OVER|WHERE)\b/g;
// SQL'in iskeleti: her derste var, ogretim gerektirmez.
const SKIP = new Set(['SELECT','FROM','VALUES','SET','INTO','TABLE','COLUMN','ADD','ASC','DESC','NULL','INTEGER','TEXT','NUMERIC','DATE','BOOLEAN']);
// Sorunun KENDI yarattigi yeni tablolar (CREATE TABLE soruları) ozellik degildir.
const CREATED = /^(KITAPLAR|NOTLAR|UYELER|GOREVLER|SALONLAR|RAFLAR|ZZZ_TMP)$/;

let failed = 0;
const miss = new Map();
for (const q of qs) {
  const sql = ((q.assessment?.referenceSql ?? '') + ' ' + (q.starterSql ?? '')).toUpperCase();
  if (!sql.trim()) continue;
  const toks = new Set();
  for (const m of sql.matchAll(FN)) toks.add(m[1]);
  for (const m of sql.matchAll(KW)) toks.add(m[1]);
  for (const t of toks) {
    if (SKIP.has(t) || CREATED.test(t) || t === '___') continue;
    const needle = sql.includes(t + '(') ? t + '(' : t;
    if (!upTo[q.unit]?.includes(needle)) {
      if (!miss.has(t)) miss.set(t, []);
      miss.get(t).push(`${q.unit}:${q.id}`);
    }
  }
}

console.log('\n--- Öğretilmeden sorulan özellik var mı ---');
for (const [tok, ids] of [...miss].sort((a, b) => b[1].length - a[1].length)) {
  console.error(`  ✗ ${tok}: ${ids.length} soruda kullanılıyor ama o noktaya kadar hiçbir dersin SQL'inde yok`);
  console.error(`     ${ids.slice(0, 5).join(', ')}${ids.length > 5 ? ` +${ids.length - 5}` : ''}`);
  failed++;
}
if (!failed) console.log(`  ✓ ${qs.length} sorunun tamamı, o noktaya kadar öğretilmiş özellikleri kullanıyor`);

console.log(failed ? '\nTEACH ORDER: BAŞARISIZ' : '\nTEACH ORDER: TAMAM ✓');
process.exit(failed ? 1 : 0);
