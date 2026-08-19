'use client';

import { useEffect, useMemo, useState } from 'react';

import { listTables, type TableInfo } from '@lib/db/pglite';
import { cn } from '@utils/cn';

// Tablo/sütun listesi. Hem Deneme Tahtası'nın yan paneli hem Sorular ekranı
// bunu kullanır; ikinci bir liste yazmak, bir gün ikisinin ayrışması demektir.
//
// Tablo adları CANLI veritabanından okunur (listTables -> information_schema).
// Buraya elle bir tablo listesi yazma: seed değişince sessizce yalan söyler.

interface SchemaPanelProps {
  /** Değişince şema yeniden okunur (örn. seed değişimi). */
  refreshKey?: string;
  /** Tablo adına tıklanınca çağrılır. Verilmezse adlar düz metin. */
  onPick?: (table: string) => void;
  /** İçinde tablo adı aranacak metin (soru promptu). Geçenler önce ve açık gelir. */
  relevantTo?: string;
  className?: string;
}

export function SchemaPanel({ refreshKey, onPick, relevantTo, className }: SchemaPanelProps) {
  const [tables, setTables] = useState<TableInfo[] | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let active = true;
    listTables()
      .then((t) => active && setTables(t))
      .catch(() => active && setTables([]));
    return () => {
      active = false;
    };
  }, [refreshKey]);

  // "İlgili" = adı soru metninde geçen tablo. Kaynak, cevabın SQL'i DEĞİL;
  // promptun kendisi. Yani burada gösterilen hiçbir şey ipucu sızdırmaz,
  // öğrenci zaten okuduğu cümlede o adı görüyor.
  const relevant = useMemo(() => {
    if (!tables || !relevantTo) return null;
    const hay = relevantTo.toLowerCase();
    const hit = tables.filter((t) => hay.includes(t.table.toLowerCase()));
    return hit.length ? hit.map((t) => t.table) : null;
  }, [tables, relevantTo]);

  if (tables === null) return <p className={cn('text-xs text-muted', className)}>Tablolar yükleniyor…</p>;
  if (!tables.length) return <p className={cn('text-xs text-muted', className)}>Tablo bulunamadı.</p>;

  const shown = relevant && !showAll ? tables.filter((t) => relevant.includes(t.table)) : tables;
  const hiddenCount = tables.length - shown.length;

  return (
    <div className={cn('text-sm', className)}>
      <ul className="flex flex-col gap-2.5">
        {shown.map((t) => (
          <li key={t.table}>
            {onPick ? (
              <button
                onClick={() => onPick(t.table)}
                className="font-mono font-semibold hover:text-primary"
                title="Bu tabloyu sorgula"
              >
                {t.table}
              </button>
            ) : (
              <span className="font-mono font-semibold">{t.table}</span>
            )}
            <ul className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 pl-3 text-xs text-muted">
              {t.columns.map((c) => (
                <li key={c.name} className="font-mono">
                  {c.name} <span className="opacity-50">{c.type}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {hiddenCount > 0 && (
        <button onClick={() => setShowAll(true)} className="mt-2 text-xs text-muted underline hover:text-primary">
          + diğer {hiddenCount} tabloyu da göster
        </button>
      )}
      {showAll && relevant && (
        <button onClick={() => setShowAll(false)} className="mt-2 text-xs text-muted underline hover:text-primary">
          sadece bu sorunun tablolarını göster
        </button>
      )}
    </div>
  );
}
