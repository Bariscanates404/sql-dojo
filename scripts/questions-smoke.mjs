// Soru bankası doğrulaması: (1) Zod şeması geçiyor mu, (2) her write_sql sorusunun
// referenceSql'i Kampüs seed'inde çalışıyor mu ve expectedColumns ile uyuşuyor mu.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';

import { questionBankSchema } from '../src/lib/questions/schema.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function assert(cond, msg) {
  if (!cond) { console.error('  ✗', msg); process.exitCode = 1; return false; }
  return true;
}

// seed
const seedSql = await readFile(path.join(root, 'content', 'seed', 'campus_seed.sql'), 'utf8');
const db = new PGlite();
await db.exec(seedSql);

// verifySql taşıyan sorular veriyi DEĞİŞTİRİR. Bunları ANA db'de koşturmak
// seed'i bozar ve sonraki soruların kontrolünü yalancı yapar; tarayıcıdaki
// execSandboxed ile aynı mantık: ayrı instance, her koşumdan önce yeniden tohum.
const sandbox = new PGlite();
async function runMutating(a) {
  await sandbox.exec('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
  await sandbox.exec(seedSql);
  await sandbox.exec(a.referenceSql);
  const res = (await sandbox.exec(a.verifySql)).at(-1);
  return { fields: res.fields ?? [], rows: res.rows ?? [] };
}

// bank
const dir = path.join(root, 'content', 'questions');
const files = (await readdir(dir)).filter((f) => f.endsWith('.json')).sort();
const bank = [];
for (const f of files) bank.push(...JSON.parse(await readFile(path.join(dir, f), 'utf8')));

console.log(`\n--- Zod şema denetimi (${bank.length} soru) ---`);
const parsed = questionBankSchema.safeParse(bank);
if (!parsed.success) {
  console.error('  ✗ Şema HATASI:');
  for (const issue of parsed.error.issues.slice(0, 12)) console.error('    -', issue.path.join('.'), issue.message);
  process.exit(1);
}
console.log('  ✓ tüm sorular şemaya uygun');

console.log('\n--- referenceSql seed üzerinde çalışıyor mu + sütun kontrolü ---');
const ids = new Set();
const mcPositionCounts = [];
let mcChoiceCount = 0;
for (const q of parsed.data) {
  assert(!ids.has(q.id), `tekrarlı id: ${q.id}`);
  ids.add(q.id);

  if (q.type === 'multiple_choice') {
    const ok = assert(q.correctIndex >= 0 && q.correctIndex < q.choices.length, `${q.id}: correctIndex aralık dışı`);
    mcChoiceCount = Math.max(mcChoiceCount, q.choices.length);
    mcPositionCounts[q.correctIndex] = (mcPositionCounts[q.correctIndex] ?? 0) + 1;
    console.log(`  ${ok ? '✓' : '✗'} ${q.id.padEnd(42)} [MC] ${q.choices.length} şık`);
    continue;
  }

  const a = q.assessment;
  try {
    const res = a.verifySql ? await runMutating(a) : await db.query(a.referenceSql);
    const cols = res.fields.map((f) => f.name);
    let ok = true;
    if (a.expectedColumns) {
      const same = cols.length === a.expectedColumns.length && [...cols].sort().join() === [...a.expectedColumns].sort().join();
      ok = assert(same, `${q.id}: sütunlar uyuşmuyor. ref=[${cols}] expected=[${a.expectedColumns}]`);
    }
    const tag = a.verifySql ? `${q.type}·DML` : q.type;
    console.log(`  ${ok ? '✓' : '✗'} ${q.id.padEnd(42)} [${tag}] ${res.rows.length} satır, sütun [${cols.join(', ')}]`);
  } catch (e) {
    assert(false, `${q.id}: referenceSql ÇALIŞMADI -> ${e.message}`);
  }
}

// DML soruları ana veritabanına DOKUNMAMALI. Bu kontrol olmadan, izolasyon
// bir gün delinirse sonraki soruların "doğru" cevapları sessizce kayar.
console.log('\n--- İzolasyon: DML soruları ana veritabanını bozdu mu ---');
{
  const counts = {};
  for (const t of ['students', 'enrollments', 'clubs', 'events', 'event_attendance', 'orders']) {
    counts[t] = (await db.query(`SELECT COUNT(*)::int c FROM ${t}`)).rows[0].c;
  }
  const expected = { students: 14, enrollments: 20, clubs: 5, events: 4, event_attendance: 10, orders: 10 };
  for (const [t, want] of Object.entries(expected)) {
    assert(counts[t] === want, `${t}: ${counts[t]} satır (beklenen ${want}) — DML sorusu ana veritabanını bozmuş`);
  }
  console.log(`  ✓ ana veritabanı bozulmadı (${Object.entries(counts).map(([k, v]) => k + '=' + v).join(', ')})`);
}

const mcTotal = mcPositionCounts.reduce((sum, n) => sum + (n ?? 0), 0);
if (mcTotal > 0) {
  const counts = Array.from({ length: mcChoiceCount }, (_, i) => mcPositionCounts[i] ?? 0);
  const labels = counts.map((n, i) => `${String.fromCharCode(65 + i)}=${n}`);
  const spread = Math.max(...counts) - Math.min(...counts);
  console.log(`\n--- MC doğru cevap dağılımı: ${labels.join(' ')} ---`);
  assert(spread <= 1, `MC doğru cevap dağılımı dengesiz: ${labels.join(' ')}`);
}

console.log(process.exitCode ? '\nQUESTIONS SMOKE: BAŞARISIZ' : `\nQUESTIONS SMOKE: ${bank.length} soru TAMAM ✓`);
