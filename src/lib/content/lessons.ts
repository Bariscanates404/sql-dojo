export interface LessonMeta {
  file: string;
  slug: string;
  prefix: string;
  title: string;
  order: number;
}

export async function fetchLessonIndex(): Promise<LessonMeta[]> {
  const res = await fetch('/content/lessons/index.json');
  if (!res.ok) throw new Error('Ders listesi yüklenemedi');
  return res.json() as Promise<LessonMeta[]>;
}

export async function fetchLessonMarkdown(slug: string): Promise<string> {
  const res = await fetch(`/content/lessons/${slug}.md`);
  if (!res.ok) throw new Error(`Ders bulunamadı: ${slug}`);
  return res.text();
}
