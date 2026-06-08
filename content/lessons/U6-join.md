# Ünite 6 — JOIN I: Tabloları İlişkiyle Birleştirmek

> Kavram etiketleri: `pk-fk`, `relationship`, `inner-join`, `join-on`, `multi-join`, `left-join`, `left-join-null`, `anti-join`
> Ön koşul: Ü0-Ü3 (Güvenlik ünitesi de görülmüş olabilir)
> Kullanılan tablolar: students, departments, courses, instructors, clubs, club_memberships
> Tahmini süre: 60-70 dk
> Ünite sloganı: **"Veri farklı tablolarda; JOIN onları anahtarla buluşturur."**

---

## Ders 6.1 — İlişki ve anahtarlar: PK ve FK

### 🧑‍🏫 Öğretmen için
Tahtaya iki ayrı kutu çiz: `students` (içinde department_id = 1) ve `departments` (id=1, name=Bilgisayar
Müh.). Sor: "Ayşe'nin bölüm adını nasıl buluruz? students tablosunda sadece `department_id = 1` yazıyor,
adı yok." Öğrenciye parmağıyla iki tabloyu takip ettir: "1 numarayı departments'ta bul, adını oku." İşte
JOIN'in elle hali bu. Sonra "neden ad doğrudan students'a yazılmamış?" diye sor; cevabı birlikte bul:
tekrarı önlemek (bölüm adı değişse tek yerde değişsin), tutarlılık.
- Tahtaya yaz: **PK = bu tablodaki kimlik** (departments.id), **FK = başka tablodaki kimliğe işaret**
  (students.department_id). "FK, bir köprünün ayağı gibidir."
- Sor: "students.department_id hangi tablonun id'sine işaret ediyor?" (departments.id.)
- Herkes burada takılır: hangi sütunun hangisine bağlandığını şaşırırlar. Hep "FK -> PK" yönünü göster.

### Neden / nerede işime yarar
Gerçek veritabanları veriyi tekrar etmemek için parçalara böler: müşteriler bir tabloda, siparişler
başka tabloda, sipariş sadece müşteri id'sini tutar. "Bu siparişi kim verdi, adı ne?" sorusu için bu
tabloları birleştirmen gerekir. JOIN, gerçek dünyadaki sorguların belki en sık ihtiyacı.

### Konu anlatımı
Veri neden ayrı tablolarda? Tekrarı önlemek için. Bölüm adını her öğrenci satırına yazsaydık, "Bilgisayar
Mühendisliği" 5 kez tekrarlardı; adı değişince 5 yeri güncellemek gerekirdi. Bunun yerine:
- `departments` tablosu bölümü **bir kez** tutar, her birinin bir kimliği (`id`) vardır.
- `students` tablosu her öğrenci için sadece **bölümün kimliğini** (`department_id`) tutar.

İki anahtar kavram:
- **Birincil anahtar (PK, primary key):** Bir satırı benzersiz tanımlayan sütun. `departments.id`,
  `students.id` birer PK'dır. Tekrar etmez, her satıra özeldir.
- **Yabancı anahtar (FK, foreign key):** Başka bir tablonun PK'sına işaret eden sütun.
  `students.department_id`, `departments.id`'ye işaret eder. Köprü budur.

JOIN, bu FK -> PK köprüsünü kullanarak iki tablonun satırlarını eşleştirir.

> Mini slogan: **PK bir satırın kimliğidir; FK başka tablodaki bir kimliğe işaret eder. JOIN bu köprüden geçer.**

### Çözümlü örnek (elle eşleştirme mantığı)
- students'tan Ayşe: `department_id = 1`. departments'ta `id = 1`: "Bilgisayar Mühendisliği".
- Yani Ayşe'nin bölümü "Bilgisayar Mühendisliği". JOIN tam da bu "git, kimliği bul, karşılığını getir"
  işini bütün satırlar için otomatik yapar.

### Sık hatalar & uyarılar
- FK'yı "satır numarası" sanmak. `department_id` bir satır sırası değil, departments tablosundaki bir
  kimliğe işaret eder.
- Hangi sütunun hangisine bağlandığını karıştırmak. Yön hep FK -> PK: `students.department_id ->
  departments.id`.

### Anlama soruları

**Soru 1 (kavram).** `courses` tablosunda `department_id` ve `instructor_id` sütunları var. Bunlar ne tür anahtardır ve neye işaret eder?
> **İpucu:** Başka tablodaki kimliğe işaret eden sütuna ne denir?

> **Detaylı cevap:** İkisi de **yabancı anahtar (FK)**. `courses.department_id`, `departments.id`'ye
> işaret eder (bu ders hangi bölüme ait); `courses.instructor_id`, `instructors.id`'ye işaret eder (bu
> dersi kim veriyor). Yani bir ders satırı, bölümün ve öğretim üyesinin adını tutmaz, sadece
> kimliklerini tutar; adları öğrenmek için JOIN ile ilgili tablolara gideriz. Not: bir tabloda birden
> çok FK olabilir (burada iki tane), her biri farklı bir tabloya köprü kurar. Ayrıca `courses.id`
> kendisi bir PK'dır (her dersi benzersiz tanımlar).

**Soru 2 (kavram).** Neden bölüm adını doğrudan her `students` satırına yazmak yerine ayrı bir
`departments` tablosu tutarız?
> **İpucu:** Aynı bilgiyi tekrar tekrar yazmanın sakıncası ne?

> **Detaylı cevap:** Çünkü tekrar hem yer israfı hem de hata kaynağıdır. Bölüm adını her öğrenciye
> yazsaydık, "Bilgisayar Mühendisliği" onlarca kez tekrarlardı; bölümün adı değişince (ya da yanlış
> yazılınca) tüm bu satırları tek tek düzeltmek gerekirdi ve biri unutulursa veri tutarsız olurdu.
> Bunun yerine bölümü `departments` tablosunda **bir kez** tutar, öğrencide sadece kimliğini
> (`department_id`) referans veririz. Adı değişse tek bir yeri güncellemek yeter. Bu fikre
> "normalleştirme" denir ve veri modellemenin temelidir (Ü12'de daha çok). JOIN, bu bölünmüş veriyi
> tekrar birleştirip okumamızı sağlar.

### Çıkış bileti
PK ile FK arasındaki fark nedir? `students.department_id` hangisidir?

---

## Ders 6.2 — INNER JOIN: eşleşenleri birleştirmek

### 🧑‍🏫 Öğretmen için
İki tabloyu tahtada yan yana koy, FK->PK köprüsünü okla göster, sonra SQL'e dök. "JOIN ... ON ..."
kalıbını yaz: "JOIN hangi tabloyu eklediğimizi, ON hangi sütunların eşleşeceğini söyler." Sonra KASITLI
hata: `ON`'u sil (`FROM students, departments`), çalıştır, 70 satır gelsin, sor: "14 öğrenci vardı, neden
70 satır?" Cevap: eşleştirme kuralı yoksa herkes herkesle eşleşir (14×5). Bu "kartezyen çarpım" felaketi,
ON'un neden şart olduğunu bir daha unutturmaz.
- Tahtaya yaz takma adları: `students s`, `departments d`. "Uzun tablo adlarını kısaltırız, s.first_name."
- Sor: "INNER JOIN'de iki tarafta da eşleşmeyen bir satır olsa ne olur?" (Gelmez; INNER sadece eşleşenler.)
- Benzetme: INNER JOIN = iki listede de adı olanların buluşması.

### Neden / nerede işime yarar
"Her öğrencinin bölüm adıyla listesi", "her dersin öğretmeniyle listesi" gibi sorular hep iki tabloyu
birleştirmeyi gerektirir. INNER JOIN, bunun en sık kullanılan halidir.

### Konu anlatımı
`INNER JOIN` (kısaca `JOIN`), iki tablonun **eşleşen** satırlarını yan yana getirir. Kalıp:

```sql
SELECT s.first_name, d.name AS bolum
FROM students s
JOIN departments d ON s.department_id = d.id;
```

- `FROM students s`: ana tablo, takma adı `s`.
- `JOIN departments d`: eklenen tablo, takma adı `d`.
- `ON s.department_id = d.id`: eşleşme kuralı (FK = PK). SQL her öğrenci için, `department_id`'sine eşit
  `id`'ye sahip bölümü bulur ve satırları birleştirir.

Takma adlar (`s`, `d`) zorunlu değil ama çok pratiktir; `s.first_name` yazmak hem kısa hem de hangi
tablodan geldiğini netleştirir. İki tabloda aynı adlı sütun varsa (ikisinde de `id`, `name`), takma ad
şart olur.

**ON'u unutmak = felaket:** `FROM students, departments` deyip `ON` yazmazsan, SQL her öğrenciyi her
bölümle eşleştirir: 14 × 5 = 70 anlamsız satır (kartezyen çarpım). ON, "hangi satır hangisiyle
eşleşecek" kuralıdır, atlanmaz.

> Mini slogan: **JOIN hangi tabloyu, ON hangi eşleşmeyi söyler; ON yoksa herkes herkesle eşleşir.**

### Çözümlü örnekler

**Örnek 1 (temel INNER JOIN)**
- Ne istiyoruz? Her öğrencinin adı + bölüm adı.
- Hangi tablolar? students (FK department_id) + departments (PK id).
- Sorgu:
```sql
SELECT s.first_name, d.name AS bolum
FROM students s
JOIN departments d ON s.department_id = d.id
ORDER BY s.first_name;
```
- Sonuç (ilk birkaç):

| first_name | bolum                   |
|------------|-------------------------|
| Ali        | Bilgisayar Mühendisliği |
| Ali        | Elektrik-Elektronik     |
| Ayşe       | Bilgisayar Mühendisliği |
| ...        | ...                     |

- Ne anlıyoruz? 14 öğrencinin hepsinin bir bölümü olduğu için 14 satır gelir, her birinin yanında
  bölüm ADI (id değil). İki "Ali" farklı bölümlerde; JOIN her birini kendi bölümüyle eşleştirdi.

**Örnek 2 (kartezyen felaketi, ON'u unut)**
- Sorgu (yanlış):
```sql
SELECT s.first_name, d.name FROM students s, departments d;
```
- Sonuç: 70 satır (14×5). Ne anlıyoruz? Eşleşme kuralı (ON) olmadığı için her öğrenci her bölümle
  eşleşti, anlamsız bir şişme oldu. Doğrusu mutlaka `JOIN ... ON ...` ya da en azından `WHERE
  s.department_id = d.id` ile eşleşmeyi belirtmek.

### Sık hatalar & uyarılar
- `ON`'u unutmak -> kartezyen çarpım (devasa, anlamsız sonuç). Her JOIN'in bir ON'u olsun.
- İki tabloda aynı adlı sütunu takma adsız yazmak (`SELECT id ...`) -> "ambiguous column" hatası.
  `s.id` / `d.id` diye netleştir.
- Yanlış sütunları eşleştirmek (`ON s.id = d.id`). Doğru köprü FK->PK: `s.department_id = d.id`.

### Anlama soruları

**Soru 1 (yaz).** Her dersin adını ve ait olduğu bölümün adını getir.
> **İpucu:** courses.department_id ile departments.id eşleşir.

> **Detaylı cevap:**
> ```sql
> SELECT c.name AS ders, d.name AS bolum
> FROM courses c
> JOIN departments d ON c.department_id = d.id;
> ```
> `courses` ana tablo (alias `c`), `departments` eklenen (alias `d`); köprü `c.department_id = d.id`.
> Sonuç 8 satır (8 dersin her biri bölüm adıyla). İki tabloda da `name` sütunu olduğu için takma ad
> ve alias şart: `c.name` dersin adı, `d.name` bölümün adı. Alias vermeseydik "hangi name?" diye
> belirsizlik (ambiguous) hatası alırdık.

**Soru 2 (hata avı).** Bu sorgu neden 70 değil de çok daha az/anlamlı satır döndürmüyor; sorun ne?
```sql
SELECT s.first_name, d.name FROM students s, departments d;
```
> **İpucu:** Eşleşme kuralı nerede?

> **Detaylı cevap:** Sorun: eşleşme koşulu (`ON` ya da `WHERE`) yok. `FROM students s, departments d`
> iki tabloyu yan yana koyar ama hangi satırın hangisiyle eşleşeceğini söylemediğimiz için SQL
> hepsini herkesle eşleştirir: 14 öğrenci × 5 bölüm = 70 satır (kartezyen çarpım). Bu satırların
> çoğu anlamsız (Ayşe'yi Psikoloji bölümüyle de eşleştirir). Doğrusu eşleşmeyi belirtmek:
> ```sql
> SELECT s.first_name, d.name
> FROM students s
> JOIN departments d ON s.department_id = d.id;
> ```
> Bu, her öğrenciyi yalnızca kendi bölümüyle eşleştirir, 14 anlamlı satır verir. Kural: tabloları
> birleştirirken mutlaka bir eşleşme koşulu ver; yoksa sonuç patlar.

### Çıkış bileti
INNER JOIN'de `ON` koşulunu yazmazsan ne olur ve neden?

---

## Ders 6.3 — ON'u derinleştir: alias ve çoklu JOIN

### 🧑‍🏫 Öğretmen için
"Bir sorguda ikiden çok tablo da birleştirebiliriz; her yeni tablo için bir JOIN + ON ekleriz." Tahtaya
zinciri çiz: courses -> departments (bölüm adı) ve courses -> ... Üç tabloyu okla bağla. Vurgula: her
JOIN kendi ON'unu ister.
- Sor: "courses'ı hem departments hem instructors ile birleştirsek ne elde ederiz?" (Ders + bölüm +
  öğretmen, tek satırda.)
- Herkes burada takılır: ikinci JOIN'in ON'unu unuturlar. "Her JOIN'in kendi ON'u var" diye tekrarlat.

### Konu anlatımı
Bir sorguda birden çok `JOIN` zincirleyebilirsin; her biri yeni bir tablo ekler ve kendi `ON`'unu
taşır. Böylece üç, dört tablodan veriyi tek satırda toplayabilirsin.

```sql
SELECT c.name AS ders, d.name AS bolum, c.credits
FROM courses c
JOIN departments d ON c.department_id = d.id
WHERE c.credits >= 5
ORDER BY c.credits DESC;
```

Burada da WHERE ile filtreleyebilir, ORDER BY ile sıralayabilirsin; JOIN bunları engellemez, sadece
önce tabloları birleştirir (çalışma sırası: FROM/JOIN -> WHERE -> ... Ü5.5).

> Mini slogan: **Her yeni tablo için bir JOIN + bir ON; veriyi adım adım yan yana eklersin.**

### Çözümlü örnekler

**Örnek 1 (JOIN + WHERE + ORDER BY birlikte)**
- Ne istiyoruz? Kredisi 5 ve üzeri dersler, bölüm adıyla, çoktan aza.
- Sorgu (yukarıdaki). Ne anlıyoruz? Önce courses+departments birleşti, sonra WHERE kredi<5 olanları
  eledi, sonra sıralandı. JOIN diğer kavramlarla sorunsuz birlikte çalışır.

**Örnek 2 (üç tablo zinciri)**
- Ne istiyoruz? Üyeliklerin: öğrenci adı + kulüp adı + roldeki kişi.
- Hangi tablolar? club_memberships (köprü) + students + clubs.
- Sorgu:
```sql
SELECT s.first_name AS ogrenci, cl.name AS kulup, cm.role
FROM club_memberships cm
JOIN students s ON s.id = cm.student_id
JOIN clubs cl ON cl.id = cm.club_id
ORDER BY cl.name, s.first_name;
```
- Sonuç: 10 satır (10 üyelik kaydı), her birinde öğrenci adı + kulüp adı + rol. Ne anlıyoruz? Köprü
  tablosundan (club_memberships) başlayıp iki yana (students, clubs) JOIN yaptık. Her JOIN'in kendi
  ON'u var. (Bu "çok-çok ilişki" mantığını Ü7'de derinleştireceğiz.)

### Sık hatalar & uyarılar
- İkinci (üçüncü) JOIN'in ON'unu unutmak. Her JOIN kendi eşleşme koşulunu ister.
- Zincirde yanlış tabloları bağlamak. Her ON'da "hangi FK hangi PK'ya?" diye düşün.

### Anlama soruları

**Soru 1 (yaz).** Her dersin adını, bölüm adını ve öğretim üyesinin adını (instructor) getir. (İpucu:
courses -> departments ve courses -> instructors, iki JOIN.)
> **İpucu:** İki köprü: c.department_id=d.id ve c.instructor_id=i.id.

> **Detaylı cevap:**
> ```sql
> SELECT c.name AS ders, d.name AS bolum, i.first_name AS ogretmen
> FROM courses c
> JOIN departments d ON c.department_id = d.id
> JOIN instructors i ON c.instructor_id = i.id;
> ```
> Üç tabloyu zincirledik: courses ana tablo, departments ve instructors ona FK'larla bağlanıyor. Her
> JOIN kendi ON'unu taşıyor. ÖNEMLİ DETAY: bu bir INNER JOIN zinciri olduğu için, öğretim üyesi
> atanmamış ders (MATH101, instructor_id NULL) bu sonuçta **görünmez**, çünkü onun eşleşeceği bir
> instructor satırı yok. Yani 8 ders yerine 7 satır gelir. MATH101'i de görmek istersek instructors'ı
> LEFT JOIN ile bağlamamız gerekir (6.4). Bu, INNER JOIN'in "eşleşmeyeni eler" davranışının ilk somut örneği.

**Soru 2 (tahmin et).** Yukarıdaki üç tablolu INNER JOIN sorgusu kaç satır döndürür, neden 8 değil?
> **İpucu:** Hangi dersin öğretmeni yok?

> **Detaylı cevap:** **7 satır.** 8 ders var, ama MATH101'in `instructor_id` değeri NULL (öğretim
> üyesi atanmamış). INNER JOIN sadece iki tarafta da eşleşen satırları getirdiği için, eşleşecek bir
> instructor bulamayan MATH101 elenir; geriye 7 ders kalır. Bu, INNER JOIN'in sessiz tuzağıdır:
> "neden bir kaydım kayboldu?" sorusunun cevabı çoğu zaman "o kaydın eşleşeni yoktu" olur. Eşleşmeyeni
> de korumak istiyorsak LEFT JOIN kullanırız, ki bir sonraki ders tam bu.

### Çıkış bileti
Üç tablolu bir INNER JOIN'de bir tablonun FK'sı NULL ise o satıra ne olur?

---

## Ders 6.4 — LEFT JOIN: eşleşmeyeni de koru (NULL'ın beşinci sınavı)

### 🧑‍🏫 Öğretmen için
6.3'teki "MATH101 kayboldu" anını hatırlat: "INNER eşleşmeyeni atıyordu. Ya eşleşmeyeni de görmek
istersek?" İşte LEFT JOIN. Tahtaya iki kutu çiz, sol tabloyu (clubs) işaretle: "LEFT JOIN, soldaki HER
satırı korur; sağda eşleşme yoksa o sütunları NULL yapar." Satranç kulübünü canlı göster: üyesi yok,
LEFT JOIN'de yine görünür ama üye sütunu NULL. NULL spiralini hatırlat (Ü2: bilinmeyen; burada: eşleşme yok).
- Sor: "Tüm kulüpleri, üyesi olsa da olmasa da görmek istersem hangi JOIN?" (LEFT.)
- Herkes burada takılır: INNER vs LEFT'i karıştırırlar. Karar cümlesi: "Soldaki herkes kalsın mı? Evetse LEFT."

### Konu anlatımı
`LEFT JOIN`, soldaki (FROM'daki) tablonun **bütün** satırlarını korur. Sağdaki tabloda eşleşme varsa
getirir; **yoksa, sağ tablonun sütunlarını NULL yapar.** Yani "soldaki kimse kaybolmasın" der.

```sql
SELECT cl.name AS kulup, cm.student_id
FROM clubs cl
LEFT JOIN club_memberships cm ON cm.club_id = cl.id;
```

Bu, INNER JOIN'in "eşleşmeyeni atma" davranışının çözümüdür. NULL spiralinin beşinci halkası burada:
LEFT JOIN'de eşleşmeyen satırlar için sağ taraf NULL gelir, çünkü "o tarafta karşılığı yok" demektir
(yine bir "yokluk", Ü2'deki gibi).

> Mini slogan: **LEFT JOIN soldakini hep tutar; sağda eşleşme yoksa o sütunlar NULL olur.**

### Çözümlü örnekler

**Örnek 1 (kulüpler + üyeler, üyesiz kulüp de görünsün)**
- Sorgu (yukarıdaki). Önce tahmin: Satranç (üyesiz) sonuçta görünür mü? (LEFT'te evet, NULL üyeyle.)
- Sonuç (ilgili kısım):

| kulup        | student_id |
|--------------|------------|
| Robotik      | 1          |
| Robotik      | 6          |
| Robotik      | 9          |
| Robotik      | 2          |
| Müzik        | 1          |
| Müzik        | 5          |
| Fotoğrafçılık| 5          |
| Fotoğrafçılık| 10         |
| Girişimcilik | 3          |
| Girişimcilik | 8          |
| Satranç      | NULL       |

- Ne anlıyoruz? 11 satır. Satranç'ın hiç üyesi yok ama LEFT JOIN onu da getirdi, `student_id` NULL.
  Aynı sorgu INNER JOIN olsaydı Satranç hiç görünmez, 10 satır olurdu. "Soldaki (kulüpler) kimse
  kaybolmasın" istediğimiz için LEFT.

**Örnek 2 (dersler + öğretmen, öğretmensiz ders de görünsün)**
- Sorgu:
```sql
SELECT c.name AS ders, i.first_name AS ogretmen
FROM courses c
LEFT JOIN instructors i ON c.instructor_id = i.id;
```
- Sonuç: 8 satır; MATH101'in `ogretmen` değeri NULL (öğretim üyesi atanmamış), ama ders yine listede.
  Ne anlıyoruz? 6.3'te INNER ile kaybolan MATH101, LEFT JOIN sayesinde geri geldi; sadece öğretmen
  bilgisi NULL.

### Sık hatalar & uyarılar
- "Tüm X'leri istiyorum, eşleşmeyenler de dahil" derken INNER kullanmak ve kayıt kaybetmek. O zaman LEFT.
- LEFT JOIN sonrası sağ tabloya `WHERE` filtresi koyup farkında olmadan INNER'a çevirmek (6.5'te
  göreceğiz). Eşleşmeyen NULL'lar WHERE'de elenebilir.

### Anlama soruları

**Soru 1 (tahmin et).** `clubs LEFT JOIN club_memberships` 11 satır döndürdü. Aynı sorgu `INNER JOIN`
olsaydı kaç satır olurdu, hangi kulüp kaybolurdu?
> **İpucu:** Üyesi olmayan kulüp hangisi?

> **Detaylı cevap:** INNER JOIN olsaydı **10 satır** olurdu ve **Satranç** kaybolurdu. LEFT JOIN
> soldaki (clubs) tüm satırları koruduğu için, üyesi olmayan Satranç'ı da NULL bir üyeyle getirdi
> (11. satır). INNER JOIN ise sadece eşleşenleri getirir; Satranç'ın hiç üyesi (eşleşeni) olmadığı
> için o satır hiç görünmezdi. Fark tam olarak bu tek NULL'lı satır: LEFT "eşleşmese de soldakini
> göster" der, INNER "sadece eşleşenler" der. "Hepsini istiyorum, boş olanlar da dahil" dediğinde LEFT.

**Soru 2 (yaz).** Tüm bölümleri ve (varsa) o bölümdeki bir öğrencinin adını getir; öğrencisi olmasa
bile bölüm görünsün. (İpucu: departments LEFT JOIN students.)
> **İpucu:** Sol tablo departments olmalı ki tüm bölümler kalsın.

> **Detaylı cevap:**
> ```sql
> SELECT d.name AS bolum, s.first_name AS ogrenci
> FROM departments d
> LEFT JOIN students s ON s.department_id = d.id
> ORDER BY d.name;
> ```
> `departments` solda olduğu için tüm bölümler korunur; her bölümün öğrencileri sağdan eklenir. Bizim
> veride her bölümün en az bir öğrencisi var (Matematik'in bile bir öğrencisi Gizem), o yüzden burada
> NULL öğrenci çıkmaz; ama eğer hiç öğrencisi olmayan bir bölüm olsaydı, LEFT JOIN onu da `ogrenci`
> NULL ile gösterirdi. Önemli olan kavram: "tüm bölümler görünsün" dediğimiz için departments'ı SOLA
> koyduk; soldaki hep korunur. Bir bölümde birden çok öğrenci olduğu için o bölüm birden çok satırda
> tekrar eder (her öğrenci için bir satır), bu da bir sonraki ünitenin (satır çoğalması) konusu.

### Çıkış bileti
LEFT JOIN'de sağ tarafta eşleşme bulunamazsa o satırın sağ sütunları ne olur?

---

## Ders 6.5 — Eşleşmeyenleri bulmak: LEFT JOIN + IS NULL (anti-join)

### 🧑‍🏫 Öğretmen için
"LEFT JOIN'de eşleşmeyenler NULL geliyordu. Peki SADECE eşleşmeyenleri istesek? Yani 'hiç üyesi olmayan
kulüpler'?" İşte numara: LEFT JOIN yap, sonra `WHERE sağ_taraf IS NULL` ile sadece eşleşmeyenleri süz.
Bu çok kullanışlı bir desen (anti-join). Tahtada Satranç'ı işaretle: "NULL olan = eşleşmeyen = aradığımız."
- Uyarı (kritik): bu desende NULL kontrolünü `WHERE`'e koymak DOĞRU; ama yanlışlıkla sağ tablonun BAŞKA
  bir sütununa normal filtre koyarsan LEFT JOIN gizlice INNER'a döner (Ü8'de derinleşecek). Şimdilik
  sadece `IS NULL` ile eşleşmeyeni bulmayı öğret.
- Sor: "Hangi öğrencilerin hiç kulübü yok? Aynı mantıkla bul."

### Konu anlatımı
LEFT JOIN, eşleşmeyenleri NULL ile getiriyordu. Eğer **sadece eşleşmeyenleri** istiyorsak, LEFT JOIN'in
ürettiği NULL'ları yakalarız:

```sql
SELECT cl.name AS uyesiz_kulup
FROM clubs cl
LEFT JOIN club_memberships cm ON cm.club_id = cl.id
WHERE cm.student_id IS NULL;
```

Mantık: LEFT JOIN tüm kulüpleri getirir; üyesi olanlarda `cm.student_id` doludur, olmayanlarda NULL'dır.
`WHERE cm.student_id IS NULL` sadece bu "hiç eşleşmeyen" kulüpleri bırakır. Buna **anti-join** denir:
"şununla eşleşmeyenleri bul".

> Mini slogan: **Eşleşmeyenleri bulmak için: LEFT JOIN yap, sonra sağ tarafın anahtarı IS NULL olanları süz.**

### Çözümlü örnekler

**Örnek 1 (üyesi olmayan kulüpler)**
- Sorgu (yukarıdaki). Sonuç: `Satranç`. Ne anlıyoruz? LEFT JOIN 11 satır üretti; bunlardan
  `cm.student_id` NULL olan tek satır Satranç'tı, WHERE onu süzdü. "Hiç üyesi olmayan kulüp" sorusunun
  temiz cevabı.

**Örnek 2 (hiç kulübü olmayan öğrenciler)**
- Sorgu:
```sql
SELECT s.first_name, s.last_name
FROM students s
LEFT JOIN club_memberships cm ON cm.student_id = s.id
WHERE cm.club_id IS NULL
ORDER BY s.first_name;
```
- Sonuç: hiç kulübe üye olmayan öğrenciler (Can, Ali Vural, Merve, Emre, Gizem, Okan). Ne anlıyoruz?
  Aynı anti-join deseni: öğrencileri solda tut, üyeliklerle LEFT JOIN yap, eşleşmeyenleri (`cm.club_id
  IS NULL`) süz.

### Sık hatalar & uyarılar
- Anti-join niyetiyle INNER JOIN kullanmak. INNER zaten eşleşmeyenleri atar, "eşleşmeyenleri" hiç
  göremezsin. Anti-join için LEFT JOIN + IS NULL şart.
- `IS NULL` yerine `= NULL` yazmak (Ü2). Hep `IS NULL`.
- LEFT JOIN'de sağ tablonun başka bir sütununa normal WHERE filtresi koyup LEFT'i INNER'a çevirmek
  (Ü8). Anti-join'de sadece anahtarın `IS NULL` kontrolünü koy.

### Anlama soruları

**Soru 1 (kavram).** "Hiç siparişi olmayan öğrenciler" sorusunu neden INNER JOIN ile çözemeyiz?
> **İpucu:** INNER eşleşmeyeni gösterir mi?

> **Detaylı cevap:** Çünkü INNER JOIN yalnızca eşleşen satırları getirir; "hiç siparişi olmayan"
> öğrencinin tanımı gereği siparişlerle hiçbir eşleşmesi yoktur, dolayısıyla INNER JOIN sonucunda hiç
> görünmezler ve onları "bulamayız". Bu soruyu çözmek için öğrencileri solda tutan bir LEFT JOIN
> yapıp, sipariş tarafı boş (eşleşmeyen) kalanları süzeriz:
> ```sql
> SELECT s.first_name
> FROM students s
> LEFT JOIN orders o ON o.student_id = s.id
> WHERE o.id IS NULL;
> ```
> LEFT JOIN tüm öğrencileri getirir, siparişi olmayanlarda sipariş sütunları NULL olur, `WHERE o.id IS
> NULL` tam da bu "siparişsiz" öğrencileri bırakır. "Hiç ... olmayan" tipi sorular neredeyse her zaman
> anti-join (LEFT JOIN + IS NULL) ile çözülür.

**Soru 2 (yaz).** Hiç dersi atanmamış (courses'ta `instructor_id` olarak hiç görünmeyen) öğretim
üyelerini... yerine daha basit: Hangi kulüplerin hiç üyesi yok, anti-join ile bul.
> **İpucu:** clubs LEFT JOIN club_memberships, WHERE ... IS NULL.

> **Detaylı cevap:**
> ```sql
> SELECT cl.name
> FROM clubs cl
> LEFT JOIN club_memberships cm ON cm.club_id = cl.id
> WHERE cm.student_id IS NULL;
> ```
> Sonuç: Satranç. LEFT JOIN tüm kulüpleri getirir; üyesi olanlarda `cm.student_id` dolu, Satranç'ta
> NULL'dır (hiç üyelik kaydı yok). `WHERE cm.student_id IS NULL` sadece bu eşleşmeyen kulübü bırakır.
> Bu desen ("LEFT JOIN + sağ anahtar IS NULL") aklında bir kalıp olarak kalsın; "hiç ... olmayanları
> bul" sorularının standart çözümü budur.

### Çıkış bileti
"Hiç X'i olmayan Y'leri bul" sorusunu hangi iki parçayla (JOIN türü + WHERE koşulu) kurarsın?

---

## Pratik (editörde dene)

> Deneme Tahtasında (⌘K) dene. Önce tahmin et, çalıştır, gözle, sonra cevaba bak. Seed: Kampüs.

**P1 (kolay).** [▶ Editörde dene] Her öğrencinin adını ve bölüm adını getir.
> İpucu: students JOIN departments ON s.department_id = d.id.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT s.first_name, d.name AS bolum
> FROM students s JOIN departments d ON s.department_id = d.id;
> ```
> 14 satır; her öğrenci kendi bölüm adıyla. Hepsinin bölümü olduğu için INNER yeter.
> </details>

**P2 (kolay).** [▶ Editörde dene] Her dersin adını ve bölüm adını getir, sadece Mühendislik
fakültesindekiler.
> İpucu: courses JOIN departments, sonra WHERE d.faculty = 'Mühendislik'.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT c.name AS ders, d.name AS bolum
> FROM courses c JOIN departments d ON c.department_id = d.id
> WHERE d.faculty = 'Mühendislik';
> ```
> Bilgisayar ve Elektrik-Elektronik bölümlerinin dersleri gelir. JOIN + WHERE birlikte.
> </details>

**P3 (orta).** [▶ Editörde dene] Tüm kulüpleri ve üye sayısını... yerine önce: tüm kulüpleri ve (varsa)
üyelerinin öğrenci id'sini getir, üyesiz kulüp de görünsün.
> İpucu: clubs LEFT JOIN club_memberships.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT cl.name AS kulup, cm.student_id
> FROM clubs cl LEFT JOIN club_memberships cm ON cm.club_id = cl.id;
> ```
> 11 satır; Satranç `student_id` NULL ile görünür (üyesiz). INNER olsaydı Satranç kaybolurdu.
> </details>

**P4 (orta).** [▶ Editörde dene] Öğretim üyesi atanmamış dersleri bul (anti-join). Yani instructor'ı
olmayan dersler.
> İpucu: courses LEFT JOIN instructors, WHERE i.id IS NULL. (Ya da doğrudan courses WHERE instructor_id IS NULL.)
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT c.name AS dersi_atanmamis
> FROM courses c LEFT JOIN instructors i ON c.instructor_id = i.id
> WHERE i.id IS NULL;
> ```
> Sonuç: MATH101 (Kalkülüs I). instructor_id NULL olduğu için LEFT JOIN'de eşleşme yok, i.id NULL,
> WHERE onu yakalar. (Bu özel durumda `WHERE c.instructor_id IS NULL` de aynı sonucu verir.)
> </details>

**P5 (zorlayıcı).** [▶ Editörde dene] Hiç kulübe üye olmayan öğrencileri ad-soyad olarak getir.
> İpucu: students LEFT JOIN club_memberships, WHERE cm.club_id IS NULL.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT s.first_name, s.last_name
> FROM students s LEFT JOIN club_memberships cm ON cm.student_id = s.id
> WHERE cm.club_id IS NULL
> ORDER BY s.first_name;
> ```
> Can, Ali Vural, Merve, Emre, Gizem, Okan. Anti-join deseni: solda öğrenciler, eşleşmeyenleri IS NULL
> ile süz.
> </details>

**P6 (düşündürücü).** [▶ Editörde dene] Üyeliklerin öğrenci adı + kulüp adı + rol listesini, kulüp
adına göre sıralı getir.
> İpucu: club_memberships'ten başla, students ve clubs'a JOIN.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT s.first_name AS ogrenci, cl.name AS kulup, cm.role
> FROM club_memberships cm
> JOIN students s ON s.id = cm.student_id
> JOIN clubs cl ON cl.id = cm.club_id
> ORDER BY cl.name, s.first_name;
> ```
> 10 satır (10 üyelik). Köprü tablodan iki yana INNER JOIN. Satranç burada yok (üyesiz, eşleşmeyen).
> Çok-çok ilişkiyi Ü7'de derinleştireceğiz.
> </details>

---

## Ünite 6 özeti (öğrenciye)
- Veri tekrarı önlemek için ayrı tablolarda durur; **PK** bir satırın kimliği, **FK** başka tablodaki
  kimliğe işaret eder. JOIN bu **FK -> PK** köprüsünden geçer.
- **INNER JOIN** iki tarafta da eşleşen satırları getirir; eşleşmeyeni eler. `ON` eşleşme kuralıdır,
  yoksa kartezyen çarpım (herkes herkesle) olur. Takma adlar (`s`, `d`) okunurluğu ve netliği sağlar.
- Birden çok `JOIN` zincirlenebilir; her birinin kendi `ON`'u olur.
- **LEFT JOIN** soldaki tüm satırları korur; sağda eşleşme yoksa o sütunlar **NULL** olur.
- **Anti-join** ("hiç X'i olmayan Y"): `LEFT JOIN` + `WHERE sağ_anahtar IS NULL`.

## 🧑‍🏫 Öğretmen notu (ünite geneli)
JOIN, öğrencinin SQL yolculuğundaki en büyük eşik. İki şeyi sağlam oturt: (1) FK->PK köprüsü ("kimliği
bul, karşılığını getir"), (2) INNER vs LEFT kararı ("soldaki herkes kalsın mı?"). Kartezyen felaketini
(ON'suz JOIN) ve "INNER eşleşmeyeni eler" durumunu (MATH101 kayboldu) canlı göstermek, bu ünitenin en
öğretici anları. NULL spiralinin beşinci halkasını (LEFT JOIN'de eşleşmeyen = NULL) burada attık; Ü9'da
NOT IN/NOT EXISTS ile altıncı gelecek. Bir sonraki ünite JOIN II: çok-çok ilişki, self join ve en
önemlisi "satır çoğalması" (grain), ki bu Ü8'deki JOIN+aggregate tuzaklarının zeminini hazırlar.
