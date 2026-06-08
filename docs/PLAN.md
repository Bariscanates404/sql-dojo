# SQL Trainer — PLAN (v1 taslak, tartışmaya açık)

> Durum: PLAN yazıldı, kullanıcı incelemesi bekliyor. Henüz kod yok.
> Kararlar BRAINSTORM.md bölüm 8'de kilitli. Bu doküman onların üstüne kuruluyor.
> Tarih: 2026-06-07

## 0. Kararlar özeti

- Pratik SQL motoru: PGlite (tarayıcıda gerçek Postgres).
- Auth + uygulama verisi: Supabase (Auth + Postgres + RLS + Realtime), deploy Vercel.
- Dil: Türkçe + İngilizce (i18n).
- Öğretmen görünümü: v1 geçmiş/inceleme, faz 2 canlı (Realtime).
- İskelet: kanji-app deseni (Next.js 16 + React 19 + TS + Tailwind v4 + Zustand 5 + Zod 4).

## 1. Kesinleşen stack

| Katman | Seçim |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind v4, kanji-app UI primitive'leri |
| State | Zustand 5 (persist) |
| Şema doğrulama | Zod 4 |
| Pratik SQL | PGlite (@electric-sql/pglite) tarayıcıda |
| Kod editörü | CodeMirror 6 + @codemirror/lang-sql |
| Auth | Supabase Auth (email + şifre; istenirse OAuth) |
| Uygulama DB | Supabase Postgres + RLS |
| Canlı (faz 2) | Supabase Realtime |
| Deploy | Vercel |
| i18n | kanji-app i18n çatısı (tr.json / en.json) |

Not: kanji-app `output: 'export'` (tam static) idi. Burada da mümkün olduğunca client-side +
Supabase gidip RLS ile öğretmen erişimini çözeceğiz. Sadece "çözümü öğrenciden tam gizleme"
gerekirse ince bir API/Edge Function ekleriz (bkz. bölüm 7).

## 2. İki-veritabanı mimarisi (en kritik kavram)

1. **Pratik DB (PGlite, tarayıcı):**
   - Her öğrencinin tarayıcısında çalışan gerçek Postgres.
   - Dersin/ünitenin seed verisiyle dolar (örn. "okul" şeması: students, courses, enrollments...).
   - Öğrenci buraya sorgu atar, sonucu anında görür. Sunucuya gitmez.
   - "Default'a çek" = seed script'ini tekrar çalıştır / kayıtlı snapshot'ı yükle.
   - Otomatik doğrulama da burada yapılır (öğrenci sorgusu vs referans sorgu, sonuç karşılaştırma).

2. **Uygulama DB (Supabase Postgres, sunucu):**
   - users/profiles, roller, ilerleme, denemeler, hatalar, oturum özetleri.
   - Öğretmenin gördüğü her şey burada. RLS ile korunur.

Akış örneği: Öğrenci "WHERE" sorusunu çözer -> PGlite'ta sorgu çalışır -> sonuç referansla
karşılaştırılır -> doğru/yanlış + süre + (hata varsa) hata -> Supabase'e `attempts` olarak yazılır
-> `skill_strength` güncellenir. Öğretmen panelinde görünür.

## 3. Roller ve auth

- Roller: `teacher`, `student`. Profilde `role` alanı.
- Tek öğretmen (Bariş) + öğrenciler senaryosu. Öğrenci kaydolurken bir **sınıf kodu** (class code)
  girer ve öğretmene bağlanır. Alternatif: öğretmen panelden öğrenci davet eder.
- Auth: Supabase email+şifre (kanji-app'teki auth.ts deseni). Magic link/OAuth opsiyonel.
- RouteGuard ile rol bazlı yönlendirme: teacher -> /teacher, student -> /learn.

## 4. Uygulama veri modeli (Supabase) + RLS

Tablolar (taslak):

```
profiles            id (=auth.users.id), role, display_name, teacher_id (öğrenci ise), class_code, created_at
classes             id, teacher_id, name, join_code            (çok sınıf gerekirse; v1'de opsiyonel)
skill_strength      user_id, skill_key, strength(0-100), correct, wrong, last_seen, updated_at
lesson_progress     user_id, lesson_id, status, score, completed_at, updated_at
attempts            id, user_id, question_id, lesson_id, submitted_sql, is_correct, error_text,
                    duration_ms, hint_used(bool), answer_revealed(bool), created_at
sessions            id, user_id, started_at, ended_at, summary(jsonb)   (aktivite/oturum kaydı)
```

RLS politikaları:
- Öğrenci: yalnız kendi satırları (auth.uid() = user_id). (kanji-app deseni.)
- Öğretmen: kendi öğrencilerinin satırlarını OKUyabilir. Politika:
  `auth.uid() = user_id OR auth.uid() = (SELECT teacher_id FROM profiles p WHERE p.id = user_id)`
  Performans için bir `security definer` yardımcı fonksiyon (`is_teacher_of(student_id)`) ile yazılır.
- Yazma: öğrenci yalnız kendi ilerlemesini yazar; öğretmen yazmaz (sadece okur).

## 5. İçerik modeli (i18n TR+EN)

İçerik kod değil, veri. kanji-app content-loader/content-schema deseni:
- JSON dosyaları, Zod ile doğrulanır, build'e gömülür (ya da Supabase'te `lessons` tablosu;
  v1 için JSON daha basit ve versiyonlanabilir).
- Çift dil: metin alanları `{ tr: "...", en: "..." }` şeklinde.

Şema (taslak):

```
Unit   { id, order, title{tr,en}, summary{tr,en}, lessonIds[] }
Lesson {
  id, unitId, order, slug,
  title{tr,en},
  explanation{tr,en}            // markdown, sade dil
  seedKey                        // bu dersin pratik DB seed'i (şema + veri)
  examples: Example[3..5]        // çözümlü örnekler
  questions: Question[2..3]      // anlama soruları
  practice: PracticeTask[]       // pratik görevleri
}
Example  { prompt{tr,en}, sql, explanation{tr,en}, runnable(bool) }
Question {
  type: 'write_sql' | 'multiple_choice',
  prompt{tr,en},
  hint{tr,en},
  answerExplanation{tr,en},      // "mal bile anlasın" detaylı açıklama
  // write_sql ise:
  referenceSql, orderMatters(bool),
  // multiple_choice ise:
  choices[{tr,en}], correctIndex
}
PracticeTask { prompt{tr,en}, referenceSql, orderMatters(bool), hint{tr,en}, answerExplanation{tr,en} }
```

Seed'ler: birkaç tematik şema (örn. "okul", "mağaza", "kütüphane"). Basit, tanıdık, ünite
ilerledikçe zenginleşen. Her seed = CREATE TABLE + INSERT script'i (Postgres).

## 6. Ekranlar ve akış

Öğrenci tarafı:
1. `/` Ana sayfa: ünite ünite ilerleme, kaldığı yer, "devam et".
2. `/units` Ünite listesi -> `/units/:id` ders listesi.
3. `/lessons/:id` Ders ekranı, 4 bölüm:
   a. Anlatım (markdown).
   b. Örnekler (3-5): her biri sorgu + sonuç tablosu + açıklama; "Çalıştır" ile PGlite'ta dener.
   c. Anlama soruları (2-3): editör veya çoktan seçmeli; "İpucu" ve "Cevap" butonları;
      cevap çok detaylı açıklar; deneme `attempts`e yazılır.
   d. Pratik: serbest editör + görevler, auto-grade, ipucu/cevap.
4. `/practice` Drill modu: ünite/ders seç -> seçime göre rastgele sorular -> editör + çalıştır +
   sonuç + ipucu/cevap; sonuçlar ilerlemeye işlenir.
5. `/playground` Serbest kum havuzu: istediğin seed üstünde özgür sorgu; "DB'yi sıfırla" butonu.
6. `/progress` Kendi ilerlemen: ünite bazlı yüzde, güçlü/zayıf konular, hatalar.

Öğretmen tarafı:
7. `/teacher` Öğrenci listesi + her birinin genel ilerlemesi.
8. `/teacher/:studentId` Öğrenci detayı: ünite ilerlemesi, denemeler, sık yapılan hatalar,
   zaman çizelgesi. **Çözümler/referans sorgular sadece bu ekranda (öğretmende) görünür.**
9. (Faz 2) `/teacher/:studentId/live` Canlı: öğrencinin o anki sorgusu/ekranı (Realtime).

Ortak bileşen: SQL editörü (CodeMirror) + "Çalıştır" + sonuç tablosu + hata gösterimi.

### 6b. Deneme Tahtası — global SQL editör paneli (KARARLAR kilitli)
Amaç: öğretmen derste anlatırken canlı örnek göstersin; öğrenci öğrendiğini hemen denesin / serbest
deneme yapsın. Her ekrandan erişilebilir, dersten çıkmadan açılır/kapanır.
- **Açılış:** sağ-altta her zaman duran floating buton + klavye kısayolu (⌘K / Ctrl+K). Panel alttan
  açılır, tek tıkla kapanır. [KARAR]
- **Varsayılan veri:** bulunduğun dersin seed'i otomatik yüklü gelir; üstteki "seed ▾" ile tüm Kampüs
  verisine geçilebilir. [KARAR]
- **[↺ Sıfırla]:** PGlite örneğini düşürüp seed'i yeniden yükler (anında temiz DB).
- **Tablolar yan paneli:** yüklü seed'in tabloları + sütunları listeli (ezber gerektirmez; öğrenci de
  öğretmen de bakar).
- **Sunum modu:** v1'de var. Büyük font, sade, yüksek kontrast; projeksiyon için. Tek düğmeyle
  normal <-> sunum geçişi. [KARAR]
- **Her çözümlü örnekte ve soruda "[▶ Editörde aç]" butonu:** ilgili SQL'i editöre doldurur, Çalıştır
  ile sonucu anında gösterir. Öğretmenin "anlatırken göster" akışı tam olarak bu.
- **Tek çekirdek, dört kullanım:** aynı editör bileşeni (CodeMirror + PGlite runner + sonuç tablosu +
  hata gösterimi + auto-grade) ders örnekleri, pratik, drill ve deneme tahtasında kullanılır.
- **Rol notu:** deneme tahtası hem öğrencide hem öğretmende var. Öğretmen sürümünde örneklerin
  yanındaki 🧑‍🏫 ipuçları da görünür; öğrencide görünmez (içerik rol-görünürlük kuralı, CURRICULUM_MASTER 5b).

## 7. Otomatik doğrulama tasarımı

- Öğrenci sorgusu ve referans sorgu AYNI PGlite örneğinde (aynı seed) çalıştırılır.
- Sonuç kümeleri karşılaştırılır:
  - `orderMatters=false` (varsayılan): iki sonuç da kararlı bir şekilde sıralanıp karşılaştırılır.
  - `orderMatters=true` (ORDER BY öğretiliyorsa): satır sırası dahil karşılaştırılır.
  - Sütun adları/sayısı ve değerler kontrol edilir.
- Geri bildirim: doğru / "eksik satırlar var" / "fazla satırlar var" / "sütunlar uyuşmuyor" /
  SQL hata mesajı. Mümkünse ipucu niteliğinde.
- Çözümü öğrenciden gizleme: lesson içindeki anlama-sorusu cevapları öğrenciye açık (tasarım gereği,
  "Cevap" butonu). Ama öğretmenin canlı-yardım bağlamında gördüğü referans çözümün öğrenciye sızmaması
  için, istenirse referans sorgular bundle'a gömülmeyip Supabase'ten role göre çekilir (öğretmen-only).
  v1'de basit tutup UI-gating ile başlayabiliriz; sıkı gizleme faz 2.

## 8. DB reset / seed mekanizması

- Her seed bir Postgres script'i (DDL + DML).
- PGlite örneği: ders/ünite değişince ilgili seed yüklenir.
- "Sıfırla" butonu: mevcut PGlite örneğini düşürüp seed'i yeniden çalıştırır (anında temiz DB).
- Performans: seed'leri küçük tut; gerekiyorsa PGlite snapshot (dump/restore) ile hızlandır.

## 9. Müfredat

BRAINSTORM.md bölüm 6'daki 0-8 ünite taslağı esas alınır. Ders şablonu: anlatım + 3-5 örnek +
2-3 anlama sorusu (ipucu + detaylı cevap) + pratik. İçerik Codex turundan sonra zenginleştirilecek.

## 10. kanji-app'ten somut reuse listesi

- `src/components/ui/*` (Button, Card, Modal, Input) ve `utils/cn.ts`, `app/globals.css` -> aynen.
- `src/lib/supabase/*` (client, auth, session) -> uyarlayarak (roller + class code eklenir).
- `src/lib/sync/*` (createStrengthSyncer, pull/merge by updatedAt) -> tablo adları değişerek.
- Zustand store deseni; `skill_strength` için kanji `strength` modeli birebir.
- RouteGuard / SessionInit / SyncInit -> uyarlanır (rol bazlı yönlendirme).
- i18n çatısı (tr.json/en.json) -> aynen.
- content-loader/content-schema deseni -> SQL lesson şemasına uyarlanır.
- XP/streak/daily summary -> opsiyonel, motivasyon için sonra eklenebilir.

## 11. Yol haritası (fazlar)

- **Faz 0 — İskelet:** repo, Next.js + Tailwind + Zustand kurulumu, Supabase projesi + auth + roller,
  RouteGuard, PGlite "merhaba dünya" (bir seed yükle, sorgu çalıştır, sonucu göster), CodeMirror editör.
- **Faz 1 — Tek ünite uçtan uca:** Ünite 1 (SELECT) tam: anlatım + örnekler + sorular + pratik +
  auto-grade + ilerleme kaydı + kendi /progress + **global Deneme Tahtası (⌘K)** ve örneklerde
  "Editörde aç". Şablon netleşir.
- **Faz 2 — İçerik + drill:** tüm ünitelerin içeriği (TR+EN), /practice drill modu, /playground.
- **Faz 3 — Öğretmen paneli (geçmiş):** /teacher, /teacher/:id, RLS ile öğrenci verisi, çözüm
  öğretmende.
- **Faz 4 — Canlı izleme:** Supabase Realtime ile /teacher/:id/live.
- **Faz 5 — Cila + yayın:** i18n tamamlama, erişilebilirlik, README, public GitHub release.

## 12. Açık/ikincil sorular

- Uygulama adı (örn: SQL Dojo, Query Lab, SQL Atölye, Sorgu Akademi...).
- Motivasyon mekanikleri (XP, rozet, streak) v1'de mi, sonra mı?
- Çoklu sınıf/öğretmen desteği gerekli mi, yoksa tek öğretmen mi (Bariş)?
- Seed temaları (okul/mağaza/kütüphane) hangileri olsun?

## 13. Sonraki adım: Codex turu

CODEX_PROMPT.md hazır. Oradaki prompt'u Codex'e ver, eğitmen/ürün gözüyle öneri + müfredat
eleştirisi + soru şablonları al. Dönüşü buraya işleyip planı revize edeceğiz, sonra Faz 0.
