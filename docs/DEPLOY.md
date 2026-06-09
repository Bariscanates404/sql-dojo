# Deploy (Vercel)

SQL Dojo bir standart Next.js 16 uygulaması; Vercel'de **sıfır yapılandırma** ile çalışır.
Pratik veritabanı (PGlite) tamamen tarayıcıda olduğu için ek bir sunucu/DB kurmaya gerek yok.

## En kolay: Vercel web import (önerilen)

1. https://vercel.com → giriş yap (GitHub ile).
2. **Add New… → Project → Import** ve `Bariscanates404/sql-dojo` reposunu seç.
3. Ayarları olduğu gibi bırak (Framework: Next.js otomatik algılanır). **Deploy**.
   - Build komutu: `npm run build` (öncesinde `prebuild` ile `content/` → `public/content/` senkronu otomatik çalışır).
   - Çevre değişkeni gerekmez (Supabase henüz yok).
4. Birkaç dakikada canlı URL çıkar: `https://sql-dojo-...vercel.app`.

## Alternatif: CLI

Etkileşimli giriş gerektiği için bu komutu kendi terminalinde çalıştır (Claude oturumunda `! npx vercel` ile de):

```bash
npx vercel        # ilk sefer: login + proje bağla
npx vercel --prod # production deploy
```

## Deploy sonrası

- Canlı URL'i README'nin en üstüne "Live demo" rozeti/linki olarak ekle (LAPRAS görünürlüğü için).
- Her `git push origin main` otomatik yeni production deploy tetikler (GitHub bağlıysa).
- Custom domain istersen Vercel → Project → Settings → Domains.

## Notlar

- `predev`/`prebuild` içerik senkronunu çalıştırır; Vercel build'i bunu otomatik yapar.
- `prepare: husky || true` olduğu için husky CI/Vercel kurulumunu bozmaz.
- İlerleme verisi şu an tarayıcıda (localStorage) tutulur; hesap/senkron ileride Supabase ile gelecek.
