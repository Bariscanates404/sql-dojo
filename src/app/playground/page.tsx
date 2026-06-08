'use client';

import { SqlRunner } from '@/components/sql/SqlRunner';

const SAMPLE = `-- Kampüs verisinde dene. ⌘↵ ile çalıştır.
SELECT first_name, city
FROM students
ORDER BY city NULLS LAST
LIMIT 10;`;

export default function PlaygroundPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">⌨️ Deneme</h1>
        <p className="mt-1 text-sm text-muted">
          Kampüs verisi üzerinde özgürce sorgu yaz. Veriyi bozarsan <strong>↺ Sıfırla</strong> ile
          temiz hale döner.
        </p>
      </div>
      <SqlRunner seedKey="campus" initialSql={SAMPLE} />
    </div>
  );
}
