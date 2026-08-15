# Ünite 3 — İfadeler, Tipler, Fonksiyonlar, COALESCE ve CASE

> Kavram etiketleri: `data-types`, `casting`, `string-functions`, `date-functions`, `coalesce`, `case-when`, `null-handling`
> Ön koşul: Ü0, Ü1, Ü2
> Kullanılan tablolar: students, products, courses, enrollments
> Tahmini süre: 55-65 dk
> Ünite sloganı: **"Veriyi olduğu gibi getirmekle kalmaz, ona şekil veririz."**

---

## Ders 3.1 — Veri tipleri ve tip dönüştürme (casting)

### 🧑‍🏫 Öğretmen için
Tahtaya üç hücre çiz: `5000`, `'5000'`, `2024-09-01`. Sınıfa sor: "Bunların hangisi sayı, hangisi
yazı, hangisi tarih? Üçü de '5000' gibi görünebilir ama SQL için tamamen farklılar." Sonra şu can
alıcı cümleyi söyle: "Bir sütunun tipi, o sütunla NE yapabileceğini belirler. Sayıyla çarpma
yaparsın, yazıyla yapamazsın; tarihten yıl çıkarırsın, yazıdan çıkaramazsın."
- Tahtaya yaz: `'10' + 5` ile `10 + 5`. Sor: "İkisi de 15 mi?" (Postgres `'10'`'u sayıya çevirip 15
  yapabilir, ama bu güvenme; niyetini açık yaz.)
- Kasıtlı hata göster: `WHERE birth_date = '2003'` yazıp neden tuhaf davrandığını tartış (tarih ile
  yıl-yazısı aynı şey değil).
- Herkes burada takılır: "tablo gösteriyor ama tip görünmüyor" derler. `students` tablosunun tip
  şemasını bir kez birlikte oku (id sayı, first_name metin, birth_date tarih, scholarship sayı).

### Neden / nerede işime yarar
Tip karışıklığı, başlangıçtaki "neden bu karşılaştırma çalışmadı / neden toplama yanlış çıktı"
sorularının yarısının sebebidir. Tipi anlamak, hataların yarısını daha doğmadan keser.

### Konu anlatımı
Her sütunun bir **veri tipi** vardır. En çok göreceğimiz dört tip:
- **Sayı**: tam sayı (`integer`) veya ondalıklı (`numeric`). Örn: `scholarship_amount`, `credits`. Tırnaksız yazılır.
- **Metin (`text`)**: yazı. Örn: `first_name`, `city`. Tek tırnak içinde yazılır: `'İstanbul'`.
- **Tarih/zaman (`date` / `timestamp`)**: örn: `birth_date`, `ordered_at`. Tek tırnaklı ama tarih
  formatında: `'2024-09-01'`.
- **Mantıksal (`boolean`)**: `TRUE` / `FALSE`. Örn: `event_attendance.attended`.

Bazen bir değeri başka tipe çevirmek isteriz, buna **cast** denir. İki yazımı var:
- `deger::tip` (Postgres kısa yolu): `'2024-09-01'::date`, `scholarship_amount::integer`
- `CAST(deger AS tip)` (standart): `CAST(price AS integer)`

> Mini slogan: **Tip, bir sütunla ne yapabileceğini belirler: sayıyla hesap, yazıyla metin işi, tarihle zaman işi.**

### Çözümlü örnekler

**Örnek 1 (cast ile tam sayıya yuvarlama benzeri kırpma)**
- Ne istiyoruz? Ürün fiyatlarını ondalıksız, tam sayı olarak görmek.
- Sorgu:
```sql
SELECT name, price, price::integer AS tam_fiyat FROM products LIMIT 3;
```
- Sonuç:

| name         | price | tam_fiyat |
|--------------|-------|-----------|
| Filtre Kahve | 25.00 | 25        |
| Latte        | 40.00 | 40        |
| Su           | 10.00 | 10        |

- Ne anlıyoruz? `::integer` ondalıklı sayıyı tam sayıya çevirir. (Dikkat: cast yuvarlayabilir; tam
  kontrol için ileride `ROUND` göreceğiz.)

**Örnek 2 (metin ile sayı farkı)**
- Ne istiyoruz? Tipin önemini görmek.
- Sorgu:
```sql
SELECT 10 + 5 AS sayisal, '10' || '5' AS metinsel;
```
- Sonuç: `sayisal = 15`, `metinsel = '105'`. Ne anlıyoruz? `+` sayılarda toplar (15), `||` metinlerde
  yan yana ekler ('105'). Aynı görünen "10" ve "5", tipe göre bambaşka davranır.
- Not: `||` burada sadece tip farkını göstermek için kullanıldı; ne işe yaradığını ve NULL ile nasıl
  davrandığını 3.2'de (Metin fonksiyonları) detaylı işleyeceğiz.

### Sık hatalar & uyarılar
- Sayı sütununu tırnakla yazmak (`WHERE credits = '6'`). Postgres çoğu zaman idare eder ama
  güvenmemeli; sayıyı sayı yaz.
- Tarihi düz yazı gibi karşılaştırmak (`birth_date = '2003'`). Tarih bir an değil tam gündür;
  yıl bilgisini çıkarmak için `EXTRACT` kullanılır (3.3).

### Anlama soruları

**Soru 1 (tahmin et).** `SELECT '7' || '7' AS a, 7 + 7 AS b;` sorgusunda `a` ve `b` ne olur?
> **İpucu:** `||` metin birleştirir, `+` sayı toplar.

> **Detaylı cevap:** `a = '77'`, `b = 14`. `||` metin birleştirme operatörüdür: `'7'` ve `'7'`
> yazılarını yan yana koyar, sonuç `'77'` metni olur. `+` ise sayısal toplama yapar: `7 + 7 = 14`.
> Burada gözle aynı görünen "7"ler, biri metin biri sayı bağlamında olduğu için tamamen farklı
> sonuç verir. Bu, tipin neden önemli olduğunun en net kanıtı: işlemi belirleyen şey, değerin
> "göründüğü" değil "tipi"dir. (`||`'i tüm detaylarıyla 3.2'de göreceğiz.)

**Soru 2 (yaz).** `students` tablosunda burs miktarını tam sayı olarak (`burs_tam` adıyla) getir.
> **İpucu:** `::integer` ya da `CAST(... AS integer)` kullan.

> **Detaylı cevap:**
> ```sql
> SELECT first_name, scholarship_amount, scholarship_amount::integer AS burs_tam FROM students;
> ```
> `::integer` ile ondalıklı `numeric` değeri tam sayıya çevirdik (5000.00 -> 5000). Burada bir NULL
> inceliği var: bursu NULL olan öğrencilerde `NULL::integer` yine `NULL` kalır; cast bilinmeyeni bir
> sayıya dönüştürmez, bilinmeyen bilinmeyen kalır. Bunu "bilinmiyorsa 0 yaz" haline getirmek istersek
> COALESCE gerekir (3.4).

### Çıkış bileti
`'5' + '5'` ile `'5' || '5'` aynı sonucu mu verir? Neden?

---

## Ders 3.2 — Metin fonksiyonları

### 🧑‍🏫 Öğretmen için
Sınıfa "isimleri tek sütunda birleştirelim mi?" diye sor, `first_name || ' ' || last_name` yaz,
çalıştır, "Ayşe Yılmaz" çıksın, küçük bir alkış anı. Sonra şu numarayı yap: bir öğrencinin şehrini
NULL olanla birleştir (`'Şehir: ' || city`), Mehmet'te sonucun boş (NULL) geldiğini göster ve sor:
"Niye Mehmet kayboldu?" Cevabı onlara buldur: NULL'a değen birleştirme de NULL olur. Bu, 3.4'teki
COALESCE'e mükemmel köprü.
- Tahtaya yaz: `LENGTH('Ayşe')` kaç? (4). "Boşluk da bir karakterdir" diye ekle: `LENGTH('Ali Veli')`.
- Türkçe uyarısı: `UPPER`/`LOWER` Türkçe'nin i/İ inceliğinde sürpriz yapabilir; örnekleri sade tut.
- Herkes burada takılır: `||` ile `+`'yı karıştırırlar. "Yazıyı toplayamazsın, yapıştırırsın" de.

### Konu anlatımı
Metinler üzerinde çalışan kullanışlı fonksiyonlar:
- `LOWER(x)` / `UPPER(x)`: küçük / büyük harfe çevirir.
- `LENGTH(x)`: karakter sayısı (boşluklar dahil).
- `TRIM(x)`: baştaki ve sondaki boşlukları kırpar.
- `x || y`: iki metni birleştirir (yapıştırır).

```sql
SELECT first_name || ' ' || last_name AS tam_ad FROM students;
```

Önemli NULL halkası: **birleştirmede parçalardan biri NULL ise sonuç NULL olur.** Çünkü
"bilinmeyen bir parçayı içeren metin" de bilinmezdir. Bu yüzden NULL olabilen sütunları
birleştirirken COALESCE ile koruma alırız (3.4).

> Mini slogan: **`||` metni yapıştırır; içine NULL girerse tüm sonuç NULL olur.**

### Çözümlü örnekler

**Örnek 1 (birleştirme)**
- Ne istiyoruz? Öğrencinin tam adını tek sütunda.
- Sorgu:
```sql
SELECT first_name || ' ' || last_name AS tam_ad FROM students LIMIT 3;
```
- Sonuç: `Ayşe Yılmaz`, `Mehmet Demir`, `Zeynep Kaya`. Ne anlıyoruz? Üç parçayı (ad, boşluk, soyad)
  yapıştırdık. Bu öğrenciler için sorun yok çünkü ad ve soyad dolu.

**Örnek 2 (NULL tuzağı)**
- Ne istiyoruz? "Şehir: X" biçiminde bir etiket.
- Sorgu:
```sql
SELECT first_name, 'Şehir: ' || city AS etiket FROM students LIMIT 4;
```
- Sonuç:

| first_name | etiket            |
|------------|-------------------|
| Ayşe       | Şehir: İstanbul   |
| Mehmet     | NULL              |
| Zeynep     | Şehir: Ankara     |
| Can        | NULL              |

- Ne anlıyoruz? Mehmet ve Can'ın şehri NULL olduğu için tüm etiket NULL oldu. Etiketin sabit "Şehir:"
  kısmı bile kayboldu, çünkü NULL bütün birleştirmeyi yutar. Çözümü 3.4'te (COALESCE) göreceğiz.

**Örnek 3 (uzunluk)**
- Ne istiyoruz? Adı ve adının harf sayısı.
- Sorgu:
```sql
SELECT first_name, LENGTH(first_name) AS harf_sayisi FROM students ORDER BY harf_sayisi DESC LIMIT 3;
```
- Sonuç: Mehmet 6, Zeynep 6, ... (6 harfliler üstte). Ne anlıyoruz? `LENGTH` karakterleri sayar;
  sıralama ile en uzun adları bulduk.

### Sık hatalar & uyarılar
- `+` ile metin birleştirmeye çalışmak. Postgres'te metin birleştirme `||` iledir, `+` değil.
- NULL'lı sütunu doğrudan birleştirip sonucun boş gelmesine şaşırmak. NULL olabilen sütunları
  COALESCE ile sarmala.

### Anlama soruları

**Soru 1 (tahmin et).** `SELECT 'Merhaba ' || NULL AS sonuc;` ne döndürür?
> **İpucu:** Birleştirmeye NULL girerse ne olur?

> **Detaylı cevap:** `sonuc = NULL`. "Merhaba " metni dolu olsa da, ona NULL (bilinmeyen) bir parça
> eklediğimiz an sonucun tamamı NULL olur. SQL şöyle düşünür: "bilinmeyen bir şeyle biten metin de
> bilinmezdir." Sezgiye aykırı gelebilir (en azından "Merhaba " kalsın beklersin), ama kural budur.
> Bu yüzden NULL olabilen alanları birleştirmeden önce `COALESCE(x, '')` gibi bir varsayılanla
> korumak gerekir, yoksa koca metin tek bir NULL yüzünden kaybolur.

**Soru 2 (yaz).** Ürünlerin adını büyük harfle (`buyuk_ad` adıyla) getir.
> **İpucu:** `UPPER(...)` kullan.

> **Detaylı cevap:**
> ```sql
> SELECT name, UPPER(name) AS buyuk_ad FROM products;
> ```
> `UPPER`, metni büyük harfe çevirir: "Filtre Kahve" -> "FILTRE KAHVE". Bu, özellikle büyük/küçük
> harf duyarlı karşılaştırmalarda iki tarafı da aynı kalıba sokmak için kullanılır (örneğin
> `WHERE UPPER(city) = 'ANKARA'`). Not: Türkçe'ye özgü harflerde (i/İ) `UPPER`/`LOWER` bazı
> ortamlarda beklenmedik davranabilir; bu yüzden örneklerimizi sade tuttuk.

### Çıkış bileti
`'Ad: ' || city` ifadesi, şehri NULL olan bir öğrenci için ne döndürür?

---

## Ders 3.3 — Tarih ile çalışmak

### 🧑‍🏫 Öğretmen için
"Tarih sadece bir yazı değil, üzerinde hesap yapabileceğin bir şey" diyerek başla. Tahtaya
`'2026-06-07' - '2024-09-01'` yaz ve "bunun farkı kaç gün?" diye sor; SQL'in tarih farkını gün olarak
verebildiğini göster. Sonra doğum tarihinden yıl çıkarmayı `EXTRACT(YEAR FROM birth_date)` ile göster.
- Önemli uyarı (tahtaya yaz): "Bugün" demek olan `CURRENT_DATE` her gün değişir; bu yüzden yaş gibi
  hesaplar "bugüne göre" değişkendir. Sınavda sabit sonuç beklemeyin.
- Kasıtlı hata: `WHERE birth_date = 2003` yaz, neden çalışmadığını tartış (2003 sayı, birth_date tarih).
- Herkes burada takılır: tarih formatı. Hep `'YYYY-AA-GG'` (`'2024-09-01'`) yazın deyin.

### Konu anlatımı
Tarihler hesaplanabilir. Sık kullanılanlar:
- `CURRENT_DATE`: bugünün tarihi (çalıştırıldığı güne göre).
- `EXTRACT(YEAR FROM tarih)`: tarihten yıl (ya da `MONTH`, `DAY`) çeker.
- `AGE(tarih)`: bir tarih ile bugün arasındaki süreyi yıl/ay/gün olarak verir.
- İki tarihi çıkarınca (`tarih1 - tarih2`) aradaki **gün** sayısını alırsın.

```sql
SELECT first_name, birth_date, EXTRACT(YEAR FROM birth_date) AS dogum_yili FROM students;
```

> Mini slogan: **Tarih bir yazı değil; ondan yıl çekebilir, iki tarih arasını gün olarak ölçebilirsin.**

### Çözümlü örnekler

**Örnek 1 (yıl çekme, sabit sonuç)**
- Ne istiyoruz? Her öğrencinin doğum yılı.
- Sorgu:
```sql
SELECT first_name, birth_date, EXTRACT(YEAR FROM birth_date) AS dogum_yili
FROM students ORDER BY dogum_yili LIMIT 3;
```
- Sonuç:

| first_name | birth_date | dogum_yili |
|------------|------------|------------|
| Burak      | 2001-10-25 | 2001       |
| Mehmet     | 2002-11-30 | 2002       |
| Ali        | 2002-05-15 | 2002       |

- Ne anlıyoruz? `EXTRACT(YEAR ...)` tarihten sadece yılı verir. Bu sonuç sabittir, çünkü doğum tarihi
  değişmez.

**Örnek 2 (bugüne göre yaş, değişken sonuç)**
- Ne istiyoruz? Yaklaşık yaş.
- Sorgu:
```sql
SELECT first_name, EXTRACT(YEAR FROM AGE(birth_date)) AS yas FROM students LIMIT 3;
```
- Ne anlıyoruz? `AGE(birth_date)`, doğum tarihinden bugüne kadar geçen süreyi verir; `EXTRACT(YEAR ...)`
  ile yıl kısmını alırız. Bu sonuç **bugünün tarihine göre** değişir; yarın çalıştırırsan biri bir yaş
  büyümüş olabilir. Bu yüzden bu tür sorularda "kesin şu sayı" yerine "bugüne göre" deriz.

### Sık hatalar & uyarılar
- Tarihi sayı gibi yazmak (`= 2003`). Yıl karşılaştırması için `EXTRACT(YEAR FROM birth_date) = 2003`.
- Tarih formatını karıştırmak. Postgres'te güvenli format `'YYYY-MM-DD'`.
- `CURRENT_DATE` içeren sorgunun sonucunu "sabit doğru cevap" sanmak; o, güne bağlıdır.

### Anlama soruları

**Soru 1 (yaz).** 2004 yılında doğan öğrencileri (ad ve doğum tarihi) getir.
> **İpucu:** `EXTRACT(YEAR FROM birth_date)` ile yılı çekip karşılaştır.

> **Detaylı cevap:**
> ```sql
> SELECT first_name, birth_date FROM students WHERE EXTRACT(YEAR FROM birth_date) = 2004;
> ```
> `EXTRACT(YEAR FROM birth_date)`, her öğrencinin doğum yılını verir; bunu `= 2004` ile süzeriz.
> Sonuç: Zeynep, Ali Vural, Selin, Okan (2004 doğumlular). Dikkat: `WHERE birth_date = 2004` yazsaydık
> hata ya da boş sonuç olurdu, çünkü `birth_date` bir tarihtir (tam gün), `2004` ise bir sayı; ikisi
> aynı tip değil. Yıl karşılaştırması için yılı açıkça çekmemiz gerekir.

**Soru 2 (kavram).** `EXTRACT(YEAR FROM AGE(birth_date))` ile bulduğun yaş neden "sabit doğru cevap"
sayılmaz?
> **İpucu:** `AGE` neye göre hesaplıyor?

> **Detaylı cevap:** Çünkü `AGE(birth_date)` bugünün tarihini temel alır ve bugün her gün değişir.
> Bugün hesapladığın yaş ile altı ay sonra hesapladığın yaş farklı olabilir (öğrenci yaş günü
> geçince bir artar). Bu yüzden yaş gibi "şimdiye göre" hesaplar zamana bağlıdır ve otomatik
> değerlendirmede sabit bir sayı beklenemez. Buna karşılık `EXTRACT(YEAR FROM birth_date)` (doğum
> yılı) sabittir, çünkü doğum tarihi hiç değişmez. Ders: bir sonucun sabit mi değişken mi olduğunu
> anlamak için "bu hesap bugüne bağlı mı?" diye sor.

### Çıkış bileti
`birth_date` ile bir öğrencinin doğum yılını nasıl elde edersin?

---

## Ders 3.4 — COALESCE: NULL'a varsayılan değer

### 🧑‍🏫 Öğretmen için
Bu ders NULL spiralinin can alıcı halkası. 3.2'deki "Mehmet kayboldu" anını hatırlat: "NULL bütün
birleştirmeyi yutmuştu, değil mi? Şimdi NULL'a 'eğer yoksa şunu kullan' demeyi öğreniyoruz."
`COALESCE(city, 'Bilinmiyor')` yaz, Mehmet'in artık "Bilinmiyor" geldiğini göster, rahatlama anı.
- Tahtaya yaz: `COALESCE(NULL, NULL, 5, 10)` kaç? (5). "Soldan sağa ilk dolu değeri seçer" de.
- Vurgu: COALESCE veriyi değiştirmez; sadece bu sorgunun çıktısında NULL'ı doldurur.
- Herkes burada takılır: "NULL'ı 0 yapmak her zaman doğru mu?" Tartış: bilinmeyen burs ile 0 burs
  aynı şey değil; bazen 0 koymak yanlış olur. Bağlama göre karar.

### Konu anlatımı
`COALESCE(a, b, c, ...)`, verdiğin değerleri soldan sağa tarar ve **ilk NULL olmayanı** döndürür.
En yaygın kullanımı: bir sütun NULL ise yerine anlamlı bir varsayılan koymak.

```sql
SELECT first_name, COALESCE(city, 'Bilinmiyor') AS sehir FROM students;
```

Burada şehir doluysa şehir gelir; NULL ise "Bilinmiyor" gelir. Böylece 3.2'deki "etiket kayboldu"
sorunu çözülür ve aritmetikte de NULL'ı yönetebiliriz (`COALESCE(scholarship_amount, 0)`).

Ama dikkat: NULL'ı bir değere çevirmek **her zaman** doğru değildir. "Bilinmeyen burs"u 0 yapmak,
ortalama hesabında yanlış sonuç doğurabilir (bilinmeyeni sıfır saymış olursun). COALESCE güçlü bir
araç, ama "bu varsayılan burada anlamlı mı?" diye düşünerek kullan.

> Mini slogan: **COALESCE, "doluysa onu, boşsa şunu kullan" demektir; ama varsayılanın anlamlı olduğundan emin ol.**

### Çözümlü örnekler

**Örnek 1 (metinde varsayılan)**
- Ne istiyoruz? Şehir NULL ise "Bilinmiyor" göster.
- Sorgu:
```sql
SELECT first_name, COALESCE(city, 'Bilinmiyor') AS sehir FROM students LIMIT 4;
```
- Sonuç:

| first_name | sehir      |
|------------|------------|
| Ayşe       | İstanbul   |
| Mehmet     | Bilinmiyor |
| Zeynep     | Ankara     |
| Can        | Bilinmiyor |

**Örnek 2 (birleştirmeyi kurtarma)**
- Ne istiyoruz? 3.2'deki "Şehir: X" etiketi, NULL'da bile bozulmasın.
- Sorgu:
```sql
SELECT first_name, 'Şehir: ' || COALESCE(city, 'Bilinmiyor') AS etiket FROM students LIMIT 4;
```
- Sonuç: Mehmet için artık "Şehir: Bilinmiyor". Ne anlıyoruz? Önce NULL'ı doldurduk, sonra
  birleştirdik; böylece koca etiket bir NULL yüzünden kaybolmadı.

**Örnek 3 (hesapta varsayılan, dikkatle)**
- Ne istiyoruz? Bursu olmayanları 0 sayarak göstermek (rapor amacıyla).
- Sorgu:
```sql
SELECT first_name, COALESCE(scholarship_amount, 0) AS burs FROM students;
```
- Ne anlıyoruz? NULL burslular 0 görünür. Bu bir gösterim tercihi; ama "ortalama burs" hesaplarken
  bu 0'ların ortalamayı düşüreceğini unutma. Bilinmeyeni 0 saymak her zaman masum değildir.

### Sık hatalar & uyarılar
- COALESCE'in tablodaki NULL'ları kalıcı doldurduğunu sanmak. Hayır, sadece bu sorgunun çıktısında.
- Bilinmeyeni körü körüne 0/'' yapıp istatistiği bozmak. Varsayılanın o bağlamda anlamlı olup
  olmadığını düşün.

### Anlama soruları

**Soru 1 (tahmin et).** `SELECT COALESCE(NULL, NULL, 'üç', 'dört');` ne döndürür?
> **İpucu:** Soldan sağa ilk NULL olmayan.

> **Detaylı cevap:** `'üç'` döner. COALESCE argümanları soldan sağa tarar: ilk iki değer NULL, üçüncü
> değer `'üç'` ilk dolu (NULL olmayan) değer olduğu için onu döndürür ve durur, dördüncüye hiç bakmaz.
> COALESCE'i "yedek plan zinciri" gibi düşünebilirsin: önce birinciyi dene, yoksa ikinciyi, yoksa
> üçüncüyü... ilk eli dolu olanı al.

**Soru 2 (yaz).** Öğrencinin adını ve bursunu getir; bursu NULL olanlarda burs yerine `-1` yaz
(`burs` adıyla).
> **İpucu:** `COALESCE(scholarship_amount, -1)`.

> **Detaylı cevap:**
> ```sql
> SELECT first_name, COALESCE(scholarship_amount, -1) AS burs FROM students;
> ```
> Bursu olan öğrencilerde gerçek miktar, NULL olanlarda `-1` görünür. Burada `-1`'i bilinçli bir
> "işaret değeri" olarak seçtik (gerçek burs negatif olamayacağı için, "-1 = bilinmiyor" diye okunur).
> Bu, bazen 0 yerine tercih edilir çünkü 0 gerçek bir burs miktarı gibi karışabilirken -1 açıkça
> "bu gerçek değil" der. Yine de en temizi, mümkünse hesapları NULL'ı olduğu gibi bırakıp `IS NULL`
> ile yönetmektir; işaret değerleri pratik ama dikkat ister.

### Çıkış bileti
COALESCE ne işe yarar ve "bilinmeyen bursu 0 yapmak" neden her zaman doğru olmayabilir?

---

## Ders 3.5 — CASE WHEN: koşullu sütun

### 🧑‍🏫 Öğretmen için
"Şimdi sorgu içinde karar vereceğiz: nota bakıp 'Geçti' ya da 'Kaldı' yazdıracağız." Tahtaya basit
bir `CASE` yaz, çalıştır, herkesin gözünde şimşek çaksın çünkü bu çok güçlü görünür. Sonra TUZAĞI
kasıtlı kur: NULL notlu (devam eden) bir kaydın `ELSE` yüzünden "Kaldı" damgası yediğini göster ve
sor: "Bu adil mi? Çocuk daha dersi bitirmedi ki." Cevabı birlikte düzeltin: önce `WHEN grade IS NULL`.
- Tahtaya yaz: CASE'in sırayla baktığını, ilk uyan WHEN'de durduğunu vurgula.
- Herkes burada takılır: `END` yazmayı unuturlar. "CASE açtıysan END ile kapat" diye tekrarlat.
- Benzetme: CASE = "eğer... değilse eğer... değilse şu" merdiveni.

### Neden / nerede işime yarar
Ham veriyi insanın okuyacağı etiketlere çevirmek (geçti/kaldı, ucuz/orta/pahalı, aktif/pasif) her
raporun ekmek peyniri. CASE, SQL içinde "if/else" kurmanın yoludur.

### Konu anlatımı
`CASE`, koşullara göre farklı değer üreten bir ifadedir:

```sql
CASE
  WHEN kosul1 THEN sonuc1
  WHEN kosul2 THEN sonuc2
  ELSE varsayilan
END
```

SQL koşulları **yukarıdan aşağıya** dener, **ilk doğru olan** WHEN'in sonucunu verir ve durur.
Hiçbiri uymazsa `ELSE` çalışır; `ELSE` yoksa sonuç NULL olur.

NULL halkası burada da var: `grade >= 50` koşulu, `grade` NULL ise "doğru" olmaz (bilinmiyor),
dolayısıyla o satır `ELSE`'e düşer. Eğer `ELSE 'Kaldı'` yazdıysan, **dersi daha bitirmemiş (NULL
notlu) bir öğrenciyi yanlışlıkla "Kaldı" damgalarsın.** Doğrusu, NULL'ı en başta ayrı ele almaktır.

> Mini slogan: **CASE ilk uyan koşulda durur; NULL hiçbir karşılaştırmayı "doğru" yapmaz, o yüzden onu en başta yakala.**

### Çözümlü örnekler

**Örnek 1 (yanlış sürüm, tuzağı görelim)**
- Ne istiyoruz? Nota göre geçti/kaldı.
- Sorgu (eksik):
```sql
SELECT student_id, grade,
  CASE WHEN grade >= 50 THEN 'Geçti' ELSE 'Kaldı' END AS durum
FROM enrollments;
```
- Sorun: notu NULL olan (devam eden) kayıtlar `ELSE` yüzünden "Kaldı" görünür. Örneğin (1,2) kaydı
  notu NULL, ama burada "Kaldı" der. Bu yanlış.

**Örnek 2 (doğru sürüm, NULL'ı önce yakala)**
- Sorgu:
```sql
SELECT student_id, grade,
  CASE
    WHEN grade IS NULL THEN 'Devam ediyor'
    WHEN grade >= 50 THEN 'Geçti'
    ELSE 'Kaldı'
  END AS durum
FROM enrollments
ORDER BY student_id;
```
- Sonuç (birkaç satır):

| student_id | grade | durum        |
|------------|-------|--------------|
| 1          | 95.00 | Geçti        |
| 1          | NULL  | Devam ediyor |
| 7          | 55.00 | Geçti        |
| 12         | 48.00 | Kaldı        |

- Ne anlıyoruz? Önce NULL'ı yakaladığımız için devam eden dersler "Devam ediyor" oldu; 50 ve üzeri
  "Geçti", altı "Kaldı". Adil ve doğru.

**Örnek 3 (kategori etiketi)**
- Ne istiyoruz? Ürünleri fiyatına göre etiketle.
- Sorgu:
```sql
SELECT name, price,
  CASE
    WHEN price < 20 THEN 'Ucuz'
    WHEN price < 45 THEN 'Orta'
    ELSE 'Pahalı'
  END AS fiyat_grubu
FROM products ORDER BY price;
```
- Ne anlıyoruz? Sırayla denenir: 20'nin altı "Ucuz", değilse 45'in altı "Orta", o da değilse
  "Pahalı". Sıralamanın önemine dikkat: koşullar üst üste binmesin diye küçükten büyüğe yazdık.

### Sık hatalar & uyarılar
- `END` yazmayı unutmak. Her `CASE` bir `END` ile kapanır.
- NULL'ı `ELSE`'e bırakıp yanlış etiketlemek (devam eden dersi "Kaldı" yapmak gibi). NULL'ı en başta
  `WHEN ... IS NULL` ile ele al.
- Koşulları yanlış sırada yazıp üst üste bindirmek. CASE ilk uyanı seçtiği için, dar koşulu üste,
  geniş koşulu alta koy.

### Anlama soruları

**Soru 1 (hata avı).** Bu sorgu neden devam eden dersleri "Kaldı" gösterir, nasıl düzeltilir?
```sql
SELECT student_id,
  CASE WHEN grade >= 50 THEN 'Geçti' ELSE 'Kaldı' END AS durum
FROM enrollments;
```
> **İpucu:** `grade` NULL olduğunda `grade >= 50` koşulu ne sonuç verir?

> **Detaylı cevap:** Çünkü notu NULL olan kayıtlarda `grade >= 50` koşulu "doğru" değil "bilinmiyor"
> sonucunu verir; CASE bunu "doğru değil" sayıp `ELSE`'e düşürür ve "Kaldı" yazar. Oysa o öğrenci
> kalmadı, dersi henüz bitirmedi. Düzeltme, NULL'ı en başta ayrı bir dal olarak yakalamak:
> ```sql
> SELECT student_id,
>   CASE
>     WHEN grade IS NULL THEN 'Devam ediyor'
>     WHEN grade >= 50 THEN 'Geçti'
>     ELSE 'Kaldı'
>   END AS durum
> FROM enrollments;
> ```
> Artık NULL notlular "Devam ediyor" olur. Genel kural: CASE'te NULL ihtimali varsa, onu ilk `WHEN`
> olarak ele al, yoksa sessizce yanlış kategoriye düşer.

**Soru 2 (yaz).** Öğrencileri bursuna göre etiketle: NULL ise 'Burssuz', 3000 ve üzeri 'Yüksek burs',
diğerleri 'Düşük burs' (`burs_grubu` adıyla).
> **İpucu:** Önce `IS NULL`, sonra `>= 3000`, sonra `ELSE`.

> **Detaylı cevap:**
> ```sql
> SELECT first_name, scholarship_amount,
>   CASE
>     WHEN scholarship_amount IS NULL THEN 'Burssuz'
>     WHEN scholarship_amount >= 3000 THEN 'Yüksek burs'
>     ELSE 'Düşük burs'
>   END AS burs_grubu
> FROM students;
> ```
> Sırayı bilinçli kurduk: önce NULL'ları "Burssuz" diye yakaladık (yoksa `>= 3000` onlarda
> "bilinmiyor" verir ve `ELSE`'e düşüp yanlışlıkla "Düşük burs" olurlardı). Sonra 3000 ve üzeri
> "Yüksek burs", kalanlar (2000, 2500, 1500 gibi) "Düşük burs" olur. Bu, NULL'ı en başta ele almanın
> neden önemli olduğunu bir kez daha gösteriyor: NULL'lar "Burssuz" mu yoksa "bilinmeyen burs" mu, bu
> bağlama göre karar verilir; burada "Burssuz" mantıklı bir etiket.

### Çıkış bileti
CASE içinde NULL olabilen bir sütunu neden en başta `WHEN ... IS NULL` ile ele alırız?

---

## Pratik (editörde dene)

> Deneme Tahtasında (⌘K) dene. Önce tahmin et, çalıştır, gözle, sonra cevaba bak. Seed: Kampüs.

**P1 (kolay).** [▶ Editörde dene] Her öğrencinin ad ve soyadını tek sütunda ('tam_ad') birleştir.
> İpucu: first_name || ' ' || last_name.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT first_name || ' ' || last_name AS tam_ad FROM students;
> ```
> 'Ayşe Yılmaz', 'Mehmet Demir'... `||` metinleri yapıştırır. (Ad/soyad dolu olduğu için NULL sorunu yok.)
> </details>

**P2 (orta).** [▶ Editörde dene] Her öğrencinin adını ve doğum yılını getir.
> İpucu: EXTRACT(YEAR FROM birth_date).
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT first_name, EXTRACT(YEAR FROM birth_date) AS dogum_yili FROM students ORDER BY dogum_yili;
> ```
> Tarihten yılı çektik (sabit sonuç). `birth_date = 2003` yazmak hatalı olurdu (tarih vs sayı).
> </details>

**P3 (orta, COALESCE).** [▶ Editörde dene] Her öğrencinin adını ve şehrini getir; şehir NULL ise
'Bilinmiyor' yaz.
> İpucu: COALESCE(city, 'Bilinmiyor').
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT first_name, COALESCE(city, 'Bilinmiyor') AS sehir FROM students;
> ```
> Mehmet, Can, Merve artık 'Bilinmiyor'. COALESCE ilk dolu değeri verir; NULL'a varsayılan koyar.
> </details>

**P4 (zorlayıcı, CASE + NULL).** [▶ Editörde dene] enrollments'ta her kaydın durumunu etiketle: not NULL
ise 'Devam ediyor', >= 50 ise 'Geçti', değilse 'Kaldı'.
> İpucu: CASE WHEN grade IS NULL THEN ... WHEN grade >= 50 THEN ... ELSE ... END. NULL'ı en başta yakala!
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT student_id, grade,
>   CASE
>     WHEN grade IS NULL THEN 'Devam ediyor'
>     WHEN grade >= 50 THEN 'Geçti'
>     ELSE 'Kaldı'
>   END AS durum
> FROM enrollments;
> ```
> NULL'ı en başta yakaladık; yoksa devam eden dersler yanlışlıkla 'Kaldı' olurdu (ELSE'e düşerlerdi).
> </details>

**P5 (düşündürücü, CASE).** [▶ Editörde dene] Ürünleri fiyatına göre etiketle: < 20 'Ucuz', < 45 'Orta',
yoksa 'Pahalı'.
> İpucu: CASE WHEN price < 20 ... WHEN price < 45 ... ELSE 'Pahalı' END. Sıra önemli (dar koşul üstte).
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT name, price,
>   CASE WHEN price < 20 THEN 'Ucuz' WHEN price < 45 THEN 'Orta' ELSE 'Pahalı' END AS grup
> FROM products ORDER BY price;
> ```
> CASE ilk uyan koşulda durur; koşulları küçükten büyüğe sıraladık ki üst üste binmesin.
> </details>

---

## Ünite 3 özeti (öğrenciye)
- Her sütunun bir **tipi** vardır (sayı, metin, tarih, boolean) ve tip, onunla ne yapabileceğini belirler.
- `::tip` veya `CAST(... AS tip)` ile dönüştürme yapılır.
- Metin: `||` birleştirir, `LOWER/UPPER/LENGTH/TRIM` işler. **Birleştirmeye NULL girerse sonuç NULL.**
- Tarih: `EXTRACT(YEAR FROM ...)` yıl çeker, `AGE`/`CURRENT_DATE` bugüne bağlıdır (değişken sonuç).
- `COALESCE(a, b, ...)` ilk dolu değeri verir; NULL'a varsayılan koyar, ama varsayılan anlamlı olmalı.
- `CASE WHEN ... THEN ... ELSE ... END` koşullu sütun üretir; ilk uyan dalda durur; **NULL'ı en başta yakala.**

## 🧑‍🏫 Öğretmen notu (ünite geneli)
Bu ünite NULL spiralinin üçüncü büyük durağı (aritmetik Ü1, filtreleme Ü2, şimdi birleştirme/COALESCE/
CASE). Öğrenci buradan "NULL bir değer değil, onu ya yakalarım ya doldururum" sezgisiyle çıkmalı.
CASE'in NULL tuzağı (devam eden dersi "Kaldı" sanmak) sınıfta en çok "aaa" dedirten an; mutlaka canlı
göster. Bir sonraki ünite Aggregate I: tek tabloyu özetleme, ve orada NULL bir kez daha karşımıza
çıkacak (COUNT(*) vs COUNT(sütun)).
