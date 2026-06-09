# Codex / ChatGPT yanıtı — Soru Bankası + Drill (VERBATIM arşiv, 2026-06-09)

> docs/CODEX_PROMPT_QUESTIONBANK.md promtuna gelen yanıt. Kullanıcı pro'ya ödedi; aynen saklanır.
> Sentez/karar için bkz. docs/QUESTION_BANK_PLAN.md.

---

Dosyayı okudum. Ana kararım: mevcut yaklaşım doğru; bunu "rastgele soru havuzu" değil, **ölçülebilir kavram ustalığı sistemi** gibi kurmak lazım. En iyi hedef: ilk sürümde **180 yapılandırılmış soru**, sonra varyantlarla 220+.

**1. Kapsam Matrisi**

Zorluk seviyeleri:

| Seviye | Anlamı |
|---|---|
| D1 | Taklit: dersteki örneğe çok yakın |
| D2 | Transfer: aynı kavram, farklı tablo/koşul |
| D3 | Birleştirme: 2-3 kavram birlikte |
| D4 | Tuzaklı: NULL, duplicate, grain, LEFT JOIN, sıra, edge case |

180 soruluk hedef dağılım:

| Ünite | D1 | D2 | D3 | D4 | Toplam |
|---|---:|---:|---:|---:|---:|
| Ü0 Temeller | 4 | 1 | 0 | 0 | 5 |
| Ü1 SELECT | 5 | 3 | 1 | 1 | 10 |
| Ü2 WHERE + NULL | 4 | 5 | 3 | 4 | 16 |
| Ü3 İfadeler/tipler/COALESCE/CASE | 3 | 4 | 3 | 2 | 12 |
| ÜG Güvenlik | 3 | 2 | 1 | 2 | 8 |
| Ü4 Aggregate I | 4 | 4 | 2 | 2 | 12 |
| Ü5 GROUP BY/HAVING | 3 | 4 | 4 | 3 | 14 |
| Ü6 JOIN I | 4 | 5 | 4 | 3 | 16 |
| Ü7 JOIN II/grain/self | 2 | 4 | 6 | 4 | 16 |
| Ü8 JOIN + Aggregate | 1 | 4 | 6 | 3 | 14 |
| Ü9 Subquery/EXISTS/küme | 2 | 4 | 5 | 3 | 14 |
| Ü10 CTE | 2 | 2 | 3 | 1 | 8 |
| Ü11 DML/transaction | 3 | 2 | 2 | 1 | 8 |
| Ü12 DDL | 3 | 2 | 2 | 1 | 8 |
| Ü13 Window | 2 | 3 | 4 | 3 | 12 |
| Ü14 View/index | 3 | 2 | 1 | 1 | 7 |
| **Toplam** | **48** | **51** | **47** | **34** | **180** |

Ekstra ağırlık alması gereken kavramlar:

| Kavram | Hedef adet |
|---|---:|
| `NULL`, `IS NULL`, `COALESCE`, `COUNT(col)` farkı | 12-16 |
| `GROUP BY` grain mantığı | 10-12 |
| `HAVING` vs `WHERE` | 6-8 |
| `LEFT JOIN` + `WHERE` tuzağı | 6-8 |
| Çoktan çoğa join ve satır çoğalması | 10-14 |
| `COUNT(*)` vs `COUNT(column)` | 6-8 |
| Window vs GROUP BY | 6-8 |
| `ORDER BY` eşitliklerinde tie-breaker | 4-6 |
| DML güvenliği, `ROLLBACK`, `WHERE` şartı | 6-8 |

**2. Mevcut Korpusu Kullanma Stratejisi**

Mevcut ~78 pratik görevin çoğu doğrudan `write_sql` bankasına taşınmalı. Mevcut ~133 anlama sorusu ise bankanın "kavram kontrolü" katmanı olmalı: `multiple_choice`, `predict_output`, `fill_blank`, `find_bug`.

İş akışı:

1. Markdown'dan soru adaylarını çıkar.
2. Her adaya `lessonId`, `type`, `conceptTags`, `difficulty`, `referenceSql`, `orderMatters` ata.
3. `referenceSql` varsa seed üzerinde çalıştır, kolon adlarını/satır sayısını/hash'i kaydet.
4. Muğlak promptları yeniden yaz.
5. Aynı kavramı ölçen çok benzer soruları varyant ailesine bağla.
6. Ders içi öğretici sorular ile bağımsız drill sorularını ayır.

Olduğu gibi kalabilecekler: açık promptlu, tek hedefli, deterministik sonuçlu, referans SQL'i net olan görevler.

Yeniden yazılacaklar: "listele", "bul", "göster" gibi kısa kalan; hangi tablo/kolon/sıra beklendiği belirsiz olan; `ORDER BY` bekleyip tie-breaker vermeyen; seed'de tesadüfen doğru çıkan sorular.

Elenmesi gerekenler: aynı kavramı aynı veriyle tekrar eden kopyalar, SQL metnini ezberleten sorular, sonucu seed'e fazla bağımlı ama kavramı ölçmeyen sorular.

Yeni soru gerektiren boşluklar: hidden seed varyantları, `LEFT JOIN` sonrası `WHERE` tuzağı, duplicate/grain, DML reset/transaction, window tie davranışı, `NULL` içeren aggregate, `ORDER BY ... NULLS LAST`, `FILTER (WHERE ...)`.

**3. Soru Tipi Karışımı**

| Tip | Oran | Ne zaman kullanmalı |
|---|---:|---|
| `write_sql` | %45-50 | Asıl beceri ölçümü |
| `predict_output` | %15-20 | SQL'in ne döndüreceğini anlama |
| `multiple_choice` | %10-15 | Kavram yanılgısı yakalama |
| `fill_blank` | %8-10 | Syntax ve yapı iskeleti |
| `find_bug` | %8-10 | Gerçekçi hata okuma |
| `explain_why` | %3-5 | Öğretmen paneli / sınıf içi tartışma |

Kopyaya en dirençli tipler: `predict_output`, `find_bug`, hidden seed ile çalışan `write_sql`, küçük veri kesiti üstünden "hangi satırlar gelir?" soruları.

Üç farklı doğru çözüm varsa: sonuç kümesiyle kabul et. Ama görev özellikle "CTE kullan", "window function kullan", "LEFT JOIN ile çöz" diyorsa `requiredConcepts` ile kavram hedefini ayrıca değerlendir. Sonuç doğru ama hedef kavram yoksa: "Sonuç doğru, fakat bu görevde amaç window kullanmaktı" diye kısmi puan ver.

**4. Zorluk Kalibrasyonu**

D1: "students tablosundan sadece `first_name`, `last_name` çek."

D2: "city değeri NULL olanları getir."

D3: "completed siparişlerde öğrenci başına toplam harcama hesapla."

D4: "Üyesi olmayan kulüpler de gelsin; `COUNT(*)` değil `COUNT(cm.student_id)` kullanman gerekebilir."

Drill sırası: önce özgüven sorusu, sonra zayıf kavram, sonra yeni/transfer, sonra karışık soru, en sonda iyi hissettiren kısa tekrar.

**5. Bağımsız Sorular Modülü UX**

Üst menüde ayrı sayfa: **Sorular / Questions**.

Filtreler:

| Filtre | Davranış |
|---|---|
| Ünite kapsamı | Aralık seçimi: Ü1-Ü4, çoklu seçim de olabilir |
| Kavram | `NULL`, `JOIN`, `GROUP BY`, `window` chip'leri |
| Zorluk | D1-D4 |
| Tip | SQL yaz, çıktı tahmin et, hatayı bul |
| Durum | Yeni, yanlış yapılan, tekrar zamanı gelen, cevap görülmüş |
| Süre | Günlük 5, hızlı 10, odak modu 20 dk |

Soru tek tek sunulmalı. Liste görünümü sadece "tekrar et / geçmiş" ekranında olmalı. Tek soru ekranı daha az kaygı üretir ve drill akışını korur.

Seçim algoritması:

```text
adaylar = filtrelenmiş_sorular
puan = due_bonus
     + zayıf_kavram_bonus
     + seçili_ünite_bonus
     + zorluk_denge_bonus
     + yeni_soru_bonus
     - son_7_günde_görüldü_cezası
     - aynı_varyant_cezası
weighted_random(puan)
```

Günlük 5 kompozisyonu:

| Slot | İçerik |
|---|---|
| 1 | Kolay ısınma |
| 2 | Tekrar zamanı gelmiş zayıf kavram |
| 3 | Aynı zayıf kavramın farklı varyantı |
| 4 | Seçili kapsamta yeni soru |
| 5 | Öğrencinin iyi bildiği konudan kapanış |

Spaced repetition basit tutulabilir: yanlış = yarın, kısmi = 2 gün, doğru ama ipuçlu = 4 gün, doğru/ipucusuz = 7 gün, üst üste doğru = 14 gün.

Ezber önleme: soru varyant aileleri, hidden seed, kolon/sıra değişimleri, aynı kavramı farklı tabloyla sorma, cevabı gören öğrenciye hemen kardeş varyant sorma.

**6. Auto-Grade Sağlamlığı**

Her soru için gerekli metadata:

| Alan | Neden |
|---|---|
| `referenceSql` | Ana karşılaştırma |
| `orderMatters` | Sıra yalnız gerektiğinde ölçülür |
| `compareMode` | `set`, `multiset`, `ordered_multiset` |
| `expectedColumns` | Fazla/eksik kolon geri bildirimi |
| `numericTolerance` | `AVG`, para, oran hesapları |
| `nullPolicy` | `NULL`, `0`, boş string ayrımı |
| `requiredConcepts` | Hedef kavram kullanıldı mı |
| `forbiddenPatterns` | `SELECT *`, tehlikeli DML, hard-code |
| `allowedLiterals` | İstanbul gibi beklenen sabitler |
| `hiddenDatasetFamilies` | Hard-code yakalama |
| `tieBreakers` | `ORDER BY` eşitlikleri |
| `dmlVerificationSql` | DML sonrası tablo durumu |
| `timeoutMs` | Sonsuz/çok pahalı sorgu engeli |

Postgres özel kararlar:

- `ORDER BY grade DESC` tek başına yeterli değilse promptta `ORDER BY grade DESC, id ASC` yaz.
- `LIMIT` varsa her zaman deterministik `ORDER BY` ver.
- `AVG` için ya tolerans kullan ya da referansta `ROUND(AVG(x)::numeric, 2)` gibi açık formatla.
- `NULLS LAST/FIRST` gereken sorularda açıkça söyle.
- DML görevlerini her denemede transaction/snapshot içinde çalıştır; sonunda resetle.
- Hidden seed mantıklı, ama öğrencinin kullanması gereken literal değerleri `allowedLiterals` içine koy.

**7. Bütünlük ve Cevap Butonu**

"Cevap" butonunu yasaklama; öğrenme aracına çevir.

Önerilen sıra:

1. İlk denemeden önce sadece `hint1`.
2. Bir çalıştırmadan sonra `hint2`.
3. İkinci hatadan sonra "çözüm iskeleti".
4. Cevabı görürse soru "mastered" sayılmaz.
5. Cevap görüldükten sonra kardeş varyant önerilir.

Kısmi puan örneği:

| Boyut | Puan |
|---|---:|
| Sorgu çalıştı | 10 |
| Kolon şekli doğru | 20 |
| Satır kümesi doğru | 35 |
| Değerler doğru | 20 |
| Sıra doğru | 10 |
| Hedef kavram doğru | 5 |

Geri bildirim dili hep şu yapıda kalmalı: "Ne doğru? / Ne farklı? / Nereye bak?"

**8. Soru Bankası Şeması**

Önerilen soru şeması:

```json
{
  "id": "q-u2-null-city-is-null-001",
  "version": 1,
  "status": "ready",
  "type": "write_sql",
  "lessonId": "U2",
  "source": { "kind": "lesson_markdown", "path": "lessons/u2.md", "anchor": "practice-03" },
  "locales": {
    "tr": { "title": "NULL şehirli öğrenciler", "prompt": "...", "hint1": "...", "hint2": "...", "answerExplanation": "..." },
    "en": { "title": "...", "prompt": "...", "hint1": "...", "hint2": "...", "answerExplanation": "..." }
  },
  "conceptTags": ["where", "null", "is-null"],
  "prerequisites": ["select-basic", "where-basic"],
  "difficulty": { "level": 2, "label": "transfer" },
  "assessment": {
    "referenceSql": "...", "orderMatters": true, "compareMode": "ordered_multiset",
    "expectedColumns": ["id", "first_name", "last_name", "city"],
    "numericTolerance": null, "requiredConcepts": ["is-null"], "forbiddenPatterns": ["select_star"],
    "allowedLiterals": [], "hiddenDatasetFamilies": ["campus_null_edges"], "timeoutMs": 1000
  },
  "commonWrongPatterns": [],
  "variants": { "familyId": "null-filtering-basic", "siblingIds": [] },
  "analytics": { "masteryConcepts": ["null-filtering"], "estimatedTimeSec": 90 },
  "review": { "reviewedBy": "teacher", "reviewStatus": "approved" }
}
```

Ayrıca attempt tablosu şart:

```json
{
  "attemptId": "...", "questionId": "...", "questionVersion": 1, "userId": "...",
  "datasetVariant": "campus_v1", "submittedSql": "...", "score": 0.72, "result": "partial",
  "feedbackBuckets": ["extra_rows", "wrong_order"], "hintsUsed": 1, "solutionViewed": false,
  "startedAt": "...", "submittedAt": "..."
}
```

i18n kararı: soru içeriği versiyonlanmalı. Prompt değişirse `version` artmalı; eski attempt eski versiyona bağlı kalmalı.

**9. Ölçekte Üretim ve QA Akışı**

Üretim pipeline:

1. Markdown'dan aday çıkar. 2. JSON draft üret. 3. Prompt netlik linter'ı çalıştır. 4. `referenceSql` seed üzerinde çalıştır. 5. Hidden seed üzerinde çalıştır. 6. Beklenen kolon/satır/hash kaydet. 7. Common wrong pattern testlerini çalıştır. 8. İnsan review. 9. Pilot sınıf verisiyle kalibre et.

Kalite sinyalleri:

| Sinyal | Yorum |
|---|---|
| D1 geçme oranı <%60 | Prompt veya ders anlatımı sorunlu |
| Güçlü öğrenciler de çok takılıyor | Soru muğlak veya edge case haksız |
| Çok hızlı doğru | Çok kolay veya ezberlenmiş |
| Çok kişi cevap açıyor | İpucu/öğretim basamağı eksik |
| Çok kişi aynı yanlış SQL'i yazıyor | Common wrong pattern'e özel feedback ekle |
| Çok farklı doğru SQL geliyor | Soru iyi olabilir; result-based grading önemli |

Review rubriği:

| Kriter | 0 | 1 | 2 |
|---|---|---|---|
| Prompt netliği | Muğlak | Kısmen açık | Tereddütsüz |
| Kavram odağı | Dağınık | 2-3 hedef | Tek/ana hedef net |
| SQL doğruluğu | Çalışmıyor | Seed'de çalışıyor | Hidden seed'de de sağlam |
| Geri bildirim | Genel | Kısmen yönlendirici | Hata tipine özel |
| Adalet | Tesadüfi | Çoğu durumda adil | Edge case'ler düşünülmüş |

**10. Yapmayalım**

- SQL metnini birebir eşleştirme. - `ORDER BY` belirsizken sırayı notlama. - Çok küçük seed ile tesadüfen doğru cevabı kabul etme. - Her şeyi tuzak soruya çevirme. - `RIGHT/FULL JOIN`'i başlangıçta fazla büyütme. - Cevap butonunu "hile" gibi tasarlama. - `SELECT *` ile doğru kabul edilen görevleri çoğaltma. - DML sorularını reset/snapshot olmadan çalıştırma. - PGlite ortamında index konusunu gerçek performans ölçümü gibi öğretme. - Öğretmen panelinde sadece toplam puan göstermek.

**11. Soru Metni Netlik Rehberi**

Her prompt şu bilgileri açıkça söylemeli: Tablo (hangi tablolar?), Kolon (hangileri, hangi sırayla?), Filtre (koşullar, NULL davranışı?), Join (hangi ilişki, eşleşmeyenler gelsin mi?), Aggregate (grup seviyesi?), Sıra (ORDER BY + tie-breaker?), Alias (kolon adları isteniyor mu?), Dışlama (fazla kolon/satır gelmemeli mi?).

Önce: "İstanbul'daki öğrencileri listele."
Sonra: "`students` tablosundan, `city` değeri tam olarak `'İstanbul'` olan öğrencileri getir. Sonuçta sadece şu üç sütun olsun ve bu sırayla gelsin: `id`, `first_name`, `last_name`. `city` değeri `NULL` olan öğrenciler gelmemeli. Sonucu `id` değerine göre küçükten büyüğe sırala."

Önce: "Kulüplere göre üye sayısını bul."
Sonra: "`clubs` ve `club_memberships` tablolarını kullanarak her kulübün kaç üyesi olduğunu göster. Üyesi olmayan kulüpler de sonuçta görünmeli ve üye sayısı `0` olmalı. Sonuçta sadece `club_id`, `club_name`, `member_count` sütunları olsun. Sonucu önce `member_count` değerine göre büyükten küçüğe, eşitlik varsa `club_id` değerine göre küçükten büyüğe sırala."

---

## 3 Tam Örnek Soru Nesnesi

(Örnek 1 NULL tuzağı, Örnek 2 JOIN grain, Örnek 3 window — tam JSON'lar aşağıda; şemanın referans uygulaması.)

### Örnek 1: NULL Tuzağı
```json
{
  "id": "q-u2-null-city-is-null-001", "version": 1, "status": "ready", "type": "write_sql", "lessonId": "U2",
  "source": { "kind": "new", "anchor": "null-filtering" },
  "locales": {
    "tr": {
      "title": "Şehir bilgisi boş olan öğrenciler",
      "prompt": "students tablosundan, city değeri NULL olan öğrencileri getir. Sonuçta sadece şu dört sütun olsun ve bu sırayla gelsin: id, first_name, last_name, city. city değeri boş string olanları değil, gerçekten NULL olanları istiyoruz. Sonucu id değerine göre küçükten büyüğe sırala.",
      "hint1": "NULL normal bir değer gibi = ile karşılaştırılmaz.",
      "hint2": "Postgres'te NULL kontrolü için IS NULL kullanılır.",
      "answerExplanation": "Doğru çözüm city IS NULL kullanır. city = NULL yazarsan beklenen satırları alamazsın, çünkü NULL bilinmeyen/değer yok anlamına gelir."
    },
    "en": { "title": "Students with missing city", "prompt": "From the students table, return students whose city value is NULL. Return only id, first_name, last_name, city, in that order. Sort by id ascending.", "hint1": "NULL is not compared with =.", "hint2": "Use IS NULL in Postgres.", "answerExplanation": "The correct solution uses city IS NULL." }
  },
  "conceptTags": ["where", "null", "is-null", "order-by"],
  "prerequisites": ["select-basic", "where-basic"],
  "difficulty": { "level": 2, "label": "transfer" },
  "assessment": {
    "referenceSql": "SELECT id, first_name, last_name, city\nFROM students\nWHERE city IS NULL\nORDER BY id ASC;",
    "orderMatters": true, "compareMode": "ordered_multiset",
    "expectedColumns": ["id", "first_name", "last_name", "city"],
    "numericTolerance": null, "requiredConcepts": ["is-null"], "forbiddenPatterns": ["select_star"],
    "allowedLiterals": [], "hiddenDatasetFamilies": ["campus_null_edges"], "timeoutMs": 1000
  },
  "commonWrongPatterns": [
    { "id": "equals_null", "detect": { "sqlRegex": "=\\s*NULL" }, "feedback": { "tr": "NULL değeri = ile kontrol edilmez. city IS NULL kullanmalısın." } },
    { "id": "empty_string_instead_of_null", "detect": { "sqlRegex": "city\\s*=\\s*''" }, "feedback": { "tr": "Boş string ile NULL aynı şey değildir. Bu soru gerçekten NULL olan satırları istiyor." } }
  ],
  "feedbackExamples": [ { "case": "equals_null", "whatIsCorrect": "Seçtiğin sütunlar doğru görünüyor.", "whatIsDifferent": "Beklenen NULL şehirli öğrenciler gelmedi.", "whereToLook": "WHERE koşulunda = NULL yerine IS NULL kullan." } ]
}
```

### Örnek 2: JOIN Grain / Satır Çoğalması
```json
{
  "id": "q-u8-join-aggregate-student-total-spent-001", "version": 1, "status": "ready", "type": "write_sql", "lessonId": "U8",
  "source": { "kind": "new", "anchor": "join-aggregate-grain" },
  "locales": {
    "tr": {
      "title": "Öğrenci başına tamamlanmış sipariş tutarı",
      "prompt": "students, orders ve order_items tablolarını kullan. Sadece status değeri 'completed' olan siparişleri hesaba kat. Her öğrenci için tamamlanmış siparişlerindeki toplam harcamayı hesapla. Toplam harcama, order_items tablosundaki quantity * unit_price değerlerinin toplamıdır. Siparişi olmayan veya sadece pending/cancelled siparişi olan öğrenciler sonuçta görünmesin. Sonuçta sadece şu sütunlar olsun: student_id, first_name, last_name, total_spent. Sonucu önce total_spent değerine göre büyükten küçüğe, eşitlik varsa student_id değerine göre küçükten büyüğe sırala.",
      "hint1": "Toplam para order seviyesinde değil, order_items satırları üzerinden hesaplanır.",
      "hint2": "Öğrenci başına tek satır istiyorsan GROUP BY öğrenci seviyesinde olmalı.",
      "answerExplanation": "Doğru grain öğrenci seviyesidir. order_items satırlarını toplarız, fakat GROUP BY içinde öğrenci kimliği ve adı/soyadı kalır."
    },
    "en": { "title": "Completed spending per student", "prompt": "Use students, orders, and order_items. Include only orders with status = 'completed'. Return student_id, first_name, last_name, total_spent. total_spent is SUM(quantity * unit_price). Exclude students with no completed orders. Sort by total_spent descending, then student_id ascending.", "hint1": "Money is calculated from order_items rows.", "hint2": "Group at the student level.", "answerExplanation": "The correct grain is one row per student." }
  },
  "conceptTags": ["join", "join-aggregate", "grain", "group-by", "sum", "status-filter"],
  "prerequisites": ["inner-join", "aggregate-basic", "group-by"],
  "difficulty": { "level": 3, "label": "combine" },
  "assessment": {
    "referenceSql": "SELECT\n  s.id AS student_id,\n  s.first_name,\n  s.last_name,\n  SUM(oi.quantity * oi.unit_price) AS total_spent\nFROM students s\nJOIN orders o ON o.student_id = s.id\nJOIN order_items oi ON oi.order_id = o.id\nWHERE o.status = 'completed'\nGROUP BY s.id, s.first_name, s.last_name\nORDER BY total_spent DESC, s.id ASC;",
    "orderMatters": true, "compareMode": "ordered_multiset",
    "expectedColumns": ["student_id", "first_name", "last_name", "total_spent"],
    "numericTolerance": "0.0001", "requiredConcepts": ["join", "group-by", "sum"], "forbiddenPatterns": ["select_star"],
    "allowedLiterals": ["completed"], "hiddenDatasetFamilies": ["campus_orders_grain_edges"], "timeoutMs": 1000
  },
  "commonWrongPatterns": [
    { "id": "missing_status_filter", "detect": { "resultSymptom": "extra_rows_or_higher_totals", "sqlRegexMissing": "status\\s*=\\s*'completed'" }, "feedback": { "tr": "pending veya cancelled siparişler de hesaba karışmış olabilir. orders.status = 'completed' filtresini kontrol et." } },
    { "id": "wrong_grain_order_level", "detect": { "resultSymptom": "multiple_rows_per_student" }, "feedback": { "tr": "Sonuç öğrenci başına tek satır olmalı. GROUP BY içinde order_id varsa grain sipariş seviyesine kayar." } },
    { "id": "forgot_quantity", "detect": { "resultSymptom": "totals_too_low" }, "feedback": { "tr": "Toplam tutar unit_price değil, quantity * unit_price toplamıdır." } }
  ],
  "feedbackExamples": [ { "case": "wrong_grain_order_level", "whatIsCorrect": "Doğru tabloları bağlamışsın.", "whatIsDifferent": "Bazı öğrenciler birden fazla satır olarak geliyor.", "whereToLook": "GROUP BY seviyesini öğrenciye indir; order_id ile gruplama yapma." } ]
}
```

### Örnek 3: Window Function
```json
{
  "id": "q-u13-window-rank-course-grades-001", "version": 1, "status": "ready", "type": "write_sql", "lessonId": "U13",
  "source": { "kind": "new", "anchor": "rank-vs-group-by" },
  "locales": {
    "tr": {
      "title": "Ders içinde not sıralaması",
      "prompt": "enrollments, students ve courses tablolarını kullan. grade değeri NULL olan devam eden kayıtları dahil etme. Her dersin kendi içinde, öğrencileri grade değerine göre yüksekten düşüğe sırala ve RANK() ile ders içi sıralama numarası üret. Aynı grade değerine sahip öğrenciler aynı rank değerini almalı; sonraki rank değeri atlamalı, yani Postgres RANK davranışı kullanılmalı. Sonuçta sadece şu sütunlar olsun ve bu sırayla gelsin: course_code, student_id, student_name, grade, rank_in_course. student_name, first_name ve last_name değerlerinin aralarında bir boşluk olacak şekilde birleştirilmiş hali olsun. Sonucu course_code küçükten büyüğe, sonra rank_in_course küçükten büyüğe, sonra student_id küçükten büyüğe sırala.",
      "hint1": "GROUP BY satır sayısını azaltır; burada her öğrencinin satırı korunmalı.",
      "hint2": "RANK() OVER (PARTITION BY ders ORDER BY grade DESC) yapısını düşün.",
      "answerExplanation": "Window function, satırları gruba indirgemeden her satırın yanına hesaplanmış bir değer ekler. PARTITION BY her ders için ayrı sıralama başlatır."
    },
    "en": { "title": "Rank grades within each course", "prompt": "Use enrollments, students, and courses. Exclude rows where grade is NULL. Rank students within each course by grade descending using RANK(). Return course_code, student_id, student_name, grade, rank_in_course. Sort by course_code, rank_in_course, student_id.", "hint1": "GROUP BY would collapse rows; window functions keep rows.", "hint2": "Use RANK() OVER (PARTITION BY course ORDER BY grade DESC).", "answerExplanation": "A window function adds a computed value next to each existing row." }
  },
  "conceptTags": ["window", "rank", "partition-by", "order-by", "null-filter", "join"],
  "prerequisites": ["join-basic", "order-by", "window-intro"],
  "difficulty": { "level": 3, "label": "combine" },
  "assessment": {
    "referenceSql": "SELECT\n  c.code AS course_code,\n  s.id AS student_id,\n  s.first_name || ' ' || s.last_name AS student_name,\n  e.grade,\n  RANK() OVER (\n    PARTITION BY e.course_id\n    ORDER BY e.grade DESC NULLS LAST\n  ) AS rank_in_course\nFROM enrollments e\nJOIN students s ON s.id = e.student_id\nJOIN courses c ON c.id = e.course_id\nWHERE e.grade IS NOT NULL\nORDER BY c.code ASC, rank_in_course ASC, s.id ASC;",
    "orderMatters": true, "compareMode": "ordered_multiset",
    "expectedColumns": ["course_code", "student_id", "student_name", "grade", "rank_in_course"],
    "numericTolerance": null, "requiredConcepts": ["window", "rank", "partition-by"], "forbiddenPatterns": ["group_by_as_main_solution"],
    "allowedLiterals": [], "hiddenDatasetFamilies": ["campus_grade_ties"], "timeoutMs": 1000
  },
  "commonWrongPatterns": [
    { "id": "uses_row_number", "detect": { "sqlRegex": "ROW_NUMBER\\s*\\(" }, "feedback": { "tr": "ROW_NUMBER eşit notlara farklı sıra verir. Bu soruda eşit notlar aynı rank değerini almalı; RANK() kullan." } },
    { "id": "uses_dense_rank", "detect": { "sqlRegex": "DENSE_RANK\\s*\\(" }, "feedback": { "tr": "DENSE_RANK sıra numarasında boşluk bırakmaz. Bu soru Postgres RANK davranışını istiyor." } },
    { "id": "missing_partition", "detect": { "resultSymptom": "ranks_across_all_courses" }, "feedback": { "tr": "Sıralama her ders içinde yeniden başlamalı. OVER içinde PARTITION BY course_id kontrol et." } },
    { "id": "group_by_collapses_rows", "detect": { "resultSymptom": "too_few_rows" }, "feedback": { "tr": "GROUP BY satırları azaltır. Burada her öğrenci-ders satırı korunmalı ve yanına rank eklenmeli." } }
  ],
  "feedbackExamples": [ { "case": "uses_row_number", "whatIsCorrect": "Ders içinde sıralama fikrin doğru.", "whatIsDifferent": "Aynı nota sahip öğrenciler farklı sıra numarası alıyor.", "whereToLook": "ROW_NUMBER yerine RANK kullan." } ]
}
```

**Son Karar Özeti**

Bağımsız **Sorular** modülü tek tek soru akışıyla çalışsın; filtreler kapsamı belirlesin, seçim algoritması ise zayıf kavram + spaced repetition + yenilik dengesini kursun. Bankanın çekirdeği 180 soru olsun: yaklaşık yarısı `write_sql`, geri kalanı kavramı ölçen kısa soru tipleri. Auto-grade yalnız sonuç karşılaştırmasından ibaret kalmasın; kolon şekli, multiset duplicate, sıra, NULL, hidden seed, required concept ve common wrong pattern feedback katmanları birlikte çalışsın.

En kritik ürün kararı: soru bankası "kaç soru çözdün?" sistemi değil, "hangi kavram gerçekten oturdu?" sistemi olmalı. Her soru kavram etiketli, zorluk kalibreli, versiyonlu ve öğretmen analitiğine bağlanabilir olmalı.
