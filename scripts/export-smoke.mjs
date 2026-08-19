// qa:export — dışa aktarma kalite kapısı (EXPORT-PLAN §5).
//
// Neden var: "öğretmen bölümleri ve cevaplar dışa aktarılan dosyaya sızmadı" bir
// niyet değil, doğrulanabilir bir kısıt olmalı. Elle gözden geçirmeye bırakılırsa
// bir gün delinir, ve delindiği gün cevap anahtarı sınıfa dağıtılmış olur; geri
// alınamaz. Bu script her ünite için iki dosyayı da gerçekten üretir ve sızıntı arar.
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PGlite } from '@electric-sql/pglite';







const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let failed = 0;
const ok = (cond, msg) => {
  if (cond) console.log('  ✓', msg);
  else { console.error('  ✗ FAIL:', msg); failed++; }
};

// Uygulamanın GERÇEK modüllerini çağırıyoruz, benzerini burada yeniden yazmıyoruz.
// Yani bu kapı, tarayıcıda çalışan kodun ta kendisini sınıyor; ayrı bir kopyayı
// sınayan kapı, kopya ayrıştığı gün yalan söylemeye başlar.
const { rewriteEditorLinks, lessonTitle } = await import(path.join(root, 'src/lib/export/lesson-text.ts'));
const { selectHomeworkQuestions, homeworkHint, HOMEWORK_QUESTION_COUNT } = await import(
  path.join(root, 'src/lib/export/select.ts')
);
const { exportFilename } = await import(path.join(root, 'src/lib/export/filename.ts'));
const { buildLessonDocument } = await import(path.join(root, 'src/lib/export/lesson.ts'));
const { buildHomeworkDocument } = await import(path.join(root, 'src/lib/export/homework.ts'));
const { splitLesson, selectQuestionsForSections, questionCountsBySection } = await import(
  path.join(root, 'src/lib/export/sections.ts')
);

const css = await readFile(path.join(root, 'public/export/lesson-export.css'), 'utf8');
const DATE = '01 Ocak 2000'; // sabit: kapı çıktısı tarihe göre değişmesin

// --- veri ------------------------------------------------------------------
const index = JSON.parse(await readFile(path.join(root, 'public/content/lessons/index.json'), 'utf8'));

const questions = [];
for (const f of (await readdir(path.join(root, 'content/questions'))).sort()) {
  const parsed = JSON.parse(await readFile(path.join(root, 'content/questions', f), 'utf8'));
  questions.push(...(Array.isArray(parsed) ? parsed : parsed.questions ?? []));
}

const db = new PGlite();
await db.exec(await readFile(path.join(root, 'content/seed/campus_seed.sql'), 'utf8'));
const schemaRows = await db.query(
  `SELECT table_name, column_name, data_type FROM information_schema.columns
   WHERE table_schema = 'public' ORDER BY table_name, ordinal_position`,
);
// Tarayıcıda listTables() ne döndürüyorsa aynı şekli kuruyoruz (TableInfo[]).
const byTable = new Map();
for (const r of schemaRows.rows) {
  if (!byTable.has(r.table_name)) byTable.set(r.table_name, []);
  byTable.get(r.table_name).push({ name: r.column_name, type: r.data_type });
}
const tables = [...byTable.entries()].map(([table, columns]) => ({ table, columns }));
const tableNames = tables.map((t) => t.table);

// --- 1) Öğrenci ders notu: öğretmen içeriği sızmamalı ----------------------
console.log('\n--- Öğrenci ders notu: öğretmen içeriği sızıntısı ---');
for (const meta of index) {
  const raw = await readFile(path.join(root, 'content/lessons', meta.file), 'utf8');
  // Uygulamanın indirttiği dosyanın TAM kendisi.
  const html = await buildLessonDocument({ slug: meta.slug, markdown: raw, css, dateLabel: DATE });

  ok(!/🧑|🏫/.test(html), `${meta.slug}: 🧑‍🏫 işareti yok`);
  ok(!/Öğretmen için|Öğretmen notu/.test(html), `${meta.slug}: "Öğretmen için/notu" başlığı yok`);
  ok(!/Editörde dene|#deneme-tahtasi/.test(html), `${meta.slug}: çevrimdışı anlamsız "Editörde dene" bağlantısı kalmadı`);
  ok(lessonTitle(rewriteEditorLinks(raw), meta.slug).length > 0, `${meta.slug}: başlık üretildi`);

  // Tek dosya sözü: dış bağlantı olursa çevrimdışı açılmaz.
  ok(!/<script\b/i.test(html), `${meta.slug}: dosyada script yok`);
  ok(!/<link\b[^>]*href=/i.test(html), `${meta.slug}: dış stil bağlantısı yok`);
  ok(!/(src|href)\s*=\s*["']https?:/i.test(html), `${meta.slug}: dışarıya giden hiçbir adres yok`);
  ok(html.includes('<style>'), `${meta.slug}: stil dosyaya gömüldü`);
}

// --- 2) Ödev kağıdı: cevap sızmamalı --------------------------------------
console.log('\n--- Ödev kağıdı: cevap sızıntısı ---');
for (const meta of index) {
  const unit = meta.prefix;
  const pool = questions.filter((q) => q.unit === unit);
  ok(pool.length >= HOMEWORK_QUESTION_COUNT, `${unit}: havuzda en az ${HOMEWORK_QUESTION_COUNT} soru var (${pool.length})`);
  if (!pool.length) continue;

  const picked = selectHomeworkQuestions(pool);
  ok(picked.length === Math.min(HOMEWORK_QUESTION_COUNT, pool.length), `${unit}: ${picked.length} soru seçildi`);

  // Öğrenciye giden GERÇEK kağıt.
  const sheet = await buildHomeworkDocument({
    lessonTitle: meta.title, questions: pool, tables, css, dateLabel: DATE,
  });
  const sheetText = sheet.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  for (const q of picked) {
    // Prompt'lar BİLEREK "aşırı açık" yazıldığı için hint2 metni prompt'un içinde
    // geçebiliyor; bu sızıntı değil, kasıt. O yüzden hint2'yi kağıtta değil,
    // prompt'un zaten söylediğinin ÜSTÜNE eklenenlerde arıyoruz.
    const addedBeyondPrompt = [q.tr.title, homeworkHint(q) ?? '', ...(q.choices ?? [])].join('\n');
    if (q.tr.hint2) ok(!addedBeyondPrompt.includes(q.tr.hint2), `${q.id}: hint2 kağıda EKLENMEDİ`);

    const flat = (s) => s.replace(/\s+/g, ' ').trim();
    ok(!sheetText.includes(flat(q.tr.answerExplanation)), `${q.id}: answerExplanation kağıtta YOK`);
    if (q.assessment?.referenceSql) {
      ok(!sheetText.includes(flat(q.assessment.referenceSql)), `${q.id}: referenceSql kağıtta YOK`);
    }
  }

  // Hata avı / boşluk doldurma sorusu seçildiyse başlangıç SQL'i kağıtta OLMALI:
  // yoksa "editördeki komutu düzelt" diyen bir soru kağıtta çözülemez.
  for (const q of picked.filter((x) => x.starterSql)) {
    ok(sheetText.includes(q.starterSql.split('\n')[0].trim()), `${q.id}: başlangıç SQL'i kağıda basıldı`);
  }

  ok(/Ad Soyad:/.test(sheet), `${unit}: kağıtta "Ad Soyad" satırı var`);
  ok(/Tablolar \(yanında bulunsun\)/.test(sheet), `${unit}: çevrimdışı öğrenci için tablo şeması basılı`);
  ok(!/(src|href)\s*=\s*["']https?:/i.test(sheet), `${unit}: ödev kağıdında dışarıya giden adres yok`);

  // Seçim deterministik olmalı: aynı havuz -> aynı sorular.
  const again = selectHomeworkQuestions(pool);
  ok(
    again.map((q) => q.id).join(',') === picked.map((q) => q.id).join(','),
    `${unit}: seçim deterministik (öğretmen aynı kağıdı iki kez indirince aynı sorular)`,
  );
}

// --- 3) Dosya adı: sürüm etiketi zorunlu ----------------------------------
console.log('\n--- Dosya adları ---');
for (const meta of index.slice(0, 3)) {
  const a = exportFilename(meta.slug, 'ogrenci');
  const b = exportFilename(meta.slug, 'odev');
  ok(
    a.endsWith('-ogrenci-konu-tekrari.html') && b.endsWith('-ogrenci-odev.html'),
    `${meta.slug}: sürüm etiketi dosya adında (${a} / ${b})`,
  );
  ok(a !== b, `${meta.slug}: iki çıktının adı farklı`);
  ok(!/[^\x20-\x7e]/.test(a + b), `${meta.slug}: dosya adı ASCII (Türkçe karakter dönüştürüldü)`);

  // Konu kodları adda: aynı üniteden farklı konu setleri farklı dosya olsun,
  // yoksa ikinci indirme tarayıcıda "(1)" olur ve hangisi hangisi belli olmaz.
  const raw = await readFile(path.join(root, 'content/lessons', meta.file), 'utf8');
  const ids = splitLesson(raw).sections.map((s) => s.id);
  const withCodes = exportFilename(meta.slug, 'odev', ids.slice(0, 2));
  const otherCodes = exportFilename(meta.slug, 'odev', ids.slice(-2));
  ok(withCodes.includes(`(${ids.slice(0, 2).join('-')})`), `${meta.slug}: konu kodları adda (${withCodes})`);
  ok(withCodes !== otherCodes, `${meta.slug}: farklı konu seçimi farklı dosya adı üretiyor`);
  ok(withCodes.endsWith('.html'), `${meta.slug}: uzantı hâlâ .html`);
}

// --- 4) Kaynak kilidi: ödev üreticisi yasak alanlara DOKUNMAMALI ----------
// Yukarıdaki veri kontrolleri "bu 5 soruda sızıntı yok" der. Bu kontrol daha
// güçlüsünü der: üretici kodu o alanları hiç okumuyor, yani hangi soru seçilirse
// seçilsin sızdıramaz. Alan adını koda eklersen bu kilit düşer, bilerek düşsün.
console.log('\n--- Kaynak kilidi: ödev üreticisi yasak alanları okumuyor ---');
const homeworkSrc = await readFile(path.join(root, 'src/lib/export/homework.ts'), 'utf8');
const code = homeworkSrc
  .split('\n')
  .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)) // yorumlar sayılmaz, orada adı geçebilir
  .join('\n');
for (const field of ['hint2', 'answerExplanation', 'referenceSql', 'correctIndex']) {
  ok(!code.includes(field), `homework.ts kodu "${field}" alanına hiç dokunmuyor`);
}

// --- 5) Konu seçimi: öğretmen sadece işlediği konuyu gönderebilmeli -------
// Bu kapı olmadan, seçim sessizce yanlış çalışırsa öğrenciye işlenmemiş konu gider.
console.log('\n--- Konu seçimi (checkbox) ---');
let emptySections = [];
for (const meta of index) {
  const raw = await readFile(path.join(root, 'content/lessons', meta.file), 'utf8');
  const parts = splitLesson(raw);
  ok(parts.sections.length > 0, `${meta.prefix}: ${parts.sections.length} alt ders bulundu`);

  const pool = questions.filter((q) => q.unit === meta.prefix);
  const sectionIds = parts.sections.map((s) => s.id);

  // Her sorunun alt dersi DOLU ve o ünitede GERÇEKTEN var olmalı.
  const orphan = pool.filter((q) => !q.section);
  ok(orphan.length === 0, `${meta.prefix}: alt dersi yazılmamış soru yok (${orphan.length})`);
  const bogus = pool.filter((q) => q.section && !sectionIds.includes(q.section));
  ok(bogus.length === 0, `${meta.prefix}: geçersiz alt ders numarası taşıyan soru yok (${bogus.length})`);

  // Yalnız ilk alt ders seçiliyken: ders notu diğerlerini İÇERMEMELİ.
  const first = parts.sections[0];
  if (parts.sections.length > 1) {
    const partial = await buildLessonDocument({
      slug: meta.slug, markdown: raw, css, dateLabel: DATE, sectionIds: [first.id],
    });
    // Konu ADININ geçmesi sızıntı DEĞİL: dersler birbirine atıf yapar
    // ("bunu 3.2'de göreceğiz"). Sızıntı, o bölümün BAŞLIĞININ basılmasıdır.
    const others = parts.sections.slice(1);
    const leaked = others.filter((s) => new RegExp(`>Ders ${s.id.replace('.', '\\.')}\\b`).test(partial));
    ok(leaked.length === 0, `${meta.prefix}: sadece ${first.id} seçiliyken diğer konuların bölümü sızmadı`);
    ok(!/## Pratik|Pratik \(editörde/.test(partial), `${meta.prefix}: alt küme seçiliyken ünite geneli Pratik basılmadı`);
    ok(partial.includes('Bu notta işlenen konular'), `${meta.prefix}: kısmi notta hangi konuların olduğu yazılı`);

    // Ödev de aynı seçime uymalı.
    const hw = selectQuestionsForSections(pool, [first.id]);
    ok(
      hw.questions.every((q) => q.section === first.id),
      `${meta.prefix}: ödev havuzu sadece ${first.id} sorularını içeriyor (${hw.questions.length})`,
    );
  }

  const counts = questionCountsBySection(pool);
  for (const id of sectionIds) if (!counts[id]) emptySections.push(`${meta.prefix} ${id}`);
}

// Soru olmayan alt dersleri SUSMUYORUZ: arayüz "soru yok" yazar, kapı da sayar.
console.log(`\n  (bilgi) hiç sorusu olmayan alt ders: ${emptySections.length ? emptySections.join(', ') : 'yok'}`);

// --- 6) Ödev şeması: öğrenci çevrimdışı, tabloları yanında taşımalı -------
console.log('\n--- Ödev kağıdındaki tablo şeması ---');
ok(tableNames.length === 12, `seed'den 12 tablo okundu (${tableNames.length})`);

console.log(
  failed ? `\nEXPORT SMOKE: ${failed} kontrol BAŞARISIZ` : '\nEXPORT SMOKE: sızıntı yok, tüm kontroller TAMAM ✓',
);
process.exit(failed ? 1 : 0);
