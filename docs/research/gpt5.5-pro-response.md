# Kaynak: ChatGPT 5.5 Pro yanıtı (SQL eğitim tasarımı)

> Arşiv. Bariş'in ücretli "pro" çıktısı. KAYBETME. Aynen saklanıyor.
> Tarih: 2026-06-07. Bu içerik CURRICULUM_MASTER.md'de sentezlendi.

---

## 1. Genel teşhis: mevcut plan iyi, ama birkaç kritik yer yeniden düzenlenmeli

Mevcut müfredatın omurgası doğru: `SELECT → WHERE → aggregate → JOIN → subquery → DML/DDL → ileri konular`. Ancak başlangıç öğrencileri için üç yerde pedagojik risk var:

1. **GROUP BY çok erken "tek ders" gibi kalıyor.**
   `COUNT/SUM/AVG` ayrı, `GROUP BY/HAVING` ayrı işlenmeli. Çünkü "tek sayı üretmek" ile "her grup için tek sayı üretmek" aynı zihinsel model değil.

2. **JOIN'dan hemen sonra ayrı bir "satır çoğalması / grain / JOIN + aggregate" dersi gerekli.**
   Öğrenciler `JOIN`i syntactically öğreniyor ama "bu sorguda bir satır neyi temsil ediyor?" sorusunu kaçırıyor. En çok yanlış sonuç, `orders` + `order_items` + `products` gibi tablolarda satır sayısı beklenmedik şekilde artınca çıkıyor.

3. **NULL konusu WHERE içinde geçilip bırakılmamalı; spiral şekilde dönmeli.**
   İlk kez `WHERE` içinde anlat, sonra aggregate'lerde `COUNT(*)` vs `COUNT(column)`, sonra `LEFT JOIN`, sonra `NOT IN` / `NOT EXISTS` sırasında tekrar getir. SQL'de normal karşılaştırmalar `NULL` ile karşılaşınca `true/false` değil "unknown" üretir; bu yüzden `= NULL` gibi ifadeler beklenen sonucu vermez. PostgreSQL belgeleri de sıradan karşılaştırma operatörlerinin `NULL` girdide `NULL/unknown` ürettiğini belirtir.

Ayrıca PGlite seçimin pedagojik olarak çok güçlü: öğrenci gerçek PostgreSQL'e yakın bir ortamda, tarayıcı içinde sorgu çalıştırıyor; PGlite resmi dokümantasyonu bunu "WASM içinde tam Postgres" olarak konumlandırıyor. Bu, oyuncak SQL motoru yerine gerçek davranışları öğretmeni sağlar.

---

# 2. Önerilen ünite/ders planı

Aşağıdaki plan, senin taslağını bozmadan daha öğretilebilir hale getirir.

## Seviye 0 — Veri okuryazarlığı ve ilk sorgu

### Ü0 — Tablo mantığı ve ilk SELECT

**Amaç:** Öğrenci "veritabanı = tablolar", "tablo = satır + sütun", "sorgu = tablodan cevap isteme" modelini kurar.

Dersler:
* Veritabanı, tablo, satır, sütun
* İlk `SELECT`
* `SELECT *` ne zaman yararlı, ne zaman kötü?
* Sonuç kümesi nedir?

Mini slogan: **"SQL'de bilgisayara ne yapacağını değil, hangi cevabı istediğini söylersin."**

## Seviye 1 — Tek tablodan veri okuma

### Ü1 — SELECT temelleri
İçerik: Sütun seçimi, `AS`, Basit hesaplamalar, `DISTINCT`, `ORDER BY`, `LIMIT`

Önemli not: `LIMIT` anlatılırken mutlaka `ORDER BY` ile birlikte göster. SQL, `ORDER BY` yoksa satırların belirli bir sırada geleceğini garanti etmez; PostgreSQL dokümanı da `LIMIT/OFFSET` kullanırken öngörülebilir sonuç için sıralama verilmesi gerektiğini açıkça belirtir.

### Ü2 — WHERE ve mantıksal filtreleme
İçerik: `=`, `<>`, `<`, `>`, `<=`, `>=`, `AND`, `OR`, `NOT`, Parantez kullanımı, `BETWEEN`, `IN`, `LIKE`, `ILIKE`, İlk NULL teması: `IS NULL`, `IS NOT NULL`

Burada `NULL` sadece "boş değer" diye anlatılmamalı. Daha iyi ifade:
> **NULL = bilmiyoruz / girilmemiş / yok.** `price = NULL` demek "fiyat bilinmeyene eşit mi?" gibi anlamsızdır. Onun yerine `price IS NULL` sorulur.

### Ü3 — İfadeler, veri tipleri, fonksiyonlar ve basit CASE
Bu senin taslağında eksik kalan kritik bir ünite.
İçerik: Sayı/metin/tarih veri tipleri, Basit string fonksiyonları (`LOWER`, `UPPER`, `LENGTH`), Tarih parçalama (`EXTRACT`, `DATE`), `COALESCE`, Basit `CASE WHEN`

Neden erken gelsin? Çünkü öğrenciler daha ilk pratiklerde "boşsa 0 göster", "şehir adını küçük harfle karşılaştır", "geçti/kaldı etiketi üret" gibi ihtiyaçlarla karşılaşacak. `CASE`i en sona bırakmak, öğrencinin ifade gücünü gereksiz kısıtlar.

## Seviye 2 — Özetleme ve gruplama

### Ü4 — Aggregate I: tüm tabloyu özetleme
İçerik: `COUNT(*)`, `COUNT(column)`, `SUM`, `AVG`, `MIN`, `MAX`, Aggregate fonksiyonların NULL davranışı

Burada öğrencinin şunu anlaması gerekir:
> `COUNT(*)` satır sayar. `COUNT(column)` o sütundaki NULL olmayan değerleri sayar.

PostgreSQL aggregate dokümanı, `count` dışındaki aggregate fonksiyonların bazı boş giriş durumlarında `NULL` döndürebileceğini ve `sum` gibi fonksiyonların NULL davranışına dikkat edilmesi gerektiğini belirtir.

### Ü5 — GROUP BY ve HAVING
İçerik: "Bir satır neyi temsil ediyor?", `GROUP BY`, Grup başına aggregate, `HAVING`, `WHERE` vs `HAVING`

Öğretim sırası:
1. Önce tek sayı: `SELECT COUNT(*) FROM students;`
2. Sonra grup başına sayı: `SELECT city, COUNT(*) FROM students GROUP BY city;`
3. Sonra grup filtresi: `SELECT city, COUNT(*) FROM students GROUP BY city HAVING COUNT(*) >= 3;`

PostgreSQL belgelerinde `GROUP BY`in aynı değerlere sahip satırları grup satırlarına dönüştürdüğü, `HAVING`in ise grupları filtrelediği anlatılır. Bu, `WHERE`in satırları, `HAVING`in grupları filtrelediğini öğretmek için çok net bir dayanak sağlar.

## Seviye 3 — Tablolar arası ilişki

### Ü6 — JOIN I: ilişki, PK/FK, INNER JOIN, LEFT JOIN
İçerik: Primary key / foreign key, Birincil/ilişkili tablo, `INNER JOIN`, `LEFT JOIN`, `ON` koşulu, Eşleşmeyen satırlar

Burada `RIGHT JOIN` öğretme. Başlangıçta kafa karıştırır ve pratikte çoğu durumda `LEFT JOIN` ile tablo sırası değiştirilerek ifade edilebilir.

Önerilen sıra: İki küçük tabloyu yan yana göster -> öğrenciye elle eşleştirt -> aynı eşleştirmeyi SQL ile yaptır -> eşleşmeyen satır örneği ekle -> en son `LEFT JOIN`.

### Ü7 — JOIN II: çoktan çoğa, self join, satır çoğalması
İçerik: Bir-çok ilişki, Çok-çok ilişki, Ara tablo, Self join, Alias zorunluluğu, Satır çoğalması
Mini slogan: > **JOIN satır eklemez; eşleşmeleri listeler. Eşleşme çoksa sonuç da çoğalır.**

### Ü8 — JOIN + Aggregate: en kritik ara ünite
Bu, mevcut planında eksik olan en önemli bölüm.
İçerik: Sipariş toplamı, Öğrenci başına ders sayısı, Kategori başına satış, `LEFT JOIN` + `COUNT`, `COUNT(*)` tuzağı, Önce join sonucu sonra group, Yanlış toplama / çift sayma

Yanlış:
```sql
SELECT c.name, COUNT(*)
FROM clubs c
LEFT JOIN memberships m ON m.club_id = c.id
GROUP BY c.name;
```
Bu sorgu, üyesi olmayan kulüpler için bile `COUNT(*) = 1` verebilir çünkü `LEFT JOIN` sonucunda kulüp satırı yine gelir.

Daha doğru:
```sql
SELECT c.name, COUNT(m.student_id) AS member_count
FROM clubs c
LEFT JOIN memberships m ON m.club_id = c.id
GROUP BY c.name;
```

## Seviye 4 — Daha güçlü sorgular

### Ü9 — Subquery, EXISTS, set operations
İçerik: Scalar subquery, `IN`, `EXISTS`, `NOT EXISTS`, `UNION`, `INTERSECT`, `EXCEPT`, `NOT IN` + NULL tuzağı
Öneri: `EXISTS`i "liste üretmek" değil, "böyle bir satır var mı?" sorusu olarak anlat.

### Ü10 — CTE: karmaşık sorguyu adımlara bölme
CTE'yi ileri konu değil, okunabilirlik aracı olarak konumlandır.
```sql
WITH city_counts AS (
  SELECT city, COUNT(*) AS student_count
  FROM students
  GROUP BY city
)
SELECT *
FROM city_counts
WHERE student_count >= 3;
```
Mini slogan: > **CTE = sorgu içinde geçici isim verilmiş ara sonuç.**

## Seviye 5 — Veri değiştirme ve veri modeli

### Ü11 — DML ve transaction
İçerik: `INSERT`, `UPDATE`, `DELETE`, `RETURNING`, `BEGIN`, `COMMIT`, `ROLLBACK`
Bunu öğrencinin güvenle deneyebilmesi için pratik ekranında "veritabanını sıfırla" ve "işlemi geri al" hissi çok önemli.

### Ü12 — DDL, veri tipleri ve constraints
İçerik: `CREATE TABLE`, Veri tipleri, `NOT NULL`, `UNIQUE`, `CHECK`, `PRIMARY KEY`, `FOREIGN KEY`, `ALTER`, `DROP`
Bence DDL'i DML'den tamamen önce koyma. Yeni başlayan, önce hazır tablolardan anlamlı cevap almayı öğrenirse motivasyonu daha yüksek olur. DDL daha sonra "şimdi bu tablolar nasıl tasarlanıyor?" sorusuna cevap olur.

## Seviye 6 — Analitik SQL

### Ü13 — Window functions
İçerik: `ROW_NUMBER`, `RANK`, `DENSE_RANK`, `SUM(...) OVER (...)`, `AVG(...) OVER (...)`, `PARTITION BY`, Window `ORDER BY`, Basit frame mantığı
En iyi giriş cümlesi: > **GROUP BY satırları azaltır. Window function satırları korur, yanına hesap ekler.**
PostgreSQL'de aggregate fonksiyonlar `OVER` ile kullanıldığında window function gibi davranabilir; `OVER` yoksa normal aggregate gibi sonucu özetler. Bu farkı görsel olarak göstermek çok işe yarar.

### Ü14 — View, index kavramı, performans sezgisi
İçerik: `VIEW`, View ne işe yarar?, Index nedir?, `EXPLAIN`e çok hafif giriş, "Doğru sonuç" vs "makul performans"
Bu üniteyi zorunlu final değil, "ileri seviye bonus" gibi sunabilirsin.

---

# 3. Her ünite için en sık hatalar ve anlatımda önleyici uyarılar

| Ünite | En sık hata | Anlatımda önleyici mini-uyarı |
| --- | --- | --- |
| Ü0 | Tabloyu Excel gibi "sabit sıra" sanmak | "Tabloda doğal sıra yoktur. Sıra istiyorsan `ORDER BY` yazarsın." |
| Ü1 | `SELECT *`i her yerde kullanmak | "Öğrenirken serbest, cevap verirken sadece istenen sütunlar." |
| Ü1 | `LIMIT`i `ORDER BY` olmadan kullanmak | "İlk 5 istiyorsan önce 'neye göre ilk?' sorusunu cevapla." |
| Ü1 | `DISTINCT`i veri temizleme sanmak | "DISTINCT veriyi düzeltmez, sadece sonuçta tekrarları saklar." |
| Ü2 | `AND` / `OR` önceliğini karıştırmak | "Kararsızsan parantez koy. İnsan için de bilgisayar için de netleşir." |
| Ü2 | `= NULL` yazmak | "NULL'a eşitlik sorulmaz; `IS NULL` sorulur." |
| Ü2 | `LIKE 'a'` ile `LIKE '%a%'` farkını kaçırmak | "Yüzde işareti jokerdir: başta, sonda, iki tarafta farklı anlam verir." |
| Ü3 | Metin ve sayı karşılaştırmasını karıştırmak | "Tırnaklı değer metindir; sayıda tırnak gerekmez." |
| Ü3 | `CASE`te `ELSE` yazmayınca NULL gelmesine şaşırmak | "Hiçbir koşula girmezse sonuç ne olacak? `ELSE` bunu söyler." |
| Ü4 | `COUNT(*)` ile `COUNT(column)` farkını bilmemek | "Biri satır sayar, biri dolu hücre sayar." |
| Ü4 | `AVG`in NULL'ları hesaba katmadığını fark etmemek | "Bilinmeyen not, sıfır not değildir." |
| Ü5 | Aggregate fonksiyonu `WHERE` içinde kullanmak | "WHERE gruplamadan önce çalışır; henüz `COUNT` oluşmamıştır." |
| Ü5 | SELECT'teki her normal sütunu GROUP BY'a koymamak | "Grup başına tek değer yoksa SQL hangi değeri göstereceğini bilemez." |
| Ü6 | `ON` koşulunu unutup devasa sonuç üretmek | "JOIN'de evlilik cüzdanı `ON`dur; yoksa herkes herkesle eşleşir." |
| Ü6 | `INNER JOIN` ile eşleşmeyen kayıtları kaybetmek | "INNER sadece iki tarafta da olanları gösterir." |
| Ü6 | `LEFT JOIN` sonrası sağ tabloya `WHERE` yazıp INNER'a çevirmek | "Sağ tablonun filtresi bazen `ON` içinde olmalı." |
| Ü7 | Alias kullanmadan self join yapmaya çalışmak | "Aynı tabloyu iki rol gibi düşün: öğrenci ve mentor gibi." |
| Ü8 | JOIN sonrası çift sayma | "Önce join sonucuna bak: bir satır artık neyi temsil ediyor?" |
| Ü9 | `NOT IN` + NULL yüzünden boş sonuç almak | "Alt listede NULL varsa `NOT IN` tehlikeli olabilir; `NOT EXISTS` daha güvenli." |
| Ü10 | CTE'yi geçici tablo sanmak | "CTE çoğu zaman sorgu içi isimlendirilmiş ara sonuçtur." |
| Ü11 | `UPDATE` / `DELETE`te `WHERE` unutmak | "WHERE yoksa tüm tablo etkilenir. Önce SELECT ile kontrol et." |
| Ü12 | PK/FK'yı sadece syntax sanmak | "PK kimliktir, FK başka tablodaki kimliğe referanstır." |
| Ü13 | Window ile GROUP BY'ı karıştırmak | "GROUP BY satırları küçültür; window satırları korur." |
| Ü14 | Index'i her şeyi hızlandıran büyü sanmak | "Index okumayı hızlandırabilir, ama yazmayı ve depolamayı etkiler." |

---

# 4. Zor kavramlar için özel öğretim sırası

## NULL öğretimi
Tek derste bitirme. Şöyle döndür:
1. **WHERE zamanı:** `IS NULL`, `IS NOT NULL`
2. **Aggregate zamanı:** `COUNT(*)` vs `COUNT(column)`
3. **LEFT JOIN zamanı:** Eşleşmeyen sağ tablo değerleri neden NULL gelir?
4. **Subquery zamanı:** `NOT IN` neden beklenmedik davranabilir?
Öğrenciye verilecek sade cümle: > NULL bir değer değildir; "değer bilinmiyor/yok" işaretidir.

## GROUP BY vs WHERE vs HAVING
Öğretirken sorguyu "boru hattı" gibi göster:
1. `FROM`: tabloyu seç
2. `WHERE`: satırları ele
3. `GROUP BY`: kalanları gruplara ayır
4. Aggregate: her grup için hesapla
5. `HAVING`: grupları ele
6. `SELECT`: göster
7. `ORDER BY`: sırala
8. `LIMIT`: kırp
Uygulama içinde bunu görselleştirebilirsin: Öğrenci sorgu yazınca yan panelde "bu sorgu önce satırları filtreliyor, sonra grupluyor" gibi bir açıklama üret.

## JOIN öğretimi
JOIN anlatımında syntax'tan önce ilişkiyi anlat.
İyi sıra: 1. Bu iki tablo neyi temsil ediyor? 2. Hangi sütunlar eşleşiyor? 3. Bir satır A'da kaç satır B ile eşleşebilir? 4. Eşleşmeyenleri istiyor muyuz? 5. O zaman hangi JOIN?
Öğrenciye karar ağacı:
```text
Sadece iki tarafta da eşleşenler mi? → INNER JOIN
Soldaki herkes kalsın, sağdaki varsa gelsin mi? → LEFT JOIN
Eşleşmeyenleri özellikle bulmak mı istiyorsun? → LEFT JOIN + WHERE right.id IS NULL veya NOT EXISTS
```

## Window functions öğretimi
```sql
SELECT student_name, city, score,
  AVG(score) OVER (PARTITION BY city) AS city_avg
FROM exam_results;
```
Açıklama: > Her öğrenci satırı duruyor. Ama yanına kendi şehrinin ortalaması geliyor.
Bu, `GROUP BY`dan daha kolay anlaşılır çünkü öğrenci sonucu satır satır görebilir.

---

# 5. Anlama sorusu şablonları
İyi anlama sorusu, öğrencinin sadece syntax hatırlamasını değil, zihinsel modeli kontrol eder.
- **Şablon 1 — "Bu sorgu ne döndürür?"** Tahmin ettir, sonra çalıştır.
- **Şablon 2 — "Hangi sorgu doğru?"** İki benzer sorgu farkı (WHERE vs HAVING, INNER vs LEFT, COUNT(*) vs COUNT(column), = NULL vs IS NULL).
- **Şablon 3 — "Hata avı"** Klasik hatayı bilinçli hale getir. Örn: `SELECT * FROM students WHERE city = NULL;` neden yanlış?
- **Şablon 4 — "Boşluk doldur"** Syntax kas hafızası. Örn: `SELECT city, COUNT(*) ... _____ city HAVING COUNT(*) >= 2;`
- **Şablon 5 — "İstenen cevabı Türkçeden SQL'e çevir"** Gerçek beceri. Örn: "Her şehirde kaç öğrenci olduğunu göster."

---

# 6. Somut anlama sorusu örnekleri

## Örnek 1 — Ü2 WHERE + NULL
Tablo `students`: (1 Ayşe İstanbul) (2 Mehmet NULL) (3 Zeynep Ankara) (4 Can NULL)
Soru: `SELECT name FROM students WHERE city = NULL;` hangi öğrencileri getirir?
A. Mehmet ve Can / B. Hiçbir öğrenci / C. NULL şehirli tüm öğrenciler / D. Hata verir
İpucu: NULL normal bir değer gibi karşılaştırılmaz.
Detaylı cevap: Doğru cevap B. `city = NULL` SQL'de beklediğimiz gibi `true` üretmez. Doğru: `WHERE city IS NULL;` (Mehmet ve Can gelir). Mini-uyarı: `= NULL` görünce alarm çalsın, genelde `IS NULL` istemişsindir.

## Örnek 2 — Ü5 GROUP BY + HAVING
Tablo `students`: İstanbul x3 (Ayşe, Mehmet, Elif), Ankara x1 (Zeynep), İzmir x1 (Can)
Soru: "En az 2 öğrencisi olan şehirleri ve sayılarını göster." A: WHERE COUNT(*)>=2 / B: GROUP BY city HAVING COUNT(*)>=2 / C: HAVING COUNT(*)>=2 (GROUP BY yok)
İpucu: WHERE satırları, HAVING grupları filtreler.
Detaylı cevap: Doğru B. Önce şehirlere göre gruplanır, sonra HAVING ile >=2 kalır. Sonuç: İstanbul 3. A yanlış çünkü WHERE'de henüz COUNT yok. C yanlış çünkü GROUP BY yok. Slogan: Satırı elemek için WHERE, grubu elemek için HAVING.

## Örnek 3 — Ü6 LEFT JOIN
`clubs`: 1 Robotik, 2 Müzik, 3 Satranç. `memberships`: (10,1)(11,1)(12,2)
Soru: "Tüm kulüpleri ve varsa üyeleri göster, üyesi olmayanlar da görünsün." A: INNER JOIN / B: LEFT JOIN
İpucu: "Tüm kulüpler görünsün" -> sol tablo korunmalı.
Detaylı cevap: Doğru B. INNER sadece eşleşenleri getirir (Satranç görünmezdi). LEFT JOIN soldaki tüm satırları tutar, eşleşme yoksa sağ taraf NULL. Sonuç: Robotik 10, Robotik 11, Müzik 12, Satranç NULL.

---

# 7. Çözümlü örnek tasarımı: iyi örnek ne yapar?
Kötü örnek: veri görünmüyor, çok kavram bir arada, tahmin ettirmiyor (`SELECT department_id, AVG(score) ... HAVING AVG(score)>70 ORDER BY AVG(score) DESC`).
İyi örnek: önce küçük tabloyu göster, günlük dilde hedef ("Her şehirde kaç öğrenci var?"), önce eksik düşünce (`SELECT city FROM students`), sonra doğru (`GROUP BY city + COUNT(*)`), adım adım açıklama, sonuç tahmin edilebilir, sonra mini varyasyon (HAVING). Dört parça: "Ne istiyoruz / Hangi tablolar / Sorgu / Sonuçtan ne anlıyoruz".

---

# 8. Pratik ve drill görevleri
Zorluk kademeleri (her görev için 4 seviye): 1. Taklit (örneğin çok benzeri) 2. Küçük transfer (farklı tablo/koşul) 3. Birleştirme (iki kavram) 4. Tuzaklı gerçek görev (klasik hata; örn "Hiç üyesi olmayan kulüpleri bul" -> LEFT JOIN + WHERE m.student_id IS NULL).
Drill soru seçimi sinyalleri: son 10 görev hata etiketleri, ipucu kullanma oranı, aynı kavramda üst üste hata, uzun süre çözülmeyenler, geçmişte doğru yapıp unutulanlar. Spaced repetition + retrieval practice güçlü stratejiler.
Kısmi puanlama: Doğru sütunlar 20, Doğru satırlar 35, Doğru aggregate 20, Doğru sıralama (istenmişse) 10, Duplicate/eksik/fazla 10, Kavram kullanımı (gerekiyorsa) 5. Dikkat: "kavramı kullanma" puanını her görevde zorunlu yapma; farklı ama geçerli çözüm olabilir.
"Neredeyse doğru" geri bildirim örnekleri: sıra yanlış -> ORDER BY DESC öner; NULL eksik -> = NULL yerine IS NULL; fazla satır -> JOIN sonrası çoğalma, önce join sonucuna bak; LEFT->INNER olmuş -> koşul ON mı WHERE mı; GROUP BY eksik -> normal sütun + aggregate var.

---

# 9. Motivasyon ve akılda kalıcılık
Rozet yağmuru değil; öğrencinin gerçekten veriyle cevap üretebildiğini hissetmesi.
1. Kavram ustalığı haritası (SELECT güçlü, NULL tekrar gerekli, JOIN riskli...). "Kaç soru çözdüm"den iyi.
2. Zayıf konuyu nazikçe tekrar getirme (2 dk mini tekrar).
3. Günlük mini drill (5 soru: ısınma, zayıf konu, yeni konu, karışık, mini başarı). Son soru iyi hisle bitsin.
4. "Açıklayarak çöz" modu (neden HAVING kullandın? A/B/C). Kopyala-yapıştır öğrenmeyi azaltır.
5. Hata koleksiyonu kartları (=NULL, WHERE COUNT(*), LEFT JOIN+WHERE, ORDER BY'sız LIMIT). Drill'de tekrar gelir.

---

# 10. Seed veri seti önerisi
Tek tutarlı evren kullan ("kampüs evreni"), ama modüler büyüt.
Çekirdek tablolar:
- `students` (id, first_name, last_name, city, department_id, birth_date, email, scholarship_amount, created_at) -> SELECT, WHERE, NULL, ORDER BY, LIMIT, CASE, tarih.
- `departments` (id, name, faculty) -> PK/FK, JOIN, GROUP BY.
- `courses` (id, code, name, department_id, credits) -> JOIN, filtreleme, DDL.
- `enrollments` (student_id, course_id, semester, grade, attendance_rate) -> çoktan çoğa, composite key, aggregate, NULL not, window.
- `clubs` (id, name, founded_year), `club_memberships` (student_id, club_id, role, joined_at) -> LEFT JOIN, üyesi olmayan kulüp, çok-çok, self join hazırlık.
İkinci modül (kampüs kafesi): `products` (id, name, category, price), `orders` (id, student_id, ordered_at, status), `order_items` (order_id, product_id, quantity, unit_price) -> JOIN+aggregate, sipariş toplamı, çift sayma, window ranking, tarih analizi.
Bilerek konulacak edge case'ler: NULL şehir, NULL not, siparişi olmayan öğrenci, üyesi olmayan kulüp, aynı puana sahip öğrenciler, aynı şehirde çok öğrenci, aynı isimli farklı öğrenciler, az kayıtlı kategori, iptal sipariş, çok ürünlü sipariş, çok kulüplü öğrenci.
İsim dili: SQL tablo/sütun isimleri İngilizce (`students`, `courses`, `enrollments`); arayüz açıklamaları TR+EN; kavram kartları iki dilli (satır/row, sütun/column, sonuç kümesi/result set). Çünkü gerçek dünya İngilizce SQL terimleriyle ilerliyor, ama başlangıç açıklaması Türkçe olmalı.

---

# 11. Otomatik değerlendirmenin pedagojik tuzakları
- Tuzak 1 Doğru sonuç yanlış öğrenme (hard-code `SELECT 'İstanbul', 3`): gizli seed varyantı, farklı veriyle test, literal yoğunluğu; cezalandırmadan önce "farklı veride de çalışmalı" de.
- Tuzak 2 Sıra önemli mi: görev metninde açık yaz; istenmemişse set/multiset karşılaştır.
- Tuzak 3 Duplicate kaybı: SQL bag/multiset gibi; duplicate sayısını dikkate al; gereksiz DISTINCT uyarısı.
- Tuzak 4 NULL vs '' vs 0 karışması: kesin ayır; "beklenen NULL'dı, sen 0 döndürdün".
- Tuzak 5 Float/AVG hassasiyeti: sayısal tolerans; yuvarlama isteniyorsa açık söyle.
- Tuzak 6 Kolon adı vs sıra: başlangıçta sayı+sıra+değer kontrol; alias hatası tüm cevabı sıfırlamasın.
- Tuzak 7 DML/DDL durum kirlenmesi: her görev izole transaction/snapshot; sıra: seed yükle -> öğrenci sorgusu -> kontrol sorguları -> reset.
- Tuzak 8 Referans sorgu tek doğru yol değil: ana not sonuç üzerinden; syntax/kavram kontrolü sadece görev o kavramı çalıştırıyorsa.

---

# 12. Daha öğretici otomatik geri bildirim mimarisi
Katmanlar: 1. Çalıştı mı? (syntax/runtime/timeout) 2. Şekil doğru mu? (sütun sayısı/adları/tipleri/satır sayısı) 3. Değerler doğru mu? (eksik/fazla satır, yanlış aggregate, duplicate, NULL) 4. Sıra doğru mu? (istenmişse) 5. Kavram hedefi karşılandı mı? (GROUP BY beklenende aggregate var mı, LEFT JOIN pratiğinde LEFT JOIN var mı). Son katman "not"tan çok "öğretici ipucu" üretmeli.

---

# 13. Eğitmen paneli: gerçekten faydalı metrikler
En değerli: "kim hangi kavram yanılgısında takıldı?"
1. Sınıf kavram ısı haritası (öğrenci x kavram). 2. En yaygın hata panosu (=NULL 12 kişi...). 3. Öğrenci detay profili (son görevler, başarı/deneme, ipucu, en çok 3 hata, ort süre, ilk denemede başarı, son sorgular, fark özeti, öğretmen notu). 4. Canlı ders izleme (öğrenci/görev/durum/son hata/süre + otomatik uyarı "6 öğrenci aynı LEFT JOIN hatası"). 5. Soru kalitesi analizi (ilk denemede başarı, ort deneme/süre, en çok hata, çözüm açma; güçlü öğrenci de takılıyorsa soru kötü olabilir).

---

# 14. Ürün içi öğretim bileşenleri
1. "Sorgu çalışma sırası" paneli (FROM -> WHERE -> GROUP BY -> aggregate -> HAVING -> SELECT -> ORDER BY -> LIMIT açıklaması).
2. "Tahmin et, sonra çalıştır" modu.
3. "Sonuç farkı" görselleştirmesi (eksik/fazla/yanlış değer satırları).
4. "Mini kavram kartı" (aynı hata 2. kez -> NULL kartı açılır).
5. "Benzer ama daha kolay soru" (3 kez takılınca önce küçük veriyle aynı kavram).

---

# 15. Ders içi akış şablonu (her ders)
1. 3 dk hatırlama (önceki dersten 2 mini soru). 2. Yeni kavram tek cümle. 3. Küçük veriyle görsel anlat (5-8 satır). 4. Tahmin ettir. 5. Çalıştırılabilir örnek. 6. Yanlış örnek göster. 7. Kontrollü pratik (2 kolay 1 orta). 8. Serbest pratik/görev (auto-grade). 9. Çıkış bileti (tek soru).

---

# 16. En önemli tasarım kararları
1. RIGHT/FULL JOIN başlangıçta zorunlu olmasın; INNER+LEFT derin. 2. CASE çok geç kalmasın. 3. Ayrı "JOIN + aggregate" ünitesi. 4. Her görev "kavram etiketi" taşısın (null-comparison, where-vs-having, left-join-unmatched, join-duplication). 5. Yanlış cevaplar hata etiketine dönüşsün. 6. Sonuç karşılaştırması multiset mantığında. 7. Gizli seed varyantı. 8. Her yeni kavram için küçük tablo + tahmin + çalıştır + açıklama döngüsü. 9. "SQL çalışma sırası" yan paneli. 10. Eğitmen panelinde başarıdan çok yanılgı göster.

---

# 17. Kısa uygulanabilir yol haritası
İlk MVP: Ü0-Ü6 (SELECT, WHERE, NULL, Aggregate, GROUP BY/HAVING, JOIN). Tek seed evren (students, departments, courses, enrollments, clubs, club_memberships). Her görevde: concept tags, expected result, order sensitivity, hint1, hint2, detailed explanation, common wrong patterns. Değerlendirme: syntax error / wrong column count / missing rows / extra rows / wrong order / NULL mismatch / duplicate mismatch. Eğitmen paneli v1: öğrenci listesi, konu bazlı başarı, son hatalar, en yaygın sınıf hataları, öğrenci sorgu geçmişi.
İkinci faz: drill adaptasyonu, gizli seed varyantları, JOIN+aggregate ünitesi, CTE, DML/DDL sandbox, window functions, canlı izleme.

## Son önerilen müfredat özeti
```text
Ü0  Veri tabanı, tablo, satır, sütun, ilk SELECT
Ü1  SELECT, AS, DISTINCT, ORDER BY, LIMIT
Ü2  WHERE, AND/OR/NOT, IN, BETWEEN, LIKE, NULL
Ü3  Veri tipleri, fonksiyonlar, COALESCE, basit CASE
Ü4  Aggregate I: COUNT, SUM, AVG, MIN, MAX
Ü5  GROUP BY, HAVING, WHERE vs HAVING
Ü6  JOIN I: PK/FK, INNER JOIN, LEFT JOIN
Ü7  JOIN II: çoktan çoğa, self join, alias, satır çoğalması
Ü8  JOIN + Aggregate: grain, çift sayma, LEFT JOIN + COUNT
Ü9  Subquery, IN, EXISTS, set operations
Ü10 CTE: sorguyu adımlara bölme
Ü11 DML: INSERT, UPDATE, DELETE, transaction
Ü12 DDL: CREATE TABLE, veri tipleri, constraints, ALTER/DROP
Ü13 Window functions, analitik sorgular
Ü14 View, index kavramı, performans sezgisi
```
En büyük pedagojik kazanç, zor kavramları tek seferlik konu olarak değil, farklı bağlamlarda tekrar eden zihinsel modeller olarak tasarlamaktır.

## Kaynaklar (pro yanıtının verdiği)
1. PostgreSQL Comparison Functions: https://www.postgresql.org/docs/current/functions-comparison.html
2. PGlite: https://pglite.dev/
3. PostgreSQL LIMIT/OFFSET: https://www.postgresql.org/docs/current/queries-limit.html
4. PostgreSQL Aggregate Functions: https://www.postgresql.org/docs/current/functions-aggregate.html
5. PostgreSQL Table Expressions (GROUP BY/HAVING): https://www.postgresql.org/docs/current/queries-table-expressions.html
6. PostgreSQL Window Functions: https://www.postgresql.org/docs/current/functions-window.html
7. Nature, spacing & retrieval practice: https://www.nature.com/articles/s44159-022-00089-1
