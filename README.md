# 🥋 SQL Dojo

Tarayıcıda çalışan gerçek bir Postgres (PGlite) üzerinde, sıfırdan adım adım SQL öğreten web uygulaması. Öğrenciler için ders + pratik, öğretmen (Bariş) için ilerleme takibi.

## Çalıştırma

```bash
npm install
npm run dev        # http://localhost:5176  (predev otomatik içerik senkronu yapar)
```

Diğer komutlar:

| Komut | Ne yapar |
|---|---|
| `npm run build` | Production build (TypeScript kontrolü dahil) |
| `npm run type-check` | Sadece `tsc --noEmit` |
| `npm run sync:content` | `content/` -> `public/content/` kopyalar + ders `index.json` üretir |
| `npm run db:smoke` | Node'da seed'i PGlite'a yükleyip örnek sorguları doğrular |

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Zustand 5 · Zod 4 · PGlite (`@electric-sql/pglite`) · CodeMirror 6 (`@uiw/react-codemirror` + `@codemirror/lang-sql`) · react-markdown + remark-gfm + rehype-raw. Mimari deseni `~/projects/kanji-app`'ten uyarlandı (Supabase bağımlılığı henüz yok).

## Mimari notlar

- **İki veritabanı:** Pratik sorgular tarayıcıdaki PGlite örneğinde çalışır (`src/lib/db/pglite.ts`); uygulama verisi (hesap/ilerleme) ileride Supabase'e gider. İkisi ayrıdır.
- **Tek çekirdek:** `src/components/sql/SqlRunner.tsx` (editör + Çalıştır + sonuç tablosu) playground, ders örnekleri ve Deneme Tahtası'nda aynen kullanılır.
- **Deneme Tahtası:** her ekrandan `⌘K` / floating buton ile açılan global SQL paneli (`src/features/scratchpad/`). Seed seçimi, `↺ Sıfırla`, tablolar yan paneli, sunum modu.
- **Rol-görünürlük:** ders markdown'ında başlığı 🧑‍🏫 ile başlayan bölümler öğretmene özeldir; öğrenci görünümünde `src/lib/content/strip-teacher.ts` ile çıkarılır (kural: `docs/CURRICULUM_MASTER.md` 5b).

## İçerik

Kaynak doğruluk `content/` altındadır (16 ders `content/lessons/*.md`, seed `content/seed/campus_seed.sql`). `public/content/` üretilmiş kopyadır (gitignore'da). Tam tasarım: `docs/PLAN.md`, `docs/CURRICULUM_MASTER.md`.

## Durum

**Faz 0 (iskelet) tamam:** scaffold, PGlite + seed (tarayıcıda doğrulandı), CodeMirror editör, Deneme Tahtası, ders renderer + rol-strip. Sırada: Supabase auth + roller + RLS + ilerleme/deneme tabloları, sonra Faz 1 (Ünite 1 uçtan uca + auto-grade + /progress). Yol haritası: `docs/PLAN.md` §11.
