# Ünite 12 — DDL: Tabloları Tasarlamak (CREATE, Kısıtlar, PK/FK, ALTER/DROP)

> Kavram etiketleri: `create-table`, `data-types`, `constraints`, `not-null-default`, `unique-check`, `primary-key`, `foreign-key`, `referential-integrity`, `alter-drop`
> Ön koşul: Ü0-Ü11 (özellikle Ü6 PK/FK, ÜG güvenlik)
> Kullanılan tablolar: yeni `kitaplar`, `odunc` (kendimiz oluşturacağız); FK için students
> Tahmini süre: 50-60 dk
> Ünite sloganı: **"Şimdiye kadar hazır tabloları kullandık; şimdi tabloların kendisini tasarlıyoruz."**

> Bu ünitede kendi tablolarımızı kuruyoruz. Bittiğinde onları DROP edebilir ya da "↺ Sıfırla" ile seed'e
> dönebilirsin (oluşturduğun özel tablolar kalabilir; istersen elle DROP et).

---

## Ders 12.1 — CREATE TABLE ve veri tipleri

### 🧑‍🏫 Öğretmen için
"Ü6'da öğrendik: iyi bir tasarım veriyi tekrar etmez, tablolara böler. Şimdi bir tabloyu sıfırdan biz
tasarlıyoruz." Tahtaya bir kütüphane düşün: kitaplar tablosu hangi sütunlara ihtiyaç duyar? (başlık, yazar,
yıl, fiyat...) Her sütunun bir TİPİ olduğunu (Ü3) hatırlat: başlık metin, yıl tam sayı, fiyat ondalık.
Birlikte `CREATE TABLE kitaplar (...)` yaz, çalıştır, sonra `INSERT` ile bir kitap ekle.
- Sor: "fiyat için hangi tip? yıl için?" (Tasarım kararları; tip, o sütunda ne tutabileceğini belirler, Ü3.)
- Herkes burada takılır: her sütundan sonra virgül, son sütundan sonra virgül YOK; ve tip yazmayı unutmamak.

### Konu anlatımı
`CREATE TABLE`, yeni bir tablo (yapı) oluşturur. Her sütun için bir **ad** ve bir **veri tipi** (Ü3)
belirtirsin. Sık tipler: `INTEGER` (tam sayı), `NUMERIC(p,s)` (ondalık), `TEXT` (metin), `DATE` (tarih),
`BOOLEAN` (doğru/yanlış).

```sql
CREATE TABLE kitaplar (
  id      INTEGER,
  baslik  TEXT,
  yazar   TEXT,
  yil     INTEGER,
  fiyat   NUMERIC(8,2)
);
```

Bu, boş bir `kitaplar` tablosu oluşturur. Sonra `INSERT` (Ü11) ile satır ekleriz. Şu an hiç kısıt yok;
bir sonraki derste kuralları (kısıtları) ekleyeceğiz.

> Mini slogan: **CREATE TABLE ile yapıyı kurarsın: her sütunun bir adı ve bir tipi vardır.**

### Çözümlü örnek
- Sorgu:
```sql
CREATE TABLE kitaplar (
  id INTEGER, baslik TEXT, yazar TEXT, yil INTEGER, fiyat NUMERIC(8,2)
);
INSERT INTO kitaplar (id, baslik, yazar, yil, fiyat)
VALUES (1, 'Veritabanı Temelleri', 'A. Demir', 2020, 120.00);
SELECT * FROM kitaplar;
```
- Ne anlıyoruz? Önce boş tabloyu kurduk, sonra bir kitap ekledik, sonra okuduk. Tablo artık var ve
  içinde bir satır. Tipler sayesinde `yil` sayı, `baslik` metin olarak saklanır.

### Sık hatalar & uyarılar
- Sütun tanımları arasında virgülü unutmak ya da son sütundan sonra fazladan virgül koymak.
- Tip yazmayı unutmak (`baslik,` -> hata). Her sütunun bir tipi olmalı.
- Zaten var olan adla tablo oluşturmak -> "already exists" hatası. (Önce DROP, ya da farklı ad.)

### Anlama soruları

**Soru 1 (yaz).** Bir `yazarlar` tablosu oluştur: `id` (tam sayı), `ad` (metin), `dogum_yili` (tam sayı).
> **İpucu:** CREATE TABLE yazarlar (id INTEGER, ...).

> **Detaylı cevap:**
> ```sql
> CREATE TABLE yazarlar (
>   id INTEGER,
>   ad TEXT,
>   dogum_yili INTEGER
> );
> ```
> Üç sütunlu boş bir tablo kurduk; her birinin adı ve tipi var. `ad` metin (TEXT), id ve dogum_yili tam
> sayı (INTEGER). Şu an kısıt yok, yani id tekrar edebilir, ad boş olabilir; bunları bir sonraki derste
> kısıtlarla (PK, NOT NULL) düzelteceğiz. Oluşturduktan sonra `INSERT` ile yazar ekleyebilirsin.

**Soru 2 (kavram).** Neden `fiyat` için `TEXT` yerine `NUMERIC` seçeriz?
> **İpucu:** Fiyatla ne yapmak isteyebiliriz? (Ü3 tipler)

> **Detaylı cevap:** Çünkü tip, o sütunla ne yapabileceğini belirler (Ü3). Fiyat bir sayıdır ve onunla
> aritmetik yapmak isteriz: toplamak (SUM), ortalamasını almak (AVG), zam uygulamak (`* 1.2`),
> karşılaştırmak (`> 100`). `NUMERIC(8,2)` bunları sayısal ve ondalık duyarlıkla yapar. `TEXT` seçseydik,
> fiyatlar "120.00" gibi metin olur; toplayamaz, sıralaman bile alfabetik olur ("100" < "20" gibi
> yanlış sonuçlar). Para/miktar için `NUMERIC`, tam sayımlar için `INTEGER` doğru tercihtir. Tip seçimi
> bir tasarım kararıdır ve ileride yapabileceklerini belirler.

### Çıkış bileti
CREATE TABLE'da her sütun için belirtmen gereken iki şey nedir?

---

## Ders 12.2 — Kısıtlar: NOT NULL, DEFAULT, UNIQUE, CHECK

### 🧑‍🏫 Öğretmen için
"Tablo sadece veri tutmaz, KURAL da koyar." Tahtaya dört kural yaz: NOT NULL (boş olamaz), DEFAULT (boş
bırakılırsa şu), UNIQUE (tekrar edemez), CHECK (şu koşulu sağlamalı). Her birini canlı ihlal et: başlıksız
kitap ekle (NOT NULL hatası), aynı isbn'i iki kez ekle (UNIQUE hatası), yıl = -5 ekle (CHECK hatası). "Veri
girilmeden, kötü veriyi kapıda durduruyoruz." Bu, "veri kalitesi"ni tasarıma gömmek.
- Sor: "fiyat girilmezse ne olsun?" (DEFAULT 0.) Boş bırak, 0 geldiğini göster.
- Herkes burada takılır: CHECK'in NULL'a izin verdiği (CHECK koşulu NULL ise ihlal sayılmaz). Kısaca değin.

### Konu anlatımı
Kısıtlar (constraints), tabloya **kurallar** koyar; kötü veriyi daha girilmeden engeller:
- `NOT NULL`: bu sütun boş (NULL) olamaz.
- `DEFAULT değer`: değer verilmezse bu kullanılır.
- `UNIQUE`: bu sütunda aynı değer tekrar edemez.
- `CHECK (koşul)`: satır bu koşulu sağlamalı (örn. `yil > 0`).

```sql
CREATE TABLE kitaplar (
  id     INTEGER,
  baslik TEXT NOT NULL,
  yazar  TEXT,
  yil    INTEGER CHECK (yil > 0),
  fiyat  NUMERIC(8,2) DEFAULT 0,
  isbn   TEXT UNIQUE
);
```

Bu tabloda: başlık zorunlu, yıl pozitif olmalı, fiyat verilmezse 0, isbn tekrar edemez. Kötü veri
(başlıksız, negatif yıl, tekrar isbn) artık INSERT aşamasında reddedilir.

> Mini slogan: **Kısıtlar kötü veriyi kapıda durdurur: NOT NULL (boş olamaz), DEFAULT (yoksa şu), UNIQUE (tekrarsız), CHECK (koşul).**

### Çözümlü örnekler

**Örnek 1 (DEFAULT iş başında)**
- Sorgu:
```sql
INSERT INTO kitaplar (id, baslik, yil) VALUES (1, 'SQL 101', 2021);
SELECT id, baslik, fiyat FROM kitaplar WHERE id = 1;
```
- Sonuç: fiyat = 0.00. Ne anlıyoruz? Fiyatı vermedik; `DEFAULT 0` devreye girdi. Diğer verilmeyenler
  (yazar, isbn) NULL kaldı (onlarda NOT NULL yok).

**Örnek 2 (kısıt ihlalleri, önce tahmin et)**
- Aşağıdakilerin her biri HATA verir; çalıştırıp mesajı gör:
```sql
INSERT INTO kitaplar (id, yil) VALUES (2, 2020);          -- HATA: baslik NOT NULL
INSERT INTO kitaplar (id, baslik, yil) VALUES (3, 'X', -5); -- HATA: CHECK (yil > 0)
INSERT INTO kitaplar (id, baslik, isbn) VALUES (4, 'A', '111');
INSERT INTO kitaplar (id, baslik, isbn) VALUES (5, 'B', '111'); -- HATA: UNIQUE isbn '111' tekrar
```
- Ne anlıyoruz? Kısıtlar kötü veriyi reddetti: başlıksız satır, negatif yıl, tekrar eden isbn hepsi
  engellendi. Veri kalitesi tasarıma gömülü.

### Sık hatalar & uyarılar
- NOT NULL bir sütunu doldurmadan INSERT yapmak -> hata (doğru davranış; kuralı koyduk).
- CHECK'in NULL'a izin verdiğini unutmak: `CHECK (yil > 0)`, `yil` NULL ise ihlal saymaz (koşul "bilinmiyor"
  olur, reddedilmez). Yılı zorunlu da kılmak istiyorsan ayrıca `NOT NULL` ekle.
- UNIQUE ile PRIMARY KEY'i karıştırmak (UNIQUE tekrarı önler ama NULL'a izin verir; PK hem benzersiz hem NOT NULL, 12.3).

### Anlama soruları

**Soru 1 (kavram).** `baslik TEXT NOT NULL` ve `fiyat NUMERIC DEFAULT 0` kısıtları sırasıyla ne sağlar?
> **İpucu:** Biri zorunluluk, biri varsayılan.

> **Detaylı cevap:** `NOT NULL`, `baslik` sütununun boş (NULL) bırakılamayacağını garanti eder; başlıksız
> bir kitap eklemeye çalışırsan INSERT reddedilir. Yani başlık zorunlu bir alandır. `DEFAULT 0` ise,
> `fiyat` değeri INSERT'te verilmezse otomatik olarak 0 kullanılır; fiyatı unutursan NULL değil 0 olur.
> İkisi farklı amaçlara hizmet eder: NOT NULL "bu olmadan satır olmaz" der (zorunluluk), DEFAULT "verilmezse
> şunu kullan" der (kolaylık). Birlikte kullanılabilirler: `NOT NULL DEFAULT 0` hem zorunlu kılar hem de
> sen vermezsen 0 koyar (yani pratikte hiç NULL olmaz).

**Soru 2 (hata avı).** Bu iki INSERT'ten ikincisi neden hata verir?
```sql
INSERT INTO kitaplar (id, baslik, isbn) VALUES (10, 'Kitap A', '999');
INSERT INTO kitaplar (id, baslik, isbn) VALUES (11, 'Kitap B', '999');
```
> **İpucu:** isbn'de hangi kısıt var?

> **Detaylı cevap:** İkinci INSERT hata verir çünkü `isbn` sütunu `UNIQUE` kısıtlı ve '999' değeri ilk
> satırda zaten kullanıldı; aynı isbn tekrar edemez. İlk satır sorunsuz eklenir (id 10, isbn '999');
> ikinci satır aynı isbn'i ('999') kullanmaya çalıştığı için UNIQUE kısıtını ihlal eder ve reddedilir.
> UNIQUE, "bu sütunda her değer en fazla bir kez" kuralıdır; gerçek dünyada e-posta, ISBN, TC kimlik no
> gibi benzersiz olması gereken alanlarda kullanılır. (Not: UNIQUE bir sütun birden çok NULL'a izin
> verebilir, çünkü NULL'lar birbirine "eşit" sayılmaz; ama dolu değerler tekrar edemez.)

### Çıkış bileti
NOT NULL, UNIQUE ve CHECK kısıtları sırasıyla neyi garanti eder?

---

## Ders 12.3 — PRIMARY KEY ve FOREIGN KEY: kimlik ve referans bütünlüğü

### 🧑‍🏫 Öğretmen için
Ü6'daki PK/FK kavramını şimdi TASARIM tarafından gör. "PK = bu tablonun kimliği (benzersiz + boş olamaz);
FK = başka tablonun kimliğine işaret, ve o kimliğin GERÇEKTEN var olmasını zorlar." Canlı göster: var
olmayan bir kitap_id ile ödünç kaydı eklemeye çalış, FK hatası alsın. "Veritabanı, olmayan kitaba ödünç
kaydı açmana izin vermiyor; buna referans bütünlüğü denir."
- Sor: "FK olmasa ne olurdu?" (Hayalet kayıtlar: olmayan kitaba/öğrenciye bağlı ödünç.)
- Ü6'yı bağla: JOIN bu PK/FK köprülerinden geçiyordu; şimdi o köprüleri biz kuruyoruz.

### Konu anlatımı
- `PRIMARY KEY`: tablonun kimlik sütunu. Hem **benzersiz** hem **NOT NULL** (UNIQUE + NOT NULL bir arada).
  Her satırı tek tanımlar (Ü6'daki PK).
- `FOREIGN KEY` (`REFERENCES`): başka bir tablonun PK'sına işaret eder ve **o değerin gerçekten var
  olmasını zorlar**. Buna **referans bütünlüğü** denir: olmayan bir kitaba/öğrenciye bağlı kayıt
  açamazsın.

```sql
CREATE TABLE odunc (
  id          INTEGER PRIMARY KEY,
  kitap_id    INTEGER REFERENCES kitaplar(id),
  student_id  INTEGER REFERENCES students(id),
  alis_tarihi DATE
);
```

Bu tabloda `kitap_id`, `kitaplar(id)`'ye; `student_id`, `students(id)`'ye işaret eder. Var olmayan bir
kitap_id ile satır eklemeye çalışırsan veritabanı reddeder.

> Mini slogan: **PK tablonun benzersiz kimliğidir; FK başka tablonun kimliğine işaret eder ve onun var olmasını zorlar (referans bütünlüğü).**

### Çözümlü örnekler

**Örnek 1 (geçerli FK)**
- Önce kitaplar'da bir kitap (id 1) ve students'ta id 1 (Ayşe) olduğunu varsayalım.
- Sorgu:
```sql
INSERT INTO odunc (id, kitap_id, student_id, alis_tarihi)
VALUES (1, 1, 1, '2025-03-01');   -- kitap 1 ve öğrenci 1 var: OK
SELECT * FROM odunc;
```
- Ne anlıyoruz? Hem kitap 1 hem öğrenci 1 var olduğu için ödünç kaydı kabul edildi.

**Örnek 2 (FK ihlali, önce tahmin et)**
- Sorgu:
```sql
INSERT INTO odunc (id, kitap_id, student_id, alis_tarihi)
VALUES (2, 999, 1, '2025-03-02');   -- kitap 999 yok: HATA
```
- Ne anlıyoruz? `kitap_id = 999` diye bir kitap olmadığı için FK kısıtı bu kaydı reddetti. Veritabanı,
  olmayan bir kitaba ödünç kaydı açmana izin vermiyor; işte referans bütünlüğü. FK olmasaydı, "hayalet"
  bir kitaba bağlı anlamsız bir kayıt oluşurdu.

### Sık hatalar & uyarılar
- FK'nın işaret ettiği satır yoksa INSERT reddedilir (doğru davranış). Önce ana kaydı (kitap/öğrenci) ekle.
- FK ile bağlı bir ana satırı silmeye çalışmak (örn. ödünç kaydı olan bir kitabı DROP/DELETE) -> hata ya
  da bağlı kayıt yönetimi gerektirir. Önce bağlı kayıtları hallet.
- PRIMARY KEY'i UNIQUE ile karıştırmak: PK = UNIQUE + NOT NULL; UNIQUE tek başına NULL'a izin verir.

### Anlama soruları

**Soru 1 (kavram).** "Referans bütünlüğü" ne demektir, bir FK bunu nasıl sağlar?
> **İpucu:** Olmayan bir şeye işaret edebilir misin?

> **Detaylı cevap:** Referans bütünlüğü, bir tablodaki referansların (FK'ların) gerçekten var olan
> kayıtlara işaret etmesini garanti eder; "hayalet" referansları engeller. Bir FK (`kitap_id INTEGER
> REFERENCES kitaplar(id)`) sayesinde, `odunc` tablosuna bir satır eklerken verdiğin `kitap_id`, `kitaplar`
> tablosunda gerçekten bir kitaba karşılık gelmek zorundadır; olmayan bir id (999) verirsen veritabanı
> reddeder. Aynı şekilde, bir kitabın ödünç kayıtları varken o kitabı silmeye çalışırsan (bağlı kayıtlar
> öksüz kalmasın diye) veritabanı buna da engel olur. Böylece veri her zaman tutarlı kalır: her ödünç
> kaydı gerçek bir kitaba ve gerçek bir öğrenciye bağlıdır. FK olmasaydı, olmayan kitaplara/öğrencilere
> bağlı anlamsız kayıtlar oluşabilirdi.

**Soru 2 (kavram).** PRIMARY KEY ile UNIQUE arasındaki fark nedir?
> **İpucu:** İkisi de benzersizlik sağlar; biri ekstra ne sağlar?

> **Detaylı cevap:** İkisi de bir sütunda değerlerin tekrar etmemesini (benzersizlik) sağlar. Fark:
> PRIMARY KEY ayrıca **NOT NULL**'dır, yani hem benzersiz hem de boş olamaz; tablonun "kimlik" sütunudur
> ve her tabloda en fazla bir tane olur. UNIQUE ise benzersizliği sağlar ama NULL'a izin verebilir (bir
> sütunda birden çok NULL olabilir, çünkü NULL'lar birbirine eşit sayılmaz), ve bir tabloda birden çok
> UNIQUE sütun olabilir. Yani PK = UNIQUE + NOT NULL + "bu tablonun ana kimliği". Örneğin `students.id`
> bir PK'dır (her öğrenciyi tanımlar), ama bir `email` sütununu UNIQUE yapabilirdik (tekrar etmesin ama
> illa kimlik olmasın diye).

### Çıkış bileti
FK bir tabloya hangi garantiyi (bütünlüğü) ekler?

---

## Ders 12.4 — ALTER ve DROP: yapıyı değiştirmek ve silmek

### 🧑‍🏫 Öğretmen için
"Tablo kurulduktan sonra da değişebilir: sütun ekle, sütun sil, yeniden adlandır (ALTER). Ve tabloyu
komple silebiliriz (DROP, ÜG)." ÜG'yi hatırlat: DROP geri dönüşü olmayan, yıkıcı bir komut. Sütun ekleyip
silmeyi canlı göster. Sonra temizlik: önce bağlı tabloyu (odunc, FK var) sonra ana tabloyu (kitaplar) DROP et.
- Sor: "Neden önce odunc'u sonra kitaplar'ı DROP ediyoruz?" (odunc, kitaplar'a FK ile bağlı; önce bağlıyı temizle.)
- Herkes burada takılır: DROP'un yıkıcılığı (ÜG). "Gerçek hayatta DROP'tan önce iki kez düşün."

### Konu anlatımı
- `ALTER TABLE ... ADD COLUMN ...`: var olan tabloya yeni sütun ekler.
- `ALTER TABLE ... DROP COLUMN ...`: bir sütunu (ve içindeki veriyi) siler.
- `ALTER TABLE ... RENAME COLUMN ... TO ...`: sütunu yeniden adlandırır.
- `DROP TABLE ...`: tabloyu komple yok eder (ÜG; geri dönüşü yok).

```sql
ALTER TABLE kitaplar ADD COLUMN sayfa_sayisi INTEGER;
ALTER TABLE kitaplar DROP COLUMN yazar;
DROP TABLE odunc;      -- önce FK ile bağlı tablo
DROP TABLE kitaplar;   -- sonra ana tablo
```

> Mini slogan: **ALTER yapıyı değiştirir (sütun ekle/sil/adlandır); DROP tabloyu komple yok eder (ÜG: dikkat, geri dönüşü yok).**

### Çözümlü örnekler

**Örnek 1 (sütun ekle/sil)**
- Sorgu:
```sql
ALTER TABLE kitaplar ADD COLUMN sayfa_sayisi INTEGER;
SELECT * FROM kitaplar;          -- artık sayfa_sayisi sütunu da var (değerler NULL)
ALTER TABLE kitaplar DROP COLUMN sayfa_sayisi;
```
- Ne anlıyoruz? Önce yeni bir sütun ekledik (mevcut satırlarda NULL gelir), sonra sildik. ALTER, tablo
  kurulduktan sonra yapısını değiştirmemizi sağlar.

**Örnek 2 (temizlik, FK sırası)**
- Sorgu:
```sql
DROP TABLE odunc;      -- önce: kitaplar'a FK ile bağlı
DROP TABLE kitaplar;   -- sonra: ana tablo
```
- Ne anlıyoruz? `odunc`, `kitaplar`'a FK ile bağlı; bağlı tabloyu önce silmezsek, kitaplar'ı silmek
  referans bütünlüğünü bozacağı için engellenebilir. O yüzden önce odunc, sonra kitaplar. (DROP yıkıcı;
  ÜG'deki dikkat geçerli.)

### Sık hatalar & uyarılar
- FK ile başka tablonun referans verdiği bir tabloyu, bağlıları silmeden DROP etmeye çalışmak -> hata.
- DROP COLUMN'un o sütundaki tüm veriyi sileceğini unutmak (geri dönüşü yok; ÜG).
- DROP TABLE'ı hafife almak. Gerçek hayatta yedeksiz DROP yapma (ÜG).

### Anlama soruları

**Soru 1 (yaz).** `kitaplar` tablosuna bir `dil` (TEXT) sütunu ekle, varsayılanı 'Türkçe' olsun.
> **İpucu:** ALTER TABLE ... ADD COLUMN dil TEXT DEFAULT 'Türkçe'.

> **Detaylı cevap:**
> ```sql
> ALTER TABLE kitaplar ADD COLUMN dil TEXT DEFAULT 'Türkçe';
> ```
> Var olan tabloya yeni bir `dil` sütunu ekledik ve varsayılanını 'Türkçe' yaptık. DEFAULT sayesinde,
> mevcut satırlar ve bundan sonra dil belirtmeden eklenecek satırlar otomatik 'Türkçe' olur (DEFAULT'suz
> eklenseydi mevcut satırlarda NULL olurdu). ALTER ADD COLUMN, tablo kurulduktan sonra ihtiyaç değişince
> yapıyı genişletmenin yoludur; gerçek projelerde sık kullanılır (yeni bir alan gerektiğinde).

**Soru 2 (kavram).** `odunc` ve `kitaplar` tablolarını silerken neden önce `odunc`'u silmeliyiz?
> **İpucu:** Hangi tablo hangisine FK ile bağlı?

> **Detaylı cevap:** Çünkü `odunc` tablosu `kitaplar`'a bir FK ile bağlı (`kitap_id REFERENCES
> kitaplar(id)`). `kitaplar`'ı önce silmeye çalışırsak, `odunc`'taki kayıtlar artık var olmayan kitaplara
> işaret eder duruma düşerdi; bu referans bütünlüğünü bozacağı için veritabanı buna izin vermez (hata
> verir). Doğru sıra: önce bağımlı (referans veren) tabloyu (`odunc`) sil, sonra ana (referans edilen)
> tabloyu (`kitaplar`). Genel kural: FK zincirlerinde silme, bağımlıdan ana tabloya doğru yapılır.
> (Alternatif olarak FK'lar `ON DELETE CASCADE` ile tanımlanırsa otomatik zincirleme silme olur, ama bu
> daha ileri bir konudur ve dikkatli kullanılmalıdır.)

### Çıkış bileti
ALTER ile DROP arasındaki fark nedir, ve hangisi ÜG'deki "yıkıcı komut"tur?

---

## Pratik (editörde dene)

> Sandbox'ta kendi tablolarını kur. Bitince DROP et ya da Sıfırla. Seed: Kampüs (students FK için lazım).

**P1 (kolay).** [▶ Editörde dene] `dergiler` adında bir tablo oluştur: id (INTEGER), ad (TEXT, NOT NULL),
ay (INTEGER). Sonra bir satır ekle ve listele.
> İpucu: CREATE TABLE dergiler (...); INSERT ...; SELECT ...
> <details><summary>Cevap</summary>
>
> ```sql
> CREATE TABLE dergiler (id INTEGER, ad TEXT NOT NULL, ay INTEGER);
> INSERT INTO dergiler (id, ad, ay) VALUES (1, 'Bilim Dergisi', 4);
> SELECT * FROM dergiler;
> ```
> Bittiğinde: `DROP TABLE dergiler;`
> </details>

**P2 (orta, kısıtlar).** [▶ Editörde dene] Bir `urunler` tablosu oluştur: id PK, ad NOT NULL, fiyat
NUMERIC DEFAULT 0, CHECK (fiyat >= 0). Sonra fiyatı negatif bir ürün eklemeyi dene (hata almalısın).
> İpucu: CHECK (fiyat >= 0); negatif fiyat reddedilir.
> <details><summary>Cevap</summary>
>
> ```sql
> CREATE TABLE urunler (
>   id INTEGER PRIMARY KEY,
>   ad TEXT NOT NULL,
>   fiyat NUMERIC(8,2) DEFAULT 0 CHECK (fiyat >= 0)
> );
> INSERT INTO urunler (id, ad, fiyat) VALUES (1, 'Kalem', -5);  -- HATA: CHECK
> ```
> CHECK kısıtı negatif fiyatı kapıda durdurur. `DROP TABLE urunler;` ile temizle.
> </details>

**P3 (zorlayıcı, FK).** [▶ Editörde dene] Bir `favori_dersler` tablosu kur: id PK, student_id (students'a
FK), course_id (courses'a FK). Sonra var olmayan bir student_id (örn. 999) ile satır eklemeyi dene (FK
hatası).
> İpucu: REFERENCES students(id), REFERENCES courses(id).
> <details><summary>Cevap</summary>
>
> ```sql
> CREATE TABLE favori_dersler (
>   id INTEGER PRIMARY KEY,
>   student_id INTEGER REFERENCES students(id),
>   course_id INTEGER REFERENCES courses(id)
> );
> INSERT INTO favori_dersler (id, student_id, course_id) VALUES (1, 999, 1);  -- HATA: öğrenci 999 yok
> INSERT INTO favori_dersler (id, student_id, course_id) VALUES (2, 1, 1);    -- OK (öğrenci 1, ders 1 var)
> ```
> FK, olmayan öğrenciye favori ders kaydı açmayı engeller (referans bütünlüğü). `DROP TABLE favori_dersler;`
> </details>

**P4 (düşündürücü, ALTER).** [▶ Editörde dene] P1'deki `dergiler` tablosuna `yil` (INTEGER) sütunu ekle,
sonra `ay` sütununu sil. Her adımdan sonra `SELECT * FROM dergiler` ile yapının değiştiğini gözle.
> İpucu: ALTER TABLE ... ADD COLUMN ...; ALTER TABLE ... DROP COLUMN ...
> <details><summary>Cevap</summary>
>
> ```sql
> ALTER TABLE dergiler ADD COLUMN yil INTEGER;
> SELECT * FROM dergiler;   -- yil sütunu eklendi (NULL)
> ALTER TABLE dergiler DROP COLUMN ay;
> SELECT * FROM dergiler;   -- ay sütunu gitti
> ```
> ALTER yapıyı değiştirir; DROP COLUMN o sütunun verisini de siler (geri dönüşü yok, ÜG).
> </details>

---

## Ünite 12 özeti (öğrenciye)
- **CREATE TABLE** ile yapı kurarsın; her sütunun bir **adı** ve bir **tipi** (INTEGER/NUMERIC/TEXT/DATE/BOOLEAN) vardır.
- **Kısıtlar** kötü veriyi kapıda durdurur: `NOT NULL` (boş olamaz), `DEFAULT` (yoksa şu), `UNIQUE`
  (tekrarsız), `CHECK` (koşul).
- **PRIMARY KEY** = benzersiz + NOT NULL (tablonun kimliği). **FOREIGN KEY** başka tablonun kimliğine
  işaret eder ve onun var olmasını zorlar (**referans bütünlüğü**).
- **ALTER TABLE** yapıyı değiştirir (sütun ekle/sil/adlandır). **DROP TABLE** tabloyu komple yok eder
  (ÜG: yıkıcı, geri dönüşü yok). FK zincirinde önce bağımlı tabloyu sil.

## 🧑‍🏫 Öğretmen notu (ünite geneli)
DDL'i en sona yakın koymamızın sebebi (kaynakların önerisi): öğrenci önce hazır tablolardan anlamlı cevap
almayı öğrenince motivasyonu yüksek olur; sonra "bu tablolar nasıl tasarlanıyor?" sorusu doğal gelir.
Kısıt ihlallerini canlı göster (başlıksız kitap, negatif yıl, tekrar isbn, olmayan FK) çünkü "kötü veriyi
tasarımla engellemek" fikri çok güçlüdür ve Ü2'deki NULL, Ü6'daki PK/FK ile bağlanır. DROP'un yıkıcılığını
ÜG'ye bağlayarak hatırlat. Bir sonraki ünite (Window functions) analitik SQL'in zirvesi; oradan sonra
bonus View/Index ile bitiriyoruz.
