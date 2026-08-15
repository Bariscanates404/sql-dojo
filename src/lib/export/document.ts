// İndirilen tek dosya HTML'in iskeleti.
//
// Kural: bu dosya TEK BAŞINA açılmak zorunda. Öğrencinin internet erişimi olmayabilir,
// uygulamaya erişimi olmayabilir. Bu yüzden CSS gömülür, dış font/görsel/script YOKTUR.
// Buraya bir <script src>, bir <link href> ya da bir CDN adresi eklemek, dosyanın
// çevrimdışı açılma sözünü bozar.

export interface DocumentOptions {
  /** <title> ve tarayıcı sekmesi. */
  title: string;
  /** Kapaktaki üst satır, örn. "SQL DOJO · DERS NOTU". */
  brand: string;
  /** Kapaktaki büyük başlık. */
  heading: string;
  /** Başlık altındaki tek satır açıklama. */
  tagline?: string;
  /** Kapaktaki kutu içi not (öğrenciye seslenen kısa metin). */
  note?: string;
  /** "Ad Soyad: ......" satırı basılsın mı (ödev kağıdında zorunlu). */
  nameField?: boolean;
  /** Gövde HTML'i. */
  bodyHtml: string;
  /** Gömülecek stil dosyasının içeriği. */
  css: string;
  /** Alt bilgi satırı. */
  footer: string;
}

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function buildDocument(o: DocumentOptions): string {
  const cover = [
    '<header class="doc-cover">',
    `<p class="doc-brand">${escapeHtml(o.brand)}</p>`,
    `<h1 class="doc-title">${escapeHtml(o.heading)}</h1>`,
    o.tagline ? `<p class="doc-tagline">${escapeHtml(o.tagline)}</p>` : '',
    o.nameField ? '<p class="doc-namefield">Ad Soyad: ................................................ &nbsp;&nbsp; Tarih: ....... / ....... / ..........</p>' : '',
    o.note ? `<p class="doc-note">${o.note}</p>` : '',
    '</header>',
  ]
    .filter(Boolean)
    .join('\n');

  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="SQL Dojo">
<title>${escapeHtml(o.title)}</title>
<style>
${o.css}
</style>
</head>
<body>
${cover}
<main>
${o.bodyHtml}
</main>
<footer class="doc-footer">${escapeHtml(o.footer)}</footer>
</body>
</html>
`;
}
