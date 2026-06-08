# Ünite 14 — View ve Index (Bonus): Soyutlama ve Performans Sezgisi

> Kavram etiketleri: `view`, `create-view`, `index`, `index-tradeoff`, `explain-intro`, `correct-vs-fast`
> Ön koşul: Ü0-Ü13
> Kullanılan tablolar: students, departments
> Tahmini süre: 35-45 dk
> Ünite sloganı: **"View karmaşığı saklar; index okumayı hızlandırır ama bedeli vardır."**

> Bu bir BONUS ünite: zorunlu değil, "iyi bilmek güzel" seviyesinde. İki pratik kavram: sık kullanılan
> bir sorguyu isimle saklamak (view) ve sorguları hızlandırma sezgisi (index).

---

## Ders 14.1 — VIEW: sık kullanılan sorguyu isimle saklamak

### 🧑‍🏫 Öğretmen için
"Ü6'da öğrenci+bölüm adını her seferinde JOIN ile yazıyorduk. Ya bunu bir kez yazıp ona isim verip
tablo gibi kullansak?" İşte view. Tahtaya `CREATE VIEW ogrenci_bolum AS (o JOIN)` yaz, sonra `SELECT *
FROM ogrenci_bolum WHERE bolum = 'İşletme'` ile sanki bir tabloymuş gibi sorgula. "View veriyi saklamaz;
sadece sorguyu saklar. Her kullandığında alttaki sorgu çalışır." CTE ile farkını söyle: CTE tek sorgu
içinde yaşar, view kalıcı bir isimdir (her sorguda kullanılabilir).
- Sor: "View yeni veri tutar mı?" (Hayır; alttaki tabloların güncel halini gösterir.)
- Herkes burada takılır: view'ı "veri kopyası" sanmak. "Sadece kayıtlı bir sorgu" de.

### Konu anlatımı
**View**, bir sorguya verilen kalıcı bir isimdir; onu bir tabloymuş gibi kullanırsın. Veriyi
kopyalamaz/saklamaz; her sorgulandığında alttaki sorgu çalışır ve tabloların güncel halini gösterir.

```sql
CREATE VIEW ogrenci_bolum AS
SELECT s.id, s.first_name, s.last_name, d.name AS bolum, d.faculty
FROM students s
JOIN departments d ON s.department_id = d.id;
```

Artık `ogrenci_bolum`'u bir tablo gibi kullanırsın:

```sql
SELECT first_name, bolum FROM ogrenci_bolum WHERE bolum = 'İşletme';
```

Faydası: sık kullanılan karmaşık bir sorguyu bir kez yazıp isimlendirmek; okunurluk, tekrar kullanım ve
karmaşıklığı saklama (kullananın JOIN'i bilmesine gerek yok). CTE'den farkı: CTE sadece tek bir sorgu
içinde yaşar; view kalıcıdır, her sorguda kullanılabilir (silene kadar). `DROP VIEW` ile kaldırılır.

> Mini slogan: **View = kayıtlı bir sorgu (kalıcı isim); veriyi saklamaz, her kullanımda alttaki sorgu çalışır.**

### Çözümlü örnekler

**Örnek 1 (view oluştur ve kullan)**
- Sorgu:
```sql
CREATE VIEW ogrenci_bolum AS
SELECT s.first_name, s.last_name, d.name AS bolum, d.faculty
FROM students s JOIN departments d ON s.department_id = d.id;

SELECT first_name, bolum FROM ogrenci_bolum WHERE faculty = 'Mühendislik';
```
- Ne anlıyoruz? View'ı bir tablo gibi sorguladık (üstelik WHERE ekledik). Alttaki JOIN'i tekrar yazmadık;
  view onu bizim için sakladı. Mühendislik fakültesindeki öğrenciler (Bilgisayar + Elektrik) gelir.

**Örnek 2 (view güncel veriyi gösterir)**
- Mantık: View veri kopyalamaz. `students`'a yeni bir öğrenci eklersen (Ü11 INSERT), `ogrenci_bolum`
  view'ı bir sonraki sorguda o öğrenciyi de gösterir; çünkü view her seferinde alttaki güncel tablodan
  okur. (Sandbox'ta dene: INSERT sonrası view'ı tekrar sorgula.)

### Sık hatalar & uyarılar
- View'ı "veri kopyası/yedek" sanmak. View veri tutmaz; alttaki tabloların güncel halini yansıtır.
- Aynı adda view zaten varsa `CREATE VIEW` hata verir; güncellemek için `CREATE OR REPLACE VIEW`, silmek
  için `DROP VIEW` kullanılır.

### Anlama soruları

**Soru 1 (kavram).** View ile CTE arasındaki temel fark nedir?
> **İpucu:** Hangisi kalıcı, hangisi tek sorgu içinde?

> **Detaylı cevap:** İkisi de bir sorguya isim verir, ama yaşam süreleri farklıdır. CTE (`WITH ...`,
> Ü10) yalnızca tanımlandığı **tek sorgu boyunca** yaşar; sorgu bitince yok olur, başka sorgudan
> erişilemez. View ise **kalıcıdır**: bir kez `CREATE VIEW` ile tanımlanır, `DROP VIEW` ile silinene
> kadar veritabanında durur ve istediğin her sorguda bir tablo gibi kullanılır. Yani aynı karmaşık
> sorguyu birçok farklı yerde tekrar tekrar kullanacaksan view; sadece tek bir sorguyu adımlara bölmek
> istiyorsan CTE uygundur. İkisi de veriyi kopyalamaz, alttaki tablolardan güncel okur.

**Soru 2 (yaz).** `students` ve `departments`'ı birleştirip sadece ad, soyad, bölüm adı gösteren
`basit_ogrenci` adında bir view oluştur, sonra ondan Bilgisayar Mühendisliği öğrencilerini getir.
> **İpucu:** CREATE VIEW basit_ogrenci AS (JOIN); sonra SELECT ... WHERE bolum = 'Bilgisayar Mühendisliği'.

> **Detaylı cevap:**
> ```sql
> CREATE VIEW basit_ogrenci AS
> SELECT s.first_name, s.last_name, d.name AS bolum
> FROM students s JOIN departments d ON s.department_id = d.id;
>
> SELECT first_name, last_name FROM basit_ogrenci WHERE bolum = 'Bilgisayar Mühendisliği';
> ```
> Önce JOIN'i bir view içine sakladık (`basit_ogrenci`), sonra onu bir tabloymuş gibi sorgulayıp
> Bilgisayar Mühendisliği öğrencilerini (Ayşe, Mehmet, Ali Çelik, Burak, Okan) süzdük. View sayesinde
> JOIN'i tekrar yazmadık; ileride "bölüm adına göre öğrenci" gerektiren her sorgu bu view'ı kullanabilir.
> Bitince `DROP VIEW basit_ogrenci;` ile kaldırırsın.

### Çıkış bileti
View veriyi saklar mı, yoksa sadece bir sorguyu mu? Her kullanımda ne olur?

---

## Ders 14.2 — Index: okumayı hızlandırmak (ve bedeli)

### 🧑‍🏫 Öğretmen için
Benzetme ile aç: "Bir kitapta belirli bir kelimeyi arıyorsun. Her sayfayı tek tek okumak mı, yoksa
sondaki dizine (index) bakıp doğrudan sayfaya gitmek mi?" İşte veritabanı index'i tam bu: bir sütun için
hızlı arama dizini. `CREATE INDEX ... ON students(city)` yaz. Ama dengeyi de söyle: index okumayı
hızlandırır, AMA yer kaplar ve yazmayı (INSERT/UPDATE) yavaşlatır (dizin de güncellenmeli). "Bedava değil."
- Dürüst not: bizim tablo minik (14 satır); Postgres index'i kullanmayabilir (tüm tabloyu taramak zaten
  hızlı). Index büyük tablolarda fark yaratır. Bunu söyle ki EXPLAIN'de "seq scan" görünce şaşırmasınlar.
- EXPLAIN'i çok hafif tanıt: "sorgunun nasıl çalışacağının planı."

### Konu anlatımı
**Index**, bir sütun (ya da sütunlar) için tutulan, aramayı hızlandıran bir veri yapısıdır. Kitabın
sonundaki dizin gibi: bir değeri her satırı tarayarak değil, dizinden bularak getirir.

```sql
CREATE INDEX idx_students_city ON students(city);
```

Bu, `WHERE city = 'İstanbul'` gibi sorguları (büyük tablolarda) hızlandırabilir. Ama index **bedava
değildir**:
- **Yer kaplar** (ek depolama).
- **Yazmayı yavaşlatır**: her INSERT/UPDATE/DELETE'te ilgili index de güncellenmeli.

Yani her sütuna index koymak yanlıştır; sık aranan/filtrelenen sütunlara konur. Index "okuma hızı" ile
"yazma maliyeti + yer" arasında bir denge (trade-off) kurar.

`EXPLAIN`, bir sorgunun nasıl çalıştırılacağının planını gösterir (index kullanılıyor mu, tüm tablo mu
taranıyor). Dürüst not: bizim tablomuz çok küçük (14 satır); veritabanı çoğu zaman index'i kullanmaz,
çünkü 14 satırı baştan sona taramak zaten anlıktır. Index'in faydası büyük tablolarda (binlerce/milyonlarca
satır) ortaya çıkar.

> Mini slogan: **Index okumayı hızlandırır (kitabın dizini gibi), ama yer kaplar ve yazmayı yavaşlatır; sık aranan sütunlara konur.**

### Çözümlü örnekler

**Örnek 1 (index oluştur)**
- Sorgu:
```sql
CREATE INDEX idx_students_city ON students(city);
SELECT * FROM students WHERE city = 'İstanbul';
```
- Ne anlıyoruz? Index oluşturuldu; `WHERE city = ...` sorguları (büyük tabloda) bundan faydalanabilir.
  Sonuç değişmez (aynı 4 İstanbullu), sadece büyük veride daha hızlı bulunur. (Küçük tabloda fark fark edilmez.)

**Örnek 2 (EXPLAIN'e bakış)**
- Sorgu:
```sql
EXPLAIN SELECT * FROM students WHERE city = 'İstanbul';
```
- Ne anlıyoruz? EXPLAIN, sorgunun planını gösterir. Bizim minik tabloda büyük olasılıkla "Seq Scan"
  (tüm tabloyu tara) görürsün, çünkü 14 satırda index kullanmak gereksiz. Büyük bir tabloda ise plan
  "Index Scan" olabilirdi. Önemli olan: EXPLAIN ile "bu sorgu nasıl çalışacak?" sorusuna bakabilmek.

### Sık hatalar & uyarılar
- Her sütuna index koymak. Index yazma maliyeti ve yer demektir; sadece sık aranan sütunlara koyulur.
- Index'i "her zaman hızlandırır" sanmak. Küçük tablolarda veritabanı index'i kullanmayabilir; faydası
  büyük veride belirir.
- Index'in sonucu değiştirdiğini sanmak. Index sadece hızı etkiler; sonuç (hangi satırlar) aynı kalır.

### Anlama soruları

**Soru 1 (kavram).** Index okumayı hızlandırıyorsa neden her sütuna index koymayız?
> **İpucu:** Index'in bedeli ne?

> **Detaylı cevap:** Çünkü index bedava değildir; iki maliyeti vardır. Birincisi **yer**: her index ek
> depolama kullanır. İkincisi **yazma yavaşlaması**: bir satır eklendiğinde/güncellendiğinde/silindiğinde,
> o sütunun index'i de güncellenmek zorundadır; ne kadar çok index varsa yazma o kadar yavaşlar. Yani
> index okumayı hızlandırırken yazmayı ve depolamayı pahalılaştırır. Bu yüzden index'leri "sık aranan/
> filtrelenen/join'lenen" sütunlara koyarız (örneğin sık `WHERE city = ...` yapıyorsak city'ye), her
> sütuna değil. Bu bir denge (trade-off) kararıdır: okuma kazancı, yazma/yer maliyetine değer mi?

**Soru 2 (kavram).** Bir index, bir sorgunun SONUCUNU (hangi satırların geldiğini) değiştirir mi?
> **İpucu:** Index hız mı, doğruluk mu etkiler?

> **Detaylı cevap:** Hayır. Index yalnızca sorgunun **ne kadar hızlı** çalıştığını etkiler, **hangi
> satırların döndüğünü** değil. `WHERE city = 'İstanbul'` index'li de index'siz de aynı 4 öğrenciyi
> döndürür; index sadece veritabanının bu satırları nasıl (hızlı dizinle mi, tüm tabloyu tarayarak mı)
> bulduğunu değiştirir. Yani index bir performans aracıdır, bir mantık/sonuç aracı değil. "Doğru sonuç"
> her zaman aynıdır; index "makul sürede" sorusunu etkiler. Bu ayrım önemli: önce sorgunun doğru sonucu
> verdiğinden emin ol, sonra (gerekiyorsa) index ile hızlandır.

### Çıkış bileti
Index neyi hızlandırır, karşılığında neyi maliyet olarak getirir?

---

## Pratik (editörde dene)

> Sandbox'ta dene; bittiğinde view/index'i DROP et ya da Sıfırla. Seed: Kampüs.

**P1 (kolay).** [▶ Editörde dene] `students` + `departments`'tan ad, soyad, bölüm adı gösteren bir view
oluştur, sonra ondan İzmir... yerine: ondan İşletme bölümü öğrencilerini getir. (Bitince DROP VIEW.)
> İpucu: CREATE VIEW v AS (JOIN); SELECT ... FROM v WHERE bolum = 'İşletme'.
> <details><summary>Cevap</summary>
>
> ```sql
> CREATE VIEW v_ogrenci AS
> SELECT s.first_name, s.last_name, d.name AS bolum
> FROM students s JOIN departments d ON s.department_id = d.id;
>
> SELECT * FROM v_ogrenci WHERE bolum = 'İşletme';
> -- Zeynep, Deniz, Merve. Bitince: DROP VIEW v_ogrenci;
> ```
> </details>

**P2 (orta).** [▶ Editörde dene] `students.department_id` üstünde bir index oluştur, sonra
`WHERE department_id = 1` sorgusunu çalıştır. (Sonuç değişmez; index büyük veride hız içindir.)
> İpucu: CREATE INDEX ... ON students(department_id).
> <details><summary>Cevap</summary>
>
> ```sql
> CREATE INDEX idx_students_dept ON students(department_id);
> SELECT first_name FROM students WHERE department_id = 1;
> ```
> Bilgisayar bölümü öğrencileri gelir. Index sonucu değiştirmez, sadece (büyük tabloda) hızlandırır.
> </details>

**P3 (düşündürücü).** [▶ Editörde dene] `EXPLAIN SELECT * FROM students WHERE city = 'İstanbul';`
çalıştır. Planda ne görüyorsun (Seq Scan mı, Index Scan mı), ve bu neden minik tabloda mantıklı?
> İpucu: 14 satırda tüm tabloyu taramak zaten hızlı.
> <details><summary>Cevap</summary>
>
> ```sql
> EXPLAIN SELECT * FROM students WHERE city = 'İstanbul';
> ```
> Büyük olasılıkla "Seq Scan" (tüm tabloyu tara) görürsün. Mantıklı, çünkü 14 satırı baştan sona taramak,
> index'e gidip gelmekten daha ucuz. Index'in faydası binlerce/milyonlarca satırda belirir. EXPLAIN,
> "bu sorgu nasıl çalışacak?" sorusunun penceresidir.
> </details>

---

## Ünite 14 özeti (öğrenciye)
- **View**, bir sorguya verilen kalıcı isimdir; veriyi saklamaz, her kullanımda alttaki güncel tablolardan
  okur. Karmaşık/sık sorguları saklamak ve okunurluk için. CTE'den farkı: view kalıcı, CTE tek sorgu içinde.
- **Index**, bir sütun için arama dizinidir; okumayı hızlandırır ama **yer kaplar ve yazmayı yavaşlatır**.
  Sık aranan sütunlara konur, her sütuna değil.
- Index sorgunun **sonucunu değiştirmez**, sadece hızını; küçük tablolarda fark edilmez, büyük tablolarda önemlidir.
- `EXPLAIN`, bir sorgunun çalışma planını gösterir (Seq Scan / Index Scan).
- İlke: **önce doğru sonuç, sonra makul performans.**

## 🧑‍🏫 Öğretmen notu (ünite geneli)
Bu bonus ünite hafif tutulmalı; amaç derinlik değil, sezgi: view "kayıtlı sorgu", index "okuma hızı vs
yazma maliyeti dengesi". Index'i mutlaka kitap-dizini benzetmesiyle anlat ve dürüstçe "bizim minik
tabloda fark görmezsiniz, index büyük veride önemli" de (yoksa EXPLAIN'de Seq Scan görünce kafaları
karışır). "Önce doğru, sonra hızlı" ilkesi güzel bir kapanış: öğrenci tüm müfredat boyunca doğru sonucu
öğrendi; performans, doğruluktan sonra gelen bir endişe. Bu üniteyle çekirdek müfredat tamam; öğrenci artık
gerçek SQL sorularının büyük çoğunluğunu yazabilir.
