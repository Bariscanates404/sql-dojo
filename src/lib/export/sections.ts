import type { Question } from '../questions/schema.ts';

// Bir ünitenin alt konuları ("## Ders G.2 — ...") ve öğretmenin hangilerini
// dışa aktaracağını seçebilmesi için gereken her şey.
//
// Bu dosyanın tek import'u TİP'tir (çalışma anında silinir), böylece hem
// tarayıcıda hem düz Node'da (scripts/export-smoke.mjs) çalışır.

export interface LessonSection {
  /** "G.2", "6.1" gibi ders numarası. Seçim bunun üzerinden yapılır. */
  id: string;
  /** "WHERE'siz UPDATE ve DELETE" gibi başlık metni. */
  title: string;
  /** Bölümün markdown'ı, "## Ders ..." satırı dahil. */
  markdown: string;
}

export interface LessonParts {
  /** İlk "## Ders" başlığından önceki her şey (ünite başlığı, künye, not). */
  front: string;
  sections: LessonSection[];
  /** Alt derslerden SONRA gelen bölümler (Pratik, ünite özeti). Üniteyi geneli ilgilendirir. */
  tail: string;
}

const DERS_HEADING = /^## Ders\s+([A-Za-zÇĞİÖŞÜ0-9]+(?:\.\d+)?)\s*(?:—|-|–)?\s*(.*)$/;

/** Ders markdown'ını künye + alt dersler + kuyruk olarak ayırır. */
export function splitLesson(md: string): LessonParts {
  const lines = md.split('\n');
  const front: string[] = [];
  const sections: LessonSection[] = [];
  const tail: string[] = [];

  let current: { id: string; title: string; body: string[] } | null = null;
  let seenAnySection = false;
  let inFence = false;

  const flush = () => {
    if (!current) return;
    sections.push({ id: current.id, title: current.title.trim(), markdown: current.body.join('\n') });
    current = null;
  };

  for (const line of lines) {
    if (/^\s*```/.test(line)) inFence = !inFence;

    const m = !inFence ? DERS_HEADING.exec(line) : null;
    if (m) {
      flush();
      seenAnySection = true;
      current = { id: m[1], title: m[2], body: [line] };
      continue;
    }

    // Alt derslerden sonra gelen "## ..." başlığı (Pratik, özet) kuyruğu başlatır.
    if (!inFence && seenAnySection && /^##\s+/.test(line) && !DERS_HEADING.test(line)) {
      flush();
      tail.push(line);
      continue;
    }

    if (current) current.body.push(line);
    else if (seenAnySection) tail.push(line);
    else front.push(line);
  }
  flush();

  return { front: front.join('\n').trimEnd(), sections, tail: tail.join('\n').trim() };
}

/** Seçili bölümlerden ders markdown'ı kurar. */
export function composeLesson(parts: LessonParts, selectedIds: string[]): string {
  const selected = parts.sections.filter((s) => selectedIds.includes(s.id));
  const all = selected.length === parts.sections.length;

  const pieces = [parts.front, ...selected.map((s) => s.markdown)];

  // Pratik ve ünite özeti ÜNİTENİN TAMAMINI kapsar: bir alt küme seçiliyken
  // bunları basmak, öğrenciye işlemediğiniz konuyu göndermek olur. O yüzden
  // yalnız hepsi seçiliyken giderler.
  if (all && parts.tail) pieces.push(parts.tail);

  return pieces.filter(Boolean).join('\n\n');
}

/**
 * Seçili alt derslere ait soruları verir.
 *
 * Eşleme SEZGİYLE yapılmaz: her sorunun `section` alanı vardır ve elle yazılmıştır
 * (bkz. content/questions/*.json). Kavram etiketlerinden çıkarım denendi ve
 * ölçüldü: %35 yanlış eşliyordu, ki bu sessizce yanlış ödev göndermek demek.
 * Alanı olmayan soru hiçbir kağıda düşmez ve `unassigned` ile sayılır.
 */
export function selectQuestionsForSections(questions: Question[], selectedIds: string[]): SectionQuestionResult {
  let unassigned = 0;
  const picked: Question[] = [];

  for (const q of questions) {
    if (!q.section) unassigned++;
    else if (selectedIds.includes(q.section)) picked.push(q);
  }

  return { questions: picked, unassigned };
}

export interface SectionQuestionResult {
  /** Seçili alt derslere ait sorular. */
  questions: Question[];
  /** `section` alanı olmayan soru sayısı. Sessizce kaybolmasın diye raporlanır. */
  unassigned: number;
}

/** Her alt derste kaç soru olduğunu verir; arayüz seçim kutularının yanına yazar. */
export function questionCountsBySection(questions: Question[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const q of questions) {
    if (q.section) counts[q.section] = (counts[q.section] ?? 0) + 1;
  }
  return counts;
}
