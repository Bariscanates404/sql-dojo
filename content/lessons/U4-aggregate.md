# Ünite 4 — Aggregate I: Tüm Tabloyu Tek Bir Özete İndirmek

> Kavram etiketleri: `count-star`, `count-column`, `count-distinct`, `sum-avg`, `min-max`, `aggregate-null`, `where-then-aggregate`
> Ön koşul: Ü0-Ü3
> Kullanılan tablolar: students, products, enrollments
> Tahmini süre: 45-55 dk
> Ünite sloganı: **"Bir sürü satır gir, tek bir sayı çık."**

---

## Ders 4.1 — Saymak: COUNT (ve NULL'ın dördüncü sınavı)

### 🧑‍🏫 Öğretmen için
Bu dersi bir tahminle aç. Tahtaya sor: "students tablosunda 14 öğrenci var. `COUNT(*)` kaç verir?"
(14, kolay.) Sonra asıl numara: "`COUNT(city)` de 14 verir mi?" Çoğu "evet" der. Çalıştır, **11**
çıksın, şaşırsınlar. İşte öğretilecek an: "COUNT(sütun), o sütunda DEĞER OLAN satırları sayar; NULL'lar
sayılmaz." NULL'ı bir kez daha yakaladık (Ü1 aritmetik, Ü2 filtre, Ü3 birleştirme, şimdi sayma).
- Tahtaya yan yana yaz: `COUNT(*)`, `COUNT(city)`, `COUNT(DISTINCT city)`. Üçünü de çalıştır, üç farklı
  sayı (14, 11, 4) çıksın. "Aynı kelime COUNT, ama üç farklı soru" de.
- Herkes burada takılır: `COUNT(city)` ile `COUNT(DISTINCT city)` farkı. Biri "kaç dolu hücre", öteki
  "kaç farklı değer". Tahtada elle say, göster.
- Benzetme: COUNT(*) = "kaç kişi geldi?", COUNT(city) = "kaç kişi şehrini yazdı?", COUNT(DISTINCT city)
  = "kaç farklı şehirden gelmişler?".

### Neden / nerede işime yarar
"Kaç müşteri var?", "kaç sipariş tamamlandı?", "kaç farklı şehre teslimat yaptık?" gibi soruların
hepsi sayma sorusudur. Doğru COUNT'u seçmek, doğru cevabı verir.

### Konu anlatımı
**Aggregate (toplulaştırma) fonksiyonu**, bir sürü satıra bakıp onları **tek bir değere** indirir.
COUNT bunların en temeli. Üç hali var:
- `COUNT(*)`: satır sayar. Hücreler dolu mu boş mu bakmaz, sadece satırları sayar.
- `COUNT(sütun)`: o sütunda **NULL olmayan** değerleri sayar. NULL'lar sayılmaz.
- `COUNT(DISTINCT sütun)`: o sütundaki **farklı** (NULL olmayan) değerleri sayar.

```sql
SELECT COUNT(*) AS toplam, COUNT(city) AS sehri_bilinen, COUNT(DISTINCT city) AS farkli_sehir
FROM students;
```

Sonuç tek satırdır: 14 öğrenci, 11'inin şehri biliniyor, 4 farklı şehir. Dikkat: aggregate kullanınca
sonuç artık "satır satır öğrenci" değil, "tablonun özeti"dir. Tek satır döner.

> Mini slogan: **COUNT(*) satır sayar, COUNT(sütun) dolu hücre sayar, COUNT(DISTINCT) farklı değer sayar.**

### Çözümlü örnekler

**Örnek 1 (önce tahmin et)**
- Ne istiyoruz? Üç farklı sayıyı yan yana görmek. Çalıştırmadan önce tahmin et: hangisi en büyük?
- Sorgu:
```sql
SELECT COUNT(*) AS toplam, COUNT(city) AS sehri_bilinen, COUNT(DISTINCT city) AS farkli_sehir
FROM students;
```
- Sonuç:

| toplam | sehri_bilinen | farkli_sehir |
|--------|---------------|--------------|
| 14     | 11            | 4            |

- Ne anlıyoruz? `COUNT(*)`=14 (tüm öğrenciler). `COUNT(city)`=11 (3 öğrencinin şehri NULL, sayılmadı).
  `COUNT(DISTINCT city)`=4 (İstanbul, Ankara, İzmir, Bursa; NULL farklı değer olarak da sayılmaz).

**Örnek 2 (bursu girilenler)**
- Ne istiyoruz? Kaç öğrencinin bursu kayıtlı?
- Sorgu:
```sql
SELECT COUNT(scholarship_amount) AS bursu_olan FROM students;
```
- Sonuç: `9`. Ne anlıyoruz? 14 öğrenciden 5'inin bursu NULL; `COUNT(scholarship_amount)` onları
  saymadı, geriye 9 kaldı. "Kaç öğrenci var" demek isteseydik `COUNT(*)` kullanırdık.

### Sık hatalar & uyarılar
- `COUNT(sütun)`'un NULL'ları saymadığını unutup "neden 14 değil 11?" demek. NULL'lar sayılmaz, doğru
  davranış bu.
- "Kaç kayıt var" için yanlışlıkla `COUNT(bir_sütun)` kullanmak. O sütunda NULL varsa eksik sayarsın;
  "kaç satır" için `COUNT(*)` kullan.

### Anlama soruları

**Soru 1 (tahmin et).** `enrollments` tablosunda 20 kayıt var, 4'ünde `grade` NULL. `COUNT(*)` ve
`COUNT(grade)` ne döndürür?
> **İpucu:** Biri satırları, öteki dolu notları sayar.

> **Detaylı cevap:** `COUNT(*)` = **20**, `COUNT(grade)` = **16**. `COUNT(*)` tüm kayıtları sayar,
> notu olsun olmasın 20 kayıt vardır. `COUNT(grade)` ise sadece notu girilmiş (NULL olmayan) kayıtları
> sayar; 4 kayıtta ders devam ettiği için not NULL, onlar sayılmaz, 20 - 4 = 16 kalır. Bu ayrım çok
> önemli: "kaç kayıt" sorusu `COUNT(*)`, "kaç notlu kayıt" sorusu `COUNT(grade)`. İkisini karıştırmak,
> raporlarda sessiz hatalara yol açar.

**Soru 2 (yaz).** Öğrencilerin kaç farklı bölümde (`department_id`) dağıldığını bulan sorguyu yaz.
> **İpucu:** "Kaç farklı" -> `COUNT(DISTINCT ...)`.

> **Detaylı cevap:**
> ```sql
> SELECT COUNT(DISTINCT department_id) AS farkli_bolum FROM students;
> ```
> `COUNT(DISTINCT department_id)`, öğrencilerin yayıldığı farklı bölüm sayısını verir. Sonuç **5**
> (öğrenciler 1'den 5'e kadar tüm bölümlere dağılmış). `COUNT(department_id)` deseydik 14 (her öğrenci
> bir bölümde) gelirdi, "kaç farklı bölüm" değil "kaç öğrencinin bölümü dolu" olurdu. "Farklı/benzersiz"
> kelimesini duyduğunda aklına DISTINCT gelsin.

### Çıkış bileti
`COUNT(*)` ile `COUNT(city)` neden farklı sayı verebilir?

---

## Ders 4.2 — Toplam ve ortalama: SUM, AVG (ve AVG'nin NULL tuzağı)

### 🧑‍🏫 Öğretmen için
Bu dersin can damarı AVG'nin NULL tuzağı. Tahtaya yaz: "9 öğrencinin bursu toplam 31000. Ortalama
nedir?" Çoğu öğrenci 31000/14 yapıp ~2214 der. Çalıştır, **3444** çıksın. "Neden 14'e değil 9'a
böldü?" diye sor. Cevap: AVG, NULL'ları yok sayar; toplamı da NULL olmayanların sayısına böler. Bu,
"bilinmeyen burs = 0 değildir" fikrinin sayısal kanıtı.
- Tahtaya yaz: AVG(x) = SUM(x) / COUNT(x), ikisi de NULL'ı atlar.
- Kasıtlı yanlış: `SUM(scholarship_amount) / COUNT(*)` yazıp AVG'den farklı (yanlış) çıktığını göster.
- Herkes burada takılır: "ortalamaya NULL'lar 0 olarak mı katılıyor?" Hayır, hiç katılmıyor.

### Konu anlatımı
- `SUM(sütun)`: sayısal sütunun toplamı. NULL'ları atlar.
- `AVG(sütun)`: ortalaması. **Önemli:** AVG, toplamı NULL OLMAYAN değerlerin sayısına böler, tüm satıra
  değil. Yani bilinmeyen değerler ortalamaya hiç girmez (0 sayılmaz, yok sayılır).

```sql
SELECT SUM(scholarship_amount) AS toplam_burs, AVG(scholarship_amount) AS ort_burs
FROM students;
```

Bu yüzden "bilinmeyen burs"u 0 yapmak (Ü3 COALESCE) ortalamayı bozar: 0'lar ortalamaya girer ve düşürür.
Bilinmeyeni olduğu gibi (NULL) bırakırsan AVG onu doğru şekilde dışlar.

> Mini slogan: **AVG, NULL'ları yok sayar; toplamı yalnızca dolu değerlerin sayısına böler.**

### Çözümlü örnekler

**Örnek 1 (temiz veride SUM/AVG)**
- Ne istiyoruz? Ürün fiyatlarının toplamı ve ortalaması (products'ta hiç NULL yok, temiz başlayalım).
- Sorgu:
```sql
SELECT SUM(price) AS toplam, AVG(price) AS ortalama, COUNT(*) AS adet FROM products;
```
- Sonuç:

| toplam | ortalama | adet |
|--------|----------|------|
| 245.00 | 30.625   | 8    |

- Ne anlıyoruz? 8 ürün, toplam 245, ortalama 30.625 (= 245/8). Hiç NULL olmadığı için sürpriz yok.

**Örnek 2 (AVG'nin NULL tuzağı, önce tahmin et)**
- Ne istiyoruz? Burs ortalaması. Çalıştırmadan tahmin et: 31000 / 14 mü, 31000 / 9 mu?
- Sorgu:
```sql
SELECT SUM(scholarship_amount) AS toplam, COUNT(scholarship_amount) AS dolu_adet,
       AVG(scholarship_amount) AS ortalama
FROM students;
```
- Sonuç:

| toplam | dolu_adet | ortalama   |
|--------|-----------|------------|
| 31000  | 9         | 3444.44... |

- Ne anlıyoruz? Ortalama 31000/9 = 3444.44, **14'e değil 9'a bölündü**. AVG, bursu NULL olan 5
  öğrenciyi hiç hesaba katmadı. "Bilinmeyen burs sıfır değildir, yoktur" fikrinin sayısal kanıtı bu.

### Sık hatalar & uyarılar
- AVG'yi "toplam / tüm satır sayısı" sanmak. Hayır: AVG, NULL olmayanların sayısına böler.
- Bilinmeyeni COALESCE ile 0 yapıp sonra ortalama almak. Bu ortalamayı yapay olarak düşürür; çoğu
  zaman istemezsin.

### Anlama soruları

**Soru 1 (kavram).** Bir tabloda 10 satır var; bir sütunda 4 değer NULL. `AVG(o_sütun)` toplamı kaça böler?
> **İpucu:** AVG NULL'ları sayar mı?

> **Detaylı cevap:** Toplamı **6'ya** böler (10 - 4 NULL = 6 dolu değer). AVG yalnızca NULL olmayan
> değerleri hem toplar hem sayar; NULL'lar ne paya ne paydaya girer. Eğer "10'a bölsün, NULL'lar 0
> sayılsın" istiyorsan bunu açıkça `AVG(COALESCE(o_sütun, 0))` ile yapman gerekir, ama bu çoğu zaman
> yanlış bir analiz olur, çünkü "bilinmeyen" ile "sıfır" farklı şeylerdir. Varsayılan davranış (NULL'ı
> dışlamak) genelde doğru olandır.

**Soru 2 (yaz).** Ürünlerin en pahalısı ile en ucuzu arasındaki farkı tek sorguda göster (`fark` adıyla).
> **İpucu:** `MAX(price) - MIN(price)`. (MIN/MAX'ı 4.3'te göreceğiz ama mantığı tahmin et.)

> **Detaylı cevap:**
> ```sql
> SELECT MAX(price) - MIN(price) AS fark FROM products;
> ```
> `MAX(price)` en yüksek fiyatı (55), `MIN(price)` en düşüğü (10) verir; farkları 45. İki aggregate'i
> aynı ifadede çıkarabiliriz çünkü her biri tüm tablodan tek bir değer üretir, sonra bu iki değer
> çıkarılır. Sonuç tek satır, tek sütun (`fark = 45.00`). Bu, aggregate sonuçlarının da normal sayılar
> gibi hesaba sokulabildiğini gösterir.

### Çıkış bileti
9 dolu, 5 NULL değer olan bir sütunda AVG toplamı kaça böler?

---

## Ders 4.3 — En küçük ve en büyük: MIN, MAX

### 🧑‍🏫 Öğretmen için
"MIN/MAX sadece sayıda değil, tarihte ve hatta metinde de çalışır" diyerek genişlet. Tahtaya
`MIN(birth_date)` yaz, "en küçük tarih = en eski doğum = en yaşlı öğrenci" çıkarımını birlikte yapın.
Bu, öğrencilere MIN/MAX'ın "anlamı" üzerine düşündürür (en küçük tarih neden en yaşlı?).
- Sor: "MIN(first_name) ne verir?" (Alfabetik ilk ad.) Metinde de çalıştığını göster.
- MIN/MAX da NULL'ı yok sayar; kısaca değin.

### Konu anlatımı
- `MIN(sütun)`: en küçük değer. `MAX(sütun)`: en büyük değer.
- Sayıda küçük/büyük; tarihte erken/geç; metinde alfabetik baş/son. NULL'ları yok sayarlar.

```sql
SELECT MIN(scholarship_amount) AS en_dusuk, MAX(scholarship_amount) AS en_yuksek FROM students;
```

> Mini slogan: **MIN/MAX sayıda küçük-büyük, tarihte erken-geç, metinde alfabetik baş-sondur.**

### Çözümlü örnekler

**Örnek 1 (sayı)**
- Sorgu:
```sql
SELECT MIN(scholarship_amount) AS en_dusuk, MAX(scholarship_amount) AS en_yuksek FROM students;
```
- Sonuç: en_dusuk = 1500 (Burak), en_yuksek = 5000. NULL burslular hesaba katılmadı.

**Örnek 2 (tarih, anlamını düşün)**
- Ne istiyoruz? En eski ve en yeni doğum tarihi.
- Sorgu:
```sql
SELECT MIN(birth_date) AS en_eski_dogum, MAX(birth_date) AS en_yeni_dogum FROM students;
```
- Sonuç: en_eski_dogum = 2001-10-25 (Burak, en yaşlı), en_yeni_dogum = 2004-11-05 (Okan, en genç).
- Ne anlıyoruz? Tarihte "MIN" en erken tarihtir, yani en yaşlı öğrenci. MIN/MAX'ın anlamı bağlama göre
  "yorumlanır".

**Örnek 3 (metin, en çok karıştırılan)**
- Ne istiyoruz? Alfabetik olarak ilk ve son öğrenci adı.
- Sorgu:
```sql
SELECT MIN(first_name) AS ilk_ad, MAX(first_name) AS son_ad FROM students;
```
- Sonuç:

| ilk_ad | son_ad |
|--------|--------|
| Ali    | Zeynep |

- Ne anlıyoruz? Metinde "küçük" alfabetik olarak **önce gelen**, "büyük" ise **sonra gelen**
  demektir. Sayı gibi düşün: A harfi küçük, Z harfi büyüktür.

**En kolay hatırlama yolu:** `MAX(x)`, `ORDER BY x` yapsaydın **en sonda** göreceğin değerdir.
`MIN(x)` ise en başta göreceğin. Aynı listeye bak:

```sql
SELECT first_name FROM students ORDER BY first_name;
```
- Sonuç (14 satırın ilk ve son birkaçı):

| first_name |
|------------|
| **Ali** ← MIN bunu verir |
| Ali |
| Ayşe |
| … |
| Selin |
| **Zeynep** ← MAX bunu verir |

**⚠️ En sık yapılan yanlış: `MAX` "en uzun metin" DEĞİLDİR.**

Çocukların çoğu `MAX(first_name)` deyince "en uzun ad" bekliyor. Değil. Karşılaştır:

```sql
SELECT MAX(first_name) AS max_ad, MAX(LENGTH(first_name)) AS en_uzun_harf_sayisi
FROM students;
```
- Sonuç:

| max_ad | en_uzun_harf_sayisi |
|--------|---------------------|
| Zeynep | 6 |

- Ne anlıyoruz? `MAX(first_name)` alfabetik son olan **"Zeynep"** adını verdi. `MAX(LENGTH(...))`
  ise en uzun adın kaç harf olduğunu (6) verdi. İkisi farklı sorular: biri **hangi ad**, diğeri
  **kaç harf**. Bu örnekte tesadüfen ikisi de Zeynep'e denk geliyor, ama "Mehmet" de 6 harfli;
  yani uzunluk sıralaması ile alfabetik sıralama aynı şey değil.

**Örnek 4 (metinde NULL yok sayılır)**
- Sorgu:
```sql
SELECT MIN(city) AS ilk_sehir, MAX(city) AS son_sehir,
       COUNT(city) AS sehri_bilinen, COUNT(*) AS toplam_ogrenci
FROM students;
```
- Sonuç:

| ilk_sehir | son_sehir | sehri_bilinen | toplam_ogrenci |
|-----------|-----------|---------------|----------------|
| Ankara    | İzmir     | 11            | 14 |

- Ne anlıyoruz? 14 öğrenci var ama şehri bilinen 11 tanesi. `MIN`/`MAX` o 3 NULL'ı görmezden
  geldi; NULL "bilinmiyor" demek olduğu için ne en küçük ne en büyük olabilir. Bu, `AVG`'nin
  NULL davranışıyla (4.2) aynı mantık.

### Sık hatalar & uyarılar
- **`MAX(metin)`'i "en uzun metin" sanmak.** Alfabetik son demektir; uzunlukla ilgisi yoktur.
  En uzunu istiyorsan `MAX(LENGTH(sütun))` yazarsın.
- MIN(birth_date)'i "en genç" sanmak. En erken tarih = en yaşlı kişidir. Anlamı bağlamla düşün.
- MIN/MAX ile satırın diğer bilgilerini (örn. en yüksek burslunun ADI) aynı sorguda almaya çalışmak.
  Bu, aggregate'in sınırı; "en yüksek burslu kim" için farklı yöntem gerekir (ORDER BY + LIMIT, ya da
  ileride subquery/window). Aggregate sadece o tek değeri verir, sahibini değil.

### Anlama soruları

**Soru 1 (yaz).** Tamamlanmamış/tüm fark etmeksizin, en yüksek ve en düşük dersi kredisini getir.
> **İpucu:** `MIN(credits)`, `MAX(credits)`.

> **Detaylı cevap:**
> ```sql
> SELECT MIN(credits) AS en_dusuk_kredi, MAX(credits) AS en_yuksek_kredi FROM courses;
> ```
> `courses` tablosundaki kredilere bakar: en düşük 4 (BUS101, PSY101, CS210), en yüksek 6 (CS101,
> CS201, MATH101). Sonuç tek satır: en_dusuk_kredi = 4, en_yuksek_kredi = 6. MIN/MAX hangi dersin
> bu krediye sahip olduğunu söylemez, sadece uç değerleri verir; "hangi ders" istersek ORDER BY +
> LIMIT gerekir.

**Soru 2 (tahmin et).** `MAX(first_name)` ne tür bir sonuç verir?
> **İpucu:** Metinde MAX ne demek?

> **Detaylı cevap:** Alfabetik olarak **en sondaki adı** verir (kabaca "Z'ye en yakın"). Metinlerde
> MIN/MAX alfabetik sıraya göre çalışır: MIN ilk, MAX son. Bizim öğrencilerde MAX(first_name) büyük
> ihtimalle "Zeynep" gibi sona yakın bir ad döndürür (kesin sonuç, ortamın harf sıralama/collation
> kuralına göre Türkçe karakterlerde biraz değişebilir). Önemli olan kavram: MIN/MAX sadece sayılarla
> sınırlı değil; sıralanabilen her tipte (sayı, tarih, metin) çalışır.

### Çıkış bileti
`MIN(birth_date)` en yaşlı öğrenciyi mi en genci mi gösterir, neden?

---

## Ders 4.4 — Aggregate'leri birleştirmek ve WHERE ile önce süzmek

### 🧑‍🏫 Öğretmen için
"Aggregate'leri tek sorguda toplayabiliriz, ve önce WHERE ile süzüp sonra özetleyebiliriz" de.
Tahtaya akışı çiz: önce WHERE satırları eler, SONRA aggregate kalanları özetler. Kasıtlı hata kur:
`WHERE COUNT(*) > 1` yazıp hata aldığını göster, "WHERE henüz sayım yokken çalışır, sayımı filtrelemek
HAVING'in işi (Ü5)" diye köprü kur.
- Sor: "İçecek kategorisinin ortalama fiyatı?" Önce WHERE ile içecekleri süz, sonra AVG.
- Herkes burada takılır: aggregate ile normal sütunu karıştırıp `SELECT category, AVG(price)` yazmak.
  "Tek özet istiyorsan normal sütun koyma; kategori kategori istersen GROUP BY gerek (Ü5)" de.

### Konu anlatımı
Birden çok aggregate'i tek sorguda yan yana koyabilirsin. Ayrıca `WHERE` ile önce satırları süzüp
**kalanları** özetleyebilirsin. Sıra önemli: **WHERE önce çalışır (satırları eler), aggregate sonra
çalışır (kalanları özetler).**

```sql
SELECT COUNT(*) AS adet, AVG(price) AS ort_fiyat
FROM products
WHERE category = 'İçecek';
```

İki kural, ileride çok işine yarayacak:
1. Aggregate'i `WHERE` içinde kullanamazsın (`WHERE COUNT(*) > 1` hata verir). Çünkü WHERE, sayım daha
   yapılmadan çalışır. Grupları/sayıları filtrelemek `HAVING`'in işi (Ü5).
2. Bir aggregate ile yan yana normal bir sütun seçersen (`SELECT category, AVG(price)`), tek özet satırı
   ile çok kategori çelişir; SQL hata verir. "Kategori başına" istiyorsan `GROUP BY` gerekir (Ü5).

> Mini slogan: **Önce WHERE eler, sonra aggregate özetler; sayıyı filtrelemek WHERE'in değil HAVING'in işidir.**

### Çözümlü örnekler

**Örnek 1 (WHERE + aggregate)**
- Ne istiyoruz? Sadece İçecek ürünlerinin sayısı ve ortalama fiyatı.
- Sorgu:
```sql
SELECT COUNT(*) AS adet, AVG(price) AS ort_fiyat FROM products WHERE category = 'İçecek';
```
- Sonuç: adet = 4, ort_fiyat = 22.5 (Filtre Kahve 25, Latte 40, Su 10, Çay 15; ortalama 90/4).
- Ne anlıyoruz? WHERE önce 4 içeceği süzdü, sonra AVG bu 4'ün ortalamasını aldı. Tüm ürünlerin
  ortalaması (30.625) ile karışmadı.

**Örnek 2 (çok aggregate bir arada)**
- Ne istiyoruz? Bursu olan öğrenciler için: kaç kişi, toplam, ortalama, en düşük, en yüksek.
- Sorgu:
```sql
SELECT COUNT(scholarship_amount) AS kisi, SUM(scholarship_amount) AS toplam,
       AVG(scholarship_amount) AS ortalama, MIN(scholarship_amount) AS en_dusuk,
       MAX(scholarship_amount) AS en_yuksek
FROM students;
```
- Sonuç: kisi=9, toplam=31000, ortalama=3444.44, en_dusuk=1500, en_yuksek=5000. Tek satırda tablonun
  burs özeti.

### Sık hatalar & uyarılar
- `WHERE COUNT(*) > 5` yazmak. Aggregate WHERE'de olmaz; o HAVING (Ü5).
- `SELECT department_id, AVG(...)` deyip GROUP BY koymamak -> hata. Bunu Ü5'te çözeceğiz.

### Anlama soruları

**Soru 1 (hata avı).** Bu sorgu neden hata verir?
```sql
SELECT AVG(price) FROM products WHERE COUNT(*) > 1;
```
> **İpucu:** WHERE ne zaman çalışıyor, COUNT ne zaman hesaplanıyor?

> **Detaylı cevap:** Çünkü `WHERE` içinde aggregate (`COUNT(*)`) kullanılamaz. WHERE, satırlar daha
> sayılıp özetlenmeden, her satıra tek tek bakarken çalışır; o aşamada henüz bir `COUNT(*)` değeri
> yoktur. Bir grubun/sonucun sayısına göre filtre yapmak istiyorsan bunun yeri `HAVING`'dir (Ü5'te
> göreceğiz). Eğer niyet "ürün sayısı 1'den fazlaysa ortalamayı göster" gibi bir şeyse, bu mantık
> normal WHERE ile değil, gruplama sonrası HAVING ile kurulur. Kural: WHERE satırları eler (sayımdan
> önce), HAVING grupları/özetleri eler (sayımdan sonra).

**Soru 2 (yaz).** İstanbul'daki öğrencilerin ortalama bursunu bul.
> **İpucu:** Önce WHERE ile İstanbul'u süz, sonra AVG.

> **Detaylı cevap:**
> ```sql
> SELECT AVG(scholarship_amount) AS ort_burs FROM students WHERE city = 'İstanbul';
> ```
> Önce `WHERE city = 'İstanbul'` 4 İstanbullu öğrenciyi süzer (Ayşe 5000, Ali Çelik 2000, Selin 5000,
> Okan NULL). Sonra `AVG`, bunların NULL olmayan burslarının ortalamasını alır: (5000+2000+5000)/3 =
> 4000 (Okan'ın bursu NULL olduğu için sayıya katılmaz, paydada 4 değil 3 vardır). Sonuç 4000. Burada
> hem "önce WHERE sonra aggregate" sırasını hem de AVG'nin NULL'ı dışladığını bir arada görüyoruz.

### Çıkış bileti
Bir sorguda WHERE mı önce çalışır yoksa aggregate mı, ve bu neden önemli?

---

## Pratik (editörde dene)

> Aşağıdaki görevleri Deneme Tahtasında (⌘K) kendin yaz, **Çalıştır**, sonucu gözle. Önce kendin
> dene, takılırsan ipucuna, en son cevaba bak. Seed: Kampüs.

**P1 (kolay).** [▶ Editörde dene] `products` tablosunda kaç ürün var?
> İpucu: "Kaç satır" -> COUNT(*).
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT COUNT(*) AS urun_sayisi FROM products;
> ```
> Sonuç: 8. COUNT(*) tüm satırları sayar.
> </details>

**P2 (kolay).** [▶ Editörde dene] Kaç öğrencinin e-postası kayıtlı (`email` NULL olmayan)?
> İpucu: COUNT(email).
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT COUNT(email) AS epostasi_olan FROM students;
> ```
> Sonuç: 14 (tüm öğrencilerin e-postası dolu). Eğer bazıları NULL olsaydı, COUNT(email) onları saymazdı.
> </details>

**P3 (orta).** [▶ Editörde dene] Öğrenciler kaç farklı şehirden geliyor (NULL hariç)?
> İpucu: "Kaç farklı" -> COUNT(DISTINCT ...).
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT COUNT(DISTINCT city) AS farkli_sehir FROM students;
> ```
> Sonuç: 4 (İstanbul, Ankara, İzmir, Bursa). NULL şehirler farklı değer olarak sayılmaz.
> </details>

**P4 (orta).** [▶ Editörde dene] Tamamlanmış (`status = 'completed'`) siparişlerin sayısını bul.
> İpucu: Önce WHERE ile completed'ları süz, sonra COUNT(*).
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT COUNT(*) AS tamamlanan FROM orders WHERE status = 'completed';
> ```
> Sonuç: 8. WHERE önce iptal/bekleyen siparişleri eler, COUNT kalanları sayar.
> </details>

**P5 (zorlayıcı).** [▶ Editörde dene] Yiyecek kategorisindeki ürünlerin ortalama fiyatını bul.
> İpucu: WHERE category = 'Yiyecek', sonra AVG(price).
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT AVG(price) AS ort_fiyat FROM products WHERE category = 'Yiyecek';
> ```
> Sonuç: 50 (Tost 45, Sandviç 55; ortalama 100/2). Önce süz, sonra ortala.
> </details>

**P6 (düşündürücü).** [▶ Editörde dene] `enrollments` tablosunda notu girilmiş kayıtların ortalama
notunu ve kaç kayıt olduğunu bul. Sonra düşün: bu ortalama 20 kayda mı, yoksa notu dolu olanlara mı
bölündü?
> İpucu: AVG(grade) ve COUNT(grade) yan yana.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT COUNT(grade) AS notlu_kayit, AVG(grade) AS ort_not FROM enrollments;
> ```
> `COUNT(grade)` = 16 (4 kayıtta not NULL, devam ediyor). AVG, toplamı 16'ya böler, 20'ye değil.
> Yani "devam eden" dersler ortalamaya hiç girmez. NULL'ın aggregate'teki davranışını bir kez daha
> görüyoruz.
> </details>

---

## Ünite 4 özeti (öğrenciye)
- **Aggregate**, çok satırı tek bir özet değere indirir; sonuç tek satır olur.
- `COUNT(*)` satır sayar; `COUNT(sütun)` NULL olmayanları; `COUNT(DISTINCT sütun)` farklı değerleri.
- `SUM`/`AVG`/`MIN`/`MAX` NULL'ları **yok sayar**. Özellikle **AVG, toplamı dolu değer sayısına böler**
  (tüm satıra değil); bilinmeyen, sıfır değildir.
- `MIN`/`MAX` sayıda, tarihte ve metinde çalışır; anlamı bağlama göre yorumlanır.
- Önce `WHERE` satırları eler, **sonra** aggregate özetler. Sayıyı/aggregate'i filtrelemek WHERE'de
  olmaz (o HAVING, Ü5). Aggregate ile normal sütunu birlikte istemek GROUP BY gerektirir (Ü5).

## 🧑‍🏫 Öğretmen notu (ünite geneli)
Bu ünite "tek özet" üretmeyi öğretti; bir sonraki ünite (GROUP BY) bunu "her grup için bir özet"e
çevirecek, ki bu öğrencinin SQL'de attığı en büyük zihinsel adımlardan biri. AVG'nin NULL tuzağı ve
"WHERE aggregate'i filtreleyemez" fikri, Ü5'teki HAVING için zemin hazırlıyor; ikisini de canlı
göstermek Ü5'i çok kolaylaştırır. P6'daki "20'ye mi 16'ya mı bölündü" anı, NULL'ı içselleştirmek için
birebir.
