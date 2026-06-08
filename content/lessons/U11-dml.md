# Ünite 11 — DML: Veri Eklemek, Değiştirmek, Silmek (ve Transaction)

> Kavram etiketleri: `insert`, `insert-multiple`, `returning`, `update`, `update-expression`, `delete`, `transaction-deep`, `atomicity`
> Ön koşul: Ü0-Ü10 (özellikle ÜG Güvenlik)
> Kullanılan tablolar: students, clubs, club_memberships (sandbox'ta, resetlenebilir)
> Tahmini süre: 50-60 dk
> Ünite sloganı: **"Okumayı öğrendin; şimdi veriyi güvenle değiştirmeyi öğreniyorsun."**

> ÜG'de (Güvenlik) bu komutların tehlikesini ve güvenli alışkanlıkları görmüştük. Bu ünitede onları
> derinlemesine ve doğru kullanımıyla öğreniyoruz. Her şey sandbox'ta; "↺ Sıfırla" hep yanında.

---

## Ders 11.1 — INSERT: yeni satır eklemek

### 🧑‍🏫 Öğretmen için
"Şimdiye kadar hep var olan veriyi okuduk. Şimdi yeni veri ekliyoruz." Tahtaya `INSERT INTO students
(...) VALUES (...)` kalıbını yaz. Vurgula: sütun listesi + ona karşılık gelen değerler, sırası eşleşmeli.
Bir satır ekleyip `SELECT COUNT(*)` ile 14'ten 15'e çıktığını göster, sonra Sıfırla. Sonra çoklu satır
ekleme ve `RETURNING` ile eklenenin id'sini geri almayı göster.
- Sor: "Sütun listesini yazmazsak ne olur?" (Tüm sütunlara sırayla değer vermen gerekir; riskli, sütun
  sırası değişirse bozulur. Sütun listesi yazmak iyi alışkanlık.)
- Herkes burada takılır: metin değerlerde tek tırnak (Ü2), sütun-değer sırası eşleşmesi.

### Konu anlatımı
`INSERT`, tabloya yeni satır(lar) ekler. Güvenli kalıp, sütunları açıkça listelemek:

```sql
INSERT INTO students (id, first_name, last_name, city, department_id, birth_date, email, scholarship_amount, created_at)
VALUES (15, 'Yeni', 'Öğrenci', 'İstanbul', 1, '2005-01-01', 'yeni@kampus.edu', 1000, '2025-09-01');
```

Sütun listesi ile değerler **sırayla** eşleşir. Sütun listesini yazmak iyi alışkanlıktır: hangi değerin
nereye gittiği açık olur ve tabloya yeni sütun eklense bile sorgun bozulmaz.

İki ek yetenek:
- **Çoklu satır:** `VALUES (...), (...), (...)` ile tek komutta birden çok satır.
- **RETURNING:** Eklenen satırın bir bilgisini geri alır (örneğin otomatik üretilen id): `... RETURNING id`.

> Mini slogan: **INSERT INTO tablo (sütunlar) VALUES (değerler); sütun listesi neyin nereye gittiğini netleştirir.**

### Çözümlü örnekler

**Örnek 1 (tek satır + say)**
- Sorgu:
```sql
SELECT COUNT(*) FROM students;   -- 14
INSERT INTO students (id, first_name, last_name, city, department_id, birth_date, email, scholarship_amount, created_at)
VALUES (15, 'Yeni', 'Öğrenci', 'İstanbul', 1, '2005-01-01', 'yeni@kampus.edu', 1000, '2025-09-01');
SELECT COUNT(*) FROM students;   -- 15
```
- Ne anlıyoruz? Bir satır eklendi, sayı 15 oldu. (Sıfırla ile 14'e döner.)

**Örnek 2 (çoklu satır + RETURNING)**
- Sorgu:
```sql
INSERT INTO clubs (id, name, founded_year)
VALUES (6, 'Tiyatro', 2022), (7, 'Dağcılık', 2019)
RETURNING id, name;
```
- Ne anlıyoruz? İki kulüp tek komutta eklendi; `RETURNING` eklenen satırların id ve adını geri verdi.
  RETURNING özellikle otomatik üretilen id'leri öğrenmek için çok pratiktir.

### Sık hatalar & uyarılar
- Değer sırasını sütun sırasıyla eşleştirmemek. Liste ve değerler birebir hizalı olmalı.
- Metni tırnaksız yazmak (Ü2). Metin değerleri tek tırnak içinde.
- Var olan bir PK ile eklemek (örn. id 1) -> "duplicate key" hatası. PK benzersiz olmalı.

### Anlama soruları

**Soru 1 (yaz).** `clubs` tablosuna id 8, adı 'Sinema', kuruluş yılı 2023 olan bir kulüp ekle.
> **İpucu:** INSERT INTO clubs (id, name, founded_year) VALUES (...).

> **Detaylı cevap:**
> ```sql
> INSERT INTO clubs (id, name, founded_year) VALUES (8, 'Sinema', 2023);
> ```
> Sütunları (id, name, founded_year) listeledik, değerleri sırayla verdik. `name` metin olduğu için tek
> tırnak içinde ('Sinema'), id ve yıl sayı olduğu için tırnaksız. Eklemeden sonra `SELECT * FROM clubs`
> ile yeni kulübü görebilirsin; Sıfırla ile eski 5 kulübe dönersin. Not: id 8'i seçtik çünkü mevcut
> kulüpler 1-5; var olan bir id verseydik (örn. 3) "duplicate key" hatası alırdık (Satranç zaten 3).

**Soru 2 (kavram).** INSERT'te sütun listesini (`(id, first_name, ...)`) yazmanın yazmamaya göre avantajı nedir?
> **İpucu:** Tablo değişirse, ya da sütun sırası karışırsa?

> **Detaylı cevap:** Sütun listesi yazmak hem güvenli hem okunur. Yazarsan, hangi değerin hangi sütuna
> gittiği açıktır ve değerleri o sıraya göre verirsin. Yazmazsan (`INSERT INTO students VALUES (...)`),
> tablodaki TÜM sütunlara, tam tablo sırasında değer vermek zorundasın; tabloya sonradan bir sütun
> eklenirse ya da sıra değişirse sorgun sessizce yanlış sütuna değer koyabilir veya hata verir. Sütun
> listesi bu kırılganlığı ortadan kaldırır ve sadece istediğin sütunları doldurup gerisini varsayılana/
> NULL'a bırakabilmeni sağlar. İyi alışkanlık: INSERT'te her zaman sütunları listele.

### Çıkış bileti
INSERT'te sütun listesi yazmak neden iyi bir alışkanlıktır?

---

## Ders 11.2 — UPDATE: var olan satırları değiştirmek

### 🧑‍🏫 Öğretmen için
ÜG'yi hatırlat: "UPDATE'te WHERE'i unutmak = herkesi değiştirmek." Önce güvenli prova (SELECT), sonra
UPDATE refleksini tekrarlat. Sonra güzel bir numara göster: `SET scholarship_amount = scholarship_amount
+ 500` — yani mevcut değerin üstüne ekleme. "Yeni değer, eski değere bağlı olabilir." Burak'a (id 9) 500
zam yap, 1500 -> 2000 olsun.
- Sor: "Birden çok sütunu aynı anda güncelleyebilir miyiz?" (Evet, SET a=.., b=.. virgülle.)
- Herkes burada takılır: WHERE'i unutmak (ÜG), ve SET'te birden çok sütunu virgülle ayırmak.

### Konu anlatımı
`UPDATE`, var olan satırların değerlerini değiştirir. Kalıp:

```sql
UPDATE students
SET scholarship_amount = scholarship_amount + 500
WHERE id = 9;
```

- `SET sütun = yeni_değer`: ne değişecek. Yeni değer sabit olabilir ('Ankara'), ya da bir ifade olabilir
  (mevcut değere bağlı: `scholarship_amount + 500`).
- Birden çok sütun: `SET city = 'Ankara', scholarship_amount = 2500`.
- `WHERE`: hangi satırlar. **WHERE'siz UPDATE tüm satırları değiştirir (ÜG).** Önce aynı WHERE ile SELECT
  çekip kaç satır etkileneceğini gör.

> Mini slogan: **UPDATE ... SET ... WHERE ...; yeni değer mevcut değere bağlı olabilir, WHERE'i asla unutma.**

### Çözümlü örnekler

**Örnek 1 (ifadeyle güncelleme, güvenli)**
- Sorgu:
```sql
SELECT first_name, scholarship_amount FROM students WHERE id = 9;  -- prova: Burak 1500
UPDATE students SET scholarship_amount = scholarship_amount + 500 WHERE id = 9;
SELECT first_name, scholarship_amount FROM students WHERE id = 9;  -- Burak 2000
```
- Ne anlıyoruz? Önce kimi değiştireceğimizi gördük (Burak), sonra mevcut bursuna 500 ekledik. Yeni
  değer eski değere bağlıydı. (Sıfırla ile 1500'e döner.)

**Örnek 2 (birden çok sütun)**
- Sorgu:
```sql
UPDATE students SET city = 'Ankara', scholarship_amount = 2500 WHERE id = 4;
```
- Ne anlıyoruz? Can'ın (id 4) hem şehri (NULL'dı, artık Ankara) hem bursu (NULL'dı, artık 2500) tek
  komutta güncellendi. SET içinde sütunları virgülle ayırdık.

### Sık hatalar & uyarılar
- WHERE'i unutmak -> tüm satırları değiştirmek (ÜG felaketi). Önce SELECT ile prova.
- SET'te sütunları virgül yerine AND ile ayırmaya çalışmak. SET'te virgül kullanılır (`SET a=.., b=..`).
- Metin/sayı tırnak karışıklığı (Ü2/Ü3).

### Anlama soruları

**Soru 1 (yaz).** Tüm Bilgisayar Mühendisliği (department_id = 1) öğrencilerinin bursuna 200 ekle. (Önce
kaç kişi etkilenecek, prova ile gör.)
> **İpucu:** Önce SELECT ... WHERE department_id = 1; sonra UPDATE ... SET ... + 200 WHERE department_id = 1.

> **Detaylı cevap:**
> ```sql
> -- prova: kimler etkilenecek?
> SELECT first_name, scholarship_amount FROM students WHERE department_id = 1;
> -- doğruysa:
> UPDATE students SET scholarship_amount = scholarship_amount + 200 WHERE department_id = 1;
> ```
> Önce provayla bölüm 1'deki 5 öğrenciyi (Ayşe, Mehmet, Ali Çelik, Burak, Okan) görürüz. UPDATE her
> birinin bursuna 200 ekler. DİKKAT: Mehmet ve Okan'ın bursu NULL; `NULL + 200 = NULL` (Ü1), yani
> onların bursu NULL kalır, 200 olmaz. Bu önemli bir incelik: NULL'a ekleme yapınca sonuç yine NULL.
> Eğer "NULL'ları da 200 yap" istiyorsak `SET scholarship_amount = COALESCE(scholarship_amount, 0) + 200`
> yazardık (Ü3 COALESCE). WHERE'i bölüme sınırladığımız için sadece 5 öğrenci etkilenir, diğerleri değil.

**Soru 2 (hata avı).** "Sadece Burak'ın şehrini İzmir yap" denildi, şu yazıldı. Sorun ne?
```sql
UPDATE students SET city = 'İzmir';
```
> **İpucu:** WHERE nerede?

> **Detaylı cevap:** WHERE eksik, bu yüzden **tüm öğrencilerin** şehri İzmir olur (14 satır), sadece
> Burak'ın değil. Bu, ÜG'de gördüğümüz en klasik felaket. Doğrusu hedefi WHERE ile belirtmek:
> ```sql
> SELECT * FROM students WHERE id = 9;          -- prova
> UPDATE students SET city = 'İzmir' WHERE id = 9;
> ```
> Önce provayla Burak'ı (id 9) gördük, sonra sadece onu güncelledik. Refleks: UPDATE/DELETE yazarken
> "WHERE nerede?" diye sor, ve uygulamadan önce aynı WHERE ile SELECT çek. (Sandbox'ta Sıfırla var ama
> bu disiplin gerçek hayat için.)

### Çıkış bileti
`SET scholarship_amount = scholarship_amount + 500` ifadesinde yeni değer neye bağlıdır?

---

## Ders 11.3 — DELETE: satır silmek

### 🧑‍🏫 Öğretmen için
ÜG'deki güvenli silme disiplinini (önce SELECT, kaç satır, sonra DELETE) burada tekrar uygula. DELETE'in
satır sildiğini ama tablonun durduğunu (DROP'tan farkı, ÜG) hatırlat. Test için eklediğimiz id 15'i silip
gösterebilirsin.
- Sor: "WHERE'siz DELETE ne yapar?" (Tüm satırları siler, ÜG.)
- Kısa tut; mantık ÜG'de oturdu, burada doğru kullanımı pekiştiriyoruz.

### Konu anlatımı
`DELETE`, koşula uyan satırları siler (tablo durur, sadece satırlar gider; DROP'tan farkı bu, ÜG).

```sql
DELETE FROM students WHERE id = 15;
```

Güvenli kalıp (ÜG): önce aynı WHERE ile `SELECT` çek (kaç ve hangi satır?), doğruysa `DELETE`. WHERE'siz
DELETE tüm tabloyu boşaltır.

> Mini slogan: **DELETE FROM tablo WHERE ...; silmeden önce aynı WHERE ile SELECT çek (ÜG disiplini).**

### Çözümlü örnek
- Sorgu:
```sql
-- diyelim 11.1'de id 15'i eklemiştik
SELECT * FROM students WHERE id = 15;     -- prova
DELETE FROM students WHERE id = 15;       -- sadece o satır
SELECT COUNT(*) FROM students;            -- tekrar 14
```
- Ne anlıyoruz? Hedefli silme: önce gördük, sonra sildik, sayı eski haline döndü. Tablo (students) hâlâ
  duruyor, sadece o satır gitti.

### Sık hatalar & uyarılar
- WHERE'siz DELETE (ÜG felaketi). Önce prova.
- FK ile bağlı bir satırı silmeye çalışmak (örn. başka tablonun referans verdiği bir bölüm) -> hata
  ya da bağlı kayıtların durumu. (Referans bütünlüğü Ü12.)

### Anlama soruları

**Soru 1 (yaz).** Güvenli silme disipliniyle, Satranç kulübünü (id 3) sil: önce prova, sonra sil, sonra doğrula.
> **İpucu:** SELECT ... WHERE id = 3; DELETE ... WHERE id = 3; SELECT COUNT(*).

> **Detaylı cevap:**
> ```sql
> SELECT * FROM clubs WHERE id = 3;     -- prova: Satranç
> DELETE FROM clubs WHERE id = 3;       -- sadece onu sil
> SELECT COUNT(*) FROM clubs;           -- 4 kaldı
> ```
> Üç adımlı güvenli silme (ÜG): gör, doğrula, uygula. Satranç'ın hiç üyesi olmadığı için bağlı kayıt
> sorunu yaşamayız; ama üyesi olan bir kulübü silmeye çalışsaydık, club_memberships'teki bağlı satırlar
> yüzünden referans bütünlüğü devreye girebilirdi (Ü12). Sıfırla ile 5 kulübe dönersin.

**Soru 2 (kavram).** `DELETE FROM clubs WHERE id = 3` ile `DROP TABLE clubs` arasındaki fark nedir? (ÜG hatırlatma)
> **İpucu:** Biri satır, biri tablo.

> **Detaylı cevap:** `DELETE FROM clubs WHERE id = 3` sadece id'si 3 olan satırı (Satranç) siler; `clubs`
> tablosu, diğer 4 kulüp ve tablonun yapısı (sütunları) yerinde kalır. `DROP TABLE clubs` ise tablonun
> tamamını, tüm satırları ve yapısıyla birlikte yok eder; artık `clubs` diye bir tablo kalmaz, ona SELECT
> bile atılamaz. Yani DELETE içeriğe (satırlara) dokunur, DROP tablonun kendisini siler. ÜG'de gördüğümüz
> gibi DROP çok daha yıkıcıdır. "Satırları sil, tablo kalsın" -> DELETE; "tabloyu yok et" -> DROP (Ü12).

### Çıkış bileti
DELETE bir satırı siler ama tabloya ne olur?

---

## Ders 11.4 — Transaction derinlemesine: ya hep ya hiç (atomiklik)

### 🧑‍🏫 Öğretmen için
ÜG'de transaction'ı "geri al güvenlik ağı" olarak görmüştük. Burada asıl gücünü ekle: **atomiklik** —
birden çok komutu "ya hepsi ya hiçbiri" olarak bağlamak. Klasik örnek: para transferi (birinden düş,
ötekine ekle); ikisi de olmalı ya da hiçbiri. Bizim evrende: bir öğrenciyi bir kulüpten çıkarıp başka
kulübe ekleme; ikisi tek işlem olmalı. Ortada bir hata olursa ROLLBACK ile baştaki tutarlı duruma dönülür.
- Anahtar cümle: **"Transaction birden çok değişikliği tek, bölünmez bir adım yapar: ya hepsi başarılı, ya hiçbiri."**
- ÜG'yi hatırlat: BEGIN/COMMIT/ROLLBACK; burada "neden" tarafını derinleştiriyoruz (tutarlılık).

### Konu anlatımı
ÜG'de gördük: `BEGIN` ile başla, `COMMIT` ile sabitle, `ROLLBACK` ile geri al. Transaction'ın asıl gücü
**atomikliktir**: içindeki komutlar tek bir bölünmez birim gibi davranır. Ya hepsi birlikte kalıcı olur
(`COMMIT`), ya hiçbiri olmaz (`ROLLBACK` ya da hata). Bu, veriyi her zaman **tutarlı** tutar.

Neden önemli? Bazı işler birden çok adım gerektirir ve yarıda kalırsa veri bozulur. Örnek (kavramsal):
para transferinde "A'dan düş" ve "B'ye ekle" ikisi birden olmalı; biri olup öteki olmazsa para kaybolur.
Transaction ikisini tek adıma bağlar.

```sql
BEGIN;
UPDATE students SET city = 'Ankara' WHERE id = 1;
UPDATE students SET city = 'Ankara' WHERE id = 6;
-- her şey yolundaysa:
COMMIT;
-- bir terslik varsa COMMIT yerine: ROLLBACK;
```

> Mini slogan: **Transaction = ya hep ya hiç; birden çok değişiklik tek bölünmez adım olur, veri tutarlı kalır.**

### Çözümlü örnekler

**Örnek 1 (atomik geri alma)**
- Sorgu:
```sql
BEGIN;
DELETE FROM club_memberships WHERE student_id = 1;   -- Ayşe'nin üyeliklerini sil
INSERT INTO club_memberships (student_id, club_id, role, joined_at)
VALUES (1, 5, 'üye', '2025-01-01');                   -- onu Girişimcilik'e ekle
SELECT * FROM club_memberships WHERE student_id = 1;  -- kontrol
ROLLBACK;                                             -- fikrimiz değişti: hiç olmamış gibi
SELECT * FROM club_memberships WHERE student_id = 1;  -- Ayşe'nin eski üyelikleri geri geldi
```
- Ne anlıyoruz? İki değişikliği (sil + ekle) tek transaction'da yaptık, kontrol ettik, sonra ROLLBACK
  ile ikisini birden geri aldık. Ayşe'nin eski iki üyeliği (Robotik, Müzik) geri geldi. Atomiklik: ikisi
  birlikte ya kalır ya gider.

**Örnek 2 (sabitleme)**
- Sorgu:
```sql
BEGIN;
UPDATE students SET scholarship_amount = 3000 WHERE id = 2;  -- Mehmet'e burs
UPDATE students SET scholarship_amount = 3000 WHERE id = 4;  -- Can'a burs
COMMIT;   -- ikisi birden kalıcı
```
- Ne anlıyoruz? İki güncellemeyi tek işleme bağladık; `COMMIT` ile ikisi de kalıcı oldu. Eğer ikincide
  bir hata olsaydı, `ROLLBACK` ile ilkini de geri alıp tutarlılığı korurduk. (Sandbox'ta Sıfırla seed'e döndürür.)

### Sık hatalar & uyarılar
- `BEGIN` açıp `COMMIT`/`ROLLBACK` ile kapatmayı unutmak; işlem açık kalır.
- COMMIT'ten sonra ROLLBACK beklemek (ÜG). COMMIT kalıcıdır.
- Birden çok adımlı işi transaction'sız yapıp yarıda hata alınca veriyi tutarsız bırakmak.

### Anlama soruları

**Soru 1 (kavram).** "Atomiklik" ne demektir ve neden bir transaction'ı tek bir `UPDATE`'ten farklı kılar?
> **İpucu:** Birden çok adım, ya hep ya hiç.

> **Detaylı cevap:** Atomiklik, bir transaction içindeki tüm komutların **tek, bölünmez bir birim** gibi
> davranması demektir: ya hepsi birlikte başarılı olur (COMMIT), ya da hiçbiri uygulanmaz (ROLLBACK veya
> hata). Tek bir `UPDATE` zaten tek bir işlemdir; transaction'ın değeri, **birden çok** komutu birbirine
> bağlamaktır. Örneğin "A'dan düş, B'ye ekle" iki ayrı UPDATE'tir; transaction olmadan, ilki olup
> ikincisi (hata yüzünden) olmazsa veri tutarsız kalır (para kaybolur). Transaction içine alınca, ikinci
> adım başarısız olursa ROLLBACK ilkini de geri alır ve veri hep tutarlı kalır. Yani atomiklik, "yarım
> kalmış iş" durumunu imkânsız kılar.

**Soru 2 (tahmin et).** Şu adımların sonunda Ayşe'nin (id 1) kaç kulüp üyeliği olur?
```sql
BEGIN;
DELETE FROM club_memberships WHERE student_id = 1;
ROLLBACK;
SELECT COUNT(*) FROM club_memberships WHERE student_id = 1;
```
> **İpucu:** ROLLBACK silmeyi geri alır mı?

> **Detaylı cevap:** **2** (Robotik ve Müzik). `DELETE` Ayşe'nin iki üyeliğini sildi, ama bu BEGIN içinde
> ve henüz COMMIT edilmemişti; `ROLLBACK` silmeyi tamamen geri aldı, sanki hiç olmamış gibi. Bu yüzden
> Ayşe'nin iki üyeliği geri geldi ve COUNT 2 verir. Eğer `ROLLBACK` yerine `COMMIT` olsaydı, silme kalıcı
> olur ve COUNT 0 çıkardı. Transaction'ın "ya hep ya hiç" doğası: COMMIT'e kadar her şey geri alınabilir.

### Çıkış bileti
Bir transaction'ın "atomiklik" özelliği, yarıda hata olursa veriyi nasıl korur?

---

## Pratik (editörde dene)

> Sandbox'tasın, "↺ Sıfırla" hep yanında. Önce prova SELECT, sonra değiştir; bittiğinde Sıfırla. Seed: Kampüs.

**P1 (kolay).** [▶ Editörde dene] `clubs` tablosuna id 9, ad 'Yazılım', yıl 2024 olan bir kulüp ekle, sonra
listeyle doğrula. (Sonra Sıfırla.)
> İpucu: INSERT INTO clubs (id, name, founded_year) VALUES (...).
> <details><summary>Cevap</summary>
>
> ```sql
> INSERT INTO clubs (id, name, founded_year) VALUES (9, 'Yazılım', 2024);
> SELECT * FROM clubs;   -- 6 kulüp
> ```
> </details>

**P2 (orta).** [▶ Editörde dene] Güvenli güncelleme: id 3 (Zeynep) olan öğrencinin şehrini 'İzmir' yap.
Önce prova, sonra güncelle, sonra doğrula.
> İpucu: SELECT ... WHERE id=3; UPDATE ... SET city='İzmir' WHERE id=3.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT first_name, city FROM students WHERE id = 3;     -- prova: Zeynep, Ankara
> UPDATE students SET city = 'İzmir' WHERE id = 3;
> SELECT first_name, city FROM students WHERE id = 3;     -- Zeynep, İzmir
> ```
> </details>

**P3 (orta).** [▶ Editörde dene] Tüm Psikoloji (department_id = 4) öğrencilerinin bursunu 1000 artır.
Önce kaç kişi etkilenecek, prova ile gör.
> İpucu: SELECT ... WHERE department_id=4; UPDATE ... SET ... + 1000 WHERE department_id=4.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT first_name, scholarship_amount FROM students WHERE department_id = 4;  -- Elif 4500, Selin 5000
> UPDATE students SET scholarship_amount = scholarship_amount + 1000 WHERE department_id = 4;
> ```
> 2 öğrenci etkilenir (Elif 5500, Selin 6000). İkisinin de bursu dolu olduğu için NULL sorunu yok.
> </details>

**P4 (zorlayıcı, transaction).** [▶ Editörde dene] Bir transaction içinde Mehmet'e (id 2) ve Can'a (id 4)
2000 burs ata, kontrol et, sonra ROLLBACK ile geri al. Burslar eski (NULL) haline döndü mü?
> İpucu: BEGIN; UPDATE...; UPDATE...; SELECT...; ROLLBACK; SELECT...
> <details><summary>Cevap</summary>
>
> ```sql
> BEGIN;
> UPDATE students SET scholarship_amount = 2000 WHERE id = 2;
> UPDATE students SET scholarship_amount = 2000 WHERE id = 4;
> SELECT id, scholarship_amount FROM students WHERE id IN (2,4);   -- ikisi 2000
> ROLLBACK;
> SELECT id, scholarship_amount FROM students WHERE id IN (2,4);   -- ikisi NULL (geri geldi)
> ```
> ROLLBACK iki güncellemeyi birden geri aldı (atomiklik). COMMIT deseydin kalıcı olurdu.
> </details>

---

## Ünite 11 özeti (öğrenciye)
- **INSERT INTO tablo (sütunlar) VALUES (değerler)**: yeni satır(lar) ekler. Sütun listesi yaz; çoklu
  satır ve `RETURNING` mümkün.
- **UPDATE ... SET ... WHERE ...**: var olan satırları değiştirir. Yeni değer mevcut değere bağlı olabilir
  (`x + 500`); birden çok sütun virgülle. **WHERE'siz UPDATE her satırı değiştirir (ÜG).**
- **DELETE FROM ... WHERE ...**: satır siler (tablo durur, DROP'tan farklı). Önce prova SELECT.
- **Transaction**: `BEGIN`/`COMMIT`/`ROLLBACK`. Asıl gücü **atomiklik**: birden çok değişiklik ya hep ya
  hiç; veri hep tutarlı kalır.
- NULL inceliği sürüyor: `NULL + 200 = NULL` (Ü1); NULL'ları da değiştirmek istersen COALESCE (Ü3).

## 🧑‍🏫 Öğretmen notu (ünite geneli)
ÜG'de tehlikeyi ve güvenli alışkanlığı tanıtmıştık; burada doğru kullanımı derinleştirdik. WHERE'siz
UPDATE/DELETE refleksini ("WHERE nerede? önce SELECT") tekrar tekrar pekiştir. Transaction'ın atomiklik
tarafını (ya hep ya hiç) bir örnekle canlandır; bu, ileride gerçek uygulamalarda veri tutarlılığının
temeli. Sandbox + Sıfırla sayesinde öğrenciler INSERT/UPDATE/DELETE'i korkmadan deneyebilir. Bir sonraki
ünite DDL: artık var olan tabloları değil, tabloların KENDİSİNİ tasarlayacağız (CREATE TABLE, kısıtlar,
PK/FK).
