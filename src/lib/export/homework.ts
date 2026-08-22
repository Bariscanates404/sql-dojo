import type { TableInfo } from '../db/pglite.ts';
import { DIFFICULTY_LABEL, type Question } from '../questions/schema.ts';

import { buildDocument } from './document.ts';
import { escapeHtml } from './escape.ts';
import { markdownToHtml } from './render.ts';
import { HOMEWORK_PER_SECTION, homeworkHint, selectHomeworkBySection } from './select.ts';

// Ödev kağıdı: öğrenciye giden, cevapsız çalışma sayfası.
//
// ÇIKTIYA ASLA GİRMEYECEK ALANLAR (ölçüldü: hint2'nin 18'i tam çözüm SQL'i,
// answerExplanation'ın 28'i SQL içeriyor):
//   - tr.hint2
//   - tr.answerExplanation
//   - assessment.referenceSql
//   - correctIndex
// Bu liste bir niyet değil, scripts/export-smoke.mjs tarafından her koşumda
// doğrulanan bir kısıt. Buraya yeni bir alan eklerken oraya da bak.

const CHOICE_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

async function renderQuestion(q: Question, no: number): Promise<string> {
  const meta = [DIFFICULTY_LABEL[q.difficulty], ...q.conceptTags].filter(Boolean).join(' · ');
  const prompt = await markdownToHtml(q.tr.prompt);

  const body: string[] = [
    '<section class="hw-item">',
    `<p><span class="hw-no">${no}</span><strong>${escapeHtml(q.tr.title)}</strong></p>`,
    `<div class="hw-prompt">${prompt}</div>`,
  ];

  // Hata avı / boşluk doldurma sorularında asıl soru BU metindedir; kağıtta
  // editör olmadığı için basılmazsa prompt ("editördeki komutu düzelt") anlamsız
  // kalır ve soru çözülemez hale gelir.
  if (q.starterSql) {
    body.push('<p class="hw-meta">Aşağıdaki komut üzerinde çalış:</p>');
    body.push(`<pre><code>${escapeHtml(q.starterSql)}</code></pre>`);
  }

  if (q.type === 'multiple_choice' && q.choices) {
    body.push('<ul class="hw-choices">');
    q.choices.forEach((c, i) => {
      body.push(`<li><strong>${CHOICE_LETTERS[i] ?? String(i + 1)})</strong> ${escapeHtml(c)}</li>`);
    });
    body.push('</ul>');
  } else {
    body.push('<div class="hw-answer-area">Sorguyu buraya yaz:</div>');
  }

  const hint = homeworkHint(q);
  if (hint) {
    body.push(`<div class="hw-prompt"><em>İpucu:</em> ${await markdownToHtml(hint)}</div>`);
  }

  body.push(`<p class="hw-meta">${escapeHtml(meta)}</p>`);
  body.push('</section>');
  return body.join('\n');
}

/** Öğrenci çevrimdışı; tabloları gezemez. Kullanacağı şemayı kağıda basıyoruz. */
function renderSchema(tables: TableInfo[]): string {
  if (!tables.length) return '';
  const items = tables
    .map((t) => `<li><strong>${escapeHtml(t.table)}</strong>: ${t.columns.map((c) => `<code>${escapeHtml(c.name)}</code>`).join(', ')}</li>`)
    .join('\n');
  return `<section class="hw-schema">
<h2>Tablolar (yanında bulunsun)</h2>
<p>Soruları çözerken bu tablo ve sütun adlarını kullanacaksın.</p>
<ul>
${items}
</ul>
</section>`;
}

export interface HomeworkDocInput {
  lessonTitle: string;
  questions: Question[];
  tables: TableInfo[];
  css: string;
  dateLabel: string;
  /** Kağıda yazılacak konu başlıkları; öğrenci neyin ödevi olduğunu bilsin. */
  coveredLabel?: string;
  /** Hangi alt derslerden soru seçilecek. Her biri için 5 soru hedeflenir. */
  sectionIds?: string[];
  /** Alt ders numarası -> başlık; kağıttaki bölüm başlıklarında kullanılır. */
  sectionTitles?: Record<string, string>;
}

export async function buildHomeworkDocument(input: HomeworkDocInput): Promise<string> {
  const groups = selectHomeworkBySection(input.questions, input.sectionIds ?? []);
  const total = groups.reduce((n, g) => n + g.questions.length, 0);

  const blocks: string[] = [renderSchema(input.tables)];
  let no = 0;
  for (const g of groups) {
    if (!g.questions.length) continue;
    const title = input.sectionTitles?.[g.sectionId];
    blocks.push(
      `<h2 class="hw-section">${escapeHtml(g.sectionId)}${title ? ' · ' + escapeHtml(title) : ''}` +
        `<span class="hw-section-n">${g.questions.length} soru</span></h2>`,
    );
    for (const q of g.questions) blocks.push(await renderQuestion(q, ++no));
  }

  // Hedefin altında kalan konular kağıtta AÇIKÇA yazılır: öğretmen eksik kağıdı
  // görmeden dağıtmasın, sessizce kısa ödev vermeyelim.
  const short = groups.filter((g) => g.available < HOMEWORK_PER_SECTION);
  if (short.length) {
    blocks.push(
      `<p class="hw-meta">Not: ${short
        .map((g) => `${escapeHtml(g.sectionId)} (${g.available})`)
        .join(', ')} konusunda bankada ${HOMEWORK_PER_SECTION} soru yok, olan kadarı verildi.</p>`,
    );
  }

  return buildDocument({
    title: `${input.lessonTitle} · Ödev · SQL Dojo`,
    brand: 'SQL DOJO · ÖDEV KAĞIDI',
    heading: input.lessonTitle,
    tagline: input.coveredLabel ? `${total} soru · ${input.coveredLabel}` : `${total} soru`,
    nameField: true,
    note:
      'Soruları kağıt üzerinde çözebilirsin, bilgisayar şart değil. Sorgularını dikkatli yaz: ' +
      'hangi tablo, hangi sütunlar, hangi koşul. Takılırsan sorunun altındaki ipucuna bak.',
    bodyHtml: blocks.filter(Boolean).join('\n'),
    css: input.css,
    footer: `SQL Dojo · ${input.lessonTitle} · ödev kağıdı · ${input.dateLabel}`,
  });
}
