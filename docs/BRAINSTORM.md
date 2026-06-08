# SQL Trainer — Brainstorm & Araştırma Notları

> Durum: PLANLAMA / beyin fırtınası. Henüz kod yok.
> Proje klasör adı `sql-trainer` şimdilik geçici, kolayca değişir.
> Tarih: 2026-06-07

## 1. Vizyon

Bariş'in öğrencilerine SQL öğretmek için kuracağı, detaylı ve iyi bir web uygulaması.
Basit bir alıştırma sitesi değil: tam bir eğitim sistemi. Konu anlatımı + örnekler +
anlama soruları + interaktif pratik + öğretmen paneli + ilerleme takibi. GitHub'da public.

## 2. Gereksinimler (kullanıcının istediği, birebir)

- [ ] Eğitimler, anlatım textleri, hazır örnekler.
- [ ] İçeride hazır DB; üzerinde çalışabilelim; istediğimiz zaman DB'yi default'a çekebilelim.
- [ ] Konular çok basitten başlasın, ünite ünite ilerlesin.
- [ ] Her konu anlatımı içinde en az 3-5 basit örnek.
- [ ] Konu sonunda 2-3 anlama sorusu. Her soruda "ipucu" ve "cevap" butonu.
      Cevap çok detaylı, "mal bile anlasın" derecesinde, gerekirse uzun açıklasın.
- [ ] Konu sonunda pratik çalışması ekranı.
- [ ] Ünite ünite / ders ders seçilebilsin. Seçime göre rastgele sorular sorsun.
      Bu modda da ipucu ve cevap olsun.
- [ ] İnteraktif sorgu yazma, çalıştırma, sonucu görme ekranları.
- [ ] Authentication sistemi (öğretmen + öğrenci rolleri).
- [ ] Öğretmen kendi ekranında öğrencinin oturumunu/durumunu görebilsin.
- [ ] Cevap (çözüm) sadece öğretmen tarafından görülebilsin (öğretirken rahat etsin).
- [ ] Öğrenci ilerlemesi, seviyesi, çözdüğü sorular, yaptığı hatalar, doğruları kalıcı tutulsun.
- [ ] Hafif (lightweight) çözüm. Supabase gerekmez.
- [ ] kanji-app mimarisi referans alınsın (Vercel + Supabase kullanıyor; biz Supabase kullanmayacağız).
- [ ] Public GitHub.

## 3. Süreç (kullanıcının istediği sıra)

1. Öğrenme / anlama / araştırma  <-- ŞU AN BURADAYIZ
2. Plan
3. Tartışma
4. Plan (revize)
5. Codex'e "eğitmen modunda nasıl yaparız" diye danış, fikirleri birleştir
6. Development

## 4. Araştırma bulguları

### 4.1 İyi SQL öğreten uygulamalar (pedagoji)
- **SQLBolt:** kısa ders + hemen tarayıcı içi interaktif alıştırma. SELECT'ten GROUP BY'a
  kademeli. Güçlü yanı: her ders küçük, hemen pratik.
- **SQLZoo:** aşamalı modüller, canlı DB, her modülde interaktif egzersizler.
- **Mode SQL Tutorial:** gerçekçi veri setleriyle analiz odaklı.
- **DataLemur:** şirket mülakat soruları, her soruda detaylı açıklama, ilerleme takibi,
  ileri konular (window functions, conditional aggregation).
- Ortak ders: kısa anlatım -> hemen interaktif egzersiz -> anında geri bildirim -> ilerleme.

### 4.2 Tarayıcıda SQL çalıştırma (sunucusuz)
- **PGlite** (electric-sql): gerçek Postgres, WASM, ~3MB gzip. Bellekte veya IndexedDB/OPFS'e
  kalıcı. Tek kullanıcı/tek bağlantı. Gerçek Postgres olduğu için window function, CTE, tüm
  ileri özellikler birebir çalışır. ÖĞRETİM İÇİN EN GÜÇLÜ SEÇENEK (gerçek dünya lehçesi).
- **sql.js** (SQLite WASM): ~1.5MB, in-memory (kalıcılık için IndexedDB'ye serialize gerek).
  Daha hafif ama SQLite lehçesi gerçek dünyadan bazı yerlerde farklı (tipleme gevşek, bazı
  fonksiyonlar yok). Mülakat/iş için Postgres daha değerli.
- **"DB'yi default'a çek":** her iki motorda da kolay. Seed script'i tekrar çalıştır ya da
  kayıtlı snapshot'ı yeniden yükle. PGlite'ta IndexedDB instance'ını sıfırlayıp seed'i basmak.

### 4.3 Öğrenci cevabını otomatik doğrulama
- En sağlam yöntem: öğrencinin sorgusu + öğretmenin referans (doğru) sorgusu AYNI DB'de
  çalıştırılır, SONUÇ KÜMELERİ karşılaştırılır. Metin/syntax değil, sonuç karşılaştırması.
- Sıralama: egzersiz ORDER BY istiyorsa sıralı karşılaştır; istemiyorsa iki tarafı da
  sıralayıp (canonical) karşılaştır. Böylece farklı ama doğru yazımlar da kabul edilir.
- Detaylı geri bildirim mümkün: eksik satırlar, fazla satırlar, yanlış/eksik sütun.
- PGlite tarayıcıda olduğu için bu karşılaştırma client-side, anında, sunucusuz yapılır.
- (İleri seviye akademik yaklaşım: sorguları canonical forma çevirip "edit distance" ile
  kısmi puanlama da var, ama bizim için sonuç-kümesi karşılaştırması yeterli ve sağlam.)

### 4.4 Önerilen müfredat sırası (basitten ileriye)
Genel kabul gören sıra: SELECT/FROM -> WHERE -> ORDER BY -> aggregate -> GROUP BY/HAVING
-> JOIN -> subquery -> set ops -> DML -> DDL -> CTE -> window functions. (Bkz. bölüm 6.)

## 5. kanji-app'ten yeniden kullanım haritası

Stack: Next.js 16 (App Router), React 19, TypeScript 5, Tailwind v4, Zustand 5 (persist),
Zod 4, Vitest. Yol takma adları (@/, @ui/, @features/ ...). Vercel'e static export.

**Aynen / büyük oranda alınacak:**
- Zustand store yapısı (state + actions + reset + merge), localStorage persist deseni.
- Sync sistemi (boot'ta pull -> timestamp ile merge -> debounce'lu batch upsert -> flush).
  `createStrengthSyncer` deseni çok değerli.
- İlerleme/güçlülük modeli: per-konu strength 0-100, correct, wrong, lastSeen, updatedAt.
  Mastery hesabı (masteryDelta), yıldız/kilit (stars/unlock), XP, streak, daily summary.
- UI primitive'leri (Button, Card, Modal, Input), cn() helper, Tailwind v4 globals.css,
  animasyonlar, RouteGuard (auth yönlendirme), SessionInit/SyncInit orchestrasyonu.
- i18n çatısı (en.json/tr.json).
- İçerik yükleme deseni: JSON + Zod şema doğrulama (content-loader/content-schema).
- Öğrenme akışı deseni: teach -> support -> quiz (bizde: anlat -> örnekler -> sorular -> pratik).

**Değiştirilecek (Supabase bağımlı):**
- Auth: Supabase Auth yerine hafif auth (bkz. bölüm 7).
- DB client: supabase.from(...) yerine hafif DB erişimi (bkz. bölüm 7).
- Şema/migration: Supabase RLS yerine kendi şemamız.
- ÖNEMLİ FARK: kanji-app static export + tüm mantık client-side. Bizde öğretmenin öğrencileri
  görmesi için PAYLAŞILAN sunucu state gerekiyor, yani gerçek backend (API routes / server
  actions) ve bir sunucu DB'si lazım. Static export'tan sunucu çalıştırmaya geçiyoruz.

## 6. Önerilen müfredat (taslak, tartışılacak)

- Ünite 0: Temeller
  - Veritabanı, tablo, satır, sütun nedir (kavram, henüz sorgu yok; örnek şemamızı tanıt)
  - İlk sorgu: SELECT * FROM tablo
- Ünite 1: SELECT temelleri
  - Belirli sütunlar, AS (takma ad), DISTINCT, LIMIT, ORDER BY
- Ünite 2: Filtreleme (WHERE)
  - Karşılaştırma operatörleri, AND/OR/NOT, BETWEEN/IN, LIKE, NULL ve IS NULL
- Ünite 3: Toplulaştırma
  - COUNT/SUM/AVG/MIN/MAX, GROUP BY, HAVING
- Ünite 4: JOIN
  - PK/FK ve ilişki kavramı, INNER, LEFT, RIGHT/FULL, self join, çoklu join
- Ünite 5: Alt sorgu ve küme işlemleri
  - WHERE içinde subquery, FROM/SELECT içinde subquery, IN/EXISTS, UNION/INTERSECT/EXCEPT
- Ünite 6: Veri değiştirme (DML)
  - INSERT, UPDATE, DELETE, transaction (BEGIN/COMMIT/ROLLBACK) [DB reset burada çok işe yarar]
- Ünite 7: Şema tasarımı (DDL)
  - CREATE TABLE ve veri tipleri, kısıtlar (NOT NULL/UNIQUE/CHECK/DEFAULT), PK/FK, ALTER/DROP
- Ünite 8: İleri SQL
  - CTE (WITH), window functions (OVER/PARTITION BY, ROW_NUMBER/RANK), running total/LAG/LEAD,
    CASE WHEN ve koşullu toplulaştırma, VIEW ve indeks (kavram)

Her ders şablonu:
1. Anlatım metni (markdown, sade dil, görsel/şema desteği).
2. 3-5 çözümlü örnek (sorgu + sonuç tablosu + kısa açıklama; "çalıştır" ile canlı denenebilir).
3. 2-3 anlama sorusu (prompt + ipucu butonu + çok detaylı cevap/açıklama butonu;
   bazıları yazılı sorgu, bazıları çoktan seçmeli olabilir).
4. Pratik ekranı (serbest sorgu editörü, o dersin verisi üzerinde, auto-grade'li görevler).

## 7. Önerilen mimari (taslak, tartışılacak)

- **Çatı:** Next.js 16 App Router + React 19 + TS + Tailwind v4 + Zustand (kanji-app deseni).
- **Tarayıcı içi SQL motoru:** PGlite (gerçek Postgres). Seed + reset kolay. (Karar: bölüm 8.)
- **Editör:** CodeMirror 6 + @codemirror/lang-sql (syntax highlight, autocomplete; hafif).
- **Auth (hafif):** Auth.js (NextAuth v5) credentials VEYA basit cookie-session.
  Roller: teacher, student. Supabase yok.
- **Sunucu DB (hesaplar + ilerleme + hatalar + oturumlar):** hafif. Drizzle ORM + libSQL/SQLite.
  Vercel'de Turso (hosted libSQL), self-host'ta tek dosya SQLite. (Karar: bölüm 8.)
- **İçerik:** structured JSON + Zod; anlatımlar markdown. (kanji-app content-loader deseni.)
- **Öğretmen paneli:** öğrenci listesi, her öğrencinin ilerlemesi/hataları/denemeleri;
  çözümler sadece öğretmene görünür. (Canlı vs geçmiş: karar bölüm 8.)
- **Deploy:** Vercel (Turso ile) veya küçük VPS/Docker (SQLite ile). Public GitHub.

Veri modeli (taslak):
- users (id, email, password_hash, role, display_name, created_at)
- skill_strength (user_id, skill_key, strength 0-100, correct, wrong, last_seen, updated_at)
- attempts (id, user_id, question_id, submitted_sql, is_correct, error, duration_ms, created_at)
- lesson_progress (user_id, lesson_id, status, score, completed_at)
- sessions (id, user_id, started_at, ended_at, summary jsonb)  [oturum/aktivite kaydı]

## 8. Kararlar (KİLİTLENDİ 2026-06-07)

1. SQL motoru: **PGlite (gerçek Postgres, tarayıcıda)**. Pratik kum havuzu bu.
2. Öğretmen görünümü: **v1'de geçmiş/inceleme, faz 2'de canlı (Supabase Realtime)**.
3. Barındırma + kalıcılık: **Vercel + Supabase** (kullanıcı tanıdık kanji-app stack'ine dönmeyi
   tercih etti, Turso ile uğraşmak istemedi). Supabase: Auth + Postgres + RLS + Realtime.
4. Dil: **Türkçe + İngilizce (i18n)**.
5. Proje/uygulama adı: henüz açık (ikincil).

**ÖNEMLİ: İki ayrı veritabanı var, karıştırma.**
- Pratik DB = PGlite, tarayıcıda, öğrencinin sorgu çalıştırdığı kum havuzu, sıfırlanabilir.
- Uygulama DB = Supabase Postgres, sunucuda, hesaplar/ilerleme/deneme/hata/roller.
Öğrenci sorgusu Supabase'e gitmez; sadece sonuç özeti (doğru/yanlış, hata, süre) Supabase'e yazılır.

## 9. Sonraki adımlar

1. Yukarıdaki 4 çatalı kullanıcıyla netleştir.
2. Plan dökümanını (PLAN.md) yaz: kesinleşen stack, müfredat, veri modeli, ekran ekran akış,
   yol haritası (faz faz), reuse listesi.
3. Codex için "eğitmen modunda en iyi nasıl öğretiriz" prompt'unu hazırla, fikirleri al, birleştir.
4. Repo iskeletini kur, sonra development.

## 10. Kaynaklar
- SQLBolt https://sqlbolt.com/
- SQLZoo, Mode, DataLemur (genel pedagoji): https://datalemur.com/sql-tutorial
- PGlite https://pglite.dev/ , https://github.com/electric-sql/pglite
- sql.js https://github.com/sql-js/sql.js
- SQL grading (result set / canonical) https://arxiv.org/pdf/1912.09019
- W3Schools SQL syllabus https://www.w3schools.com/sql/sql_syllabus.asp
