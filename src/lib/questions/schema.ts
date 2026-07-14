import { z } from 'zod';

// v1 desteklenen tipler. predict_output / find_bug / fill_blank Q2'de.
export const QUESTION_TYPES = ['write_sql', 'multiple_choice'] as const;
export const COMPARE_MODES = ['set', 'multiset', 'ordered_multiset'] as const;
export const UNITS = ['U0', 'U1', 'U2', 'U3', 'UG', 'U4', 'U5', 'U6', 'U7', 'U8', 'U9', 'U10', 'U11', 'UM', 'U12', 'U13', 'U14'] as const;

const localeText = z.object({
  title: z.string(),
  prompt: z.string(),
  hint1: z.string(),
  hint2: z.string().optional(),
  answerExplanation: z.string(),
});

const assessmentSchema = z.object({
  referenceSql: z.string(),
  orderMatters: z.boolean().default(false),
  compareMode: z.enum(COMPARE_MODES).default('multiset'),
  expectedColumns: z.array(z.string()).optional(),
  numericTolerance: z.number().nullable().default(null),
  requiredConcepts: z.array(z.string()).default([]),
  forbiddenPatterns: z.array(z.string()).default([]),
  allowedLiterals: z.array(z.string()).default([]),
  timeoutMs: z.number().default(2000),
});

const commonWrongPattern = z.object({
  id: z.string(),
  sqlRegex: z.string().optional(),
  feedback: z.string(),
});

export const questionSchema = z
  .object({
    id: z.string(),
    version: z.number().int().default(1),
    status: z.enum(['draft', 'ready']).default('ready'),
    type: z.enum(QUESTION_TYPES),
    unit: z.enum(UNITS),
    lessonId: z.string(),
    conceptTags: z.array(z.string()).default([]),
    difficulty: z.number().int().min(1).max(4),
    tr: localeText,
    assessment: assessmentSchema.optional(),
    choices: z.array(z.string()).optional(),
    correctIndex: z.number().int().optional(),
    commonWrongPatterns: z.array(commonWrongPattern).default([]),
    variantFamily: z.string().optional(),
  })
  .superRefine((q, ctx) => {
    if (q.type === 'write_sql' && !q.assessment) {
      ctx.addIssue({ code: 'custom', message: `write_sql sorusu (${q.id}) assessment gerektirir` });
    }
    if (q.type === 'multiple_choice' && (!q.choices || q.correctIndex == null)) {
      ctx.addIssue({ code: 'custom', message: `multiple_choice sorusu (${q.id}) choices + correctIndex gerektirir` });
    }
  });

export const questionBankSchema = z.array(questionSchema);

export type Question = z.infer<typeof questionSchema>;
export type Assessment = z.infer<typeof assessmentSchema>;
export type QuestionType = (typeof QUESTION_TYPES)[number];
export type Unit = (typeof UNITS)[number];

export const DIFFICULTY_LABEL: Record<number, string> = {
  1: 'D1 · Taklit',
  2: 'D2 · Transfer',
  3: 'D3 · Birleştirme',
  4: 'D4 · Tuzaklı',
};
