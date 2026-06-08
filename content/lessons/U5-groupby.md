# Ünite 5 — GROUP BY ve HAVING: Her Grup İçin Bir Özet

> Kavram etiketleri: `grain`, `group-by`, `group-aggregate`, `having`, `where-vs-having`, `query-execution-order`
> Ön koşul: Ü0-Ü4
> Kullanılan tablolar: students, products, orders
> Tahmini süre: 55-65 dk
> Ünite sloganı: **"Tek özet değil, grup grup özet."**

---

## Ders 5.1 — Grain: "bir satır neyi temsil ediyor?"

### 🧑‍🏫 Öğretmen için
Bu, tüm SQL'in en önemli kavramlarından biri; yavaş git. Tahtaya `students` tablosundan birkaç satır
çiz. Sor: "Bu tabloda bir satır neyi temsil ediyor?" (Bir öğrenciyi.) Sonra Ü4'ü hatırlat: "AVG(burs)
yazınca kaç satır döndü?" (Bir.) "İşte aggregate, 14 öğrenci satırını TEK özet satırına indirdi." Sonra
asıl soru: "Peki ya 'her şehir için ayrı ortalama' istesem? O zaman çıktıda bir satır = bir şehir
olmalı, değil mi?" İşte GROUP BY tam bunu yapar: çıktının grain'ini (bir satırın anlamını) değiştirir.
- Tahtaya iki kutu çiz: solda "girdi: bir satır = bir öğrenci", sağda "çıktı: bir satır = bir şehir".
  Ortadaki ok = GROUP BY.
- Sor: "Çıktıda bir satır bir şehirse, o satırda `first_name` ne anlama gelir?" (Anlamsız; hangi
  öğrencinin adı? 4 İstanbullu var.) Bu, "neden normal sütunları GROUP BY'a koymak zorundayız"ın sezgisi.
- Anahtar cümle: **"Çıktıda bir satır neyi temsil ediyor?" sorusunu her sorguda sor.**

### Neden / nerede işime yarar
Gerçek raporların çoğu "X başına Y" sorusudur: şehir başına öğrenci, kategori başına satış, ay başına
ciro, müşteri başına sipariş. Bunların hepsi GROUP BY ile yapılır. Bu ünite, "özet"ten "gruplu özet"e
geçiş, yani gerçek analiz buradan başlar.

### Konu anlatımı
Ü4'te aggregate tüm tabloyu **tek** satıra indiriyordu. Çoğu zaman istediğimiz bu değil: "her şehir
için ayrı sayı" isteriz. `GROUP BY`, satırları ortak değere göre kutulara böler ve aggregate'i **her
kutu için ayrı ayrı** hesaplar.

"Grain" (tanecik), bir satırın neyi temsil ettiğidir:
- `students`'ta grain = bir öğrenci.
- `SELECT city, COUNT(*) ... GROUP BY city` sonucunda grain = bir şehir.

GROUP BY çıktının grain'ini değiştirir. Bu yüzden çıktıda görünen her normal sütun ya **grup anahtarı**
olmalı (GROUP BY'da yazılı), ya da bir **aggregate** içinde olmalı. Aksi halde SQL "bu şehir grubunda 4
öğrenci var, hangisinin adını göstereyim?" diye çelişir ve hata verir.

> Mini slogan: **GROUP BY, "bir satır = bir grup" yapar; her sütun ya grup anahtarıdır ya hesaplamadır.**

### Çözümlü örnekler

**Örnek 1 (grain'i hissettir, önce tahmin et)**
- Önce tahmin: `SELECT COUNT(*) FROM students` kaç satır döner? (1) Peki `... GROUP BY city`? (Şehir sayısı kadar.)
- Sorgu:
```sql
SELECT city, COUNT(*) AS ogrenci_sayisi FROM students GROUP BY city;
```
- Sonuç (sıra garanti değil):

| city     | ogrenci_sayisi |
|----------|----------------|
| İstanbul | 4              |
| Ankara   | 3              |
| İzmir    | 2              |
| Bursa    | 2              |
| NULL     | 3              |

- Ne anlıyoruz? Çıktıda artık bir satır = bir şehir. 14 öğrenci, 5 gruba bölündü. NULL şehirliler de
  kendi grubunu oluşturdu (3 kişi). Toplam 4+3+2+2+3 = 14, yani kimse kaybolmadı.

### Sık hatalar & uyarılar
- Çıktıda bir satırın hâlâ "bir öğrenci" olduğunu sanmak. GROUP BY sonrası bir satır bir gruptur.
- "NULL grubu olmaz" sanmak. NULL'lar da kendi grubunu oluşturur (yukarıda 3 kişilik NULL şehir grubu).

### Anlama soruları

**Soru 1 (kavram).** `SELECT department_id, COUNT(*) FROM students GROUP BY department_id` çıktısında
bir satır neyi temsil eder?
> **İpucu:** Neye göre grupladık?

> **Detaylı cevap:** Bir satır **bir bölümü** temsil eder. `GROUP BY department_id` öğrencileri
> bölümlerine göre kutulara ayırdığı için çıktının grain'i "öğrenci" değil "bölüm" olur; her satır bir
> bölüm ve o bölümdeki öğrenci sayısıdır. Bu yüzden çıktıda `first_name` göstermek anlamsız olurdu:
> bir bölümde birden çok öğrenci var, "hangi ad?" sorusunun tek cevabı yok. İşte bu yüzden GROUP BY
> sorgularında normal sütunlar ya grup anahtarı ya da aggregate olmak zorunda.

**Soru 2 (hata avı).** Bu sorgu neden hata verir?
```sql
SELECT city, first_name, COUNT(*) FROM students GROUP BY city;
```
> **İpucu:** Bir şehir grubunda kaç farklı `first_name` var?

> **Detaylı cevap:** Çünkü `first_name` ne grup anahtarı (GROUP BY'da yok) ne de bir aggregate içinde.
> Çıktının grain'i "şehir" olduğu için her satır bir şehir grubudur; ama İstanbul grubunda 4 öğrenci
> (4 farklı ad) var. SQL "bu grupta hangi `first_name`'i göstereyim?" sorusuna cevap veremez ve hata
> verir. Çözüm bağlama göre değişir: ya `first_name`'i de gruba ekle (`GROUP BY city, first_name`, ama
> o zaman grain değişir), ya bir aggregate'e sok (`COUNT(DISTINCT first_name)` gibi), ya da `first_name`'i
> sorgudan çıkar. Kural net: GROUP BY varsa, SELECT'teki her normal sütun GROUP BY'da olmalı.

### Çıkış bileti
GROUP BY bir sorgunun çıktısında "bir satırın anlamını" nasıl değiştirir?

---

## Ders 5.2 — GROUP BY temel kullanım

### 🧑‍🏫 Öğretmen için
Ü4'teki "tek özet"ten başla, sonra GROUP BY ekleyip "gruplu özet"e geç; bu kademeyi canlı yap. Tahtaya
önce `SELECT COUNT(*) FROM students;` (tek sayı), sonra `SELECT city, COUNT(*) FROM students GROUP BY
city;` (şehir başına) yaz, ikisini de çalıştır. "Tek satılık gördün mü? Şimdi onu şehir şehir kırdık."
- Sor: "Toplam satır sayısı GROUP BY sonrası değişti mi?" (Gruplar toplandığında yine 14 öğrenci.)
  Grupların toplamının hep ana toplamı verdiğini fark ettir.
- Herkes burada takılır: GROUP BY'a hangi sütunu yazacağını şaşırırlar. "Neye göre kırpmak istiyorsan
  onu yaz" de.

### Konu anlatımı
`GROUP BY sütun`, satırları o sütunun değerine göre gruplar; sonra SELECT'teki aggregate her grup için
hesaplanır. Tipik kalıp:

```sql
SELECT grup_anahtari, AGGREGATE(...) 
FROM tablo
GROUP BY grup_anahtari;
```

İstersen sonucu sıralarsın (`ORDER BY`) ya da takma ad verirsin. Çok sık birlikte kullanılır:
"grupları sayıya göre büyükten küçüğe sırala".

> Mini slogan: **"X başına Y" gördüğünde: GROUP BY X, aggregate Y.**

### Çözümlü örnekler

**Örnek 1 (bölüm başına sayı, sıralı)**
- Ne istiyoruz? Her bölümde kaç öğrenci, çoktan aza.
- Sorgu:
```sql
SELECT department_id, COUNT(*) AS ogrenci_sayisi
FROM students
GROUP BY department_id
ORDER BY ogrenci_sayisi DESC;
```
- Sonuç:

| department_id | ogrenci_sayisi |
|---------------|----------------|
| 1             | 5              |
| 2             | 3              |
| 3             | 3              |
| 4             | 2              |
| 5             | 1              |

- Ne anlıyoruz? Bölüm 1 en kalabalık (5), bölüm 5 en az (1, tek Matematik öğrencisi Gizem). Grupları
  ORDER BY ile sıraladık; alias'ı (`ogrenci_sayisi`) ORDER BY'da kullanabildik.

**Örnek 2 (kategori başına ortalama fiyat)**
- Ne istiyoruz? Her ürün kategorisinin ortalama fiyatı.
- Sorgu:
```sql
SELECT category, AVG(price) AS ort_fiyat, COUNT(*) AS adet
FROM products
GROUP BY category;
```
- Sonuç: İçecek (4 ürün, ort 22.5), Yiyecek (2 ürün, ort 50), Tatlı (2 ürün, ort 27.5). Ne anlıyoruz?
  Her kategori bir satır; ortalama o kategorinin kendi ürünleri üzerinden hesaplandı.

### Sık hatalar & uyarılar
- Aggregate'i unutup sadece `SELECT city FROM students GROUP BY city` yazmak: bu çalışır ama
  `SELECT DISTINCT city` ile aynı şeydir, bir özet vermez. GROUP BY'ın gücü aggregate ile ortaya çıkar.
- Grupları sıralamak isterken `ORDER BY`'ı unutmak. Gruplar da sırasız gelir; istiyorsan sırala.

### Anlama soruları

**Soru 1 (yaz).** Her şehirde kaç öğrenci olduğunu, en kalabalık şehir üstte olacak şekilde getir.
> **İpucu:** GROUP BY city, COUNT(*), sonra ORDER BY ... DESC.

> **Detaylı cevap:**
> ```sql
> SELECT city, COUNT(*) AS ogrenci_sayisi
> FROM students
> GROUP BY city
> ORDER BY ogrenci_sayisi DESC;
> ```
> `GROUP BY city` öğrencileri şehirlere böler, `COUNT(*)` her şehirdeki öğrenciyi sayar, `ORDER BY
> ogrenci_sayisi DESC` en kalabalık şehri üste taşır. Sonuçta İstanbul (4) en üstte, ardından NULL ve
> Ankara (3'er), sonra İzmir ve Bursa (2'şer). NULL grubunun da listede yer aldığını unutma; "şehri
> bilinmeyen" 3 kişi tek grup olarak görünür.

**Soru 2 (tahmin et).** `SELECT department_id, COUNT(*) FROM students GROUP BY department_id` sonucundaki
sayıların toplamı kaçtır?
> **İpucu:** Her öğrenci tam bir bölümde; gruplar toplanınca?

> **Detaylı cevap:** **14.** Her öğrenci tam olarak bir bölüme ait olduğu için, bölüm gruplarındaki
> öğrenci sayıları toplandığında toplam öğrenci sayısını (14) verir: 5+3+3+2+1 = 14. Bu güzel bir
> kontrol yöntemidir: GROUP BY sonrası grup büyüklüklerinin toplamı, (filtre yoksa) ana tablonun satır
> sayısına eşit olmalı. Tutmuyorsa bir şeyi atlamış ya da yanlış gruplamışsındır.

### Çıkış bileti
"Kategori başına ortalama fiyat" sorusunu hangi iki parçayla (GROUP BY ve aggregate) kurarsın?

---

## Ders 5.3 — Birden çok aggregate, birden çok grup anahtarı, ve COUNT(*) vs COUNT(sütun)

### 🧑‍🏫 Öğretmen için
Ü4'teki COUNT(*) vs COUNT(sütun) farkını burada grup bağlamında diriltmek çok öğretici. Bölüm bazında
`COUNT(*)` (kaç öğrenci) ile `COUNT(scholarship_amount)` (kaç burslu) yan yana göster; bölüm 1'de 5 vs
3 çıksın (2 öğrencinin bursu NULL). "Aynı grupta iki farklı sayı, çünkü biri herkesi, öteki bursu
olanı sayıyor" de.
- İki sütunla gruplamayı (örn. şehir + bölüm) bir kez göster; grain'in "şehir-bölüm ikilisi" olduğunu
  vurgula.
- Herkes burada takılır: grup başına birden çok aggregate'i tek sorguda alabileceklerini bilmezler.
  "İstediğin kadar aggregate yan yana koyabilirsin" de.

### Konu anlatımı
Bir GROUP BY sorgusunda **birden çok aggregate** yan yana olabilir (sayı + ortalama + max...). Ayrıca
**birden çok sütunla** gruplayabilirsin; o zaman grain o sütunların kombinasyonu olur.

Ü4'teki NULL ayrımı grup içinde de geçerli: `COUNT(*)` gruptaki tüm satırları, `COUNT(sütun)` o grupta
o sütunu dolu olanları sayar.

> Mini slogan: **Grup başına istediğin kadar aggregate alabilirsin; COUNT(*) ve COUNT(sütun) grup içinde de farklıdır.**

### Çözümlü örnekler

**Örnek 1 (grup başına çoklu aggregate + NULL farkı)**
- Ne istiyoruz? Her bölümde: kaç öğrenci, kaçının bursu var, ortalama burs.
- Sorgu:
```sql
SELECT department_id,
       COUNT(*) AS ogrenci,
       COUNT(scholarship_amount) AS burslu,
       AVG(scholarship_amount) AS ort_burs
FROM students
GROUP BY department_id
ORDER BY department_id;
```
- Sonuç (bölüm 1 satırı):

| department_id | ogrenci | burslu | ort_burs   |
|---------------|---------|--------|------------|
| 1             | 5       | 3      | 2833.33... |

- Ne anlıyoruz? Bölüm 1'de 5 öğrenci var ama sadece 3'ünün bursu kayıtlı (Mehmet ve Okan NULL).
  Ortalama 3 burs üzerinden: (5000+2000+1500)/3 = 2833.33. `COUNT(*)` ile `COUNT(scholarship_amount)`
  aynı grupta iki farklı sayı verdi; çünkü biri herkesi, öteki bursu olanı sayıyor.

**Örnek 2 (iki sütunla gruplama)**
- Ne istiyoruz? Her (bölüm, şehir) ikilisinde kaç öğrenci.
- Sorgu:
```sql
SELECT department_id, city, COUNT(*) AS adet
FROM students
GROUP BY department_id, city
ORDER BY department_id, city;
```
- Ne anlıyoruz? Artık grain "bölüm + şehir" ikilisi. Aynı bölümdeki farklı şehirler ayrı satır olur.
  Örneğin bölüm 1'in İstanbul'daki öğrencileri ayrı, İzmir'dekiler ayrı satırda görünür.

### Sık hatalar & uyarılar
- Grup içinde `COUNT(*)` ile `COUNT(sütun)`'u aynı sanmak. O sütunda NULL varsa farklı çıkarlar.
- İki sütunla gruplayınca grain'in değiştiğini unutmak; satır sayısı beklediğinden fazla olabilir.

### Anlama soruları

**Soru 1 (yaz).** Her bölümün en yüksek ve en düşük bursunu (sadece bursu olanlar arasında) ve öğrenci
sayısını getir.
> **İpucu:** GROUP BY department_id; MAX, MIN, COUNT(*) yan yana.

> **Detaylı cevap:**
> ```sql
> SELECT department_id,
>        COUNT(*) AS ogrenci,
>        MIN(scholarship_amount) AS en_dusuk_burs,
>        MAX(scholarship_amount) AS en_yuksek_burs
> FROM students
> GROUP BY department_id
> ORDER BY department_id;
> ```
> Her bölüm için üç aggregate'i yan yana aldık. MIN ve MAX o bölümdeki bursu olan öğrenciler arasından
> seçilir (NULL'lar yok sayılır); COUNT(*) ise bölümdeki tüm öğrencileri sayar. Dikkat: bir bölümdeki
> herkesin bursu NULL olsaydı MIN/MAX o grup için NULL dönerdi, ama COUNT(*) yine gerçek öğrenci
> sayısını verirdi. Bu da grup içinde aggregate'lerin bağımsız çalıştığını gösterir.

**Soru 2 (kavram).** Bir bölümde 5 öğrenci var, 2'sinin bursu NULL. O bölüm satırında `COUNT(*)` ve
`COUNT(scholarship_amount)` ne gösterir?
> **İpucu:** Biri herkesi, öteki bursu olanı sayar.

> **Detaylı cevap:** `COUNT(*)` = **5** (gruptaki tüm öğrenciler), `COUNT(scholarship_amount)` = **3**
> (bursu girilmiş olanlar; 2 NULL sayılmaz). Aynı grup, iki farklı soru: "kaç öğrenci?" vs "kaçının
> bursu kayıtlı?". Bu fark, özellikle "yüzde kaçının X bilgisi var" gibi veri-kalitesi raporlarında
> çok işe yarar. Ü4'te tüm tablo için gördüğümüz COUNT(*) vs COUNT(sütun) farkı, burada her grup için
> ayrı ayrı geçerli.

### Çıkış bileti
Aynı grupta `COUNT(*)` ve `COUNT(scholarship_amount)` neden farklı olabilir?

---

## Ders 5.4 — HAVING: grupları filtrelemek (ve WHERE'den farkı)

### 🧑‍🏫 Öğretmen için
Bu dersin altın cümlesi: **"WHERE satırları eler, HAVING grupları eler."** Tahtaya sorgu boru hattını
çiz (5.5'in ön provası): satırlar -> WHERE süzer -> gruplar oluşur -> HAVING süzer. Kasıtlı hata kur:
`WHERE COUNT(*) >= 3` yaz, hata al, "gördünüz mü, sayım daha yokken WHERE çalışıyor; sayıyı eleyen
HAVING" de. Sonra doğrusunu `HAVING COUNT(*) >= 3` ile göster.
- Sor: "Önce 'sadece tamamlanmış siparişler' (satır filtresi) mi, yoksa '2'den çok siparişi olanlar'
  (grup filtresi) mi? İkisi farklı yerlerde." Bu ikisini tek sorguda birleştir (WHERE + HAVING).
- Herkes burada takılır: WHERE ve HAVING'i karıştırırlar. "Gruplamadan ÖNCE mi SONRA mı süzüyorsun?"
  diye sordur.

### Konu anlatımı
`WHERE` satırları gruplamadan **önce** süzer. Ama bazen grubun kendisini, oluştuktan **sonra**, bir
aggregate değerine göre süzmek isteriz: "sadece 3'ten fazla öğrencisi olan şehirler". Bunu WHERE ile
yapamayız (sayım daha yokken çalışır). Bunun aracı `HAVING`'dir.

```sql
SELECT city, COUNT(*) AS adet
FROM students
GROUP BY city
HAVING COUNT(*) >= 3;
```

İkisini birlikte de kullanırsın: önce `WHERE` ile ilgisiz satırları at, sonra grupla, sonra `HAVING`
ile istemediğin grupları at.

> Mini slogan: **WHERE satırları eler (gruplamadan önce), HAVING grupları eler (gruplamadan sonra).**

### Çözümlü örnekler

**Örnek 1 (HAVING)**
- Ne istiyoruz? En az 3 öğrencisi olan şehirler.
- Sorgu:
```sql
SELECT city, COUNT(*) AS adet
FROM students
GROUP BY city
HAVING COUNT(*) >= 3
ORDER BY adet DESC;
```
- Sonuç:

| city     | adet |
|----------|------|
| İstanbul | 4    |
| Ankara   | 3    |
| NULL     | 3    |

- Ne anlıyoruz? Önce şehir grupları oluştu, sonra HAVING ile sayısı 3'ün altındaki gruplar (İzmir 2,
  Bursa 2) elendi. NULL grubu da 3 kişiyle eşiği geçti, listede.

**Örnek 2 (WHERE + HAVING birlikte)**
- Ne istiyoruz? Sadece **tamamlanmış** siparişlere bakarak, 2 veya daha fazla tamamlanmış siparişi
  olan öğrenciler.
- Sorgu:
```sql
SELECT student_id, COUNT(*) AS siparis_sayisi
FROM orders
WHERE status = 'completed'
GROUP BY student_id
HAVING COUNT(*) >= 2
ORDER BY siparis_sayisi DESC;
```
- Sonuç:

| student_id | siparis_sayisi |
|------------|----------------|
| 1          | 3              |
| 3          | 2              |

- Ne anlıyoruz? `WHERE status = 'completed'` önce iptal/bekleyen siparişleri attı (satır filtresi).
  Sonra öğrenci başına gruplandı. Sonra `HAVING COUNT(*) >= 2` az siparişli öğrencileri attı (grup
  filtresi). İki filtre, iki farklı aşama. Öğrenci 1'in 3, öğrenci 3'ün 2 tamamlanmış siparişi var.

### Sık hatalar & uyarılar
- `WHERE COUNT(*) >= 2` yazmak: hata. Aggregate'e göre filtre HAVING ile yapılır.
- Satır filtresini HAVING'e koymak: çalışır ama yanlış/yavaş olabilir. Kural: aggregate içermeyen
  koşul WHERE'e, aggregate içeren koşul HAVING'e.

### Anlama soruları

**Soru 1 (hata avı).** Öğrenci "3'ten fazla öğrencisi olan şehirleri" istedi, şunu yazıp hata aldı. Neden, doğrusu ne?
```sql
SELECT city, COUNT(*) FROM students WHERE COUNT(*) > 3 GROUP BY city;
```
> **İpucu:** COUNT ne zaman hesaplanıyor, WHERE ne zaman çalışıyor?

> **Detaylı cevap:** Hata, çünkü `WHERE` aggregate (`COUNT(*)`) içeremez. WHERE, satırlar daha
> gruplanıp sayılmadan, her satıra tek tek bakarken çalışır; o aşamada bir grup sayımı henüz yoktur.
> Grup sayısına göre filtre, gruplar oluştuktan sonra çalışan `HAVING` ile yapılır. Doğrusu:
> ```sql
> SELECT city, COUNT(*) AS adet
> FROM students
> GROUP BY city
> HAVING COUNT(*) > 3;
> ```
> Bu, sayısı 3'ten fazla olan tek şehri (İstanbul, 4) getirir. Hatırla: WHERE gruplamadan önce
> satırları, HAVING gruplamadan sonra grupları süzer.

**Soru 2 (yaz).** Ortalama fiyatı 30'dan yüksek olan ürün kategorilerini ve ortalama fiyatlarını getir.
> **İpucu:** GROUP BY category; HAVING AVG(price) > 30.

> **Detaylı cevap:**
> ```sql
> SELECT category, AVG(price) AS ort_fiyat
> FROM products
> GROUP BY category
> HAVING AVG(price) > 30;
> ```
> Önce kategoriye göre gruplanır, her kategorinin ortalama fiyatı hesaplanır, sonra `HAVING AVG(price)
> > 30` ile ortalaması 30'un altında olan kategoriler elenir. Kategoriler: İçecek (22.5, elenir),
> Yiyecek (50, kalır), Tatlı (27.5, elenir). Sonuç sadece Yiyecek (50). Bu koşul bir aggregate
> (`AVG`) içerdiği için WHERE'e değil HAVING'e yazılır; çünkü ortalama ancak gruplar oluşunca bellidir.

### Çıkış bileti
Aynı sorguda "sadece tamamlanmış siparişler" ve "2'den fazla siparişi olanlar" koşulları hangi
yapılara (WHERE/HAVING) gider?

---

## Ders 5.5 — Sorgu çalışma sırası (her şeyi birbirine bağlayan ders)

### 🧑‍🏫 Öğretmen için
Bu, öğrencinin kafasındaki tüm parçaları yerine oturtan ders. Tahtaya boru hattını büyük büyük yaz ve
her aşamada "şimdi elimizde ne var?" diye sor. Bu sıra, neden alias'ı WHERE'de kullanamadığımızı
(Ü1.2), neden aggregate'i WHERE'e koyamadığımızı (5.4), neden GROUP BY'daki sütun kuralının olduğunu
(5.1) tek seferde açıklar. "SQL'i yazdığın sırayla değil, bu sırayla çalıştırır" de.
- Sınıfta bir sorguyu satır satır "boru hattından geçir": her aşamada elde kalan tabloyu tarif et.
- Bu sıra, ileride uygulamadaki "Sorgu çalışma sırası" yan panelinin de mantığı.

### Konu anlatımı
SQL bir sorguyu **yazdığın sırayla değil**, şu mantıksal sırayla işler:

1. **FROM**: hangi tablo(lar).
2. **WHERE**: satırları süz (aggregate yok, alias yok).
3. **GROUP BY**: kalan satırları gruplara böl.
4. **Aggregate hesapla**: her grup için COUNT/SUM/AVG...
5. **HAVING**: grupları aggregate'e göre süz.
6. **SELECT**: gösterilecek sütunları/ifadeleri belirle (alias'lar burada doğar).
7. **ORDER BY**: sırala (burada alias kullanılabilir).
8. **LIMIT/OFFSET**: kaç satır.

Bu sıra, daha önceki birçok "neden" sorusunun tek cevabı:
- Alias'ı `WHERE`'de kullanamıyoruz (Ü1.2), çünkü SELECT (6) WHERE'den (2) sonra gelir; WHERE
  çalışırken alias henüz doğmamıştır.
- `ORDER BY`'da alias kullanabiliyoruz, çünkü ORDER BY (7) SELECT'ten (6) sonradır.
- Aggregate'i `WHERE`'e koyamıyoruz (5.4), çünkü gruplama (3-4) WHERE'den (2) sonradır.

> Mini slogan: **SQL'i yazdığın sırayla değil, FROM -> WHERE -> GROUP BY -> aggregate -> HAVING -> SELECT -> ORDER BY -> LIMIT sırasıyla çalıştırır.**

### Çözümlü örnek (boru hattını izle)
- Sorgu:
```sql
SELECT city, COUNT(*) AS adet
FROM students
WHERE scholarship_amount IS NOT NULL
GROUP BY city
HAVING COUNT(*) >= 2
ORDER BY adet DESC;
```
- Boru hattı, adım adım elde kalan:
  1. FROM students: 14 öğrenci.
  2. WHERE scholarship_amount IS NOT NULL: bursu olan 9 öğrenci kaldı.
  3. GROUP BY city: bu 9 öğrenci şehirlere bölündü.
  4. COUNT(*): her şehir grubunun sayısı hesaplandı.
  5. HAVING COUNT(*) >= 2: 2'den az olan gruplar elendi.
  6. SELECT city, COUNT(*) AS adet: gösterilecekler seçildi, `adet` alias'ı doğdu.
  7. ORDER BY adet DESC: çoktan aza sıralandı.
- Ne anlıyoruz? Aynı sorgu, sekiz aşamalı bir boru hattı. Bu sırayı bilmek, "neden bu çalışmadı"
  sorularının çoğunu kendi kendine çözmeni sağlar.

### Sık hatalar & uyarılar
- Sorguyu yazıldığı sırayla (SELECT en başta) çalışıyor sanmak. SELECT aslında neredeyse en sonda işlenir.
- "WHERE ile HAVING aynı şey" demek. Farklı aşamalar: WHERE (2) satır, HAVING (5) grup.

### Anlama soruları

**Soru 1 (kavram).** Neden bir sütun alias'ını `WHERE` içinde kullanamayız ama `ORDER BY` içinde
kullanabiliriz?
> **İpucu:** Alias hangi aşamada (SELECT) doğuyor? WHERE ve ORDER BY ona göre nerede?

> **Detaylı cevap:** Çünkü alias'lar `SELECT` aşamasında (6. adım) doğar. `WHERE` (2. adım) ondan
> ÖNCE çalışır, dolayısıyla WHERE çalışırken alias henüz yoktur, kullanamazsın. `ORDER BY` (7. adım)
> ise SELECT'ten SONRA çalışır, o yüzden alias'lar artık mevcuttur ve ORDER BY içinde rahatça
> kullanılır. Bu, "neden burada çalıştı da şurada çalışmadı" tipi kafa karışıklıklarının tek
> açıklaması: her şey çalışma sırasıyla ilgili. Sorgu çalışma sırasını ezberlemek yerine "alias ne
> zaman doğar?" diye düşünmek bile çoğu zaman yeter.

**Soru 2 (tahmin et).** Şu sorguda hangi öğrenciler `WHERE` aşamasında elenir, dolayısıyla hiçbir
gruba giremez?
```sql
SELECT city, COUNT(*) FROM students WHERE scholarship_amount IS NOT NULL GROUP BY city;
```
> **İpucu:** Bursu NULL olanlara ne olur?

> **Detaylı cevap:** Bursu NULL olan 5 öğrenci (Mehmet, Can, Ali Vural, Emre, Okan) `WHERE
> scholarship_amount IS NOT NULL` aşamasında elenir; gruplama bile onları görmez. Çünkü çalışma
> sırasında WHERE (2. adım), GROUP BY'dan (3. adım) önce gelir: önce bu 5 satır atılır, geriye 9
> öğrenci kalır, gruplar bu 9 kişi üzerinden oluşur. Yani bu sorgudaki şehir sayıları "bursu olan
> öğrenciler" üzerinden olur, tüm öğrenciler değil. Örneğin şehri NULL olan Mehmet ve Merve de
> (bursları NULL olduğu için) elenir, böylece NULL şehir grubu beklediğinden küçük (hatta bazı
> şehirler hiç) olabilir. Çalışma sırasını bilmek, sonucu önceden kestirmeni sağlar.

### Çıkış bileti
SQL'in mantıksal çalışma sırasında `SELECT` kaçıncı sırada işlenir, ve bu neden alias kuralını açıklar?

---

## Pratik (editörde dene)

> Deneme Tahtasında (⌘K) dene. Önce tahmin et, çalıştır, gözle, sonra cevaba bak. Seed: Kampüs.

**P1 (kolay).** [▶ Editörde dene] Her bölümde kaç öğrenci olduğunu listele.
> İpucu: GROUP BY department_id, COUNT(*).
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT department_id, COUNT(*) AS adet FROM students GROUP BY department_id ORDER BY department_id;
> ```
> Bölüm 1:5, 2:3, 3:3, 4:2, 5:1. Toplam 14 (kontrol).
> </details>

**P2 (kolay).** [▶ Editörde dene] Her ürün kategorisinde kaç ürün var?
> İpucu: GROUP BY category.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT category, COUNT(*) AS adet FROM products GROUP BY category;
> ```
> İçecek 4, Yiyecek 2, Tatlı 2.
> </details>

**P3 (orta).** [▶ Editörde dene] Her şehirde ortalama bursu göster (şehri NULL olanlar da görünsün).
> İpucu: GROUP BY city, AVG(scholarship_amount).
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT city, AVG(scholarship_amount) AS ort_burs, COUNT(*) AS ogrenci
> FROM students GROUP BY city ORDER BY ort_burs DESC NULLS LAST;
> ```
> Dikkat: bir şehirdeki herkesin bursu NULL ise o grubun ort_burs değeri NULL olur, ama COUNT(*) yine
> gerçek öğrenci sayısını verir. AVG yine NULL'ları yok sayar.
> </details>

**P4 (orta).** [▶ Editörde dene] En az 3 öğrencisi olan bölümleri ve sayılarını getir.
> İpucu: GROUP BY + HAVING COUNT(*) >= 3.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT department_id, COUNT(*) AS adet
> FROM students GROUP BY department_id HAVING COUNT(*) >= 3 ORDER BY adet DESC;
> ```
> Bölüm 1 (5), bölüm 2 (3), bölüm 3 (3). Bölüm 4 (2) ve 5 (1) HAVING'de elenir.
> </details>

**P5 (zorlayıcı).** [▶ Editörde dene] Sadece tamamlanmış siparişlere bakarak, en az 2 siparişi olan
öğrencileri ve sipariş sayılarını bul.
> İpucu: WHERE status='completed', GROUP BY student_id, HAVING COUNT(*) >= 2.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT student_id, COUNT(*) AS siparis
> FROM orders WHERE status = 'completed'
> GROUP BY student_id HAVING COUNT(*) >= 2 ORDER BY siparis DESC;
> ```
> Öğrenci 1 (3), öğrenci 3 (2). WHERE satırları (iptal/bekleyen), HAVING grupları (az siparişli) eler.
> </details>

**P6 (düşündürücü).** [▶ Editörde dene] Şu sorguyu çalıştırmadan tahmin et, sonra çalıştırıp doğrula:
`SELECT department_id, COUNT(*) FROM students WHERE city = 'İstanbul' GROUP BY department_id;` Hangi
bölümler ve kaçar kişi gelir?
> İpucu: Önce WHERE İstanbul'u süzer (4 kişi), sonra bölüme göre gruplar.
> <details><summary>Cevap</summary>
>
> İstanbullular: Ayşe (b1), Ali Çelik (b1), Selin (b4), Okan (b1). WHERE bunları süzer, sonra bölüme
> göre gruplanır: bölüm 1 -> 3 (Ayşe, Ali Çelik, Okan), bölüm 4 -> 1 (Selin). Çalışma sırası: önce
> WHERE (İstanbul), sonra GROUP BY (bölüm). Sadece İstanbullular gruplandığı için toplam 4.
> </details>

---

## Ünite 5 özeti (öğrenciye)
- **GROUP BY**, satırları ortak değere göre gruplar ve aggregate'i her grup için ayrı hesaplar; çıktının
  grain'i (bir satırın anlamı) değişir.
- SELECT'teki her normal sütun ya **grup anahtarı** (GROUP BY'da) ya da bir **aggregate** içinde olmalı.
- Grup başına birden çok aggregate alabilirsin; `COUNT(*)` ve `COUNT(sütun)` grup içinde de farklıdır.
- **HAVING** grupları aggregate'e göre süzer; **WHERE** satırları gruplamadan önce süzer. Aggregate'li
  koşul HAVING'e, aggregate'siz koşul WHERE'e gider.
- Çalışma sırası: **FROM -> WHERE -> GROUP BY -> aggregate -> HAVING -> SELECT -> ORDER BY -> LIMIT.**
  Bu sıra alias ve aggregate kurallarının "neden"ini açıklar.

## 🧑‍🏫 Öğretmen notu (ünite geneli)
GROUP BY, öğrencinin SQL'de attığı en büyük kavramsal adım; "tek özet"ten "gruplu özet"e geçiş. Grain
fikrini (5.1) ve çalışma sırasını (5.5) sağlam oturtursan, ileride JOIN sonrası gruplama (Ü8) ve
window functions (Ü13) çok daha kolay gelir. HAVING'i WHERE'den ayırmak için her seferinde "gruplamadan
önce mi sonra mı süzüyorum?" sorusunu sordur. Bir sonraki ünite veri modeli ve JOIN: artık tek tabloyu
bırakıp tabloları birbirine bağlayacağız.
