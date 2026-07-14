// İki kademeli SQL hata katmanı doğrulaması: gerçek PGlite hatalarını yakalayıp
// toSqlError'ın (1) doğru SQLSTATE kodunu, (2) doğru anlaşılır açıklamayı üretmesini
// uçtan uca kontrol eder. Ayrıca kod içermeyen (DB-dışı) hatalarda genel açıklamaya
// düştüğünü doğrular.
import { PGlite } from '@electric-sql/pglite';

import { toSqlError } from '../src/lib/db/errors.ts';

let failed = 0;
function check(name, cond, detail) {
  if (cond) {
    console.log(`  ✓ ${name}`);
  } else {
    console.error(`  ✗ ${name}${detail ? ` -> ${detail}` : ''}`);
    failed++;
  }
}

const db = new PGlite();
await db.exec('CREATE TABLE t (a INTEGER, b INTEGER, u INTEGER UNIQUE, nn INTEGER NOT NULL);');

// Gerçek hatayı çalıştır, yakala, SqlError'a çevir.
async function sqlErr(sql) {
  try {
    await db.exec(sql);
    return null;
  } catch (e) {
    return toSqlError(e);
  }
}

console.log('\n--- Gerçek PGlite hatası -> kod + anlaşılır açıklama ---');

const cases = [
  { name: 'undefined_table', sql: 'SELECT * FROM yok_boyle_tablo;', code: '42P01', titleHas: 'tablo' },
  { name: 'undefined_column', sql: 'SELECT yok_sutun FROM t;', code: '42703', titleHas: 'sütun' },
  { name: 'syntax_error', sql: 'SELCT 1;', code: '42601', titleHas: 'Yazım' },
  { name: 'grouping_error', sql: 'SELECT a FROM t GROUP BY b;', code: '42803', titleHas: 'GROUP BY' },
  { name: 'duplicate_table', sql: 'CREATE TABLE t (x INTEGER);', code: '42P07', titleHas: 'zaten var' },
  { name: 'division_by_zero', sql: 'SELECT 1 / 0;', code: '22012', titleHas: 'Sıfıra bölme' },
];

for (const c of cases) {
  const err = await sqlErr(c.sql);
  if (!err) {
    check(c.name, false, 'hata beklenirken sorgu başarılı oldu');
    continue;
  }
  check(`${c.name}: kod ${c.code}`, err.code === c.code, `code=${err.code}`);
  check(`${c.name}: başlık "${c.titleHas}"`, err.friendly.title.includes(c.titleHas), err.friendly.title);
  check(`${c.name}: fix dolu`, err.friendly.fix.length > 0);
}

console.log('\n--- Kısıt ihlalleri (DML) ---');
await db.exec("INSERT INTO t (a, b, u, nn) VALUES (1, 1, 100, 1);");

const uniq = await sqlErr("INSERT INTO t (a, b, u, nn) VALUES (2, 2, 100, 2);");
check('unique_violation: kod 23505', uniq?.code === '23505', uniq?.code);
check('unique_violation: başlık', !!uniq && uniq.friendly.title.includes('zaten var'), uniq?.friendly.title);

const notnull = await sqlErr("INSERT INTO t (a, b, u) VALUES (3, 3, 300);");
check('not_null_violation: kod 23502', notnull?.code === '23502', notnull?.code);

console.log('\n--- DB-dışı hata -> genel açıklamaya düşer ---');
const generic = toSqlError(new Error('ağ hatası: seed indirilemedi'));
check('generic: kod yok', generic.code === undefined, String(generic.code));
check('generic: mesaj korunur', generic.message.includes('seed indirilemedi'));
check('generic: friendly dolu', generic.friendly.title.length > 0 && generic.friendly.fix.length > 0);

console.log(failed ? `\nERRORS SMOKE: BAŞARISIZ (${failed} hata)` : '\nERRORS SMOKE: tüm eşlemeler TAMAM ✓');
process.exit(failed ? 1 : 0);
