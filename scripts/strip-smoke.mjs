// Runs the REAL stripTeacherSections over all 16 lessons and asserts that the
// student build keeps the lesson body but contains no teacher-only heading.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { stripTeacherSections } from '../src/lib/content/strip-teacher.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'content', 'lessons');
const teacherHeading = /^#{1,6}\s+.*🧑/gm;

const files = (await readdir(dir)).filter((f) => f.endsWith('.md')).sort();
let fail = 0;

for (const f of files) {
  const md = await readFile(path.join(dir, f), 'utf8');
  const before = (md.match(teacherHeading) || []).length;
  const stripped = stripTeacherSections(md);
  const after = (stripped.match(teacherHeading) || []).length;
  const keepsBody = /Konu anlatımı|özet|Çıkış bileti|Pratik|Ünite/.test(stripped);
  const ok = after === 0 && keepsBody && before > 0;
  if (!ok) fail++;
  console.log(`${ok ? '✓' : '✗'} ${f.padEnd(20)} öğretmen başlığı: ${before} -> ${after}, gövde: ${keepsBody ? 'var' : 'YOK'}`);
}

console.log(fail ? `\nSTRIP: ${fail} ders BAŞARISIZ` : '\nSTRIP: 16/16 ders TAMAM ✓');
process.exit(fail ? 1 : 0);
