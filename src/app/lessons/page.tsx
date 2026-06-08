'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Card } from '@ui/Card';
import { fetchLessonIndex, type LessonMeta } from '@lib/content/lessons';

export default function LessonsPage() {
  const [lessons, setLessons] = useState<LessonMeta[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLessonIndex()
      .then(setLessons)
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">📚 Dersler</h1>
      {error && <p className="text-sm text-danger">{error}</p>}
      <ol className="flex flex-col gap-2">
        {lessons.map((l) => (
          <li key={l.slug}>
            <Link href={`/lessons/${l.slug}`}>
              <Card className="flex items-center gap-3 p-4 transition hover:border-primary">
                <span className="min-w-12 rounded-lg bg-foreground/5 px-2 py-1 text-center font-mono text-sm">
                  {l.prefix}
                </span>
                <span className="font-medium">{l.title}</span>
              </Card>
            </Link>
          </li>
        ))}
      </ol>
      {lessons.length === 0 && !error && <p className="text-sm text-muted">Yükleniyor…</p>}
    </div>
  );
}
