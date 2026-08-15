// Dışa aktarma dosya adlarının TEK üreticisi (EXPORT-PLAN §5).
//
// Neden tek yerde: sürüm etiketi ("-ogrenci", "-odev") çağıranın insafına
// bırakılırsa bir gün biri etiketsiz dosya üretir ve o dosyanın hangi sürüm
// olduğu dosya adından anlaşılamaz. Etiket burada zorunludur.

export const EXPORT_KINDS = ['ogrenci', 'odev'] as const;
export type ExportKind = (typeof EXPORT_KINDS)[number];

const KIND_SUFFIX: Record<ExportKind, string> = {
  ogrenci: 'ogrenci',
  odev: 'odev',
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

export function exportFilename(lessonSlug: string, kind: ExportKind): string {
  return `${slugify(lessonSlug)}-${KIND_SUFFIX[kind]}.html`;
}
