// Dışa aktarma dosya adlarının TEK üreticisi (EXPORT-PLAN §5).
//
// Neden tek yerde: sürüm etiketi ("-ogrenci", "-odev") çağıranın insafına
// bırakılırsa bir gün biri etiketsiz dosya üretir ve o dosyanın hangi sürüm
// olduğu dosya adından anlaşılamaz. Etiket burada zorunludur.

export const EXPORT_KINDS = ['ogrenci', 'odev'] as const;
export type ExportKind = (typeof EXPORT_KINDS)[number];

// Dosyayı alan kişi ADINDAN ne olduğunu anlamalı: öğrenciye WhatsApp'tan iki
// dosya birden gidiyor, biri okunacak biri çözülecek.
const KIND_SUFFIX: Record<ExportKind, string> = {
  ogrenci: 'ogrenci-konu-tekrari',
  odev: 'ogrenci-odev',
};

/** Türkçe karakterleri ve boşlukları dosya adına uygun hale getirir. */
function slugify(s: string): string {
  const map: Record<string, string> = {
    ç: 'c', Ç: 'C', ğ: 'g', Ğ: 'G', ı: 'i', İ: 'I',
    ö: 'o', Ö: 'O', ş: 's', Ş: 'S', ü: 'u', Ü: 'U',
  };
  return s
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (c) => map[c] ?? c)
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * `U6-join-ogrenci-odev(6.1-6.2).html`
 *
 * Konu kodları parantez içinde yazılır: öğretmen aynı üniteden farklı haftalarda
 * farklı konuların dosyasını indiriyor. Kod olmasaydı ikinci indirme tarayıcıda
 * "(1)" olarak inerdi ve hangi dosyanın hangi konu olduğu anlaşılmazdı.
 */
export function exportFilename(lessonSlug: string, kind: ExportKind, sectionIds: string[] = []): string {
  const base = `${slugify(lessonSlug)}-${KIND_SUFFIX[kind]}`;
  if (!sectionIds.length) return `${base}.html`;

  // Arayüzdeki ve kapaktaki kod ne ise dosya adında da o olsun ("G.2", "6.1").
  const codes = sectionIds.map((id) => slugify(id)).join('-');
  return `${base}(${codes}).html`;
}
