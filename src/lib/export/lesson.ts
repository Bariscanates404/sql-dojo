import { stripTeacherSections } from '../content/strip-teacher.ts';

import { buildDocument } from './document.ts';
import { lessonTagline, lessonTitle, rewriteEditorLinks, stripLeadingH1 } from './lesson-text.ts';
import { composeLesson, splitLesson } from './sections.ts';
import { markdownToHtml, wrapTables } from './render.ts';

// Öğrenci ders notu: indirilip çevrimdışı okunacak tek dosya.
//
// Öğretmen bölümlerini BURADA yeniden gizlemiyoruz; ekranda kullanılan
// stripTeacherSections'ı çağırıyoruz. Tek kural, tek yer (EXPORT-PLAN §2):
// ikinci bir gizleme mantığı yazmak, bir gün ikisinin ayrışması demektir.

export interface LessonDocInput {
  slug: string;
  markdown: string;
  css: string;
  /** Alt bilgiye basılacak tarih; belge üreticisi saf kalsın diye çağıran verir. */
  dateLabel: string;
  /** Dahil edilecek alt ders numaraları ("G.2"). Verilmezse ünitenin tamamı. */
  sectionIds?: string[];
}

export async function buildLessonDocument(input: LessonDocInput): Promise<string> {
  const full = rewriteEditorLinks(stripTeacherSections(input.markdown));
  const parts = splitLesson(full);
  const selected = input.sectionIds ?? parts.sections.map((s) => s.id);
  const partial = selected.length < parts.sections.length;

  const studentMd = composeLesson(parts, selected);
  const title = lessonTitle(full, input.slug);
  const bodyHtml = wrapTables(await markdownToHtml(stripLeadingH1(studentMd)));

  const covered = parts.sections
    .filter((s) => selected.includes(s.id))
    .map((s) => `${s.id} ${s.title}`)
    .join(' · ');

  return buildDocument({
    title: `${title} · SQL Dojo`,
    brand: 'SQL DOJO · DERS NOTU',
    heading: title,
    // Bir alt küme seçildiyse öğrenci NE OKUDUĞUNU bilsin: eksik konuyu
    // sessizce eksik göstermek, "bu ünite bu kadarmış" sanmasına yol açar.
    tagline: partial ? `Bu notta işlenen konular: ${covered}` : lessonTagline(full),
    note:
      'Bu dosya kendi başına çalışır, internet gerekmez. Örneklerin sonuçları hazır basılıdır, ' +
      'yani sorguyu çalıştıramadan da ne döndüğünü görebilirsin. Kendin denemek istersen ' +
      'SQL Dojo uygulamasındaki Deneme Tahtası’nı kullan.',
    bodyHtml,
    css: input.css,
    footer: `SQL Dojo · ${title} · öğrenci notu${partial ? ` (${selected.length}/${parts.sections.length} konu)` : ''} · ${input.dateLabel}`,
  });
}
