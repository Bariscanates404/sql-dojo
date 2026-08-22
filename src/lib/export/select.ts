import type { Question } from '../questions/schema';

// Ödev sorusu seçimi. Tek import'u TİP'tir (çalışma anında silinir), böylece bu
// dosya hem tarayıcıda hem düz Node'da (scripts/export-smoke.mjs) çalışır.

/** Ödev kağıdında HER SEÇİLİ KONU için hedeflenen soru sayısı. */
export const HOMEWORK_PER_SECTION = 5;

/**
 * Üniteden `count` soru seçer.
 *
 * Rastgelelik YOK: öğretmen aynı kağıdı iki kez indirdiğinde aynı soruları
 * görmeli, yoksa sınıfta dağıttığı kağıtla elindeki kağıt tutmaz. Seçim kavram
 * etiketlerine yayılmayı gözetir, böylece 5 soru ünitenin tek bir köşesinde
 * yığılmaz; kağıtta kolaydan zora sıralanır.
 */
export function selectHomeworkQuestions(questions: Question[], count = HOMEWORK_PER_SECTION): Question[] {
  const byLevelThenId = (a: Question, b: Question) => a.difficulty - b.difficulty || a.id.localeCompare(b.id);
  const pool = [...questions].sort(byLevelThenId);
  const picked: Question[] = [];
  const seenTags = new Set<string>();

  while (picked.length < count && picked.length < pool.length) {
    let best: Question | null = null;
    let bestNewTags = -1;

    for (const q of pool) {
      if (picked.includes(q)) continue;
      const newTags = q.conceptTags.filter((t) => !seenTags.has(t)).length;
      if (newTags > bestNewTags) {
        bestNewTags = newTags;
        best = q;
      }
    }

    if (!best) break;
    picked.push(best);
    best.conceptTags.forEach((t) => seenTags.add(t));
  }

  return picked.sort(byLevelThenId);
}

export interface HomeworkGroup {
  sectionId: string;
  questions: Question[];
  /** Havuzda kaç soru vardı; hedefin altındaysa arayüz ve kağıt bunu SÖYLER. */
  available: number;
}

/**
 * Ödev sorularını KONU KONU seçer: her seçili alt dersten `perSection` tane.
 *
 * Neden ünite başına değil: öğretmen bir haftada ünitenin bir kısmını işliyor ve
 * ödevi işlediği konuların her birinden istiyor. Ünite başına 5 soru, 4 konuluk
 * bir ünitede konu başına birden az soru demekti.
 *
 * Bir konuda `perSection` kadar soru yoksa olan kadarı verilir ve `available`
 * ile kaç tane olduğu bildirilir; sessizce kısa kağıt üretilmez.
 */
export function selectHomeworkBySection(
  questions: Question[],
  sectionIds: string[],
  perSection = HOMEWORK_PER_SECTION,
): HomeworkGroup[] {
  return sectionIds.map((sectionId) => {
    const pool = questions.filter((q) => q.section === sectionId);
    return { sectionId, questions: selectHomeworkQuestions(pool, perSection), available: pool.length };
  });
}

/** Karşılaştırma için SQL/metni sadeleştirir: küçük harf, tek boşluk, sondaki ; yok. */
function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/;+$/, '');
}

/**
 * Ödev kağıdına basılacak ipucu, yoksa null.
 *
 * Bankada ipucu ile çözümün AYNI olduğu sorular var (ölçüldü: 186 write_sql
 * sorusunun 8'inde hint1 birebir referenceSql). Ekranda bu tartışılır, ama
 * kağıtta ölümcül: öğrenci ipucunu kopyalar ve ödev biter. O yüzden ipucu
 * çözümü veriyorsa kağıda basmıyoruz; soru ipucusuz gider, cevapsız değil.
 */
export function homeworkHint(q: Question): string | null {
  const hint = q.tr.hint1?.trim();
  if (!hint) return null;

  const ref = q.assessment?.referenceSql;
  if (ref && normalize(hint).includes(normalize(ref))) return null;

  // İpucu tek başına çalışır bir sorguysa, o ipucu değil cevaptır.
  if (/^(select|insert|update|delete|with)\b[\s\S]*;\s*$/i.test(hint)) return null;

  return hint;
}
