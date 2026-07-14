# Ünite M — Veri Modelleme: Gerçek Dünyayı Tablolara Dökmek

> Kavram etiketleri: `data-modeling`, `entity-attribute-relationship`, `redundancy`, `anomaly`, `normalization`, `one-to-many`, `many-to-many`, `junction-table`, `self-relationship`, `natural-vs-surrogate-key`, `composite-key`
> Ön koşul: Ü0-Ü11 (özellikle Ü6-Ü8 JOIN/PK-FK, Ü11 DML)
> Kullanılan tablolar: hazır kampüs şeması (students, departments, courses, enrollments, clubs, club_memberships, instructors) + Pratik'te kısa bir kendi tasarımın
> Tahmini süre: 45-55 dk
> Ünite sloganı: **"Ü12'de tabloları kuracaksın; önce onları kafanda doğru tasarlamayı öğren."**

> Bu ünite bir ara duraktır: 11 ünitedir hazır kampüs tablolarını sorguladın. Şimdi geri çekilip
> soruyoruz: bu tablolar neden tam olarak böyle? Neden bölüm adı students'ta değil de ayrı bir
> tabloda? Neden enrollments diye ayrı bir tablo var? Bu soruların cevabı **veri modelleme**dir:
> gerçek dünyayı tekrarsız, tutarlı tablolara bölme sanatı. Ü12'de (DDL) bu tasarımı SQL'e dökeceğiz;
> burada önce tasarımın kendisini öğreniyoruz. Çoğu örnek editörde çalıştırılabilir (hepsi okuma,
> hiçbir şeyi bozmaz).

---

## Ders M.1 — Varlık, nitelik, ilişki: bir problemi tablolara çevirmek

### 🧑‍🏫 Öğretmen için
Tahtaya tek cümle yaz: "Bir kampüsü nasıl tabloya dökeriz?" Öğrenciden dünyayı üç parçaya ayırmasını
iste. **Varlıklar** (öğrenci, ders, bölüm, kulüp), bunların **nitelikleri** (öğrencinin adı, şehri,
doğum tarihi) ve varlıklar arası **ilişkiler** (öğrenci bir bölüme bağlı, bir derse yazılır). Sonra
göster: her varlık bir TABLO, her nitelik bir SÜTUN, her ilişki bir YABANCI ANAHTAR olur. Kampüs
şemasını aç ve "buradaki her tablo bir varlık, department_id ise bir ilişki" diye eşleştir.
- Sor: "Şehir (city) bir varlık mı, nitelik mi?" (Nitelik: öğrenciyi tanımlayan bir özellik, kendi
  başına bir "şey" değil. Ama şehirlerin nüfusunu da tutmak isteseydik, o zaman şehir bir varlık olurdu.)
- Herkes burada takılır: varlık ile nitelik arasındaki sınır bağlama göre değişir. "Kendi başına
  hakkında veri tutmak istiyor muyuz?" sorusu ayracımızdır.

### Neden / nerede işime yarar
Kötü bir model her sorguyu zorlaştırır, iyi bir model kendini yazar. Gerçek projelerde en pahalı
hatalar kod değil, yanlış tasarlanmış tablolardır: sonradan düzeltmek, üstüne yazılmış binlerce satırı
taşımak demektir. "Önce doğru modelle" alışkanlığı, ileride saatlerce iş kurtarır.

### Konu anlatımı
Bir problemi tabloya çevirirken üç şey ararız:
- **Varlık (entity):** Hakkında veri tuttuğumuz bağımsız bir "şey". Kampüste: öğrenci, ders, bölüm,
  kulüp, sipariş. Her varlık bir **tablo** olur (students, courses, departments...).
- **Nitelik (attribute):** Bir varlığı tanımlayan özellik. Öğrencinin adı, şehri, doğum tarihi. Her
  nitelik bir **sütun** olur (first_name, city, birth_date).
- **İlişki (relationship):** İki varlık arasındaki bağ. "Öğrenci bir bölüme aittir", "öğrenci bir derse
  yazılır". Her ilişki bir **yabancı anahtar** (FK) ya da bir **ara tablo** ile kurulur.

Yani kampüs şeması aslında gerçek bir kampüsün modelidir: students tablosu "öğrenci" varlığı,
department_id sütunu "öğrenci bir bölüme aittir" ilişkisi.

> Mini slogan: **Varlık tablodur, nitelik sütundur, ilişki yabancı anahtardır.**

### Çözümlü örnek
Kampüsteki bir öğrenciyi, ait olduğu bölümün adıyla birlikte görelim. Dikkat: öğrencinin niteliği
(first_name) students'tan, bölümün niteliği (name) departments'tan geliyor; ilişki department_id
üzerinden kuruluyor.
- Sorgu:
```sql
SELECT s.first_name, s.city, d.name AS bolum
FROM students s
JOIN departments d ON s.department_id = d.id
WHERE s.id = 1;
```
- Ne anlıyoruz? Tek bir öğrenci satırı, iki varlıktan (öğrenci + bölüm) besleniyor. first_name ve city
  öğrencinin nitelikleri; bolum ise ilişki üzerinden başka bir varlıktan (departments) geliyor. Model
  "öğrenci" ile "bölüm"ü ayrı tablolara koyduğu için, bölüm adını tek yerde tutuyoruz ve JOIN ile
  birleştiriyoruz.

### Sık hatalar & uyarılar
- Her şeyi tek tablo sanmak: "bölüm adını da students'a yazsam olmaz mıydı?" olurdu ama tekrar (redundans)
  doğardı, bir sonraki derste göreceğiz.
- Nitelik ile varlığı karıştırmak: city şu an bir nitelik. Ama şehirler hakkında ayrıca veri (nüfus,
  plaka) tutmak isteseydik, "şehir" bir varlık (ayrı tablo) olurdu. Karar bağlama bağlıdır.

### Anlama soruları

**Soru 1 (kavram).** Kampüs modelinde `courses` bir varlık mı, nitelik mi? Peki `credits` (kredi)?
> **İpucu:** Hangisi kendi başına bir "şey", hangisi o şeyin bir özelliği?

> **Detaylı cevap:** `courses` bir **varlıktır**: hakkında bağımsız veri tuttuğumuz bir "şey" (dersin
> kodu, adı, kredisi, hangi bölüme ait olduğu). Bu yüzden kendi tablosu vardır. `credits` ise o varlığın
> bir **niteliğidir**: bir dersi tanımlayan özelliklerden biri, kendi başına bir "şey" değil. Bu yüzden
> `courses` tablosunda bir sütundur, ayrı bir tablo değil. Genel ayraç şudur: "Bunun kendisi hakkında
> veri tutmak istiyor muyum?" Evet ise varlık (tablo), hayır ise nitelik (sütun). Dersler hakkında veri
> tutuyoruz (varlık), kredi sadece dersi anlatan bir sayı (nitelik).

**Soru 2 (yaz).** [▶ Editörde dene] Öğrenci id 9'un adını, şehrini ve bölüm adını getir (M.1'deki
örneğin aynısını id 9 için). Hangi nitelik hangi tablodan geliyor, gör.
> **İpucu:** JOIN students ... departments ON s.department_id = d.id; WHERE s.id = 9.

> **Detaylı cevap:**
> ```sql
> SELECT s.first_name, s.city, d.name AS bolum
> FROM students s
> JOIN departments d ON s.department_id = d.id
> WHERE s.id = 9;
> ```
> Burak, İzmir, Bilgisayar Mühendisliği döner. first_name ve city öğrenci varlığının nitelikleri
> (students tablosundan), bolum ise "öğrenci bir bölüme aittir" ilişkisi üzerinden departments
> varlığından geliyor. Model iki varlığı ayrı tuttuğu için bölüm adını bir kez saklıyoruz; her öğrenciye
> tekrar yazmıyoruz. İlişkiyi kuran şey students.department_id yabancı anahtarı.

### Çıkış bileti
Bir varlık tabloda neye, bir nitelik neye, bir ilişki neye karşılık gelir?

---

## Ders M.2 — Tekrarı ayıkla: redundans, anomaliler ve normalizasyon

### 🧑‍🏫 Öğretmen için
Kötü modeli önce YAŞAT, sonra kurtar. Tahtaya "dev tek tablo" çiz: her satırda öğrenci adı + bölüm adı
+ fakülte + ders adı hepsi bir arada. Sonra sor: "İşletme bölümünün adı kaç satırda tekrarlıyor?" (Her
İşletme öğrencisinde.) "Bölümün adını 'İşletme'den 'İş İdaresi'ne çevirsek?" (Tüm o satırları tek tek
güncellemek gerek, biri unutulursa veri tutarsız olur.) İşte redundans ve güncelleme anomalisi. Sonra
çözümü göster: bölümü ayır, students sadece department_id tutsun. "Aynı bilgiyi iki yere yazıyorsak,
ikinci bir tablo istiyoruz demektir." Bu normalleştirmenin (normalization) sezgisi.
- Sor: "Son İşletme öğrencisini silsek, bölümün adı nerede kalırdı?" (Dev tabloda kaybolurdu: silme
  anomalisi. Ayrı departments tablosunda ise durur.)
- Herkes burada takılır: normalleştirmeyi "kural ezberi" sanmak. Aslında tek fikir var: tekrarı ayıkla.

### Neden / nerede işime yarar
Redundans üç belaya yol açar: veri şişer, güncellemeler tutarsızlaşır (bir yeri günceller, ötekini
unutursun), ve bazı bilgileri tutamaz olursun. Normalleştirme, bu üç anomaliyi tasarımla baştan
engeller. "Tek doğru kaynak" (single source of truth) ilkesi buradan gelir.

### Konu anlatımı
**Redundans:** aynı bilginin birden çok yerde tekrarlanması. Diyelim öğrenci tablosuna bölüm adını da
yazdık:

```
students_kotu(id, first_name, department_name, faculty)
  1, Ayşe,  Bilgisayar Mühendisliği, Mühendislik
  2, Mehmet, Bilgisayar Mühendisliği, Mühendislik
  6, Ali,   Bilgisayar Mühendisliği, Mühendislik
  ...
```

"Bilgisayar Mühendisliği" ve "Mühendislik" her öğrencide tekrar tekrar yazılır. Bu üç anomali doğurur:
- **Güncelleme anomalisi:** Bölüm adı değişirse, tüm ilgili satırları güncellemen gerekir. Birini
  kaçırırsan veri tutarsız olur (kimi satır eski, kimi yeni ad).
- **Silme anomalisi:** Bir bölümün son öğrencisini silersen, o bölümün bilgisi de tamamen kaybolur.
- **Ekleme anomalisi:** Henüz öğrencisi olmayan yeni bir bölümü hiçbir yere yazamazsın (öğrenci satırı
  olmadan bölüm satırı yok).

**Çözüm (normalleştirme):** Tekrarlayan grubu ayrı bir tabloya al, FK ile bağla. Kampüs tam da böyle
yapılmış: `departments` ayrı bir tablo, `students` yalnızca `department_id` tutuyor. Bölümün adı ve
fakültesi TEK yerde (departments'ta) durur; öğrenci sadece hangisine ait olduğunu bir sayıyla gösterir.

> Mini slogan: **Aynı bilgiyi iki yere yazıyorsan, muhtemelen ikinci bir tabloya ihtiyacın var.**

### Çözümlü örnekler

**Örnek 1 (redundansın büyüklüğünü gör)**
- Sorgu:
```sql
SELECT department_id, COUNT(*) AS ogrenci_sayisi
FROM students
GROUP BY department_id
ORDER BY department_id;
```
- Ne anlıyoruz? Bölüm 1'de 5 öğrenci var. Eğer bölüm adını students'a yazsaydık, "Bilgisayar
  Mühendisliği" metni 5 kez tekrarlanırdı; şimdiyse departments'ta 1 kez duruyor, students sadece
  `department_id = 1` tutuyor. Tekrar ne kadar çok satırda olacaksa, ayrı tablonun kazancı o kadar büyük.

**Örnek 2 (tek doğru kaynak)**
- Sorgu:
```sql
SELECT id, name, faculty FROM departments ORDER BY id;
```
- Ne anlıyoruz? Bölümün adı ve fakültesi burada, her bölüm için tek satır. Bir bölümün adını değiştirmek
  istersen tek bir UPDATE yeterli (Ü11); tüm öğrenciler otomatik doğru bölüm adını "görür", çünkü adı
  kendileri tutmuyor, departments'a işaret ediyorlar. İşte güncelleme anomalisinin çözümü.

### Sık hatalar & uyarılar
- Normalleştirmeyi ezber kural sanmak (1NF/2NF/3NF terimleri). Tek fikir yeter: tekrarlayan bilgiyi
  ayrı tabloya al, FK ile bağla.
- Aşırıya kaçmak: her şeyi bölmek de sorgu başına onlarca JOIN demektir. Denge: tekrarı ayıkla ama
  anlamlı bütünleri bölme. (Gerçek nitelikler, örn. öğrencinin şehri, students'ta kalır.)
- "Bir sütun tekrar ediyor" ile "bir değer tekrar ediyor"u karıştırmak. Sorun değerin (Bilgisayar
  Mühendisliği metninin) yüzlerce satıra kopyalanması; aynı şehir adının birkaç kez geçmesi normaldir.

### Anlama soruları

**Soru 1 (kavram).** Bölüm adını her öğrenci satırında saklasaydık, "bir bölümün adını değiştirmek"
neden tehlikeli olurdu? Bu hangi anomalidir?
> **İpucu:** Kaç satırı güncellemen gerekirdi, biri atlanırsa ne olurdu?

> **Detaylı cevap:** Bu bir **güncelleme anomalisidir**. Bölüm adı her öğrenci satırında tekrarlanıyor
> olsaydı, adı değiştirmek için o bölümdeki TÜM öğrenci satırlarını tek tek güncellemen gerekirdi.
> Örneğin Bilgisayar Mühendisliği'nde 5 öğrenci varsa 5 satır; gerçek bir okulda yüzlerce. Bir tanesini
> bile atlarsan, veri tutarsız hale gelir: kimi satırda eski ad, kimisinde yeni ad, ve artık "doğru ad
> hangisi?" sorusunun net cevabı kalmaz. Kampüs modeli bunu çözer: bölüm adı yalnızca `departments`
> tablosunda, tek satırda durur. Adı değiştirmek tek bir UPDATE'tir; öğrenciler adı kendileri tutmadığı,
> `department_id` ile işaret ettiği için hepsi anında doğru adı görür. Buna "tek doğru kaynak" denir.

**Soru 2 (yaz).** [▶ Editörde dene] Her fakültede kaç öğrenci olduğunu bul (departments.faculty üzerinden).
İpucu: students ile departments'ı JOIN'le, faculty'ye göre grupla. Bu, bölüm bilgisinin ayrı tabloda
durmasının sorguyu nasıl kolaylaştırdığını gösterir.
> **İpucu:** JOIN students s ... departments d ON s.department_id = d.id; GROUP BY d.faculty.

> **Detaylı cevap:**
> ```sql
> SELECT d.faculty, COUNT(*) AS ogrenci_sayisi
> FROM students s
> JOIN departments d ON s.department_id = d.id
> GROUP BY d.faculty
> ORDER BY d.faculty;
> ```
> Fakülte bilgisi departments'ta tek yerde durduğu için, "fakülte başına öğrenci" gibi bir soruyu tek
> JOIN + GROUP BY ile cevaplayabiliyoruz. Eğer fakülteyi her öğrenci satırına kopyalamış olsaydık, aynı
> sonucu alırdık ama fakülte adını tüm o satırlarda tutarlı tutmak zorunda kalırdık (ve bir satırda yanlış
> yazım olsaydı sayım da yanlış çıkardı). Model bilgiyi ait olduğu varlıkta (departments) tuttuğu için,
> hem tekrar yok hem de gruplama güvenilir. Bu, normalleştirmenin sorgu tarafındaki getirisi.

### Çıkış bileti
Redundans hangi üç anomaliye yol açar, normalleştirme bunları nasıl engeller?

---

## Ders M.3 — İlişki tipleri: bir-çok, çok-çok (ara tablo) ve self-ilişki

### 🧑‍🏫 Öğretmen için
Üç ilişki tipini kampüsten canlı örnekle göster. **Bir-çok:** bir bölümde çok öğrenci, ama her öğrenci
tek bölümde (FK "çok" tarafta: students.department_id). **Çok-çok:** bir öğrenci çok derse, bir ders çok
öğrenciye. Sor: "FK'yı nereye koyarız?" (Hiçbir tarafa sığmaz.) İşte ara tablo (enrollments) burada
doğar. **Self-ilişki:** instructors.mentor_id yine instructors'a bakar (öğretim üyesinin mentoru da bir
öğretim üyesi). "Çok-çok gördüğün her yerde bir ara tablo ara" de. Kampüste enrollments, club_memberships,
event_attendance, order_items hepsi ara tablo.
- Sor: "enrollments neden sadece (student_id, course_id) değil de grade, semester de tutuyor?" (İlişkinin
  kendine ait nitelikleri: bir öğrencinin bir derse yazılışının notu ve dönemi. Bunlar ne öğrencinin ne
  dersin niteliği; ilişkinin niteliği.)
- Herkes burada takılır: çok-çok ilişkiyi tek FK ile kurmaya çalışmak. "Bir sütun tek bir değere işaret
  eder; çok-çok iki tarafta da çokluk ister, o yüzden ayrı bir tablo şart."

### Neden / nerede işime yarar
İlişki tipini doğru okumak, tabloları doğru kurmanın anahtarıdır. Çok-çok'u ara tablosuz kurmaya
çalışmak, gerçek projelerde en sık görülen tasarım hatasıdır (ve sonradan düzeltmesi en acılısı).

### Konu anlatımı
- **Bir-çok (1:N):** Bir tarafta bir, diğer tarafta çok. Bir bölümde çok öğrenci, ama her öğrenci tek
  bölüme ait. FK **"çok" tarafına** konur: `students.department_id -> departments.id`. En sık ilişki
  tipidir. (Ü6'daki PK/FK köprüsü tam da buydu.)
- **Çok-çok (N:M):** İki tarafta da çokluk. Bir öğrenci çok derse yazılır, bir derste çok öğrenci vardır.
  Bu ilişki tek bir FK'ya sığmaz. Çözüm: iki tarafın anahtarını taşıyan bir **ara tablo** (junction /
  bridge). Kampüste `enrollments(student_id, course_id, ...)` tam olarak budur. Ara tablo çoğu zaman
  ilişkinin kendi niteliklerini de taşır (enrollments'ta grade, semester, attendance_rate).
- **Self-ilişki:** Bir varlık kendi türünden bir varlığa bağlanır. `instructors.mentor_id ->
  instructors.id`: bir öğretim üyesinin mentoru yine bir öğretim üyesidir. (Ü7'deki self join bu ilişkiyi
  sorgular.)
- **Bir-bir (1:1):** Nadirdir. Her A'ya en fazla bir B (örn. bir öğrenciye bir öğrenci kartı). Genelde
  aynı tabloda tutulur ya da paylaşılan bir anahtarla ikiye ayrılır.

> Mini slogan: **Çok-çok ilişki tek yabancı anahtara sığmaz; iki tarafın anahtarını taşıyan bir ara tablo ister.**

### Çözümlü örnekler

**Örnek 1 (bir-çok: FK "çok" tarafta)**
- Sorgu:
```sql
SELECT d.name AS bolum, COUNT(s.id) AS ogrenci
FROM departments d
LEFT JOIN students s ON s.department_id = d.id
GROUP BY d.name
ORDER BY ogrenci DESC;
```
- Ne anlıyoruz? Bir bölüm birçok öğrenciye bağlı (1:N). FK öğrenci tarafında (department_id) durur, çünkü
  "çok" olan taraf öğrenciler. LEFT JOIN, öğrencisi olmayan bölümü de 0 ile gösterir.

**Örnek 2 (çok-çok: ara tablo kanıtı, önce tahmin et)**
- Bir öğrenci birden fazla derse yazılabiliyor mu? enrollments'a bakalım:
```sql
SELECT student_id, COUNT(DISTINCT course_id) AS ders_sayisi
FROM enrollments
GROUP BY student_id
HAVING COUNT(DISTINCT course_id) > 1
ORDER BY student_id;
```
- Ne anlıyoruz? student 1, 2, 6, 8, 9 birden çok derse yazılı. Yani "öğrenci-ders" gerçekten çok-çok bir
  ilişki. Bu yüzden ne students'a bir course_id sütunu, ne courses'a bir student_id sütunu koymak yeterdi;
  ikisinin arasına `enrollments` ara tablosu koyduk. Her satır "şu öğrenci, şu derse, şu dönemde yazıldı"
  der; üstüne notu ve devamı da taşır.

**Örnek 3 (self-ilişki)**
- Sorgu:
```sql
SELECT o.first_name AS ogretim_uyesi, m.first_name AS mentoru
FROM instructors o
LEFT JOIN instructors m ON o.mentor_id = m.id
ORDER BY o.id;
```
- Ne anlıyoruz? Aynı tablo (instructors) kendine bağlanıyor: mentor_id yine bir instructor'ı gösteriyor.
  mentoru olmayanlar (mentor_id NULL) LEFT JOIN sayesinde NULL mentorla görünür. Self-ilişki, "aynı türden
  şeyler birbirine bağlı" durumlarını modeller (çalışan-yönetici, kategori-üst kategori gibi).

### Sık hatalar & uyarılar
- Çok-çok ilişkiyi tek FK ile kurmaya çalışmak (örn. courses'a tek bir student_id). Bu sadece "bir ders
  bir öğrenci" derdi, çokluğu kaybederdi. Çok-çok = ara tablo, istisnasız.
- Ara tablonun ilişki niteliklerini unutmak. enrollments'taki grade ne öğrencinin ne dersin niteliği;
  o "yazılma"nın (ilişkinin) niteliği. İlişkiye ait veriler ara tabloda durur.
- Self-ilişkide alias zorunluluğunu unutmak (Ü7). Aynı tabloyu iki rolde kullanırken (o, m) ayrı takma
  adlar şart.

### Anlama soruları

**Soru 1 (kavram).** "Öğrenci ile kulüp" ilişkisi hangi tiptir, ve kampüs bunu nasıl modellemiş?
> **İpucu:** Bir öğrenci birden çok kulüpte olabilir mi? Bir kulüpte birden çok öğrenci?

> **Detaylı cevap:** Bu bir **çok-çok (N:M)** ilişkidir: bir öğrenci birden çok kulübe üye olabilir (Ayşe
> hem Robotik hem Müzik'te), ve bir kulüpte birçok öğrenci vardır. İki tarafta da çokluk olduğu için tek
> bir FK yetmez. Kampüs bunu `club_memberships(student_id, club_id, role, joined_at)` **ara tablosuyla**
> modellemiş: her satır "şu öğrenci şu kulübe üye" der. Ara tablo ilişkinin kendi niteliklerini de taşır:
> `role` (başkan/üye) ve `joined_at` (katılma tarihi) ne öğrencinin ne kulübün niteliğidir, "üyelik"in
> (ilişkinin) niteliğidir. student_id ve club_id birlikte bu tablonun bileşik anahtarını oluşturur (aynı
> öğrenci aynı kulübe iki kez üye olamaz). Bu, enrollments (öğrenci-ders) ile birebir aynı desendir.

**Soru 2 (yaz).** [▶ Editörde dene] Birden fazla kulübe üye olan öğrencilerin id'lerini bul
(club_memberships üzerinden). Bu, öğrenci-kulüp ilişkisinin gerçekten çok-çok olduğunu kanıtlar.
> **İpucu:** SELECT student_id FROM club_memberships GROUP BY student_id HAVING COUNT(*) > 1.

> **Detaylı cevap:**
> ```sql
> SELECT student_id
> FROM club_memberships
> GROUP BY student_id
> HAVING COUNT(*) > 1
> ORDER BY student_id;
> ```
> student 1 (Ayşe) ve student 5 (Elif) döner; ikisi de iki kulübe üye. Bu sonucun boş olmaması, ilişkinin
> çok-çok olduğunun kanıtıdır: en az bir öğrenci birden fazla kulüpte. Eğer ilişki bir-çok olsaydı (her
> öğrenci en fazla bir kulüp), bu sorgu hiç satır döndürmezdi ve club_id'yi students'a bir sütun olarak
> koyabilirdik. Çokluk iki tarafta da olduğu için ara tablo (club_memberships) şart. Aynı mantığı
> enrollments için de kurabilirsin: orada da bir öğrenci birden çok derse yazılıyor.

### Çıkış bileti
Çok-çok bir ilişkiyi neden tek yabancı anahtarla kuramayız, yerine ne kullanırız?

---

## Ders M.4 — Anahtar tasarımı: doğal vs yapay anahtar ve bileşik anahtar

### 🧑‍🏫 Öğretmen için
"Her tablonun bir kimliği (PK) olmalı ama kimliği neyden seçeriz?" iki seçenek: **doğal anahtar** (veriden
gelen benzersiz alan, örn. email, ISBN, TC) ve **yapay/surrogate anahtar** (anlamsız, sabit bir id). Sor:
"email'i öğrencinin PK'sı yapsak ne olur?" (Öğrenci e-postasını değiştirince, ona bağlı tüm kayıtları da
güncellemek gerekir; kötü.) Kampüs neden hep id kullanmış: id anlamsızdır, hiç değişmez, kısadır ve
FK'lar ona rahatça bağlanır. Sonra ara tablolara geç: enrollments'ın PK'sı tek sütun değil, (student_id,
course_id, semester) **bileşik**. "Bu üçü birlikte bir yazılmayı benzersiz tanımlar" ve aynı zamanda "aynı
öğrenci aynı derse aynı dönemde iki kez yazılamaz" kuralını da kurar.
- Sor: "enrollments'ın PK'sında neden semester de var?" (Bir öğrenci aynı dersi farklı dönemde tekrar
  alabilir; semester olmadan bu ikinci kaydı ekleyemezdik.)
- Herkes burada takılır: her tablonun PK'sının tek sütun olması gerektiğini sanmak. Ara tablolarda PK
  çoğu zaman bileşiktir.

### Neden / nerede işime yarar
Anahtar seçimi, tablonun ömrü boyunca yaşayacağın kolaylık ya da acıyı belirler. Yanlış PK (değişen bir
doğal anahtar) seçmek, ileride tüm bağlı tabloları peşinden sürükler. Doğru surrogate anahtar ise sessiz
sedasız işini görür.

### Konu anlatımı
- **Doğal anahtar (natural key):** Verinin kendisinden gelen, doğal olarak benzersiz bir alan: e-posta,
  ISBN, TC kimlik no. Anlamlıdır ("bu email kime ait" bellidir) ama iki riski var: değişebilir (insan
  e-postasını değiştirir) ve uzun/dağınık olabilir.
- **Yapay anahtar (surrogate key):** Sırf kimlik olsun diye üretilen, anlamsız ve sabit bir değer: genelde
  bir `INTEGER id`. Kampüsün her tablosunda bunu görüyorsun (students.id, courses.id...). Avantajı: asla
  değişmez, kısadır, FK'lar rahatça bağlanır. Dezavantajı: kendi başına bir anlam taşımaz (id 7 kim,
  bakmadan bilemezsin).
- **Bileşik anahtar (composite key):** Kimlik tek sütun olmak zorunda değil. Ara tablolarda birden çok
  sütun **birlikte** kimliği oluşturur. `enrollments`'ın PK'sı `(student_id, course_id, semester)`: bu üçlü
  bir "yazılma"yı benzersiz tanımlar. Bu aynı zamanda bir kuraldır: aynı öğrenci, aynı derse, aynı dönemde
  iki satır olamaz.

> Mini slogan: **Yapay anahtar (id) değişmez ve kısadır; ara tabloların kimliği çoğu zaman bileşiktir.**

### Çözümlü örnekler

**Örnek 1 (ara tablonun anatomisi)**
- enrollments'ın sütunlarını, şemayı değiştirmeden inceleyelim (Ü12'deki information_schema):
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'enrollments'
ORDER BY ordinal_position;
```
- Ne anlıyoruz? İlk iki sütun (student_id, course_id) iki varlığa işaret eden FK'lar; semester ilişkiyi
  benzersizleştiren üçüncü anahtar parçası; grade ve attendance_rate ise ilişkinin kendi nitelikleri. Yani
  bir ara tablo = iki (veya daha çok) FK + ilişkiye ait nitelikler.

**Örnek 2 (bileşik anahtarın kuralı, önce tahmin et)**
- students'ta id kaç kez tekrarlıyor, enrollments'ta student_id kaç kez tekrarlıyor?
```sql
SELECT
  (SELECT COUNT(DISTINCT id) FROM students)          AS students_farkli_id,
  (SELECT COUNT(*) FROM students)                    AS students_satir,
  (SELECT COUNT(DISTINCT student_id) FROM enrollments) AS enroll_farkli_ogrenci,
  (SELECT COUNT(*) FROM enrollments)                 AS enroll_satir;
```
- Ne anlıyoruz? students'ta id her satırda benzersiz (surrogate PK, tek sütun kimlik: farklı id = satır
  sayısı). enrollments'ta ise student_id tekrarlıyor (bir öğrenci çok kez yazılmış), çünkü orada kimlik
  tek başına student_id değil, `(student_id, course_id, semester)` bileşiği. Tekil bir sütunun tekrar
  etmesi, kimliğin bileşik olduğunun işaretidir.

### Sık hatalar & uyarılar
- Değişebilen bir doğal anahtarı PK yapmak (örn. email). Değişince tüm FK'lar kırılır. Değişme ihtimali
  olan hiçbir şeyi PK yapma; onun yerine surrogate id kullan, email'i UNIQUE yap (Ü12).
- Her PK'nın tek sütun olması gerektiğini sanmak. Ara tablolarda bileşik PK normaldir ve genelde doğrusudur.
- Bileşik PK'da bir sütunu unutmak. enrollments'tan semester'ı çıkarsaydık, bir öğrenci aynı dersi ikinci
  dönem tekrar alamazdı (ilk kayıt PK'yı işgal ederdi).

### Anlama soruları

**Soru 1 (kavram).** Öğrencinin e-postasını (email) PRIMARY KEY yapmak yerine neden anlamsız bir `id`
(surrogate) kullanıyoruz?
> **İpucu:** E-posta zamanla değişebilir mi? Değişirse ona bağlı kayıtlara ne olur?

> **Detaylı cevap:** Çünkü e-posta bir **doğal anahtardır** ve doğal anahtarların en büyük riski
> değişebilmeleridir. Bir öğrenci e-postasını değiştirdiğinde, eğer email PK olsaydı, ona işaret eden tüm
> yabancı anahtarları (o öğrencinin tüm kayıtları, siparişleri, üyelikleri) da tek tek güncellemek
> gerekirdi; biri atlanırsa referans bütünlüğü kırılır. Ayrıca e-posta uzundur ve her FK'da bu uzun metni
> taşımak yer ve hız kaybıdır. **Surrogate anahtar** (`id INTEGER`) bu sorunları çözer: anlamsızdır, bu
> yüzden hiçbir zaman "değişmesi" gerekmez (id 7 hep id 7 kalır, öğrenci e-postasını, adını, şehrini
> değiştirse bile); kısadır, FK'lar rahatça bağlanır. E-postanın benzersiz kalmasını hâlâ istiyorsak, onu
> PK yapmak yerine `UNIQUE` kısıtıyla koruruz (Ü12). Kısaca: kimliği veriden değil, sabit bir sayıdan al.

**Soru 2 (yaz).** [▶ Editörde dene] enrollments tablosunun sütunlarını ve tiplerini, sırasıyla listele
(information_schema ile, şemayı değiştirmeden). Hangi sütunlar FK, hangileri ilişki niteliği, gör.
> **İpucu:** SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='enrollments' ORDER BY ordinal_position.

> **Detaylı cevap:**
> ```sql
> SELECT column_name, data_type
> FROM information_schema.columns
> WHERE table_schema = 'public' AND table_name = 'enrollments'
> ORDER BY ordinal_position;
> ```
> Beş sütun döner: student_id, course_id, semester, grade, attendance_rate. İlk ikisi (student_id,
> course_id) iki varlığa (öğrenci, ders) işaret eden yabancı anahtarlar; semester ilişkiyi benzersizleştiren
> üçüncü anahtar parçası (üçü birlikte bileşik PK); grade ve attendance_rate ise ilişkinin kendi nitelikleri
> (bu öğrencinin bu derse bu dönemki notu ve devam oranı). Bu, bir ara tablonun tipik anatomisidir:
> ilişkiyi kuran FK'lar + ilişkiye ait nitelikler. information_schema'yı kullanmak, tabloya hiç dokunmadan
> yapısını okumanın güvenli yoludur (Ü12).

### Çıkış bileti
Doğal anahtar yerine surrogate anahtar seçmenin iki nedeni nedir, bileşik anahtar ne zaman gerekir?

---

## Pratik (editörde dene)

> İlk üç görev kampüs şemasını analiz eder (hepsi okuma, hiçbir şeyi bozmaz). Son görevde küçük bir
> çok-çok modelini kendin kurup sonra silersin. Seed: Kampüs.

**P1 (kolay, 1:N).** [▶ Editörde dene] Her bölümde kaç öğrenci var? department_id başına öğrenci sayısını,
department_id'ye göre artan listele. (Bir-çok ilişkinin "çok" tarafını sayıyorsun.)
> İpucu: SELECT department_id, COUNT(*) ... FROM students GROUP BY department_id ORDER BY department_id.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT department_id, COUNT(*) AS ogrenci_sayisi
> FROM students
> GROUP BY department_id
> ORDER BY department_id;
> ```
> Bölüm 1: 5, bölüm 2: 3, bölüm 3: 3, bölüm 4: 2, bölüm 5: 1. FK (department_id) "çok" tarafında, yani
> öğrencilerde. Bir-çok ilişkiyi bu yüzden tek bir GROUP BY ile özetleyebiliyoruz.
> </details>

**P2 (orta, N:M).** [▶ Editörde dene] Birden fazla kulübe üye olan öğrencilerin id'lerini bul
(club_memberships üzerinden), student_id'ye göre artan. (Çok-çok ilişkinin kanıtı.)
> İpucu: GROUP BY student_id HAVING COUNT(*) > 1.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT student_id
> FROM club_memberships
> GROUP BY student_id
> HAVING COUNT(*) > 1
> ORDER BY student_id;
> ```
> student 1 ve 5 döner. Boş dönmemesi, öğrenci-kulüp ilişkisinin çok-çok olduğunu ve bu yüzden ara tablo
> (club_memberships) gerektiğini kanıtlar.
> </details>

**P3 (introspection, ara tablo anatomisi).** [▶ Editörde dene] order_items ara tablosunun sütunlarını ve
tiplerini sırasıyla listele (information_schema ile). Hangileri FK, hangileri ilişki niteliği?
> İpucu: information_schema.columns, table_name = 'order_items', ORDER BY ordinal_position.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT column_name, data_type
> FROM information_schema.columns
> WHERE table_schema = 'public' AND table_name = 'order_items'
> ORDER BY ordinal_position;
> ```
> order_id, product_id, quantity, unit_price döner. order_id ve product_id iki varlığa (sipariş, ürün)
> işaret eden FK'lar ve birlikte bileşik PK; quantity ve unit_price ise ilişkinin nitelikleri (bu siparişte
> bu üründen kaç adet, hangi birim fiyattan). "Bir siparişte çok ürün, bir ürün çok siparişte" çok-çok
> ilişkisinin ara tablosu.
> </details>

**P4 (düşündürücü, kendi N:M modelin).** [▶ Editörde dene] Bir "yazar-kitap" çok-çok ilişkisini kur: bir
kitabın birden çok yazarı, bir yazarın birden çok kitabı olabilir. `authors(id, ad)`, `books(id, baslik)`
ve bunları bağlayan `book_authors` ara tablosunu (iki FK + bileşik PK) oluştur. Sonra hepsini DROP et.
> İpucu: book_authors(book_id REFERENCES books(id), author_id REFERENCES authors(id), PRIMARY KEY (book_id, author_id)).
> <details><summary>Cevap</summary>
>
> ```sql
> CREATE TABLE authors (id INTEGER PRIMARY KEY, ad TEXT NOT NULL);
> CREATE TABLE books  (id INTEGER PRIMARY KEY, baslik TEXT NOT NULL);
> CREATE TABLE book_authors (
>   book_id   INTEGER REFERENCES books(id),
>   author_id INTEGER REFERENCES authors(id),
>   PRIMARY KEY (book_id, author_id)
> );
> -- Küçük bir çok-çok örneği:
> INSERT INTO authors VALUES (1, 'A. Demir'), (2, 'B. Kaya');
> INSERT INTO books   VALUES (1, 'SQL 101'), (2, 'Veri Modelleme');
> INSERT INTO book_authors VALUES (1, 1), (1, 2), (2, 1);  -- kitap 1'in iki yazarı, yazar 1'in iki kitabı
> SELECT b.baslik, a.ad
> FROM book_authors ba
> JOIN books b   ON ba.book_id = b.id
> JOIN authors a ON ba.author_id = a.id
> ORDER BY b.baslik, a.ad;
> -- Temizlik (FK sırası: önce ara tablo):
> DROP TABLE book_authors;
> DROP TABLE books;
> DROP TABLE authors;
> ```
> book_authors ara tablosu, kitap 1'in iki yazarını (çokluk bir tarafta) ve yazar 1'in iki kitabını
> (çokluk diğer tarafta) aynı anda tutabiliyor. Bileşik PK (book_id, author_id) aynı yazarın aynı kitaba
> iki kez bağlanmasını engeller. Bu, enrollments/club_memberships ile birebir aynı desen; sen kurdun.
> Silerken önce ara tabloyu (FK veren) sil (Ü12).
> </details>

---

## Ünite M özeti (öğrenciye)
- Bir problemi tabloya çevirmek: **varlık** (tablo), **nitelik** (sütun), **ilişki** (yabancı anahtar).
- **Redundans** (aynı bilgiyi tekrar yazmak) üç anomaliye yol açar: güncelleme, silme, ekleme.
  **Normalleştirme** = tekrarlayan grubu ayrı tabloya alıp FK ile bağlamak (tek doğru kaynak).
- İlişki tipleri: **bir-çok** (FK "çok" tarafta), **çok-çok** (ara/junction tablo şart), **self-ilişki**
  (tablo kendine bağlanır), bir-bir (nadir). Ara tablo, ilişkinin kendi niteliklerini de taşır.
- Anahtar tasarımı: **surrogate** (anlamsız, sabit id) doğal anahtardan güvenlidir çünkü değişmez.
  Ara tablolarda **bileşik anahtar** (birden çok sütun birlikte) normaldir ve bir benzersizlik kuralı kurar.
- Sıradaki ünite Ü12 (DDL): burada tasarladığın modeli CREATE TABLE, kısıtlar ve PK/FK ile gerçekten
  SQL'e dökeceksin. Model kafanda netse, DDL sadece onu yazmaktır.

## 🧑‍🏫 Öğretmen notu (ünite geneli)
Bu üniteyi DML (Ü11) ile DDL (Ü12) arasına koymamızın sebebi: öğrenci artık hem okumayı hem veriyi
değiştirmeyi biliyor, ama "tablolar en baştan neden böyle?" sorusunu henüz sormadı. Ü12'de tablo
KURMADAN önce, tasarımın kendisini (varlık/nitelik/ilişki, redundans, ilişki tipleri, anahtarlar)
oturtmak, DDL'i mekanik ezberden anlamlı bir işe çevirir. En güçlü hamle: her kavramı öğrencinin 11
ünitedir sorguladığı kampüs şemasında canlı göstermek ("enrollments neden var, departments neden ayrı").
Redundansı önce yaşat (dev tek tablo), sonra kurtar; anomalileri somut anlat (adı değiştir, son öğrenciyi
sil). Çok-çok = ara tablo fikrini tekrar tekrar vurgula, çünkü gerçek hayatta en pahalı tasarım hatası
burada yapılıyor. Ü12'ye geçerken köprüyü kur: "kafanda modelledin, şimdi SQL'e dökelim."
