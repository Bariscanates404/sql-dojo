import type { TableInfo } from '../db/pglite.ts';
import { DIFFICULTY_LABEL, type Question } from '../questions/schema.ts';

import { buildDocument } from './document.ts';
import { escapeHtml } from './escape.ts';
import { markdownToHtml } from './render.ts';
import { homeworkHint, selectHomeworkQuestions } from './select.ts';

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

async function renderQuestion(q: Question, index: number): Promise<string> {
  const no = index + 1;
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
}

export async function buildHomeworkDocument(input: HomeworkDocInput): Promise<string> {
  const selected = selectHomeworkQuestions(input.questions);
  const rendered = await Promise.all(selected.map((q, i) => renderQuestion(q, i)));
  const bodyHtml = [renderSchema(input.tables), ...rendered].filter(Boolean).join('\n');

  return buildDocument({
    title: `${input.lessonTitle} · Ödev · SQL Dojo`,
    brand: 'SQL DOJO · ÖDEV KAĞIDI',
    heading: input.lessonTitle,
    tagline: input.coveredLabel ? `${selected.length} soru · ${input.coveredLabel}` : `${selected.length} soru`,
    nameField: true,
    note:
      'Soruları kağıt üzerinde çözebilirsin, bilgisayar şart değil. Sorgularını dikkatli yaz: ' +
      'hangi tablo, hangi sütunlar, hangi koşul. Takılırsan sorunun altındaki ipucuna bak.',
    bodyHtml,
    css: input.css,
    footer: `SQL Dojo · ${input.lessonTitle} · ödev kağıdı · ${input.dateLabel}`,
  });
}
