# Ünite G — Güvenlik: Veriyi Değiştiren ve Yok Eden Komutlar

> Kavram etiketleri: `read-vs-write`, `delete-without-where`, `update-without-where`, `transaction-safety`, `drop-truncate`, `safe-habits`
> Ön koşul: Ü0-Ü3 (özellikle Ü2 WHERE)
> Önerilen yer: Ü3'ten sonra, JOIN'lerden önce (hafif-orta). Tam DML Ü11, tam DDL Ü12'de derinleşir.
> Kullanılan tablolar: students, enrollments, clubs, events (sandbox'ta, resetlenebilir)
> Tahmini süre: 35-45 dk
> Ünite sloganı: **"Bazı komutlar veriyi okur, bazıları değiştirir, bazıları geri dönüşü olmadan yok eder."**

> NOT (öğrenciye): Bu ünitedeki tehlikeli komutları burada GÖNÜL RAHATLIĞIYLA dene. Çünkü buradaki
> veritabanı bir kum havuzu; "↺ Sıfırla" ile her şey eski haline döner. Amacımız, gerçek hayatta
> (sıfırlama olmayan yerde) bu komutları nasıl güvenle kullanacağını öğrenmek.

---

## Ders G.1 — İki dünya: okuyan komutlar vs değiştiren/yok eden komutlar

### 🧑‍🏫 Öğretmen için
Tahtayı ikiye böl. Sol tarafa "OKUR (güvenli)" yaz: `SELECT`. Sağ tarafa "DEĞİŞTİRİR / YOK EDER
(dikkat)" yaz: `INSERT`, `UPDATE`, `DELETE`, `DROP`, `TRUNCATE`. Sınıfa şunu söyle: "Şimdiye kadar hep
sol taraftaydık, hiçbir şeyi bozmadık. Bugün sağ tarafa geçiyoruz ve orada bir yanlış, gerçek hayatta
geri dönülmez sonuçlar doğurabilir." Sonra rahatlat: "Ama burada kum havuzundayız, Sıfırla butonumuz
var, o yüzden korkmadan deneyeceğiz; korkmayı değil, dikkati öğreneceğiz."
- Sor: "Sizce `SELECT` bir satırı silebilir mi?" (Hayır, sadece okur, Ü0.4'te demiştik.)
- Gerçek hayat hikâyesi anlat (klişe ama etkili): "Bir geliştirici `WHERE` koymayı unutup tüm müşteri
  tablosunu güncellemiş..." Bu dersin neden var olduğunu hissettirir.
- Anahtar cümle: **"Sağ taraftaki komutları çalıştırmadan önce bir saniye dur ve düşün."**

### Neden / nerede işime yarar
Bir gün gerçek bir veritabanında çalışacaksın: müşteri, sipariş, kullanıcı verisi. Orada yanlış bir
`DELETE` ya da `UPDATE`, saniyeler içinde binlerce kaydı bozabilir ve çoğu zaman geri alınamaz. Bu
dersin amacı sana komutları değil, **disiplini** vermek.

### Konu anlatımı
SQL komutlarını üç gruba ayıralım:

1. **Okuyan (güvenli):** `SELECT`. Veriye dokunmaz, sadece sonuç kümesi üretir (Ü0.4). İstediğin kadar
   çalıştır, hiçbir şey bozulmaz.
2. **Veriyi değiştiren (dikkat):** `INSERT` (ekler), `UPDATE` (değiştirir), `DELETE` (satır siler).
   Bunlar tablonun **içeriğini** kalıcı değiştirir. (Detay: Ü11.)
3. **Yapıyı değiştiren/yok eden (yüksek dikkat):** `DROP TABLE` (tabloyu komple siler), `TRUNCATE`
   (tüm satırları bir anda boşaltır), `ALTER` (yapıyı değiştirir). (Detay: Ü12.)

Bu ünitede bu komutları derinlemesine değil, **tehlikelerini ve güvenli kullanımını** öğreneceğiz.
En önemli fikir: **2. ve 3. gruptaki komutların gerçek hayatta çoğu zaman "geri al" tuşu yoktur.**

> Mini slogan: **SELECT okur ve güvenlidir; UPDATE/DELETE/DROP değiştirir ya da yok eder, geri dönüşü çoğu zaman yoktur.**

### Çözümlü örnek

**Örnek 1 (güvenli dünya)**
- `SELECT * FROM clubs;` çalıştır. 5 kulüp gelir. Tekrar tekrar çalıştır; hep aynı, hiçbir şey bozulmaz.
  Bu, okuyan dünyanın rahatlığı: deneme yapmak bedava.

### Sık hatalar & uyarılar
- "Her komut SELECT gibi masumdur" sanmak. Değil. UPDATE/DELETE/DROP veriye kalıcı dokunur.
- Gerçek bir veritabanında "önce dene, olmazsa geri alırım" diye düşünmek. Çoğu zaman geri alamazsın.

### Anlama soruları

**Soru 1 (çoktan seçmeli).** Aşağıdakilerden hangisi tabloyu DEĞİŞTİRMEZ, sadece okur?
- A) `DELETE FROM students;`
- B) `UPDATE students SET city = 'İzmir';`
- C) `SELECT * FROM students;`
- D) `DROP TABLE students;`

> **İpucu:** Hangisi sonuç üretir ama veriye dokunmaz?

> **Detaylı cevap:** Doğru cevap **C**. `SELECT` salt okur; tabloyu olduğu gibi bırakır, sana bir
> sonuç kümesi gösterir (Ü0.4). Diğer üçü tehlikelidir: A tüm öğrenci satırlarını siler, B tüm
> öğrencilerin şehrini İzmir yapar (WHERE yok!), D ise `students` tablosunu komple yok eder. Bu üçü
> gerçek bir veritabanında geri dönülmez hasar verebilir. Bu yüzden sol-dünya (SELECT) ile sağ-dünya
> (değiştiren/yok eden) ayrımını her zaman aklında tut.

### Çıkış bileti
`SELECT` ile `DELETE` arasındaki en temel fark nedir?

---

## Ders G.2 — En sık felaket: WHERE'siz UPDATE ve DELETE

### 🧑‍🏫 Öğretmen için
Bu dersi canlı ve dramatik yap. Tahtaya yaz: `DELETE FROM enrollments;` Sınıfa sor: "Bu kaç satır
siler?" (Hepsini, 20'yi.) Sonra editörde GERÇEKTEN çalıştır, `SELECT COUNT(*)` ile 0 olduğunu göster,
sınıf "aaa" desin, sonra "↺ Sıfırla" bas, geri gelsin. Bu an unutulmaz olur. Mesaj: "WHERE'i unutmak,
'şu öğrenciyi sil' derken 'tüm öğrencileri sil' demektir."
- Altın kural (tahtaya büyük yaz): **"UPDATE/DELETE yazmadan önce, aynı WHERE ile bir SELECT çalıştır,
  kaç satırı etkileyeceğini gör."**
- Sor: "Önce hangi 3 öğrenciyi sileceğimi nasıl görürüm?" (Aynı WHERE ile SELECT.)
- Herkes burada takılır: heyecanla WHERE'siz çalıştırırlar. Refleks haline getir: "WHERE nerede?"

### Konu anlatımı
`DELETE` ve `UPDATE` bir `WHERE` ile hangi satırlara dokunacağını belirler. **WHERE'i yazmazsan,
komut TÜM satırlara uygulanır.** Bu, en sık ve en pahalı SQL hatasıdır.

Güvenli alışkanlık, üç adım:
1. **Önce prova:** Silmek/değiştirmek istediğin satırları, aynı WHERE ile bir `SELECT` yazıp gör.
2. **Kaç satır?** Beklediğin sayı mı? (3 öğrenci silecektim ama SELECT 14 gösteriyorsa, WHERE yanlış.)
3. **Sonra uygula:** Aynı WHERE ile `DELETE`/`UPDATE`.

```sql
-- 1) ÖNCE PROVA: kimi sileceğim?
SELECT * FROM enrollments WHERE student_id = 7;

-- 2) Beklediğim satırlar mı? Evetse:
DELETE FROM enrollments WHERE student_id = 7;
```

> Mini slogan: **WHERE'siz UPDATE/DELETE = "hepsine yap" demektir. Silmeden önce aynı WHERE ile SELECT çek.**

### Çözümlü örnekler

**Örnek 1 (felaket, sandbox'ta güvenle)**
- Ne oluyor? WHERE unutulursa.
- Sorgu:
```sql
SELECT COUNT(*) FROM enrollments;   -- 20
DELETE FROM enrollments;            -- WHERE yok: HEPSİ silinir
SELECT COUNT(*) FROM enrollments;   -- 0
```
- Ne anlıyoruz? `DELETE FROM enrollments;` 20 kaydın hepsini sildi. Gerçek hayatta bu felaket olurdu.
  Burada güvendeyiz: **↺ Sıfırla** ile 20 kayıt geri gelir. Şimdi sıfırla ve doğrusunu yap.

**Örnek 2 (doğru yol: önce prova, sonra hedefli sil)**
- Sorgu:
```sql
-- prova: Ali Vural'ın (id 7) kayıtları
SELECT * FROM enrollments WHERE student_id = 7;   -- 1 satır görünür
-- beklediğim buysa:
DELETE FROM enrollments WHERE student_id = 7;     -- sadece o 1 satır silinir
```
- Ne anlıyoruz? Önce SELECT ile tam olarak neyi sileceğimizi gördük (1 satır), sonra aynı WHERE ile
  sildik. Sürpriz yok. (Bitince sıfırla.)

**Örnek 3 (UPDATE'te aynı tuzak)**
- Sorgu:
```sql
-- YANLIŞ: herkesin şehrini değiştirir
UPDATE students SET city = 'İzmir';
-- DOĞRU: önce prova, sonra hedefli
SELECT * FROM students WHERE id = 9;
UPDATE students SET city = 'İzmir' WHERE id = 9;
```
- Ne anlıyoruz? WHERE'siz UPDATE 14 öğrencinin hepsini İzmirli yaptı (felaket). WHERE'li olan sadece
  Burak'ı (id 9) güncelledi.

### Sık hatalar & uyarılar
- WHERE'i unutmak. En pahalı hata. Refleksin "WHERE nerede?" olsun.
- Provayı atlamak. Silmeden/değiştirmeden önce aynı WHERE ile SELECT, kaç satır göreceğine bak.
- Yanlış WHERE (örn. `WHERE id = 9` yerine `WHERE id > 9`). Prova bunu da yakalar.

### Anlama soruları

**Soru 1 (tahmin et).** `DELETE FROM students WHERE city = 'Bursa';` kaç satırı siler? (Bursa'da Ali
Vural ve Emre var.)
> **İpucu:** Önce aynı WHERE ile SELECT düşün.

> **Detaylı cevap:** **2 satır** siler (Ali Vural id 7, Emre id 12). Çünkü `WHERE city = 'Bursa'`
> sadece Bursa'lı öğrencileri hedefler. Bunu silmeden önce `SELECT * FROM students WHERE city =
> 'Bursa';` ile prova etsen, tam olarak bu 2 satırı görür ve "evet, bunları silmek istiyorum" diye
> emin olurdun. Eğer yanlışlıkla `WHERE`'i hiç yazmasaydın, 14 öğrencinin hepsi silinirdi. Prova
> alışkanlığı işte bu farkı yakalar.

**Soru 2 (hata avı).** Bir öğrenci "sadece 9. öğrencinin bursunu sıfırlamak" istedi, şunu yazdı ve tüm
öğrencilerin bursu sıfırlandı. Hata ne, doğrusu ne?
```sql
UPDATE students SET scholarship_amount = 0;
```
> **İpucu:** Hangi satırlara uygulandı? WHERE var mı?

> **Detaylı cevap:** Hata: `WHERE` yok. WHERE olmadan `UPDATE`, tablodaki **tüm** satırlara uygulanır;
> bu yüzden 14 öğrencinin hepsinin bursu 0 oldu. Doğrusu hedefi WHERE ile belirtmek:
> ```sql
> -- önce prova:
> SELECT * FROM students WHERE id = 9;
> -- doğruysa:
> UPDATE students SET scholarship_amount = 0 WHERE id = 9;
> ```
> Böylece sadece 9. öğrenci (Burak) etkilenir. Genel kural: bir `UPDATE` ya da `DELETE` yazarken,
> cümleyi `WHERE` olmadan ASLA bitmiş sayma; ve uygulamadan önce aynı WHERE ile bir SELECT çekip kaç
> satır geleceğini gör. (Sandbox'ta zaten Sıfırla var ama bu alışkanlığı gerçek hayat için kazan.)

### Çıkış bileti
Bir `DELETE` çalıştırmadan önce hangi tek adımı yaparak felaketi önlersin?

---

## Ders G.3 — Transaction kalkanı: BEGIN, ROLLBACK, COMMIT

### 🧑‍🏫 Öğretmen için
"Ya WHERE'i doğru yazdığını sandın ama yine de yanlışsa? İşte bir güvenlik ağı daha: transaction."
Benzetme kullan: "BEGIN, 'kalemle yazmaya başla' demek; COMMIT 'mürekkeple sabitle'; ROLLBACK
'sildim, hiç olmadı'." Canlı göster: BEGIN, sil, SELECT ile gittiğini gör, ROLLBACK, geri geldi.
- Sor: "ROLLBACK'ten sonra veri geri geldi mi?" (Evet, COMMIT etmediğimiz için.)
- Uyarı: "COMMIT dersen artık kalıcı; ROLLBACK'in penceresi kapanır."
- Bu, "geri al" tuşunun SQL'deki hali; ama sadece COMMIT'ten önce çalışır.

### Konu anlatımı
Bir **transaction** (işlem), birkaç komutu "ya hep ya hiç" paketine koyar:
- `BEGIN;` işlemi başlatır.
- Komutlarını çalıştırırsın (DELETE, UPDATE...). Değişiklikler henüz **geçici**.
- `COMMIT;` dersen değişiklikler **kalıcı** olur.
- `ROLLBACK;` dersen tüm değişiklikler **geri alınır**, hiç olmamış gibi.

Bu, tehlikeli bir işlemi yapmadan önce bir güvenlik ağı kurmanı sağlar: BEGIN ile başla, yap,
SELECT ile sonucu kontrol et; iyiyse COMMIT, kötüyse ROLLBACK.

```sql
BEGIN;
DELETE FROM clubs WHERE id = 3;     -- Satranç kulübünü sildim
SELECT * FROM clubs;                -- kontrol: gitti mi? doğru olan mı gitti?
ROLLBACK;                           -- fikrim değişti / yanlış oldu: geri al
SELECT * FROM clubs;                -- Satranç geri geldi, 5 kulüp
```

> Mini slogan: **BEGIN ile başla, ROLLBACK ile geri al, COMMIT ile sabitle. ROLLBACK sadece COMMIT'ten önce kurtarır.**

### Çözümlü örnekler

**Örnek 1 (geri alma)**
- Sorgu (yukarıdaki). Ne anlıyoruz? `DELETE` çalıştı ama `BEGIN` içinde olduğu için kalıcı değildi;
  `ROLLBACK` her şeyi eski haline getirdi. Transaction, "emin değilsem önce deneyip geri alabilirim"
  imkânı verir.

**Örnek 2 (sabitleme)**
- Sorgu:
```sql
BEGIN;
UPDATE students SET scholarship_amount = 6000 WHERE id = 1;  -- Ayşe'ye zam
SELECT scholarship_amount FROM students WHERE id = 1;        -- 6000, doğru
COMMIT;                                                       -- artık kalıcı
```
- Ne anlıyoruz? Kontrol ettik, doğruydu, `COMMIT` ile sabitledik. Artık `ROLLBACK` işe yaramaz, karar
  kesinleşti. (Sandbox'ta yine de Sıfırla seed'e döndürür.)

### Sık hatalar & uyarılar
- `BEGIN` açıp `COMMIT` ya da `ROLLBACK` ile kapatmayı unutmak. İşlem açık kalır.
- COMMIT'ten sonra ROLLBACK beklemek. COMMIT kalıcıdır; geri alma penceresi kapanmıştır.

### Anlama soruları

**Soru 1 (tahmin et).** Şu adımların sonunda `students` tablosunda kaç satır olur?
```sql
BEGIN;
DELETE FROM students;     -- 14 satır gitti gibi görünür
ROLLBACK;
SELECT COUNT(*) FROM students;
```
> **İpucu:** ROLLBACK ne yapar?

> **Detaylı cevap:** **14.** `DELETE FROM students;` işlem içinde tüm satırları sildi, ama bu
> değişiklik henüz geçiciydi (BEGIN içindeydik, COMMIT etmedik). `ROLLBACK;` tüm transaction'ı geri
> aldığı için silme hiç olmamış gibi olur ve 14 öğrenci geri gelir. Eğer `ROLLBACK` yerine `COMMIT`
> yazsaydık, 0 satır kalırdı (silme kalıcı olurdu). Transaction'ın gücü tam burada: COMMIT'e kadar her
> şey "kurşun kalemle", istediğin an silebilirsin.

**Soru 2 (kavram).** `COMMIT` ile `ROLLBACK` arasındaki fark nedir?
> **İpucu:** Biri sabitler, biri geri alır.

> **Detaylı cevap:** `COMMIT`, transaction içinde yaptığın tüm değişiklikleri **kalıcı** yapar; artık
> geri alınamaz. `ROLLBACK` ise transaction içinde yaptığın tüm değişiklikleri **iptal eder**, veri
> BEGIN'den önceki haline döner. İkisi de transaction'ı kapatır. Pratikte: tehlikeli bir işlemi
> `BEGIN` ile sarıp yaparsın, `SELECT` ile kontrol edersin; sonuç doğruysa `COMMIT`, yanlışsa
> `ROLLBACK`. Bu, "önce gör, sonra karar ver" güvenliği sağlar. (Tam detay Ü11.)

### Çıkış bileti
Yanlış bir `DELETE` yaptın ama henüz `COMMIT` etmedin. Seni ne kurtarır?

---

## Ders G.4 — Yok etmek: DROP ve TRUNCATE (geri dönüşü yok)

### 🧑‍🏫 Öğretmen için
"DELETE satırları siler ama tablo durur. DROP ise tabloyu komple yok eder, sütunlarıyla birlikte.
TRUNCATE ise tüm satırları bir anda, çok hızlı boşaltır." Tahtaya farkı çiz. Sonra DROP'u sandbox'ta
göster, `SELECT * FROM events` hata versin ("tablo yok"), sınıf görsün, Sıfırla ile geri gelsin.
- Uyarı (büyük yaz): "DROP ve TRUNCATE genelde transaction'la bile zor kurtarılır; gerçek hayatta
  bunları çalıştırmadan önce iki kez düşün, yedek al."
- Sor: "DELETE ile DROP arasındaki fark ne?" (DELETE satır siler/tablo kalır; DROP tabloyu yok eder.)

### Konu anlatımı
- `DELETE FROM tablo;` satırları siler ama tablo (yapısı, sütunları) durur. WHERE ile seçici olunur.
- `TRUNCATE tablo;` tablodaki **tüm** satırları bir anda boşaltır (DELETE'ten hızlı, ama topluca, WHERE
  yok). Tablo durur ama bomboş kalır.
- `DROP TABLE tablo;` tabloyu **komple yok eder**: satırlar, sütunlar, yapı, hepsi gider. Artık o tablo
  yoktur.

Bunlar "yok edici" uçtur. Gerçek hayatta DROP/TRUNCATE çoğu zaman geri alınamaz (yedekten dönmek
gerekir). Bu yüzden en yüksek dikkat bunlarda. (Tam syntax ve kullanım: Ü12.)

İyi haber: burada kum havuzundayız. DROP'u dene, tabloyu uçur, sonra **↺ Sıfırla** ile geri getir.
Korkuyu değil, "gerçek hayatta bunu yapmadan önce dur ve yedek al" disiplinini öğreniyoruz.

> Mini slogan: **DELETE satır siler (tablo kalır), TRUNCATE hepsini boşaltır, DROP tabloyu yok eder. Üçü de gerçek hayatta geri dönülmez olabilir.**

### Çözümlü örnekler

**Örnek 1 (DROP, sonra Sıfırla)**
- Sorgu:
```sql
SELECT * FROM events;     -- 4 etkinlik var
DROP TABLE events;        -- tablo komple yok edildi
SELECT * FROM events;     -- HATA: "relation events does not exist"
```
- Ne anlıyoruz? `DROP TABLE events;` tabloyu tamamen sildi; artık ona SELECT bile atamıyoruz, hata
  veriyor. Gerçek hayatta bu kayıpla sonuçlanırdı. Burada **↺ Sıfırla** ile `events` geri gelir.

**Örnek 2 (TRUNCATE vs DELETE)**
- Sorgu:
```sql
TRUNCATE event_attendance;          -- tüm satırlar bir anda gitti, tablo boş ama duruyor
SELECT COUNT(*) FROM event_attendance;  -- 0
```
- Ne anlıyoruz? `TRUNCATE` tablodaki tüm katılım kayıtlarını boşalttı. Tablo hâlâ var (SELECT hata
  vermedi, 0 döndü), ama içi boş. WHERE ile seçici olamazsın; ya hep ya hiç. (Sıfırla ile geri gelir.)

### Sık hatalar & uyarılar
- `DROP` ile `DELETE`'i karıştırmak. DELETE satır siler (tablo kalır); DROP tabloyu yok eder.
- Gerçek bir veritabanında yedeksiz DROP/TRUNCATE çalıştırmak. Önce yedek, sonra iki kez düşün.
- TRUNCATE'i "WHERE ile sınırlarım" sanmak. TRUNCATE topludur, WHERE almaz; seçici silme DELETE iledir.

### Anlama soruları

**Soru 1 (çoktan seçmeli).** `clubs` tablosundaki tüm satırları silmek ama tabloyu (yapısını) korumak
istiyorsun. Hangisi DOĞRU?
- A) `DROP TABLE clubs;`
- B) `DELETE FROM clubs;` (veya `TRUNCATE clubs;`)
- C) `SELECT * FROM clubs;`
- D) `ALTER TABLE clubs;`

> **İpucu:** Tablo kalsın ama içi boşalsın istiyorsun.

> **Detaylı cevap:** Doğru cevap **B**. `DELETE FROM clubs;` (WHERE'siz) tüm satırları siler ama tablo
> yapısı durur; `TRUNCATE clubs;` de aynı sonucu daha hızlı verir. A (`DROP TABLE`) tabloyu komple yok
> ederdi, yapıyı da kaybederdin. C sadece okur, hiçbir şey silmez. D yapıyı değiştirmek içindir
> (örneğin sütun ekleme) ve tek başına bu haliyle anlamsız. Özet: "satırları sil, tablo kalsın" =
> DELETE/TRUNCATE; "tabloyu yok et" = DROP.

**Soru 2 (kavram).** Neden DROP ve TRUNCATE, DELETE'ten daha "tehlikeli" sayılır?
> **İpucu:** Geri alınabilirlik ve kapsam.

> **Detaylı cevap:** Çünkü hem kapsamları geniştir hem de geri alınmaları zordur. `DELETE` seçici
> olabilir (WHERE ile sadece birkaç satır) ve bir transaction içinde ROLLBACK ile geri alınabilir.
> `TRUNCATE` ise tüm satırları topluca boşaltır (WHERE yok) ve birçok sistemde transaction'la bile zor
> kurtarılır; `DROP TABLE` ise tablonun kendisini, yapısıyla birlikte yok eder, geri getirmek için
> genelde yedekten dönmek gerekir. Yani yanlışlık ihtimali daha pahalıdır. Pratik kural: DROP/TRUNCATE
> öncesi mutlaka "emin miyim, yedek var mı?" diye dur. (Sandbox'ta Sıfırla seni korur, gerçek hayatta korumaz.)

### Çıkış bileti
`DELETE FROM clubs;` ile `DROP TABLE clubs;` arasındaki fark nedir?

---

## Pratik (editörde dene)

> Bu pratikte BİLEREK tehlikeli komutlar çalıştıracağız, çünkü kum havuzundayız. Her görevden sonra
> **↺ Sıfırla** ile veriyi geri getir. Amaç: ne olduğunu gözle gör, güvenli alışkanlığı kas hafızası yap.

**P1 (kolay).** [▶ Editörde dene] Önce `SELECT * FROM clubs WHERE id = 3;` ile Satranç kulübünü gör.
Sonra sadece onu sil. Sonra `SELECT * FROM clubs;` ile 4 kulüp kaldığını doğrula. (Bitince Sıfırla.)
> İpucu: Önce prova SELECT, sonra `DELETE ... WHERE id = 3;`.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT * FROM clubs WHERE id = 3;     -- prova: Satranç
> DELETE FROM clubs WHERE id = 3;       -- sadece onu sil
> SELECT * FROM clubs;                  -- 4 kulüp kaldı
> ```
> Hedefli silme: önce gördük, sonra sildik. Sıfırla ile 5'e döner.
> </details>

**P2 (orta, felaketi gör).** [▶ Editörde dene] `enrollments` tablosunda kaç satır olduğunu say.
Sonra WHERE'siz `DELETE` çalıştır, tekrar say. Ne oldu? (Sonra Sıfırla.)
> İpucu: `DELETE FROM enrollments;` WHERE yok = hepsi.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT COUNT(*) FROM enrollments;   -- 20
> DELETE FROM enrollments;            -- WHERE yok!
> SELECT COUNT(*) FROM enrollments;   -- 0
> ```
> 20 kayıt tek komutla gitti. Gerçek hayatta felaket; burada Sıfırla kurtarır. WHERE'in önemini
> hisset.
> </details>

**P3 (orta, transaction).** [▶ Editörde dene] Bir transaction aç, tüm öğrencilerin şehrini 'Test' yap,
SELECT ile gör, sonra ROLLBACK ile geri al. Şehirler eski haline döndü mü?
> İpucu: BEGIN; UPDATE ...; SELECT ...; ROLLBACK;
> <details><summary>Cevap</summary>
>
> ```sql
> BEGIN;
> UPDATE students SET city = 'Test';
> SELECT DISTINCT city FROM students;   -- hepsi 'Test'
> ROLLBACK;
> SELECT DISTINCT city FROM students;   -- eski şehirler geri geldi
> ```
> ROLLBACK, COMMIT etmediğimiz değişiklikleri sildi. Transaction = güvenlik ağı.
> </details>

**P4 (zorlayıcı, DROP).** [▶ Editörde dene] `events` tablosunu DROP et, sonra ona SELECT atmayı dene
(hata almalısın). Sonra Sıfırla ile geri getir ve tekrar SELECT at.
> İpucu: `DROP TABLE events;` sonra `SELECT * FROM events;` hata verir.
> <details><summary>Cevap</summary>
>
> ```sql
> DROP TABLE events;        -- tablo yok edildi
> SELECT * FROM events;     -- HATA: relation events does not exist
> -- ↺ Sıfırla bas, sonra:
> SELECT * FROM events;     -- 4 etkinlik geri geldi
> ```
> DROP, tabloyu yapısıyla birlikte yok etti; DELETE'ten farkı bu. Sıfırla seed'i yeniden kurar.
> </details>

**P5 (düşündürücü).** [▶ Editörde dene] Önce `SELECT COUNT(*) FROM students WHERE city = 'İstanbul';`
ile kaç İstanbullu olduğunu gör (4). Sonra "güvenli silme" disipliniyle SADECE İstanbulluları sil.
Sonra toplamı kontrol et (10 kalmalı). (Sonra Sıfırla.)
> İpucu: Prova SELECT'i gördün; aynı WHERE ile DELETE.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT COUNT(*) FROM students WHERE city = 'İstanbul';  -- 4 (prova)
> DELETE FROM students WHERE city = 'İstanbul';           -- aynı WHERE ile sil
> SELECT COUNT(*) FROM students;                          -- 14 - 4 = 10
> ```
> Önce kaç satır etkileneceğini gördük (4), sonra aynı WHERE ile sildik, sonucu doğruladık (10).
> Bu üç adımlı disiplin (gör, doğrula, uygula) gerçek hayatta seni felaketlerden korur.
> </details>

---

## Ünite G özeti (öğrenciye)
- Komutlar üç dünya: **okuyan** (SELECT, güvenli), **değiştiren** (INSERT/UPDATE/DELETE), **yok eden**
  (DROP/TRUNCATE/ALTER).
- **WHERE'siz UPDATE/DELETE tüm satırlara uygulanır** = en sık felaket. Uygulamadan önce **aynı WHERE
  ile SELECT** çek, kaç satır göreceğine bak.
- **Transaction** güvenlik ağıdır: `BEGIN` ile başla, `ROLLBACK` ile geri al, `COMMIT` ile sabitle.
  ROLLBACK yalnız COMMIT'ten önce kurtarır.
- **DELETE** satır siler (tablo kalır), **TRUNCATE** hepsini boşaltır, **DROP** tabloyu yok eder.
  DROP/TRUNCATE gerçek hayatta çoğu zaman geri dönülmez; önce yedek, iki kez düşün.
- Burada sandbox + **↺ Sıfırla** var, korkmadan dene; ama disiplini gerçek hayat için kazan.

## 🧑‍🏫 Öğretmen notu (ünite geneli)
Bu ünite bilerek erken (Ü3'ten sonra) ve hafif-orta: amaç öğrenciye DML/DDL'i tam öğretmek değil,
tehlikeyi tanıtmak ve "önce SELECT, WHERE, transaction, yedek" disiplinini kas hafızası yapmak. En
güçlü an, WHERE'siz DELETE'i canlı çalıştırıp her şeyin gittiğini, sonra Sıfırla ile geri geldiğini
göstermek; öğrenciler bunu unutmaz. Tam syntax ve detaylar Ü11 (DML) ve Ü12'de (DDL) gelecek; orada bu
disipline geri atıfta bulun. Sandbox'ın resetlenebilir olması bu üniteyi mümkün kılıyor: gerçek
ortamda asla yaptırmayacağın denemeleri burada güvenle yaptırabilirsin.
