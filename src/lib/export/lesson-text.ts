// Ders markdown'ı üzerinde çalışan SAF metin fonksiyonları.
//
// Bu dosyanın bilerek hiç import'u yoktur: hem tarayıcıda hem düz Node'da
// (scripts/export-smoke.mjs) aynen çalışsın diye. Belge kurma işi lesson.ts'te;
// burada sadece "metne ne oluyor" var.

/**
 * Çevrimdışı okunacak dosyada editöre gönderen satırların karşılığı yok.
 * "[▶ Editörde dene]" işaretini kağıda uygun bir yönergeye çevirir; sessizce
 * SİLMEYİZ, çünkü o satır bir GÖREV, sadece tıklanacak yeri kalmadı.
 */
export function rewriteEditorLinks(md: string): string {
  return md
    .replace(/\[▶ Editörde dene\]\(#deneme-tahtasi\)/g, '**Görev.**')
    .replace(/\[▶ Editörde dene\]\(\)/g, '**Görev.**')
    .replace(/\[▶ Editörde dene\]/g, '**Görev.**')
    .replace(/\[([^\]]*?)\]\(#deneme-tahtasi\)/g, '$1');
}

/** Markdown'ın ilk "# ..." başlığını ders adı olarak alır. */
export function lessonTitle(md: string, fallback: string): string {
  const m = /^#\s+(.+)$/m.exec(md);
  return m ? m[1].trim() : fallback;
}

/** Ünite sloganı satırını ("> Ünite sloganı: **...**") tek satırlık açıklamaya çevirir. */
export function lessonTagline(md: string): string | undefined {
  const m = /^>\s*Ünite sloganı:\s*\*\*(.+?)\*\*/m.exec(md);
  return m ? m[1].trim() : undefined;
}

/** Başlık kapakta zaten basıldığı için gövdedeki ilk H1'i çıkarır. */
export function stripLeadingH1(md: string): string {
  return md.replace(/^#\s+.+$/m, '').replace(/^\n+/, '');
}
