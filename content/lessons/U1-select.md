# Ünite 1 — SELECT Temelleri: Sütun Seçme ve Sonucu Şekillendirme

> Kavram etiketleri: `select-columns`, `column-alias`, `computed-column`, `distinct`, `order-by`, `limit`, `null-arithmetic`, `null-ordering`
> Ön koşul: Ü0
> Kullanılan tablolar: students, departments, courses
> Tahmini süre: 45-55 dk
> Ünite sloganı: **"Önce hangi sütunları, sonra hangi sırayla, sonra kaç tane."**

---

## Ders 1.1 — Belirli sütunları seçmek ve sıralarını belirlemek

### 🧑‍🏫 Öğretmen için
"Ü0'da `SELECT *` ile her şeyi getirdik. Şimdi terziye dönüşüyoruz: tam istediğimiz sütunları, tam
istediğimiz sırayla seçeceğiz." Tahtaya `SELECT city, first_name` yazıp "dikkat, önce şehir sonra ad
geldi, çünkü ben öyle yazdım" de. Sütun sırasının SELECT'te yazdığın sıra olduğunu vurgula.
- Sorabileceğin soru: "`SELECT last_name, first_name` ile `SELECT first_name, last_name` arasında ne fark var?" (Sadece sütunların görüntü sırası.)

### Konu anlatımı
Sütunları virgülle ayırarak tek tek seçersin. Ve **yazdığın sıra, sonuçta görünen sıradır.**

```sql
SELECT first_name, city FROM students;
```

Bu, önce ad sonra şehir getirir. Eğer şöyle yazsaydık:

```sql
SELECT city, first_name FROM students;
```

bu sefer önce şehir, sonra ad gelirdi. Veri aynı, sadece sunum sırası değişti. Yani SELECT listesi,
hem "hangi sütunlar" hem de "hangi sırayla" sorusunu birden cevaplar.

> Mini slogan: **SELECT'te sütunları hangi sırayla yazarsan, sonuçta o sırayla görünür.**

### Çözümlü örnekler

**Örnek 1**
- Ne istiyoruz? Öğrencilerin önce şehrini, sonra adını.
- Hangi tablolar? `students`.
- Sorgu:
```sql
SELECT city, first_name FROM students LIMIT 4;
```
- Sonuç:

| city     | first_name |
|----------|------------|
| İstanbul | Ayşe       |
| NULL     | Mehmet     |
| Ankara   | Zeynep     |
| NULL     | Can        |

- Ne anlıyoruz? Sütun sırası bizim yazdığımız gibi (önce `city`). Can ve Mehmet'in şehri `NULL`,
  yani bilinmiyor; sonuçta öylece görünüyor, gizlenmiyor.

**Örnek 2**
- Ne istiyoruz? Derslerin kodunu ve adını.
- Hangi tablolar? `courses`.
- Sorgu:
```sql
SELECT code, name FROM courses;
```
- Ne anlıyoruz? 8 satır (8 ders), 2 sütun. `credits` ve diğerlerini istemedik, gelmediler.

### Sık hatalar & uyarılar
- Sütunlar arasına virgül koymamak: `SELECT code name FROM courses` SQL tarafından "code sütununu
  getir, adını da name yap" diye yorumlanır (bu takma ad konusu, 1.2). İstediğin iki ayrı sütunsa
  araya virgül koy: `SELECT code, name`.
- Var olmayan sütun adı yazmak (`SELECT sehir FROM students`). Bizim sütun `city`. SQL "column does
  not exist" der. Tablonun sütun adlarını bilmek için önce `SELECT * FROM students LIMIT 1;` ile bak.

### Anlama soruları

**Soru 1 (yaz).** `students` tablosundan önce soyadı, sonra adı gelecek şekilde iki sütun seç.
> **İpucu:** Sütun sırası, SELECT'te yazdığın sıradır.

> **Detaylı cevap:**
> ```sql
> SELECT last_name, first_name FROM students;
> ```
> `last_name` önce yazıldığı için sonuçta ilk sütun o olur, `first_name` ikinci. İçerik olarak
> `SELECT first_name, last_name` ile aynı veriyi taşır, sadece sütunların görüntü sırası farklıdır.
> SQL burada senin yazdığın sıraya harfiyen uyar.

**Soru 2 (çoktan seçmeli).** `SELECT name, code FROM courses;` ile `SELECT code, name FROM courses;`
arasındaki tek fark nedir?
- A) Biri daha az satır getirir
- B) Sütunların sonuçtaki sırası farklıdır, veri aynıdır
- C) Biri hata verir
- D) Hiçbir fark yok

> **İpucu:** Satır sayısı mı değişti, yoksa sütunların dizilişi mi?

> **Detaylı cevap:** Doğru cevap **B**. İki sorgu da 8 satır ve aynı iki sütunu getirir; tek fark
> hangisinin solda hangisinin sağda görüneceğidir. Satır sayısı değişmez (A yanlış), ikisi de geçerli
> sorgudur (C yanlış), ve fark vardır çünkü sütun sırası SELECT listesindeki sıraya göre belirlenir
> (D yanlış). Bu küçük ama önemli: raporlarda sütunları okuyucunun beklediği sırada vermek için bu
> kontrolü kullanırsın.

### Çıkış bileti
SELECT'te sütunların sırası neye göre belirlenir?

---

## Ders 1.2 — Takma adlar (AS / alias)

### 🧑‍🏫 Öğretmen için
"`first_name` güzel ama bir rapora `Ad` yazsak daha hoş olur, değil mi? İşte sütuna geçici bir
görünen ad verebiliriz, buna takma ad (alias) denir." `AS` kelimesinin opsiyonel olduğunu, ama
okunurluk için yazmanın iyi olduğunu söyle. Türkçe veya boşluklu ad istiyorsak çift tırnak gerektiğini göster.

### Konu anlatımı
Bir sütuna sonuçta görünecek farklı bir ad vermek için `AS` kullanırız:

```sql
SELECT first_name AS ad, last_name AS soyad FROM students;
```

Sonuçta sütun başlıkları artık `ad` ve `soyad` olur. Dikkat: bu sadece **görünüş**, tablodaki
gerçek sütun adı hâlâ `first_name`. Takma ad sorgunun çıktısında yaşar, veride değil.

Birkaç ince nokta:
- `AS` opsiyoneldir: `SELECT first_name ad FROM students` da çalışır. Ama `AS` yazmak niyeti
  netleştirir, okuması kolaydır.
- Boşluk veya Türkçe karakter içeren bir başlık istiyorsan **çift tırnak** kullan:
  `SELECT first_name AS "Öğrenci Adı" FROM students`. Çift tırnak sütun/alias adları içindir; tek
  tırnak (`'...'`) ise metin değerleri içindir, ikisini karıştırma.
- Takma adlar özellikle birazdan göreceğimiz hesaplanan sütunlarda hayat kurtarır.

> Mini slogan: **Alias, sütunun sonuçtaki görünen adıdır; veriyi değiştirmez.**

### Çözümlü örnekler

**Örnek 1**
- Ne istiyoruz? Bölüm adını "Bölüm" başlığıyla görmek.
- Sorgu:
```sql
SELECT name AS "Bölüm" FROM departments;
```
- Ne anlıyoruz? Sonuçta sütun başlığı `Bölüm` olur. Boşluk yok ama Türkçe karakter (`ö`) var, yine de
  çift tırnak güvenli tercih. İçerik 5 bölüm adı.

**Örnek 2**
- Ne istiyoruz? Ad ve soyadı sade başlıklarla.
- Sorgu:
```sql
SELECT first_name AS ad, last_name AS soyad FROM students LIMIT 3;
```
- Sonuç:

| ad     | soyad  |
|--------|--------|
| Ayşe   | Yılmaz |
| Mehmet | Demir  |
| Zeynep | Kaya   |

### Sık hatalar & uyarılar
- Alias'ı `WHERE` içinde kullanmaya çalışmak. Bu çalışmaz, çünkü `WHERE` (Ü2) mantıksal olarak
  takma adlar oluşmadan önce işler. İyi haber: `ORDER BY` içinde alias kullanabilirsin (1.5'te göreceğiz).
- Türkçe/boşluklu başlıkta tek tırnak kullanmak: `AS 'Öğrenci Adı'` Postgres'te genelde hata ya da
  beklenmedik davranış verir. Alias için **çift** tırnak doğrusudur.

### Anlama soruları

**Soru 1 (yaz).** `students` tablosundaki `email` sütununu, sonuçta başlığı `eposta` olacak şekilde getir.
> **İpucu:** `AS` ile sütuna görünen ad ver.

> **Detaylı cevap:**
> ```sql
> SELECT email AS eposta FROM students;
> ```
> `email` sütununu seçtik ve ona `eposta` takma adını verdik. Sonuçtaki başlık artık `eposta` olur,
> ama `students` tablosundaki gerçek sütun adı hâlâ `email`. Burada çift tırnağa gerek yok çünkü
> `eposta` tek kelime, boşluk veya özel karakter yok.

**Soru 2 (hata avı).** Bu sorgu neden istediğimiz iki sütunu getirmez?
```sql
SELECT first_name last_name FROM students;
```
> **İpucu:** İki sütun istiyorsan aralarına ne koymalısın?

> **Detaylı cevap:** Çünkü virgül eksik. SQL bunu "`first_name` sütununu getir ve ona `last_name`
> takma adını ver" diye yorumlar. Yani sonuçta tek sütun gelir, başlığı `last_name` olur, içindeyse
> adlar vardır. İki ayrı sütun istiyorsak doğrusu: `SELECT first_name, last_name FROM students;`.
> Bu, alias'ın gizli bir tuzağıdır: `AS` opsiyonel olduğu için, virgülü unuttuğunda SQL ikinci kelimeyi
> takma ad sanır ve hata bile vermez, sessizce yanlış sonucu verir. Bu yüzden sütunları ayırırken
> virgüle çok dikkat.

### Çıkış bileti
Alias (takma ad) sonuçta mı yoksa tabloda mı değişiklik yapar?

---

## Ders 1.3 — Hesaplanan sütunlar (ifadeler)

### 🧑‍🏫 Öğretmen için
"Sütunları sadece olduğu gibi getirmek zorunda değiliz; üzerinde hesap da yapabiliriz. Mesela aylık
bursu 12 ile çarpıp yıllık bursu üretebiliriz." Burada hesaplanan sütunun otomatik bir başlığı
olmadığını, o yüzden alias'ın çok işe yaradığını göster. NULL ile hesabın sonucunun NULL olduğunu da
küçük bir sürpriz olarak göster.

### Konu anlatımı
SELECT içinde sadece sütun adı değil, hesap da yazabilirsin. Sayılarla `+ - * /`, metinlerle
birleştirme yapılabilir.

```sql
SELECT first_name, scholarship_amount, scholarship_amount * 12 AS yillik_burs
FROM students;
```

Burada `scholarship_amount * 12` yeni, hesaplanan bir sütundur. Otomatik bir başlığı olmaz (Postgres
genelde `?column?` gibi bir şey yazar), o yüzden `AS yillik_burs` ile düzgün bir ad veriyoruz.

Önemli bir nokta, NULL'a dair spiralimizin ikinci halkası: **NULL ile yapılan aritmetik yine
NULL'dır.** Mehmet'in bursu `NULL` (bilinmiyor); `NULL * 12` de `NULL`'dır, çünkü "bilinmeyen bir
sayının 12 katı" da bilinmeyendir. Mantıklı, değil mi?

> Mini slogan: **Bir şeyi bilmiyorsan, onunla yaptığın hesabı da bilemezsin: NULL ile işlem NULL verir.**

### Çözümlü örnekler

**Örnek 1**
- Ne istiyoruz? Her dersin kredisini ve "kredi x 30" ile kabaca toplam çalışma saatini.
- Hangi tablolar? `courses`.
- Sorgu:
```sql
SELECT name, credits, credits * 30 AS tahmini_saat FROM courses LIMIT 3;
```
- Sonuç:

| name                  | credits | tahmini_saat |
|-----------------------|---------|--------------|
| Programlamaya Giriş   | 6       | 180          |
| Veri Yapıları         | 6       | 180          |
| Veritabanı Sistemleri | 5       | 150          |

- Ne anlıyoruz? `tahmini_saat` tabloda olmayan, anlık hesaplanan bir sütun. Alias olmasa başlığı
  okunaksız olurdu.

**Örnek 2 (NULL sürprizi)**
- Ne istiyoruz? Adı, aylık bursu ve yıllık bursu.
- Sorgu:
```sql
SELECT first_name, scholarship_amount, scholarship_amount * 12 AS yillik_burs
FROM students LIMIT 3;
```
- Sonuç:

| first_name | scholarship_amount | yillik_burs |
|------------|--------------------|-------------|
| Ayşe       | 5000               | 60000       |
| Mehmet     | NULL               | NULL        |
| Zeynep     | 3000               | 36000       |

- Ne anlıyoruz? Mehmet'in bursu bilinmediği için yıllık bursu da NULL çıktı. Bu bir hata değil,
  doğru davranış. (İleride COALESCE ile "bilinmiyorsa 0 say" gibi numaraları öğreneceğiz.)

### Sık hatalar & uyarılar
- Hesaplanan sütuna alias vermemek, sonra başlığın `?column?` çıkmasına şaşırmak. Hesaba her zaman
  bir `AS` ver.
- NULL'lı bir sütunla hesap yapıp "neden bazı satırlar boş geldi?" diye şaşırmak. Cevap: o satırlarda
  girdi NULL'dı, NULL ile hesap NULL verir.

### Anlama soruları

**Soru 1 (tahmin et).** Aşağıdaki sorguda Can'ın (`scholarship_amount = NULL`) `yillik_burs` değeri ne olur?
```sql
SELECT first_name, scholarship_amount * 12 AS yillik_burs FROM students;
```
> **İpucu:** NULL ile çarpım ne verir?

> **Detaylı cevap:** Can'ın `yillik_burs` değeri **NULL** olur. Çünkü Can'ın `scholarship_amount`
> değeri NULL (bilinmiyor) ve "bilinmeyen bir sayının 12 katı" da bilinmeyendir, yani NULL. SQL burada
> 0 üretmez, çünkü NULL sıfır değildir. Bu, NULL'ın aritmetikteki temel davranışıdır: NULL'a değen
> her toplama, çıkarma, çarpma, bölme sonucu NULL olur. İleride "bilinmiyorsa şu değeri kullan"
> demek istersek `COALESCE` fonksiyonunu kullanacağız (Ü3).

**Soru 2 (yaz).** `products` tablosundan ürün adını, fiyatını ve fiyatın %20 zamlısını (`price * 1.2`)
`zamli_fiyat` adıyla getir.
> **İpucu:** Hesaba `AS zamli_fiyat` eklemeyi unutma.

> **Detaylı cevap:**
> ```sql
> SELECT name, price, price * 1.2 AS zamli_fiyat FROM products;
> ```
> `price * 1.2`, fiyatı 1.2 ile çarparak %20 zamlı halini hesaplar (örneğin 25 -> 30). Bu hesaplanan
> sütuna `zamli_fiyat` takma adını verdik ki başlık anlamlı olsun. `products` tablosunda hiçbir fiyat
> NULL olmadığı için burada NULL sürprizi yaşamayız, tüm satırlar düzgün hesaplanır.

### Çıkış bileti
`NULL * 5` neye eşittir ve neden?

---

## Ders 1.4 — Tekrarsız değerler: DISTINCT

### 🧑‍🏫 Öğretmen için
"Bazen 'kaç farklı şehir var' diye sorarız, her öğrenciyi değil. İşte tekrarları ayıklayan kelime
`DISTINCT`." Önemli inceliği vurgula: DISTINCT veriyi düzeltmez, sadece sonuçta tekrarları gizler.
NULL'ın tek bir grup sayıldığını da göster.

### Konu anlatımı
`SELECT DISTINCT`, sonuçtaki tekrar eden satırları teke indirir.

```sql
SELECT DISTINCT city FROM students;
```

`students` tablosunda 14 öğrenci var ama bir sürü öğrenci aynı şehirden (üç kişi İstanbul'dan...).
`DISTINCT` ile her şehir bir kez görünür. İki ince nokta:
- DISTINCT, **seçtiğin sütunların kombinasyonuna** bakar. Tek sütun seçtiysen o sütundaki farklı
  değerler; iki sütun seçtiysen o ikisinin farklı kombinasyonları.
- NULL'lar da bir değer gibi gruplanır: birden çok NULL şehir varsa, sonuçta **tek bir NULL** görünür.

> Mini slogan: **DISTINCT veriyi temizlemez, sadece sonuçta tekrarları teke indirir.**

### Çözümlü örnekler

**Örnek 1**
- Ne istiyoruz? Öğrencilerin geldiği farklı şehirler.
- Sorgu:
```sql
SELECT DISTINCT city FROM students;
```
- Sonuç: 5 satır gelir: `İstanbul`, `Ankara`, `İzmir`, `Bursa` ve bir tane `NULL`. (Sıra garanti
  değil, sıralamak istersen `ORDER BY` eklersin, bkz. 1.5.)
- Ne anlıyoruz? 14 öğrenci olmasına rağmen sadece 5 farklı şehir değeri var. Birden çok öğrencinin
  şehri NULL ama sonuçta NULL tek kez görünüyor.

**Örnek 2 (iki sütun birlikte)**
- Ne istiyoruz? Hangi (bölüm, şehir) kombinasyonları var?
- Sorgu:
```sql
SELECT DISTINCT department_id, city FROM students;
```
- Ne anlıyoruz? Bu sefer DISTINCT tek bir sütuna değil, `department_id` ve `city` ikilisinin birlikte
  farklı olduğu satırlara bakar. Yani aynı bölüm + aynı şehir ikilisi bir kez görünür, ama farklı
  şehirdeki aynı bölüm ayrı satır olur.

### Sık hatalar & uyarılar
- `DISTINCT`'i bir sütuna ait sanmak: `SELECT DISTINCT(city), first_name` yazıp "sadece city'yi
  tekilleştirdim" sanmak. Hayır. `DISTINCT` tüm SELECT listesine uygulanır; `first_name` de ekliyse
  artık (city, first_name) ikilisine bakar ve neredeyse hiçbir satır tekrar etmez.
- DISTINCT'i veri temizleme aracı sanmak. O, kaynaktaki tekrarları silmez; sadece bu sorgunun
  sonucunda tekrarları gizler.

### Anlama soruları

**Soru 1 (tahmin et).** `SELECT DISTINCT city FROM students;` kaç satır döndürür ve NULL kaç kez görünür?
> **İpucu:** Farklı şehirleri say; NULL tek grup sayılır.

> **Detaylı cevap:** **5 satır** döner ve **NULL yalnızca 1 kez** görünür. Öğrencilerin şehirleri
> İstanbul, Ankara, İzmir, Bursa ve bir kısmı NULL. Tekrarlar (üç İstanbul'lu öğrenci gibi) teke
> indiği için 4 gerçek şehir + 1 NULL = 5 satır olur. DISTINCT, NULL'ları "hepsi aynı bilinmeyen"
> gibi tek bir grupta toplar, bu yüzden defalarca NULL olsa da sonuçta bir tane görürsün.

**Soru 2 (kavram).** Aşağıdaki iki sorgu neden farklı sayıda satır döndürür?
```sql
SELECT DISTINCT city FROM students;
SELECT DISTINCT city, first_name FROM students;
```
> **İpucu:** DISTINCT hangi sütunların kombinasyonuna bakıyor?

> **Detaylı cevap:** Çünkü DISTINCT, SELECT listesindeki **bütün** sütunların birlikte oluşturduğu
> kombinasyona bakar. Birinci sorgu sadece `city`'ye bakar, tekrar eden şehirler teke iner, 5 satır
> çıkar. İkinci sorgu (city, first_name) ikilisine bakar; neredeyse her öğrencinin adı + şehri farklı
> bir kombinasyon olduğu için tekrar pek olmaz ve sonuç tablodaki satır sayısına yakın (14 civarı)
> olur. Ders: DISTINCT'i tek bir sütuna uyguladığını sanma, her zaman seçtiğin tüm sütunlara birden
> uygulanır.

### Çıkış bileti
DISTINCT kaynak tablodaki tekrarları siler mi, yoksa sadece sonuçta mı gizler?

---

## Ders 1.5 — Sıralama: ORDER BY

### 🧑‍🏫 Öğretmen için
"Şimdiye kadar satırlar 'gelişigüzel' bir sırada geliyordu. Çünkü tabloda doğal sıra yok, Ü0'da
söylemiştik. Sıra istiyorsak açıkça istemeliyiz: `ORDER BY`." Artan/azalan (`ASC`/`DESC`) farkını ve
eşitlik durumunda ikinci bir kritere (tiebreaker) ihtiyaç olduğunu göster.

### Konu anlatımı
`ORDER BY`, sonucu bir veya birden çok sütuna göre sıralar:
- `ASC` artan (küçükten büyüğe, a'dan z'ye). Varsayılan budur, yazmasan da ASC olur.
- `DESC` azalan (büyükten küçüğe).

```sql
SELECT first_name, scholarship_amount
FROM students
ORDER BY scholarship_amount DESC;
```

Birkaç önemli nokta:
- **Eşitlik (tie) olursa** ikinci bir sıralama kriteri eklemezsen, eşit olanların kendi arasındaki
  sırası garanti değildir. Net bir sonuç için ikinci kriter ekle: `ORDER BY scholarship_amount DESC, first_name ASC`.
- **NULL nereye gider?** Postgres'te varsayılan: `ASC` ile NULL'lar sona, `DESC` ile başa gelir.
  Bunu `NULLS FIRST` / `NULLS LAST` ile kontrol edebilirsin. Örneğin en yüksek bursu üste, bilinmeyen
  bursları en sona atmak için: `ORDER BY scholarship_amount DESC NULLS LAST`.
- `ORDER BY` içinde **alias kullanabilirsin** (WHERE'in aksine): `... AS yillik AS ... ORDER BY yillik`.

> Mini slogan: **Sıra istiyorsan ORDER BY ile sen iste; yazmazsan SQL sırayı garanti etmez.**

### Çözümlü örnekler

**Örnek 1**
- Ne istiyoruz? Öğrencileri bursu en yüksekten en düşüğe sırala, bilinmeyen burslar en sonda olsun,
  eşitlikte ada göre sırala.
- Sorgu:
```sql
SELECT first_name, scholarship_amount
FROM students
ORDER BY scholarship_amount DESC NULLS LAST, first_name ASC
LIMIT 5;
```
- Sonuç:

| first_name | scholarship_amount |
|------------|--------------------|
| Ayşe       | 5000               |
| Selin      | 5000               |
| Elif       | 4500               |
| Gizem      | 4000               |
| Deniz      | 3500               |

- Ne anlıyoruz? 5000 iki kişide eşit (Ayşe ve Selin); ikinci kriter `first_name` sayesinde Ayşe (A)
  Selin'den (S) önce geldi. NULL burslular en sona itildi (zaten ilk 5'te görünmüyorlar).

**Örnek 2 (yanlış sezgiyi düzelt)**
- Ne istiyoruz? "Bursu en yüksek 3 öğrenci."
- Eksik deneme:
```sql
SELECT first_name, scholarship_amount FROM students LIMIT 3;
```
Bu, ORDER BY olmadığı için "rastgele" 3 öğrenci verir, "en yüksek" garantisi yok.
- Doğru:
```sql
SELECT first_name, scholarship_amount
FROM students
ORDER BY scholarship_amount DESC NULLS LAST
LIMIT 3;
```
- Ne anlıyoruz? "İlk 3" demek için önce "neye göre?" sorusunu `ORDER BY` ile cevaplaman gerekir.
  LIMIT'i 1.6'da detaylı göreceğiz; buradaki ders, sıralamasız LIMIT'in "en iyi"yi getirmediği.

### Sık hatalar & uyarılar
- `LIMIT`'i `ORDER BY` olmadan kullanıp "ilk 5"i "en iyi 5" sanmak. Sıralama yoksa "ilk" kavramı
  rastgeledir.
- Sıralamayı "veriyi değerlendirme" sanmak. ORDER BY sadece görüntü sırasını değiştirir; hangi
  satırların geldiğini değiştirmez (onu WHERE yapar).
- Eşitlik olan durumlarda tek sütuna göre sıralayıp sonucun her seferinde aynı sırada geleceğini
  varsaymak. Garanti istiyorsan ikinci bir sıralama kriteri ekle.

### Anlama soruları

**Soru 1 (yaz).** Dersleri kredisine göre en yüksekten en düşüğe sırala; kredi eşitse ders adına göre
artan sırala.
> **İpucu:** İki kriter: önce `credits DESC`, sonra `name ASC`.

> **Detaylı cevap:**
> ```sql
> SELECT name, credits FROM courses ORDER BY credits DESC, name ASC;
> ```
> Önce `credits DESC` ile en yüksek kredili dersler üste gelir. Birden fazla ders aynı krediye sahip
> (örneğin CS101 ve CS201 ve MATH101 hepsi 6 kredi) olduğunda, ikinci kriter `name ASC` devreye girer
> ve eşit kredilileri ders adına göre alfabetik sıralar. Bu ikinci kriter olmasa, eşit kredili
> derslerin kendi arasındaki sırası garanti olmazdı. İyi alışkanlık: sıralaman "tek değer" üretene
> kadar yeterince kriter ekle.

**Soru 2 (çoktan seçmeli).** `ORDER BY` yazmadan `SELECT * FROM students LIMIT 5;` çalıştırdın. Gelen
5 satır hakkında ne söyleyebilirsin?
- A) En son eklenen 5 öğrenci
- B) id'si en küçük 5 öğrenci
- C) Belirli, garantili bir sıra yok; herhangi 5 öğrenci olabilir
- D) Alfabetik ilk 5 öğrenci

> **İpucu:** Sıralama belirtmediysen SQL sıra konusunda söz vermez.

> **Detaylı cevap:** Doğru cevap **C**. `ORDER BY` yoksa SQL satırların hangi sırayla geleceğine dair
> hiçbir garanti vermez; veritabanı bunları en kolayına geldiği gibi döndürebilir. Çoğu zaman id
> sırasına benzer görünebilir (B'ye benzer), ama bu bir tesadüftür, garanti değildir ve veri ya da
> sürüm değişince bozulabilir. "En son eklenen" (A) veya "alfabetik" (D) demek için ilgili sütuna göre
> açıkça `ORDER BY` yazman gerekir. Kural: belirli bir sıra istiyorsan, onu yazmak zorundasın.

### Çıkış bileti
`ORDER BY` olmadan gelen satırların sırası neden güvenilir değildir?

---

## Ders 1.6 — Kaç tane: LIMIT (ve OFFSET)

### 🧑‍🏫 Öğretmen için
"`LIMIT` 'bana sadece şu kadar satır yeter' demek. 'En çok satan 5 ürün', 'en yüksek 3 not' gibi
sorularda kullanırız, ama her zaman bir `ORDER BY` ile birlikte, yoksa 'en'i belirleyemeyiz." OFFSET'i
"baştan şu kadarını atla" diye sayfalama için kısaca göster.

### Konu anlatımı
`LIMIT n`, sonuçtan sadece ilk `n` satırı alır. `OFFSET m` ise baştan `m` satır atlar (sayfalama için).

```sql
SELECT first_name, scholarship_amount
FROM students
ORDER BY scholarship_amount DESC NULLS LAST
LIMIT 3;
```

Kritik kural: **LIMIT neredeyse her zaman ORDER BY ile birlikte anlamlıdır.** "İlk 3" demek için
önce "neye göre sıralı?" sorusunu cevaplamalısın. Sıralama yoksa "ilk 3" rastgele 3 demektir.

OFFSET ile sayfalama: ilk sayfa `LIMIT 5`, ikinci sayfa `LIMIT 5 OFFSET 5`, üçüncü sayfa
`LIMIT 5 OFFSET 10`...

> Mini slogan: **"İlk N" demek için önce "neye göre?" sorusunu ORDER BY ile cevapla.**

### Çözümlü örnekler

**Örnek 1**
- Ne istiyoruz? Bursu en yüksek 3 öğrenci.
- Sorgu:
```sql
SELECT first_name, scholarship_amount
FROM students
ORDER BY scholarship_amount DESC NULLS LAST, first_name
LIMIT 3;
```
- Sonuç:

| first_name | scholarship_amount |
|------------|--------------------|
| Ayşe       | 5000               |
| Selin      | 5000               |
| Elif       | 4500               |

- Ne anlıyoruz? Önce sıraladık (en yüksek burs üste), sonra `LIMIT 3` ile tepeden 3 tanesini aldık.
  İşte "en yüksek 3" böyle yazılır.

**Örnek 2 (sayfalama)**
- Ne istiyoruz? Öğrencileri ada göre sıralayıp "ikinci sayfayı" (4-6. sıralar) görmek.
- Sorgu:
```sql
SELECT first_name FROM students ORDER BY first_name LIMIT 3 OFFSET 3;
```
- Ne anlıyoruz? `ORDER BY first_name` ile sıraladık, ilk 3'ü `OFFSET 3` ile atladık, sonraki 3'ü
  `LIMIT 3` ile aldık. Bu, listeyi sayfa sayfa göstermenin temel yolu.

### Sık hatalar & uyarılar
- `LIMIT`'i sıralamasız kullanıp "en yüksek/en yeni" sandığın şeyi almak. Sıralamasız LIMIT = rastgele kesit.
- OFFSET'i çok büyük verip boş sonuç alınca şaşırmak: tabloda o kadar satır yoksa, atladıktan sonra
  geriye bir şey kalmaz, bu normaldir.

### Anlama soruları

**Soru 1 (yaz).** En pahalı 2 ürünü (ad ve fiyat) getir.
> **İpucu:** Önce fiyata göre azalan sırala, sonra 2 ile sınırla.

> **Detaylı cevap:**
> ```sql
> SELECT name, price FROM products ORDER BY price DESC LIMIT 2;
> ```
> Önce `ORDER BY price DESC` ile ürünleri en pahalıdan en ucuza sıraladık. Sonra `LIMIT 2` ile
> tepeden iki tanesini aldık. Sonuç: Sandviç (55) ve Tost (45). Eğer `ORDER BY` yazmasaydık, `LIMIT 2`
> bize rastgele iki ürün verirdi ve "en pahalı" garantisi olmazdı. `products` tablosunda fiyatların
> hiçbiri NULL olmadığı için burada NULLS LAST'a gerek yok.

**Soru 2 (hata avı).** Bir öğrenci "en yüksek notlu 5 öğrenci" istedi ve şunu yazdı. Sorun ne?
```sql
SELECT student_id, grade FROM enrollments LIMIT 5;
```
> **İpucu:** "En yüksek" demek için neyi eklemeliydi?

> **Detaylı cevap:** Sorgu çalışır ama soruyu cevaplamaz, çünkü `ORDER BY` yok. Bu haliyle "herhangi
> 5 kayıt" gelir, "en yüksek 5 not" değil. Doğrusu önce nota göre azalan sıralamak, sonra sınırlamak:
> ```sql
> SELECT student_id, grade FROM enrollments
> ORDER BY grade DESC NULLS LAST
> LIMIT 5;
> ```
> `NULLS LAST` ekledik çünkü bazı kayıtlarda not NULL (ders devam ediyor); onları en yüksek sananları
> tepeye çıkarmak istemeyiz, en sona itmek isteriz. Ders: `LIMIT` tek başına "en"i bilmez, ona
> sıralamayı sen vermelisin.

### Çıkış bileti
"En yüksek 10 X" tarzı bir soruda hangi iki şeyi mutlaka birlikte kullanırsın?

---

## Pratik (editörde dene)

> Deneme Tahtasında (⌘K) dene. Önce tahmin et, çalıştır, gözle, sonra cevaba bak. Seed: Kampüs.

**P1 (kolay).** [▶ Editörde dene] Öğrencileri adına göre alfabetik sırala (ad ve soyad).
> İpucu: ORDER BY first_name.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT first_name, last_name FROM students ORDER BY first_name;
> ```
> ORDER BY olmadan sıra garanti değildi; burada ada göre sıraladık.
> </details>

**P2 (kolay).** [▶ Editörde dene] Öğrencilerin geldiği farklı şehirleri (tekrarsız) getir.
> İpucu: SELECT DISTINCT city.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT DISTINCT city FROM students;
> ```
> 5 satır: İstanbul, Ankara, İzmir, Bursa ve bir NULL (bilinmeyen, tek grup). DISTINCT tekrarları teke indirir.
> </details>

**P3 (orta).** [▶ Editörde dene] Adı 'Ad', soyadı 'Soyad' başlığıyla getir (alias).
> İpucu: AS ile takma ad ver.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT first_name AS "Ad", last_name AS "Soyad" FROM students;
> ```
> Başlıklar artık Ad/Soyad. Türkçe/boşluklu başlık için çift tırnak. Veri değişmez, sadece görünen ad.
> </details>

**P4 (orta).** [▶ Editörde dene] Bursu en yüksek 3 öğrenciyi getir (bilinmeyen burslar en sonda).
> İpucu: ORDER BY scholarship_amount DESC NULLS LAST, LIMIT 3.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT first_name, scholarship_amount FROM students
> ORDER BY scholarship_amount DESC NULLS LAST
> LIMIT 3;
> ```
> Ayşe 5000, Selin 5000, Elif 4500. "En yüksek N" için önce sırala, sonra LIMIT.
> </details>

**P5 (zorlayıcı).** [▶ Editörde dene] Ürün adını, fiyatını ve %20 zamlı fiyatını (`zamli` adıyla) getir.
> İpucu: price * 1.2 AS zamli.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT name, price, price * 1.2 AS zamli FROM products;
> ```
> Hesaplanan sütuna alias verdik. products'ta NULL fiyat yok, hepsi düzgün hesaplanır.
> </details>

---

## Ünite 1 özeti (öğrenciye)
- Sütunları virgülle seç; yazdığın **sıra**, sonuçtaki sıradır.
- `AS` ile sütuna **görünen ad** (alias) ver; bu veriyi değiştirmez. Boşluk/Türkçe için çift tırnak.
- SELECT içinde **hesap** yapabilirsin; hesaplanan sütuna alias ver. **NULL ile hesap NULL verir.**
- `DISTINCT` sonuçtaki tekrarları teke indirir; tüm seçili sütunlara birden bakar; NULL tek grup sayılır.
- `ORDER BY` ile sırala (`ASC`/`DESC`, `NULLS FIRST/LAST`, eşitlikte ikinci kriter).
- `LIMIT` ile kaç satır; "en N" için **mutlaka ORDER BY ile birlikte**. `OFFSET` ile sayfalama.

## 🧑‍🏫 Öğretmen notu (ünite geneli)
Bu ünitenin gizli kahramanı "ORDER BY olmadan sıra yoktur" fikri; Ü0'daki "tabloda doğal sıra yok"
ile birleşince öğrenci LIMIT'i doğru kullanır. NULL'ı iki yerde dokunduk (aritmetik ve sıralama),
bu spiralin parçası; öğrenci NULL'ı "bilinmeyen" olarak gördükçe Ü2'deki `IS NULL` çok daha kolay
oturacak. Bir sonraki ünite: WHERE ile satır eleme ve NULL'ın ilk ciddi sınavı.
