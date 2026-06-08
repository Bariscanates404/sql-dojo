# Ünite 2 — WHERE: Satırları Filtrelemek (ve NULL'ın İlk Sınavı)

> Kavram etiketleri: `where-compare`, `and-or-not`, `paren-precedence`, `between-in`, `like-pattern`, `null-comparison`
> Ön koşul: Ü0, Ü1
> Kullanılan tablolar: students, products, enrollments, courses
> Tahmini süre: 50-60 dk
> Ünite sloganı: **"WHERE her satıra tek tek 'sen kalıyor musun?' diye sorar."**

---

## Ders 2.1 — Karşılaştırma ile filtreleme

### 🧑‍🏫 Öğretmen için
"Şimdiye kadar bütün satırları getiriyorduk. Ama genelde hepsini değil, bir kısmını isteriz: 'sadece
İstanbul'dakiler', 'bursu 3000'den fazla olanlar'. İşte satır eleme işi `WHERE`'in." Tahtaya tabloyu
çiz, `WHERE`'i "her satıra tek tek bakan bir kapı görevlisi" gibi anlat: koşul doğruysa içeri alır,
değilse almaz.
- Sorabileceğin soru: "14 öğrenciden `WHERE city = 'İstanbul'` kaçını geçirir?"

### Neden / nerede işime yarar
Gerçek tablolar milyonlarca satır olabilir. Asıl beceri "hepsini getirmek" değil, "tam ihtiyacın olan
satırları süzmek". WHERE, SQL'in en çok kullanılan filtreleme aracıdır.

### Konu anlatımı
`WHERE`, `FROM`'dan sonra gelir ve bir **koşul** alır. SQL her satıra bakar, koşul o satır için
doğruysa (true) satırı sonuca alır, değilse atar.

Karşılaştırma operatörleri:
- `=` eşit
- `<>` (veya `!=`) eşit değil
- `<` küçük, `>` büyük, `<=` küçük eşit, `>=` büyük eşit

```sql
SELECT first_name, city FROM students WHERE city = 'İstanbul';
```

Çok önemli bir ayrıntı: metin değerleri **tek tırnak** içine alınır (`'İstanbul'`). Tek tırnak "bu bir
metin değeridir" der. Çift tırnak ise (Ü1) sütun/alias adları içindir. Sayılarda tırnak yok:
`WHERE scholarship_amount > 3000`.

> Mini slogan: **WHERE her satıra koşulu sorar; cevap "doğru" ise satır kalır.**

### Çözümlü örnekler

**Örnek 1**
- Ne istiyoruz? Sadece İstanbul'daki öğrenciler.
- Sorgu:
```sql
SELECT first_name, last_name, city FROM students WHERE city = 'İstanbul';
```
- Sonuç:

| first_name | last_name | city     |
|------------|-----------|----------|
| Ayşe       | Yılmaz    | İstanbul |
| Ali        | Çelik     | İstanbul |
| Selin      | Aydın     | İstanbul |
| Okan       | Erden     | İstanbul |

- Ne anlıyoruz? 14 öğrenciden koşulu sağlayan 4'ü geldi. Diğerleri elendi.

**Örnek 2**
- Ne istiyoruz? Bursu 3000'den (kesin) fazla olanlar.
- Sorgu:
```sql
SELECT first_name, scholarship_amount
FROM students
WHERE scholarship_amount > 3000
ORDER BY scholarship_amount DESC;
```
- Sonuç: Ayşe 5000, Selin 5000, Elif 4500, Gizem 4000, Deniz 3500 (5 satır).
- Ne anlıyoruz? `> 3000` kesin büyüklük, 3000'in kendisi (Zeynep) gelmez. Ayrıca dikkat: bursu `NULL`
  olanlar (Mehmet, Can...) da gelmedi. Neden? Bunu 2.5'te açacağız, ama küçük bir ipucu: "bilinmeyen
  bir sayı 3000'den büyük mü?" sorusunun cevabı da bilinmeyendir, "evet" değildir.

### Sık hatalar & uyarılar
- Metni tırnaksız yazmak: `WHERE city = İstanbul` (tırnak yok) -> SQL `İstanbul`'u bir sütun adı sanır
  ve hata verir. Metin daima tek tırnak içinde.
- `=` yerine programlamadan gelen alışkanlıkla `==` yazmak. SQL'de eşitlik tek `=`.
- Büyük/küçük harfe dikkat: `'istanbul'` ile `'İstanbul'` farklı metinlerdir, `=` bunları eşit saymaz.

### Anlama soruları

**Soru 1 (yaz).** Kredisi tam 6 olan dersleri (kod ve ad) getir.
> **İpucu:** Sayı karşılaştırmasında tırnak yok; eşitlik `=`.

> **Detaylı cevap:**
> ```sql
> SELECT code, name FROM courses WHERE credits = 6;
> ```
> `credits` bir sayı sütunu, o yüzden `6`'yı tırnaksız yazıyoruz. `=` ile tam eşitliği istedik. Sonuç:
> CS101 (Programlamaya Giriş), CS201 (Veri Yapıları), MATH101 (Kalkülüs I) gibi 6 kredilik dersler.
> Eğer `'6'` yazsaydık (tırnaklı), SQL onu metin olarak görür; Postgres çoğu zaman otomatik çevirir
> ama sayıyı sayı gibi yazmak doğru alışkanlıktır.

**Soru 2 (çoktan seçmeli).** `WHERE city = 'istanbul'` (küçük i ile) sorgusu İstanbul'daki öğrencileri
getirir mi?
- A) Evet, SQL büyük/küçük harfi önemsemez
- B) Hayır, çünkü `'istanbul'` ile `'İstanbul'` farklı metinlerdir
- C) Hata verir

> **İpucu:** `=` metinde harf büyüklüğünü dikkate alır mı?

> **Detaylı cevap:** Doğru cevap **B**. SQL'de `=` ile metin karşılaştırması harf büyüklüğüne
> duyarlıdır: `'istanbul'` ve `'İstanbul'` birbirinden farklı kabul edilir, bu yüzden sonuç boş gelir.
> Hata vermez (C yanlış), sadece eşleşme bulamaz. Büyük/küçük harfi önemsemeden aramak istersen `ILIKE`
> kullanırsın (2.4) ya da iki tarafı da `LOWER()` ile küçültürsün (Ü3). Bu, başlangıçta çok kafa
> karıştıran bir "neden boş geldi?" sebebidir, aklında olsun.

### Çıkış bileti
Metin değerini WHERE içinde yazarken hangi tırnağı kullanırsın, neden?

---

## Ders 2.2 — AND, OR, NOT ve parantez

### 🧑‍🏫 Öğretmen için
"Tek koşul yetmediğinde birden çok koşulu birleştiririz: 'İstanbul'da VE bilgisayar bölümünde'. İşte
`AND`, `OR`, `NOT`." En kritik nokta: `AND`, `OR`'dan daha güçlüdür (önce bağlar), bu yüzden niyetini
netleştirmek için parantez koymak hayat kurtarır. Bunu somut bir örnekle, parantezli ve parantezsiz
farklı sonuç çıkararak göster.

### Konu anlatımı
- `AND`: iki koşul da doğruysa satır kalır.
- `OR`: koşullardan en az biri doğruysa satır kalır.
- `NOT`: koşulu tersine çevirir.

```sql
SELECT first_name, city, department_id
FROM students
WHERE city = 'İstanbul' AND department_id = 1;
```

Bu, "hem İstanbul'da hem 1. bölümde" der. İkisi birden doğru olmalı.

**Öncelik tuzağı:** `AND`, `OR`'dan önce değerlendirilir (çarpmanın toplamadan önce gelmesi gibi).
Yani şu iki sorgu farklıdır:

```sql
-- A: parantezsiz. SQL bunu (dept=1 AND İstanbul) OR (İzmir) diye okur.
WHERE department_id = 1 AND city = 'İstanbul' OR city = 'İzmir'

-- B: parantezli. Niyetimiz buysa böyle yazmalıyız.
WHERE department_id = 1 AND (city = 'İstanbul' OR city = 'İzmir')
```

A'da "İzmir'deki herkes" sonuca girer (bölümü ne olursa olsun), çünkü `OR city = 'İzmir'` ayrı bir
kapı açar. B'de ise "bölüm 1 olacak, ayrıca şehir İstanbul ya da İzmir olacak". Farklı sonuçlar.

> Mini slogan: **Karışıyorsa parantez koy; SQL senin niyetini tahmin etmez, kurallara göre okur.**

### Çözümlü örnekler

**Örnek 1 (AND)**
- Ne istiyoruz? İstanbul'daki bilgisayar (bölüm 1) öğrencileri.
- Sorgu:
```sql
SELECT first_name, city, department_id
FROM students
WHERE city = 'İstanbul' AND department_id = 1;
```
- Sonuç: Ayşe (İstanbul, 1), Ali Çelik (İstanbul, 1), Okan (İstanbul, 1). 3 satır. (Selin İstanbul'da
  ama bölüm 4, o yüzden elendi.)

**Örnek 2 (OR)**
- Ne istiyoruz? Ankara veya İzmir'deki öğrenciler.
- Sorgu:
```sql
SELECT first_name, city FROM students WHERE city = 'Ankara' OR city = 'İzmir';
```
- Sonuç: Zeynep, Deniz, Gizem (Ankara) + Elif, Burak (İzmir) = 5 satır.

**Örnek 3 (parantez farkı)**
- Aşağıdaki iki sorguyu çalıştırıp say: parantezsiz 5 satır (bölüm 1 İstanbullular + bütün İzmirliler),
  parantezli 4 satır (bölüm 1 olup İstanbul ya da İzmir'de olanlar). Aynı kelimeler, parantez yüzünden
  farklı sonuç.

### Sık hatalar & uyarılar
- `AND`/`OR` önceliğini görmezden gelip parantezsiz yazmak ve yanlış sonucu doğru sanmak. Şüphedeysen
  parantez.
- "city = 'Ankara' OR 'İzmir'" gibi yazmak. Her koşulu tam yazmalısın: `city = 'Ankara' OR city = 'İzmir'`.
  (Kısa yol IN, bkz. 2.3.)

### Anlama soruları

**Soru 1 (tahmin et).** Aşağıdaki sorgu, bölümü 2 olmayan İzmirli birini getirir mi? Burak bölüm 1,
İzmir'de.
```sql
SELECT first_name FROM students WHERE department_id = 2 AND city = 'İzmir' OR city = 'İzmir';
```
> **İpucu:** AND önce bağlar; sorguyu `(dept=2 AND İzmir) OR İzmir` diye oku.

> **Detaylı cevap:** Evet, Burak gelir. Çünkü `AND` önce değerlendiğinden sorgu aslında
> `(department_id = 2 AND city = 'İzmir') OR (city = 'İzmir')` gibi okunur. İkinci parça `city = 'İzmir'`
> tek başına bir kapı; İzmir'deki herkesi (bölümü ne olursa olsun) sonuca alır. Yani Burak (bölüm 1,
> İzmir) bu ikinci koşuldan geçer. Muhtemelen niyet "bölüm 2 ve İzmir" idi; o zaman
> `WHERE department_id = 2 AND city = 'İzmir'` yazmak yeterdi. Bu, parantez/öncelik tuzağının tipik
> örneği: yazdığını sandığın şeyle SQL'in okuduğu şey farklı olabilir.

**Soru 2 (yaz).** Bursu 4000'den fazla VEYA hiç İstanbul'da olmayan öğrenciler... yerine net bir görev:
Bölümü 1 olan ve bursu 2000'den fazla olan öğrencileri getir.
> **İpucu:** İki koşulu `AND` ile bağla.

> **Detaylı cevap:**
> ```sql
> SELECT first_name, department_id, scholarship_amount
> FROM students
> WHERE department_id = 1 AND scholarship_amount > 2000;
> ```
> İki koşul da doğru olmalı: bölüm tam 1, ve burs kesinlikle 2000'den büyük. Bölüm 1 öğrencileri Ayşe
> (5000), Mehmet (NULL), Ali Çelik (2000), Burak (1500), Okan (NULL). Bunlardan bursu > 2000 olan tek
> kişi Ayşe (5000). Ali Çelik tam 2000 (kesin büyük değil), Burak 1500, Mehmet ve Okan NULL (bilinmeyen,
> koşulu geçemez). Yani sonuç sadece Ayşe. Buradaki iki ders: `>` sınır değerini almaz, ve NULL'lar
> sayısal koşulu sessizce geçemez.

### Çıkış bileti
`AND` ile `OR` arasında öncelik açısından hangisi önce bağlar, bu neden önemli?

---

## Ders 2.3 — BETWEEN ve IN: aralık ve liste

### 🧑‍🏫 Öğretmen için
"Aynı sütun için bir sürü `OR` yazmak yorucu. İki kısayol var: `BETWEEN` (bir aralık), `IN` (bir
liste)." `BETWEEN`'in iki ucu da dahil ettiğini (inclusive) mutlaka vurgula, çünkü en sık hata bu.

### Konu anlatımı
- `BETWEEN a AND b`: değer a ile b arasında mı (a ve b **dahil**). Yani `scholarship_amount BETWEEN
  2000 AND 4000`, 2000 ve 4000'i de kapsar.
- `IN (...)`: değer bu listeden biri mi? `city IN ('Ankara', 'Bursa')`, `city = 'Ankara' OR city =
  'Bursa'` ile aynı ama daha kısa ve okunur.
- İkisinin de `NOT` hali var: `NOT BETWEEN`, `NOT IN`.

> Mini slogan: **BETWEEN iki ucu da dahil eder; IN ise "şu listeden biri mi" demektir.**

### Çözümlü örnekler

**Örnek 1 (BETWEEN)**
- Ne istiyoruz? Bursu 2000 ile 4000 arasında (dahil) olan öğrenciler.
- Sorgu:
```sql
SELECT first_name, scholarship_amount
FROM students
WHERE scholarship_amount BETWEEN 2000 AND 4000
ORDER BY scholarship_amount;
```
- Sonuç: Ali Çelik 2000, Merve 2500, Zeynep 3000, Deniz 3500, Gizem 4000 (5 satır).
- Ne anlıyoruz? 2000 ve 4000 dahil edildi. 4500 (Elif) ve 1500 (Burak) dışarıda kaldı. NULL burslular
  yine gelmedi.

**Örnek 2 (IN)**
- Ne istiyoruz? Ankara veya Bursa'daki öğrenciler.
- Sorgu:
```sql
SELECT first_name, city FROM students WHERE city IN ('Ankara', 'Bursa');
```
- Sonuç: Zeynep, Deniz, Gizem (Ankara) + Ali Vural, Emre (Bursa) = 5 satır.
- Ne anlıyoruz? `IN`, üç dört `OR` yazmaktan çok daha temiz. Liste uzadıkça avantajı artar.

### Sık hatalar & uyarılar
- `BETWEEN`'i "iki ucu hariç" sanmak. Hayır, iki uç da dahildir. "2000'den fazla, 4000'den az" istiyorsan
  `> 2000 AND < 4000` yazmalısın, BETWEEN değil.
- `NOT IN` ile NULL içeren liste kullanmak çok tehlikelidir (beklenmedik boş sonuç). Bunu Ü9'da ayrıca
  göreceğiz; şimdilik akılda kalsın.

### Anlama soruları

**Soru 1 (çoktan seçmeli).** `WHERE credits BETWEEN 4 AND 5` hangi kredileri kapsar?
- A) Sadece 4 ve 5 değerini değil, sadece aradakileri (yani hiçbirini)
- B) 4 ve 5 dahil, yani 4 ile 5
- C) Sadece 5
- D) 4, 5 ve 6

> **İpucu:** BETWEEN iki ucu dahil eder.

> **Detaylı cevap:** Doğru cevap **B**. `BETWEEN 4 AND 5`, 4 ve 5 dahil olmak üzere bu aralıktaki
> değerleri alır; tamsayı kredilerde bu 4 ve 5 demektir. 6 dışarıda (D yanlış), sadece 5 değil (C
> yanlış), ve kesinlikle "hiçbiri" değil (A yanlış). En sık yapılan hata BETWEEN'i uçları hariç
> sanmaktır; unutma, iki uç da içeridedir.

**Soru 2 (yaz).** Şehri İstanbul, Ankara veya İzmir olan öğrencileri `IN` kullanarak getir.
> **İpucu:** `city IN (...)` içine üç şehri yaz.

> **Detaylı cevap:**
> ```sql
> SELECT first_name, city FROM students WHERE city IN ('İstanbul', 'Ankara', 'İzmir');
> ```
> `IN` ile üç şehirden herhangi birinde olanları tek satırda süzdük; bu, `city = 'İstanbul' OR city =
> 'Ankara' OR city = 'İzmir'` yazmakla aynı ama çok daha okunur. Sonuçta Bursa'dakiler (Ali Vural,
> Emre) ve şehri NULL olanlar (Mehmet, Can, Merve) gelmez. NULL'ların gelmemesi yine o tanıdık sebep:
> NULL "şu listeden biri mi?" sorusuna "evet" diyemez.

### Çıkış bileti
`BETWEEN 10 AND 20` ifadesi 10 ve 20'yi içerir mi?

---

## Ders 2.4 — Desen eşleme: LIKE ve ILIKE

### 🧑‍🏫 Öğretmen için
"Bazen tam eşitlik değil, 'A ile başlayan', '...mail.com ile biten' gibi desen ararız. Bunun aracı
`LIKE`." İki joker karakteri göster: `%` (sıfır veya daha çok karakter) ve `_` (tam bir karakter).
Büyük/küçük harf duyarsız aramak için `ILIKE`.

### Konu anlatımı
`LIKE` bir desenle eşleştirir. İki joker:
- `%` : sıfır veya daha fazla herhangi karakter. `'A%'` = "A ile başlayan".
- `_` : tam olarak bir karakter. `'_li'` = "üç harfli, ortası l, sonu i, başı herhangi".

```sql
SELECT first_name FROM students WHERE first_name LIKE 'A%';
```

`LIKE` büyük/küçük harfe duyarlıdır. Duyarsız istiyorsan `ILIKE` kullan (Postgres'e özgü, çok
pratik): `WHERE name ILIKE '%kahve%'` hem "Kahve" hem "kahve" hem "KAHVE" yakalar.

> Mini slogan: **`%` = herhangi kadar karakter, `_` = tam bir karakter; harf duyarsızlığı için ILIKE.**

### Çözümlü örnekler

**Örnek 1**
- Ne istiyoruz? Adı "A" ile başlayan öğrenciler.
- Sorgu:
```sql
SELECT first_name, last_name FROM students WHERE first_name LIKE 'A%';
```
- Sonuç: Ayşe Yılmaz, Ali Çelik, Ali Vural (3 satır).
- Ne anlıyoruz? `'A%'`, "A ile başlasın, sonrası ne olursa olsun" demek. İki farklı "Ali" de geldi.

**Örnek 2 (içinde geçen + ILIKE)**
- Ne istiyoruz? Adında "kahve" geçen ürünler (büyük/küçük harf fark etmesin).
- Sorgu:
```sql
SELECT name FROM products WHERE name ILIKE '%kahve%';
```
- Sonuç: "Filtre Kahve". `%kahve%` deseni "içinde herhangi bir yerde kahve geçsin" der; `ILIKE`
  sayesinde büyük "K" de yakalanır.

**Örnek 3 (soyadı belirli harfle biten)**
- Ne istiyoruz? Soyadı "z" ile biten öğrenciler.
- Sorgu:
```sql
SELECT first_name, last_name FROM students WHERE last_name LIKE '%z';
```
- Sonuç: Ayşe Yılmaz, Gizem Yıldız (2 satır).

### Sık hatalar & uyarılar
- `LIKE 'Ali'` yazıp "Ali ile başlayanları aldım" sanmak. Jokersiz LIKE, tam eşitlik gibidir; sadece
  tam olarak "Ali" olanı bulur. "Ali ile başlayan" için `'Ali%'` gerekir.
- Büyük/küçük harf yüzünden boş sonuç. `LIKE 'a%'` (küçük a) Türkçe adlarda "Ayşe"yi yakalamaz; ya
  `'A%'` yaz ya da `ILIKE` kullan.

### Anlama soruları

**Soru 1 (çoktan seçmeli).** `WHERE first_name LIKE '%a%'` hangi adları getirir?
- A) Sadece "a" adındaki kişileri
- B) İçinde küçük "a" harfi geçen adları
- C) "a" ile başlayan adları
- D) Hiçbirini

> **İpucu:** `%a%` = "herhangi bir yerinde a geçen".

> **Detaylı cevap:** Doğru cevap **B**. `%a%` deseni "öncesinde herhangi kadar karakter, sonra bir
> 'a', sonra yine herhangi kadar karakter" demektir; yani "içinde küçük a harfi geçen" adları getirir.
> Dikkat: küçük "a" arıyoruz, o yüzden "Ayşe" (büyük A ile başlar ama içinde küçük 'a' yok... aslında
> "Ayşe"de küçük a yok) gibi adlar deseni içinde küçük a barındırmıyorsa gelmez; ama "Burak", "Zeynep"
> değil, "Burak"ta 'a' var, gelir. Harf büyüklüğünü önemsemeden istiyorsan `ILIKE '%a%'` kullanırdın.
> "a ile başlayan" için `'a%'`, tam "a" için jokersiz `'a'` gerekirdi.

**Soru 2 (yaz).** E-postası "@kampus.edu" ile biten öğrencileri getir (zaten hepsi öyle, ama deseni kur).
> **İpucu:** "...ile biten" için deseni `'%...'` şeklinde yaz.

> **Detaylı cevap:**
> ```sql
> SELECT first_name, email FROM students WHERE email LIKE '%@kampus.edu';
> ```
> `'%@kampus.edu'` deseni "öncesi ne olursa olsun, `@kampus.edu` ile bitsin" der. Baştaki `%`
> kullanıcı adını (ayse.yilmaz gibi) temsil eder. Tüm öğrencilerin e-postası bu domende olduğu için
> 14 satır da gelir; gerçek hayatta bu, belirli bir alan adındaki adresleri süzmek için çok kullanılır.

### Çıkış bileti
`%` ve `_` joker karakterleri arasındaki fark nedir?

---

## Ders 2.5 — NULL ile çalışmak: IS NULL ve "= NULL" tuzağı

### 🧑‍🏫 Öğretmen için
Bu dersi yavaş anlat, çünkü NULL başlangıç öğrencilerinin EN çok takıldığı konudur. Ana cümle: "NULL
bir değer değil, 'bilmiyorum' işaretidir; bilinmeyen bir şeyle eşitlik kurulmaz." `= NULL`'ın neden
hiçbir satır getirmediğini canlı göster, sonra `IS NULL`'ı göster. Ü1'den NULL'ın aritmetikte ve
sıralamada nasıl davrandığını hatırlat (spiral).
- Sorabileceğin soru: "`city = NULL` kaç satır getirir sizce?" (Cevap: sıfır. Şaşıracaklar, tam da bu yüzden öğretici.)

### Neden / nerede işime yarar
Gerçek veride eksik bilgi her yerdedir: girilmemiş telefon, bilinmeyen tarih, henüz oluşmamış sonuç.
NULL'ı doğru ele almak, "neden bazı satırlar kayboldu / neden toplamlar tutmadı" gibi gerçek
hataların önüne geçer.

### Konu anlatımı
Ü0'da demiştik: `NULL` = "değer yok / bilinmiyor". Şimdi bunun filtrelemedeki sonucu:

SQL'de bir karşılaştırma üç sonuç verebilir: **doğru (true)**, **yanlış (false)** ya da
**bilinmiyor (unknown)**. NULL ile yapılan her normal karşılaştırma "bilinmiyor" üretir. Ve `WHERE`
sadece sonucu **doğru** olan satırları alır; "bilinmiyor" satırlar elenir.

Bu yüzden:
- `WHERE city = NULL` -> her satır için "bilinmiyor" -> **hiçbir satır gelmez**. (Hata vermez, sessizce boş.)
- `WHERE city <> 'İstanbul'` -> şehri NULL olanlar için bile "bilinmiyor" -> o satırlar **gelmez**,
  oysa günlük dilde "İstanbul değil" gibi düşünürüz. NULL onları sessizce dışarıda bırakır.

Doğru yol, özel operatörler:
- `WHERE city IS NULL` -> şehri bilinmeyenler.
- `WHERE city IS NOT NULL` -> şehri bilinenler.

> Mini slogan: **NULL'a eşitlik sorulmaz; "değer yok mu?" diye `IS NULL` ile sorulur.**

### Çözümlü örnekler

**Örnek 1 (tuzak)**
- Ne istiyoruz? Şehri bilinmeyen öğrenciler. Önce yanlış deneme:
```sql
SELECT first_name, city FROM students WHERE city = NULL;
```
Sonuç: **0 satır.** Hata yok ama boş. Çünkü `= NULL` her zaman "bilinmiyor"dur, asla "doğru" olmaz.
- Doğru:
```sql
SELECT first_name, city FROM students WHERE city IS NULL;
```
- Sonuç: Mehmet, Can, Merve (3 satır). İşte şehri girilmemiş öğrenciler.

**Örnek 2 (sessiz eleme)**
- Ne istiyoruz? "İstanbul'da olmayan" öğrenciler.
- Sorgu:
```sql
SELECT first_name, city FROM students WHERE city <> 'İstanbul';
```
- Sonuç: Ankara, İzmir, Bursa'dakiler gelir (7 satır), ama şehri NULL olanlar (Mehmet, Can, Merve)
  **gelmez**. Ne anlıyoruz? Günlük dilde "İstanbul değil"e NULL'lar da girer sanırız; SQL girmez,
  çünkü "bilinmeyen şehir İstanbul'dan farklı mı?" sorusunun cevabı da bilinmeyendir. Onları da
  istiyorsak açıkça eklemeliyiz: `WHERE city <> 'İstanbul' OR city IS NULL`.

**Örnek 3 (bilinen değerler)**
- Ne istiyoruz? Bursu girilmiş (bilinen) öğrenciler.
- Sorgu:
```sql
SELECT first_name, scholarship_amount FROM students WHERE scholarship_amount IS NOT NULL;
```
- Sonuç: bursu olan 9 öğrenci; NULL burslular (5 kişi) elenir.

### Sık hatalar & uyarılar
- `= NULL` veya `<> NULL` yazmak. İkisi de hep "bilinmiyor" üretir, boş sonuç verir. Daima `IS NULL` /
  `IS NOT NULL`.
- `<>` veya `NOT IN` gibi negatif filtrelerin NULL satırları sessizce attığını unutmak. "Neden 3 satır
  eksik?" sorusunun cevabı çoğu zaman budur.

### Anlama soruları

**Soru 1 (hata avı).** Öğrenci "bursu olmayanları" istedi ve şunu yazdı, sonuç boş geldi. Neden ve doğrusu ne?
```sql
SELECT first_name FROM students WHERE scholarship_amount = NULL;
```
> **İpucu:** NULL ile eşitlik kurulur mu?

> **Detaylı cevap:** Sonuç boş, çünkü `scholarship_amount = NULL` her satır için "bilinmiyor" sonucunu
> verir ve `WHERE` yalnızca "doğru" olanları aldığı için hiçbir satır geçemez. NULL bir değer değil,
> "bilinmiyor" işaretidir; ona `=` ile dokunamazsın. Doğrusu:
> ```sql
> SELECT first_name FROM students WHERE scholarship_amount IS NULL;
> ```
> Bu, bursu girilmemiş öğrencileri (Mehmet, Can, Ali Vural, Emre, Okan) getirir. Kural net: "değer yok
> mu?" sorusu `IS NULL`, "değer var mı?" sorusu `IS NOT NULL` ile sorulur, asla `= NULL` ile değil.

**Soru 2 (tahmin et).** `students` tablosunda 14 öğrenci var, 3'ünün şehri NULL. `WHERE city <>
'Ankara'` kaç satır döndürür?
> **İpucu:** Ankara'dakileri çıkar, ama NULL şehirlilere ne olur?

> **Detaylı cevap:** **8 satır.** Toplam 14 öğrenci var. Ankara'da 3 öğrenci var (Zeynep, Deniz, Gizem),
> bunlar `<> 'Ankara'` koşulunu sağlamadığı için elenir: 14 - 3 = 11 gibi düşünebilirsin, ama bir tuzak
> var. Şehri NULL olan 3 öğrenci (Mehmet, Can, Merve) için `city <> 'Ankara'` sonucu "bilinmiyor"dur,
> "doğru" değildir, bu yüzden onlar da elenir. Yani 14 - 3 (Ankaralı) - 3 (NULL şehirli) = 8 satır
> gelir. İşte negatif filtrelerin (`<>`, `NOT IN`) NULL'ları sessizce attığı klasik durum. NULL'lıları
> da istiyorsan `WHERE city <> 'Ankara' OR city IS NULL` yazmalısın (o zaman 11 satır gelir).

### Çıkış bileti
Neden `WHERE x = NULL` hiçbir satır getirmez, ve doğrusu nedir?

---

## Pratik (editörde dene)

> Deneme Tahtasında (⌘K) dene. Önce tahmin et, çalıştır, gözle, sonra cevaba bak. Seed: Kampüs.

**P1 (kolay).** [▶ Editörde dene] Ankara'daki öğrencilerin adını getir.
> İpucu: WHERE city = 'Ankara' (metin tek tırnak).
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT first_name FROM students WHERE city = 'Ankara';
> ```
> Zeynep, Deniz, Gizem. Metin değeri tek tırnak içinde.
> </details>

**P2 (orta).** [▶ Editörde dene] Bursu 2000 ile 4000 arasında (dahil) olan öğrencileri getir.
> İpucu: BETWEEN 2000 AND 4000 (iki uç dahil).
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT first_name, scholarship_amount FROM students
> WHERE scholarship_amount BETWEEN 2000 AND 4000 ORDER BY scholarship_amount;
> ```
> Ali Çelik 2000, Merve 2500, Zeynep 3000, Deniz 3500, Gizem 4000. NULL burslular gelmez.
> </details>

**P3 (orta).** [▶ Editörde dene] Şehri Ankara veya İzmir olanları IN ile getir.
> İpucu: WHERE city IN ('Ankara','İzmir').
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT first_name, city FROM students WHERE city IN ('Ankara', 'İzmir');
> ```
> Zeynep, Deniz, Gizem (Ankara) + Elif, Burak (İzmir) = 5. IN, çok OR yazmaktan temiz.
> </details>

**P4 (orta).** [▶ Editörde dene] Adı 'A' ile başlayan öğrencileri getir.
> İpucu: LIKE 'A%'.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT first_name, last_name FROM students WHERE first_name LIKE 'A%';
> ```
> Ayşe, Ali Çelik, Ali Vural. `%` = sonrası herhangi kadar karakter.
> </details>

**P5 (orta, NULL).** [▶ Editörde dene] Şehri bilinmeyen (NULL) öğrencileri getir.
> İpucu: IS NULL (= NULL değil!).
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT first_name FROM students WHERE city IS NULL;
> ```
> Mehmet, Can, Merve. `= NULL` 0 satır verirdi; `IS NULL` doğru yoldur.
> </details>

**P6 (düşündürücü, NULL tuzağı).** [▶ Editörde dene] `SELECT COUNT(*) FROM students WHERE city <>
'Ankara';` kaç döndürür? 14 - 3 (Ankaralı) = 11 mi? Çalıştır, açıkla.
> İpucu: NULL şehirlilere `<>` ne yapar?
> <details><summary>Cevap</summary>
>
> **8** döndürür (11 değil). Ankaralı 3 kişi elenir (14-3=11 sanırsın), AMA şehri NULL olan 3 kişi de
> elenir, çünkü `NULL <> 'Ankara'` "bilinmiyor"dur, "doğru" değil. 14 - 3 - 3 = 8. NULL'ları da
> istersen: `WHERE city <> 'Ankara' OR city IS NULL` (o zaman 11).
> </details>

---

## Ünite 2 özeti (öğrenciye)
- `WHERE`, her satıra koşulu sorar; sonuç "doğru" ise satır kalır. `FROM`'dan sonra gelir.
- Metin değerleri **tek tırnak** içinde; sayılar tırnaksız. `=` harf büyüklüğüne duyarlı.
- `AND` iki koşulu da, `OR` en az birini ister. **`AND`, `OR`'dan önce bağlar; şüphedeysen parantez.**
- `BETWEEN a AND b` iki ucu **dahil** eder. `IN (...)` "şu listeden biri mi" demektir.
- `LIKE` desen eşler (`%` = herhangi kadar, `_` = tam bir karakter); harf duyarsızlığı için `ILIKE`.
- **NULL = bilinmiyor.** `= NULL` çalışmaz (hep "bilinmiyor"); doğrusu `IS NULL` / `IS NOT NULL`.
  Negatif filtreler (`<>`, `NOT IN`) NULL satırları sessizce eler.

## 🧑‍🏫 Öğretmen notu (ünite geneli)
NULL bu ünitenin kalbi ve tüm müfredatın en kritik 30 dakikası. Öğrenci "bilinmeyenle karşılaştırma
yapılmaz, bilinmeyen sorgulanır" fikrini kavrarsa, ileride LEFT JOIN'deki NULL'lar (Ü6/Ü8) ve NOT IN
tuzağı (Ü9) çok daha kolay gelecek. Spiralin ikinci ve üçüncü halkalarını (aritmetik, sıralama)
Ü1'de attık; burada dördüncüyü (filtreleme) attık; ileride devam edecek.
