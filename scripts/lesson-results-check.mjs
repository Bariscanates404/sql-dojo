// İçerik-QA: derslerde her ```sql SELECT bloğunun hemen ardından gösterilen markdown
// "Sonuç" tablosunu, sorguyu Kampüs seed'inde çalıştırıp karşılaştırır.
// Sütun adları + satır sayısı (sert sinyal) ve değerler (yumuşak sinyal) kontrol edilir.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const db = new PGlite();
await db.exec(await readFile(path.join(root, 'content', 'seed', 'campus_seed.sql'), 'utf8'));

const strip = (l) => l.replace(/^\s*>\s?/, '');
const norm = (v) => {
  if (v === null || v === undefined) return 'NULL';
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v).trim();
  if (s !== '' && !Number.isNaN(Number(s))) return String(Number(s)); // 45.00 == 45
  return s;
};

// Çıktı: lesson içinde [{sql, table}] çiftleri (sql tek-ifadeli SELECT, ardından markdown tablo)
function pairs(md) {
  const lines = md.split('\n').map(strip);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/^```sql/.test(lines[i].trim())) continue;
    let j = i + 1;
    const sqlLines = [];
    while (j < lines.length && !/^```/.test(lines[j].trim())) sqlLines.push(lines[j++]);
    const sql = sqlLines.join('\n').trim();
    i = j;
    // sql sonrası ilk markdown tabloyu ara (en fazla 6 boş/prose satır atla)
    let k = j + 1, skipped = 0, table = null;
    while (k < lines.length && skipped < 6) {
      const t = lines[k].trim();
      if (t.startsWith('|') && lines[k + 1] && /^\|?[\s:-]+\|/.test(lines[k + 1].trim())) {
        const tbl = [];
        let m = k;
        while (m < lines.length && lines[m].trim().startsWith('|')) { tbl.push(lines[m].trim()); m++; }
        const cells = (row) => row.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
        const headers = cells(tbl[0]);
        const rows = tbl.slice(2).map(cells);
        table = { headers, rows };
        break;
      }
      if (t === '' || (!t.startsWith('|') && !t.startsWith('-'))) skipped++;
      k++;
    }
    if (table) out.push({ sql, table });
  }
  return out;
}

const files = (await readdir(path.join(root, 'content', 'lessons'))).filter((f) => f.endsWith('.md')).sort();
let checked = 0, colMismatch = 0, rowMismatch = 0, valMismatch = 0;
const issues = [];

for (const f of files) {
  for (const { sql, table } of pairs(await readFile(path.join(root, 'content', 'lessons', f), 'utf8'))) {
    const tok = sql.replace(/--.*$/gm, '').trim().split(/\s+/)[0]?.toUpperCase();
    if (tok !== 'SELECT') continue; // tek SELECT; çok-ifadeli/DML atla
    if ((sql.match(/;/g) || []).length > 1) continue;
    let res;
    try { res = await db.query(sql); } catch { continue; } // çalışmayan = lesson-sql-check işi
    checked++;
    const cols = res.fields.map((x) => x.name);
    const tableCols = table.headers;
    const colsOk = cols.length === tableCols.length && cols.every((c, idx) => c === tableCols[idx]);
    const rowsOk = res.rows.length === table.rows.length;
    if (!colsOk) { colMismatch++; issues.push(`  [SÜTUN] ${f}: sorgu=[${cols}] tablo=[${tableCols}]\n      ${sql.replace(/\s+/g, ' ').slice(0, 80)}`); continue; }
    if (!rowsOk) { rowMismatch++; issues.push(`  [SATIR] ${f}: sorgu ${res.rows.length} satır, tablo ${table.rows.length} satır\n      ${sql.replace(/\s+/g, ' ').slice(0, 80)}`); continue; }
    // değer karşılaştırma (multiset)
    const qSet = res.rows.map((r) => cols.map((c) => norm(r[c])).join('')).sort();
    const tSet = table.rows.map((r) => r.map(norm).join('')).sort();
    if (JSON.stringify(qSet) !== JSON.stringify(tSet)) {
      valMismatch++;
      issues.push(`  [DEĞER] ${f}: ${sql.replace(/\s+/g, ' ').slice(0, 70)}\n      sorgu: ${qSet.slice(0, 2).join(' / ')}\n      tablo: ${tSet.slice(0, 2).join(' / ')}`);
    }
  }
}

console.log(`Kontrol edilen (SELECT + gösterilen tablo) çift: ${checked}`);
console.log(`Sütun uyumsuz: ${colMismatch} | Satır sayısı uyumsuz: ${rowMismatch} | Değer uyumsuz: ${valMismatch}`);
if (issues.length) { console.log('\n--- UYUMSUZLUKLAR ---'); console.log(issues.join('\n')); }
else console.log('\nTüm gösterilen sonuç tabloları seed ile tutuyor ✓');
