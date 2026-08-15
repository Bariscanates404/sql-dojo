'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';

import { ExportButtons } from '@/components/lesson/ExportButtons';
import { LessonView } from '@/components/lesson/LessonView';
import { fetchLessonMarkdown } from '@lib/content/lessons';
import { useRoleStore } from '@stores/roleStore';
import { cn } from '@utils/cn';

/** "U6-join" -> "U6". Ödev soruları bu ünite kodundan seçilir (index.json'daki prefix ile aynı). */
function unitFromSlug(slug: string): string {
  return slug.split('-')[0];
}

export default function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [md, setMd] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const role = useRoleStore((s) => s.role);
  const setRole = useRoleStore((s) => s.setRole);

  useEffect(() => {
    setMd(null);
    setError(null);
    fetchLessonMarkdown(slug)
      .then(setMd)
      .catch((e) => setError(String(e)));
  }, [slug]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Link href="/lessons" className="text-sm text-muted hover:text-primary">
          ← Tüm dersler
        </Link>
        <div className="flex items-center gap-1 rounded-xl border border-border p-1 text-sm">
          <button
            onClick={() => setRole('student')}
            className={cn('rounded-lg px-3 py-1', role === 'student' && 'bg-primary text-primary-foreground')}
          >
            👩‍🎓 Öğrenci
          </button>
          <button
            onClick={() => setRole('teacher')}
            className={cn('rounded-lg px-3 py-1', role === 'teacher' && 'bg-primary text-primary-foreground')}
          >
            🧑‍🏫 Öğretmen
          </button>
        </div>
      </div>

      {role === 'teacher' ? (
        <p className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-accent">
          Öğretmen görünümü: 🧑‍🏫 ile başlayan bölümler görünür. Öğrenci görünümünde otomatik gizlenir.
        </p>
      ) : null}

      {md !== null && (
        <div className="rounded-xl border border-border bg-surface px-3 py-2.5">
          <ExportButtons slug={slug} markdown={md} unit={unitFromSlug(slug)} />
        </div>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}
      {md === null && !error && <p className="text-sm text-muted">Yükleniyor…</p>}
      {md !== null && <LessonView markdown={md} />}
    </div>
  );
}
