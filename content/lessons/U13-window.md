# Ünite 13 — Window Functions: Satırı Koruyup Yanına Hesap Eklemek

> Kavram etiketleri: `window-over`, `partition-by`, `row-number`, `rank`, `dense-rank`, `running-total`, `lag-lead`, `window-vs-groupby`
> Ön koşul: Ü0-Ü10 (özellikle Ü5 GROUP BY, Ü8 grain)
> Kullanılan tablolar: students
> Tahmini süre: 55-65 dk
> Ünite sloganı: **"GROUP BY satırları azaltır; window function satırları korur, yanına hesap ekler."**

> Bu, analitik SQL'in zirvesi ve genelde "ileri" sayılır; ama doğru gösterilince çok sezgiseldir. Anahtar
> fikri bir cümlede tut: window function her satırı yerinde bırakır, yanına bir hesap (ortalama, sıra,
> kümülatif toplam...) ekler.

---

## Ders 13.1 — OVER ve PARTITION BY: satırı koruyan grup hesabı

### 🧑‍🏫 Öğretmen için
GROUP BY'ı hatırlat: "Her şehrin ortalama bursunu bulduğumuzda 14 satır 5 satıra inmişti (şehir başına
bir satır)." Sor: "Ya her öğrenciyi YERİNDE bırakıp, yanına KENDİ şehrinin ortalamasını yazmak istesem?"
İşte window function. Tahtaya iki çıktı çiz: solda GROUP BY (5 satır, çökmüş), sağda window (14 satır,
her birinin yanında şehir ortalaması). "Aynı hesap, ama window satırı yok etmiyor." `OVER (PARTITION BY
city)` = "şehir şehir hesapla ama satırları tut".
- Anahtar cümle: **"GROUP BY çöktürür, OVER çöktürmez; satır kalır, yanına grup hesabı gelir."**
- Sor: "Ayşe'nin satırında şehir ortalaması ne yazar?" (İstanbul'un ortalaması, 4000.)
- Herkes burada takılır: window'da GROUP BY YOK; sadece OVER var. "GROUP BY yazmıyoruz" de.

### Neden / nerede işime yarar
"Her öğrencinin notu + sınıf ortalaması yan yana", "her satışın yanında o günün toplamı", "her ürünün
fiyatı + kategorisinin ortalaması" gibi "satır + grubun özeti birlikte" sorularının hepsi window
function ister. GROUP BY ile yapamazsın çünkü o satırları çöktürür.

### Konu anlatımı
GROUP BY (Ü5) satırları gruplara çöktürür: her grup tek satır olur. **Window function** ise satırları
**korur**; her satırın yanına, ait olduğu "pencere" (window) üzerinden hesaplanmış bir değer ekler.

Anahtar sözdizimi `OVER`:

```sql
SELECT first_name, city, scholarship_amount,
       AVG(scholarship_amount) OVER (PARTITION BY city) AS sehir_ort
FROM students;
```

- `AVG(...) OVER (...)`: bu bir aggregate ama `OVER` yüzünden window olarak çalışır; satırları çöktürmez.
- `PARTITION BY city`: pencereyi şehre göre böler. Her öğrencinin `sehir_ort` değeri, KENDİ şehrinin
  ortalamasıdır.
- **GROUP BY YOK.** Window function GROUP BY istemez; 14 öğrenci, 14 satır kalır.

> Mini slogan: **`AGG(...) OVER (PARTITION BY x)`: x'e göre hesapla ama satırları koru; her satır kendi grubunun özetini yanında taşır.**

### Çözümlü örnekler

**Örnek 1 (şehir ortalaması, satırlar korunur)**
- Sorgu (yukarıdaki). Sonuç (İstanbullular):

| first_name | city     | scholarship_amount | sehir_ort |
|------------|----------|--------------------|-----------|
| Ayşe       | İstanbul | 5000               | 4000      |
| Ali        | İstanbul | 2000               | 4000      |
| Selin      | İstanbul | 5000               | 4000      |
| Okan       | İstanbul | NULL               | 4000      |

- Ne anlıyoruz? 14 öğrencinin hepsi yerinde (14 satır), ama her birinin yanında KENDİ şehrinin ortalama
  bursu var. İstanbul ortalaması 4000 (NULL Okan hariç, (5000+2000+5000)/3). GROUP BY olsaydı İstanbul
  tek satıra inerdi; window sayesinde her öğrenci + şehir ortalaması bir arada.

**Örnek 2 (GROUP BY ile karşılaştır)**
- GROUP BY versiyonu (çöktürür):
```sql
SELECT city, AVG(scholarship_amount) FROM students GROUP BY city;   -- 5 satır (şehir başına 1)
```
- Window versiyonu (korur):
```sql
SELECT first_name, city, AVG(scholarship_amount) OVER (PARTITION BY city) FROM students;  -- 14 satır
```
- Ne anlıyoruz? Aynı "şehir ortalaması" hesabı; GROUP BY 5 satır verir (her şehir özeti), window 14 satır
  verir (her öğrenci + şehir özeti). Hangisini istediğin soruya bağlı: sadece özet mi, yoksa satır+özet mi.

### Sık hatalar & uyarılar
- Window function ile birlikte GROUP BY yazmaya çalışmak. Window GROUP BY istemez; satırları zaten korur.
- "Her satırın yanında grup hesabı" istediğinde GROUP BY kullanıp satırların çöktüğünü görmek. O durumda window gerekir.

### Anlama soruları

**Soru 1 (kavram).** `AVG(scholarship_amount) OVER (PARTITION BY city)` ile `AVG(scholarship_amount) ...
GROUP BY city` arasındaki temel fark nedir?
> **İpucu:** Kaç satır döner, satırlar korunur mu?

> **Detaylı cevap:** İkisi de "şehir başına ortalama burs"u hesaplar, ama sonuç şekli farklıdır. GROUP BY
> versiyonu satırları çöktürür: her şehir için tek satır, toplam 5 satır (şehir + ortalaması). Window
> versiyonu (`OVER (PARTITION BY city)`) satırları korur: 14 öğrencinin hepsi yerinde kalır, her birinin
> yanına KENDİ şehrinin ortalaması eklenir, toplam 14 satır. Yani GROUP BY "özet tablosu" üretir, window
> "her satır + ait olduğu grubun özeti" üretir. "Her öğrenciyi görmek ama yanında şehir ortalamasını da
> istemek" senaryosunda window şarttır; GROUP BY ile öğrenci satırlarını kaybedersin.

**Soru 2 (yaz).** Her öğrencinin adını, bölüm id'sini, bursunu ve KENDİ bölümünün ortalama bursunu yan
yana getir (satırlar korunsun).
> **İpucu:** AVG(scholarship_amount) OVER (PARTITION BY department_id).

> **Detaylı cevap:**
> ```sql
> SELECT first_name, department_id, scholarship_amount,
>        AVG(scholarship_amount) OVER (PARTITION BY department_id) AS bolum_ort
> FROM students
> ORDER BY department_id;
> ```
> `OVER (PARTITION BY department_id)`, pencereyi bölüme göre böler; her öğrencinin `bolum_ort` değeri
> kendi bölümünün ortalama bursudur. 14 öğrencinin hepsi satır olarak kalır (GROUP BY yok), yanlarında
> bölüm ortalamaları görünür. Böylece "bu öğrencinin bursu, kendi bölüm ortalamasının üstünde mi altında
> mı?" gibi karşılaştırmaları tek bakışta yapabilirsin. AVG yine NULL bursları yok sayar (Ü4), yani
> ortalama o bölümdeki bursu dolu öğrenciler üzerinden hesaplanır.

### Çıkış bileti
Window function ile GROUP BY arasındaki en temel fark (satırlara ne olur) nedir?

---

## Ders 13.2 — Sıralama fonksiyonları: ROW_NUMBER, RANK, DENSE_RANK

### 🧑‍🏫 Öğretmen için
"Her satıra bir sıra numarası vermek istesek?" Tahtaya bursları büyükten küçüğe yaz, yanına numara koy.
Sonra eşitliği gündeme getir: "İki kişi 5000'de eşit; ikisi de 1. mi, biri 1 biri 2 mi?" İşte üç farklı
cevap: ROW_NUMBER (herkese ayrı numara: 1,2), RANK (eşitlere aynı, sonra atlar: 1,1,3), DENSE_RANK
(eşitlere aynı, atlamaz: 1,1,2). Üçünü yan yana çalıştır, farkı gözle gör.
- `OVER (ORDER BY ...)`: pencere içinde neye göre sıralanacağını söyler.
- `PARTITION BY` ile birleştir: "her ŞEHRİN kendi içinde sıralama" (her grup ayrı sıralanır).
- Herkes burada takılır: RANK ile DENSE_RANK farkı. "RANK atlar, DENSE atlamaz" diye tekrarlat.

### Konu anlatımı
Sıralama (ranking) window fonksiyonları, satırlara bir `OVER (ORDER BY ...)` sırasına göre numara verir:
- `ROW_NUMBER()`: her satıra benzersiz, ardışık numara (1,2,3,...). Eşitlikte bile farklı numara.
- `RANK()`: eşit değerlere aynı sıra; sonra **atlar** (1,1,3 — iki birinci varsa üçüncü 3'tür).
- `DENSE_RANK()`: eşit değerlere aynı sıra; **atlamaz** (1,1,2).

`PARTITION BY` eklersen, her grup kendi içinde sıralanır (örn. her şehrin kendi sıralaması).

> Mini slogan: **ROW_NUMBER herkese ayrı numara; RANK eşitlere aynı verip atlar (1,1,3); DENSE_RANK aynı verir ama atlamaz (1,1,2).**

### Çözümlü örnekler

**Örnek 1 (üç fonksiyon yan yana, eşitlik farkı)**
- Sorgu:
```sql
SELECT first_name, scholarship_amount,
       ROW_NUMBER()  OVER (ORDER BY scholarship_amount DESC) AS rn,
       RANK()        OVER (ORDER BY scholarship_amount DESC) AS rnk,
       DENSE_RANK()  OVER (ORDER BY scholarship_amount DESC) AS drnk
FROM students
WHERE scholarship_amount IS NOT NULL;
```
- Sonuç:

| first_name | scholarship_amount | rn | rnk | drnk |
|------------|--------------------|----|----|------|
| Ayşe       | 5000               | 1  | 1  | 1    |
| Selin      | 5000               | 2  | 1  | 1    |
| Elif       | 4500               | 3  | 3  | 2    |
| Gizem      | 4000               | 4  | 4  | 3    |
| Deniz      | 3500               | 5  | 5  | 4    |
| ...        | ...                | ...| ...| ...  |

- Ne anlıyoruz? İki 5000 eşit. ROW_NUMBER ikisine 1 ve 2 verdi (ayrı numara; hangisi 1 garanti değil).
  RANK ikisine de 1 verdi, sonra 4500'e 3 dedi (2'yi **atladı**). DENSE_RANK ikisine 1, sonra 4500'e 2
  dedi (**atlamadı**). Üçü, "eşitliği nasıl ele alırsın" sorusuna üç farklı cevap.

**Örnek 2 (her şehrin kendi içinde sıralama, PARTITION BY)**
- Sorgu:
```sql
SELECT first_name, city, scholarship_amount,
       RANK() OVER (PARTITION BY city ORDER BY scholarship_amount DESC) AS sehir_sirasi
FROM students
WHERE scholarship_amount IS NOT NULL
ORDER BY city, sehir_sirasi;
```
- Ne anlıyoruz? `PARTITION BY city` her şehri ayrı bir pencere yapar; sıralama her şehrin KENDİ içinde
  baştan başlar. Örneğin İstanbul'da Ayşe ve Selin (5000) ortak 1., Ali Çelik (2000) 3.; Ankara kendi
  içinde ayrı sıralanır. "Her grubun kendi şampiyonu" tipi sorular için ideal.

### Sık hatalar & uyarılar
- `OVER`'da `ORDER BY` koymayı unutmak. Sıralama fonksiyonları neye göre sıralanacağını bilmeli.
- RANK ile DENSE_RANK'ı karıştırmak. RANK atlar (1,1,3), DENSE_RANK atlamaz (1,1,2).
- ROW_NUMBER'ın eşitlikte hangi satıra 1 vereceğini garanti sanmak; tiebreaker eklemezsen sıra belirsiz.

### Anlama soruları

**Soru 1 (kavram).** Üç öğrencinin notu 90, 90, 80 (azalan sırada). ROW_NUMBER, RANK ve DENSE_RANK her
biri ne üretir?
> **İpucu:** İki 90 eşit; her fonksiyon eşitliği nasıl ele alır?

> **Detaylı cevap:** ROW_NUMBER: **1, 2, 3** (iki 90 eşit olsa da ayrı numara alır; hangisinin 1 olduğu
> garanti değil). RANK: **1, 1, 3** (iki 90 ortak 1.; sonraki (80) 3 olur, çünkü RANK eşit sayısı kadar
> atlar, 2'yi atlar). DENSE_RANK: **1, 1, 2** (iki 90 ortak 1.; sonraki (80) 2 olur, atlama yok). Özet:
> ROW_NUMBER her zaman ardışık ve benzersiz; RANK eşitlere aynı verir ama sonraki sırayı atlayarak devam
> eder; DENSE_RANK eşitlere aynı verir ve atlamadan devam eder. "İlk 3 farklı not seviyesi" istiyorsan
> DENSE_RANK, "klasik yarışma sıralaması (2 birinci varsa üçüncü 3.)" istiyorsan RANK kullanırsın.

**Soru 2 (yaz).** Öğrencileri bursuna göre numaralandır (en yüksek 1. olacak), her satırda adı, bursu ve
sıra numarası (ROW_NUMBER) olsun. (Sadece bursu olanlar.)
> **İpucu:** ROW_NUMBER() OVER (ORDER BY scholarship_amount DESC).

> **Detaylı cevap:**
> ```sql
> SELECT first_name, scholarship_amount,
>        ROW_NUMBER() OVER (ORDER BY scholarship_amount DESC) AS sira
> FROM students
> WHERE scholarship_amount IS NOT NULL;
> ```
> `ROW_NUMBER() OVER (ORDER BY scholarship_amount DESC)` her öğrenciye, bursa göre azalan sırada
> benzersiz bir numara verir: en yüksek burslu 1, sonraki 2... `WHERE scholarship_amount IS NOT NULL`
> ile bursu olmayanları dışarıda tuttuk (yoksa onlar da numaralanır ve sıralamada en sona düşerdi). İki
> öğrenci 5000'de eşit olduğu için ROW_NUMBER ikisine 1 ve 2 verir (hangisinin 1 olacağı, ek bir
> tiebreaker yazmazsak garanti değildir; istersek `ORDER BY scholarship_amount DESC, first_name` ile
> deterministik yapabiliriz). "En yüksek N'i bul" gibi sorularda ROW_NUMBER çok kullanılır.

### Çıkış bileti
RANK ile DENSE_RANK arasındaki fark, eşitlik sonrası numaralandırmada nasıl ortaya çıkar?

---

## Ders 13.3 — Kümülatif toplam (running total) ve LAG/LEAD

### 🧑‍🏫 Öğretmen için
İki güçlü desen. Birincisi running total: "satır satır ilerlerken biriken toplam." `SUM(...) OVER (ORDER
BY ...)` ile. Tahtaya bursları id sırasına diz, yanına biriken toplamı yaz; her satırda öncekilerin
toplamı + kendisi. İkincisi LAG/LEAD: "önceki/sonraki satırın değerine bak." `LAG(x) OVER (ORDER BY ...)`
= bir önceki satırın x'i. "Bu ayki satış ile geçen ayki satışı karşılaştırmak" gibi.
- Sor: "İlk satırda LAG ne döner?" (NULL; öncesi yok.)
- Bu desenler zaman serisi/trend analizinin temeli; gerçek hayatta çok kullanılır.

### Konu anlatımı
**Running total (kümülatif toplam):** `SUM(...) OVER (ORDER BY ...)`, satırları sıraya dizer ve her
satırda o ana kadar biriken toplamı verir.

```sql
SELECT id, first_name, scholarship_amount,
       SUM(COALESCE(scholarship_amount,0)) OVER (ORDER BY id) AS kumulatif
FROM students;
```

**LAG / LEAD:** Bir satırdan, sıradaki bir önceki (`LAG`) veya bir sonraki (`LEAD`) satırın değerine
bakmanı sağlar. "Bir öncekiyle karşılaştır" tipi sorular için.

```sql
SELECT id, first_name, scholarship_amount,
       LAG(scholarship_amount)  OVER (ORDER BY id) AS onceki,
       LEAD(scholarship_amount) OVER (ORDER BY id) AS sonraki
FROM students;
```

> Mini slogan: **`SUM(...) OVER (ORDER BY ...)` biriken toplam; `LAG/LEAD` önceki/sonraki satırın değerine bakar.**

### Çözümlü örnekler

**Örnek 1 (running total)**
- Sorgu (yukarıdaki kümülatif). Sonuç (ilk satırlar):

| id | first_name | scholarship_amount | kumulatif |
|----|------------|--------------------|-----------|
| 1  | Ayşe       | 5000               | 5000      |
| 2  | Mehmet     | NULL               | 5000      |
| 3  | Zeynep     | 3000               | 8000      |
| 4  | Can        | NULL               | 8000      |
| 5  | Elif       | 4500               | 12500     |

- Ne anlıyoruz? Her satırda, id sırasıyla o ana kadar biriken burs toplamı. Mehmet ve Can'ın bursu NULL
  (COALESCE ile 0 sayıldı), o yüzden onların satırında toplam değişmedi. Son satırda toplam 31000'e
  ulaşır (tüm bursların toplamı, Ü4).

**Örnek 2 (LAG ile önceki satır)**
- Sorgu:
```sql
SELECT id, first_name, scholarship_amount,
       LAG(scholarship_amount) OVER (ORDER BY id) AS onceki_burs
FROM students;
```
- Sonuç (ilk satırlar): Ayşe (id1) onceki_burs = NULL (öncesi yok); Mehmet (id2) onceki_burs = 5000
  (Ayşe'ninki); Zeynep (id3) onceki_burs = NULL (Mehmet'inki NULL'dı)... Ne anlıyoruz? `LAG`, sıradaki
  bir önceki satırın değerini getirir. İlk satırda önceki olmadığı için NULL. Bu, "bir öncekiyle
  karşılaştır" (örneğin trend, değişim) için temel araçtır.

### Sık hatalar & uyarılar
- `OVER`'da `ORDER BY` koymadan running total/LAG kullanmak. Bu desenler bir sıraya ihtiyaç duyar.
- İlk satırda `LAG`'in NULL döndüğünü unutmak (öncesi yok). `LAG(x, 1, 0)` ile varsayılan verebilirsin.
- Eşit ORDER BY değerlerinde running total'ın peer'leri birlikte toplayabileceği inceliği (benzersiz
  sıralama, örn. id, bunu önler).

### Anlama soruları

**Soru 1 (kavram).** `SUM(scholarship_amount) OVER (ORDER BY id)` ile düz `SUM(scholarship_amount)`
(aggregate, Ü4) arasındaki fark nedir?
> **İpucu:** Biri tek sayı, öteki her satırda?

> **Detaylı cevap:** Düz `SUM(scholarship_amount)` (Ü4 aggregate) tüm tabloyu tek bir toplama çöktürür:
> 31000, tek satır. `SUM(scholarship_amount) OVER (ORDER BY id)` ise bir window fonksiyonudur: satırları
> korur ve her satırda, id sırasıyla O ANA KADAR biriken toplamı verir (running total). Yani ilk satırda
> ilk değer, ikinci satırda ilk iki değerin toplamı... son satırda 31000. Birincisi "toplam ne?" sorusunu
> (tek cevap), ikincisi "her noktada biriken toplam ne?" sorusunu (her satır için ayrı) cevaplar. `OVER`
> eklemek, bir aggregate'i "çöktüren"den "satır satır biriken"e çevirir. Bu, satış/stok gibi zaman
> içindeki birikimleri görmek için çok kullanılır.

**Soru 2 (kavram).** `LAG(scholarship_amount) OVER (ORDER BY id)` ilk satır için neden NULL döndürür?
> **İpucu:** İlk satırın "öncekisi" var mı?

> **Detaylı cevap:** Çünkü `LAG`, sıradaki bir ÖNCEKİ satırın değerini getirir; ilk satırın (id'si en
> küçük öğrenci, Ayşe) kendisinden önce bir satır yoktur, dolayısıyla "öncekinin bursu" diye bir değer
> bulunmaz ve NULL döner. Bu mantıklıdır: "bir önceki" tanımsızsa sonuç bilinmiyordur (NULL). İstersen
> `LAG(scholarship_amount, 1, 0)` yazarak "önceki yoksa 0 kullan" diyebilirsin (üçüncü argüman varsayılan
> değerdir). LAG/LEAD, "her satırı komşusuyla karşılaştır" (önceki aya göre değişim, bir önceki sıradaki
> öğrenciyle fark gibi) sorularının temelidir; uçlardaki satırlarda komşu olmadığı için NULL gelmesi normaldir.

### Çıkış bileti
`SUM(...) OVER (ORDER BY ...)` düz `SUM`'dan nasıl farklıdır?

---

## Pratik (editörde dene)

> Deneme Tahtasında (⌘K) dene. Önce tahmin et, çalıştır, gözle, sonra cevaba bak. Seed: Kampüs.

**P1 (kolay).** [▶ Editörde dene] Her öğrencinin adı, şehri, bursu ve kendi şehrinin ortalama bursu yan
yana (satırlar korunsun).
> İpucu: AVG(scholarship_amount) OVER (PARTITION BY city).
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT first_name, city, scholarship_amount,
>        AVG(scholarship_amount) OVER (PARTITION BY city) AS sehir_ort
> FROM students ORDER BY city;
> ```
> 14 satır korunur; her satırda kendi şehrinin ortalaması. GROUP BY olsaydı satırlar çökerdi.
> </details>

**P2 (orta).** [▶ Editörde dene] Bursu olan öğrencileri bursa göre numaralandır (RANK), eşitlikleri gözle gör.
> İpucu: RANK() OVER (ORDER BY scholarship_amount DESC), WHERE scholarship_amount IS NOT NULL.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT first_name, scholarship_amount,
>        RANK() OVER (ORDER BY scholarship_amount DESC) AS sira
> FROM students WHERE scholarship_amount IS NOT NULL;
> ```
> İki 5000 ortak 1.; sonraki (4500) 3. (RANK atlar). DENSE_RANK olsaydı 2. derdi.
> </details>

**P3 (orta).** [▶ Editörde dene] Her şehrin kendi içinde, öğrencileri bursa göre sırala (PARTITION BY +
RANK). En yüksek burslu her şehirde 1. olsun.
> İpucu: RANK() OVER (PARTITION BY city ORDER BY scholarship_amount DESC).
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT first_name, city, scholarship_amount,
>        RANK() OVER (PARTITION BY city ORDER BY scholarship_amount DESC) AS sehir_sirasi
> FROM students WHERE scholarship_amount IS NOT NULL
> ORDER BY city, sehir_sirasi;
> ```
> Her şehir ayrı pencere; sıralama her şehirde baştan başlar. İstanbul'da Ayşe ve Selin ortak 1.
> </details>

**P4 (zorlayıcı, running total).** [▶ Editörde dene] Öğrencileri id sırasıyla diz, yanına biriken
(kümülatif) burs toplamını yaz. Son satırda toplam kaç?
> İpucu: SUM(COALESCE(scholarship_amount,0)) OVER (ORDER BY id).
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT id, first_name, scholarship_amount,
>        SUM(COALESCE(scholarship_amount,0)) OVER (ORDER BY id) AS kumulatif
> FROM students ORDER BY id;
> ```
> Son satırda 31000 (tüm bursların toplamı). NULL burslar (COALESCE 0) toplamı değiştirmez.
> </details>

**P5 (düşündürücü, LAG).** [▶ Editörde dene] Her öğrencinin bursunu ve kendisinden bir önceki (id
sırasına göre) öğrencinin bursunu yan yana getir. İlk satırda önceki neden NULL?
> İpucu: LAG(scholarship_amount) OVER (ORDER BY id).
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT id, first_name, scholarship_amount,
>        LAG(scholarship_amount) OVER (ORDER BY id) AS onceki_burs
> FROM students ORDER BY id;
> ```
> İlk satır (Ayşe) onceki_burs NULL, çünkü öncesinde satır yok. LAG "bir önceki satırın değeri"ni getirir.
> </details>

---

## Ünite 13 özeti (öğrenciye)
- **Window function**, GROUP BY'ın aksine satırları **çöktürmez**; her satırı korur, yanına bir hesap ekler.
- `AGG(...) OVER (PARTITION BY x)`: x'e göre hesapla ama satırları tut (örn. her öğrenci + şehir ortalaması).
- Sıralama: `ROW_NUMBER` (benzersiz ardışık), `RANK` (eşitlere aynı, atlar 1,1,3), `DENSE_RANK` (eşitlere
  aynı, atlamaz 1,1,2). `OVER (ORDER BY ...)` ile.
- `SUM(...) OVER (ORDER BY ...)`: kümülatif (biriken) toplam. `LAG`/`LEAD`: önceki/sonraki satırın değeri.
- `PARTITION BY` her grubu ayrı pencere yapar; sıralama/hesap her grupta baştan başlar.

## 🧑‍🏫 Öğretmen notu (ünite geneli)
Window functions "ileri" görünür ama tek bir sezgiye dayanır: **GROUP BY çöktürür, OVER çöktürmez.** Bu
cümleyi ve yan yana çıktıyı (5 satır vs 14 satır) canlı göster, gerisi açılır. RANK vs DENSE_RANK farkını
eşitlik örneğiyle göster (1,1,3 vs 1,1,2). Running total ve LAG/LEAD, gerçek hayatta trend/zaman serisi
analizinin temelidir; öğrenci bunları görünce "raporlardaki o sütunlar böyle yapılıyormuş" der. Bu, çekirdek
analitik müfredatın sonu; son ünite (Ü14) bonus View & index ile bitiriyoruz.
