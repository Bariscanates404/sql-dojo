'use client';

import { useEffect, useMemo, useState } from 'react';

import { listTables } from '@lib/db/pglite';
import { downloadHtml, fetchExportCss, todayLabel } from '@lib/export/download';
import { buildHomeworkDocument } from '@lib/export/homework';
import { buildLessonDocument } from '@lib/export/lesson';
import { lessonTitle } from '@lib/export/lesson-text';
import { questionCountsBySection, selectQuestionsForSections, splitLesson } from '@lib/export/sections';
import { loadQuestions } from '@lib/questions/load';
import type { Question } from '@lib/questions/schema';
import { cn } from '@utils/cn';

type Busy = null | 'ogrenci' | 'odev';

interface ExportButtonsProps {
  slug: string;
  markdown: string;
  /** Ünite kodu (U6, UG, UM...). Ödev soruları bu üniteden seçilir. */
  unit: string;
}

export function ExportButtons({ slug, markdown, unit }: ExportButtonsProps) {
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [unitQuestions, setUnitQuestions] = useState<Question[] | null>(null);

  const parts = useMemo(() => splitLesson(markdown), [markdown]);
  const [selected, setSelected] = useState<string[]>(() => parts.sections.map((s) => s.id));

  // Ders değişince seçim sıfırlanır, yoksa bir önceki dersin konu numaraları kalır.
  useEffect(() => setSelected(parts.sections.map((s) => s.id)), [parts]);

  useEffect(() => {
    loadQuestions()
      .then((all) => setUnitQuestions(all.filter((q) => q.unit === unit)))
      .catch(() => setUnitQuestions([]));
  }, [unit]);

  const counts = useMemo(() => questionCountsBySection(unitQuestions ?? []), [unitQuestions]);
  const selectedQuestions = useMemo(
    () => selectQuestionsForSections(unitQuestions ?? [], selected).questions,
    [unitQuestions, selected],
  );

  const allSelected = selected.length === parts.sections.length;
  const noneSelected = selected.length === 0;

  const toggle = (id: string) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const coveredLabel = () =>
    parts.sections
      .filter((s) => selected.includes(s.id))
      .map((s) => s.id)
      .join(', ');

  async function exportLesson() {
    setBusy('ogrenci');
    setError(null);
    try {
      const css = await fetchExportCss();
      const html = await buildLessonDocument({
        slug,
        markdown,
        css,
        dateLabel: todayLabel(),
        sectionIds: selected,
      });
      downloadHtml(html, slug, 'ogrenci');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function exportHomework() {
    setBusy('odev');
    setError(null);
    try {
      const [css, tables] = await Promise.all([fetchExportCss(), listTables()]);
      if (!selectedQuestions.length) throw new Error('Seçili konularda soru yok');
      const html = await buildHomeworkDocument({
        lessonTitle: lessonTitle(markdown, slug),
        questions: selectedQuestions,
        tables,
        css,
        dateLabel: todayLabel(),
        coveredLabel: allSelected ? undefined : `konular: ${coveredLabel()}`,
      });
      downloadHtml(html, slug, 'odev');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  const btn =
    'rounded-lg border border-border px-3 py-1.5 text-sm transition hover:border-primary hover:text-primary disabled:opacity-50';

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="mb-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-sm font-semibold">Hangi konular gitsin?</span>
          <button
            onClick={() => setSelected(allSelected ? [] : parts.sections.map((s) => s.id))}
            className="text-xs text-muted underline hover:text-primary"
          >
            {allSelected ? 'hiçbirini seçme' : 'hepsini seç'}
          </button>
        </div>

        <div className="flex flex-col gap-1">
          {parts.sections.map((s) => {
            const n = counts[s.id] ?? 0;
            return (
              <label key={s.id} className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.includes(s.id)}
                  onChange={() => toggle(s.id)}
                  className="mt-1 accent-[var(--primary)]"
                />
                <span>
                  <span className="font-mono text-xs text-muted">{s.id}</span> {s.title}{' '}
                  <span className={cn('text-xs', n === 0 ? 'text-danger' : 'text-muted')}>
                    ({n === 0 ? 'soru yok' : `${n} soru`})
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">İndir:</span>
        <button onClick={exportLesson} disabled={busy !== null || noneSelected} className={cn(btn)}>
          {busy === 'ogrenci' ? 'Hazırlanıyor…' : '📄 Ders notu (HTML)'}
        </button>
        <button
          onClick={exportHomework}
          disabled={busy !== null || noneSelected || selectedQuestions.length === 0}
          className={cn(btn)}
        >
          {busy === 'odev' ? 'Hazırlanıyor…' : `📝 Ödev kağıdı (${Math.min(5, selectedQuestions.length)} soru)`}
        </button>
      </div>

      <p className="text-xs text-muted">
        Seçili konular: {selected.length}/{parts.sections.length} · ödev havuzunda{' '}
        {selectedQuestions.length} soru. Tek dosya, internet gerektirmez. PDF için dosyayı açıp
        yazdır (Ctrl/Cmd+P) ve &quot;PDF olarak kaydet&quot;i seç.
      </p>

      {noneSelected && <p className="text-xs text-danger">En az bir konu seç.</p>}
      {!noneSelected && selectedQuestions.length === 0 && unitQuestions !== null && (
        <p className="text-xs text-danger">Seçili konularda hiç soru yok, ödev kağıdı üretilemez.</p>
      )}
      {error && <p className="text-xs text-danger">Dışa aktarma başarısız: {error}</p>}
    </div>
  );
}
