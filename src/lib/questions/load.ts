import { type Question, questionBankSchema } from './schema';

let cache: Question[] | null = null;

export async function loadQuestions(): Promise<Question[]> {
  if (cache) return cache;
  const res = await fetch('/content/questions/bank.json');
  if (!res.ok) throw new Error('Soru bankası yüklenemedi');
  const raw = await res.json();
  cache = questionBankSchema.parse(raw);
  return cache;
}
