// Copies authoring content (lessons + seeds) from /content into /public/content
// so the browser app can fetch them, and builds a lesson index.json.
// Source of truth stays in /content; /public/content is a generated artifact (gitignored).
import { readdir, readFile, mkdir, copyFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcLessons = path.join(root, 'content', 'lessons');
const srcSeed = path.join(root, 'content', 'seed');
const outLessons = path.join(root, 'public', 'content', 'lessons');
const outSeed = path.join(root, 'public', 'content', 'seed');
const srcQuestions = path.join(root, 'content', 'questions');
const outQuestions = path.join(root, 'public', 'content', 'questions');

// Canonical curriculum order (ÜG güvenlik Ü3'ten sonra; ÜM veri modelleme Ü11 ile Ü12 DDL arasında).
const ORDER = ['U0', 'U1', 'U2', 'U3', 'UG', 'U4', 'U5', 'U6', 'U7', 'U8', 'U9', 'U10', 'U11', 'UM', 'U12', 'U13', 'U14'];

function prefixOf(file) {
  return file.split('-')[0]; // "U4-aggregate.md" -> "U4"
}

function titleOf(md) {
  const line = md.split('\n').find((l) => /^#\s+/.test(l));
  return line ? line.replace(/^#\s+/, '').trim() : '(başlıksız)';
}

async function main() {
  await mkdir(outLessons, { recursive: true });
  await mkdir(outSeed, { recursive: true });

  // Seeds
  const seedFiles = (await readdir(srcSeed)).filter((f) => f.endsWith('.sql'));
  for (const f of seedFiles) {
    await copyFile(path.join(srcSeed, f), path.join(outSeed, f));
  }

  // Lessons + index
  const lessonFiles = (await readdir(srcLessons)).filter((f) => f.endsWith('.md'));
  const index = [];
  for (const f of lessonFiles) {
    const md = await readFile(path.join(srcLessons, f), 'utf8');
    await copyFile(path.join(srcLessons, f), path.join(outLessons, f));
    const slug = f.replace(/\.md$/, '');
    const prefix = prefixOf(f);
    index.push({ file: f, slug, prefix, title: titleOf(md) });
  }

  index.sort((a, b) => {
    const ia = ORDER.indexOf(a.prefix);
    const ib = ORDER.indexOf(b.prefix);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });
  index.forEach((it, i) => { it.order = i; });

  await writeFile(path.join(outLessons, 'index.json'), JSON.stringify(index, null, 2));

  // Questions: merge all content/questions/*.json arrays into one bank.json
  await mkdir(outQuestions, { recursive: true });
  let bank = [];
  try {
    const qFiles = (await readdir(srcQuestions)).filter((f) => f.endsWith('.json'));
    for (const f of qFiles) {
      const arr = JSON.parse(await readFile(path.join(srcQuestions, f), 'utf8'));
      if (!Array.isArray(arr)) throw new Error(`${f} bir dizi (array) olmalı`);
      bank.push(...arr);
    }
  } catch (e) {
    if (e.code !== 'ENOENT') throw e; // questions klasörü yoksa sorun değil
  }
  await writeFile(path.join(outQuestions, 'bank.json'), JSON.stringify(bank, null, 2));

  console.log(`[sync-content] ${seedFiles.length} seed, ${lessonFiles.length} ders, ${bank.length} soru -> public/content`);
}

main().catch((e) => {
  console.error('[sync-content] HATA:', e);
  process.exit(1);
});
