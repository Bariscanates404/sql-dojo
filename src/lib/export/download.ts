import { exportFilename, type ExportKind } from './filename';

/** Gömülecek stil dosyası. Tek kaynak: public/export/lesson-export.css */
export async function fetchExportCss(): Promise<string> {
  const res = await fetch('/export/lesson-export.css');
  if (!res.ok) throw new Error('Dışa aktarma stil dosyası yüklenemedi');
  return res.text();
}

/** Tarayıcıya tek dosya HTML'i indirtir. Sunucu yok, her şey istemcide. */
export function downloadHtml(html: string, lessonSlug: string, kind: ExportKind): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = exportFilename(lessonSlug, kind);
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Blob'u hemen bırakma: bazı tarayıcılar indirmeyi başlatmadan iptal eder.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Alt bilgide kullanılan tarih. Belge üreticileri saf kalsın diye burada. */
export function todayLabel(): string {
  return new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
}
