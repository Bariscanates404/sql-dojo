/** HTML'e gömülen her metin buradan geçer. Soru/ders içeriği VERİDİR, işaretleme değil. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
