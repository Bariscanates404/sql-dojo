# Ünite 7 — JOIN II: Çok-Çok İlişki, Self Join ve Satır Çoğalması

> Kavram etiketleri: `one-to-many`, `many-to-many`, `bridge-table`, `self-join`, `alias-required`, `row-multiplication`, `grain-after-join`
> Ön koşul: Ü0-Ü6
> Kullanılan tablolar: students, clubs, club_memberships, instructors
> Tahmini süre: 55-65 dk
> Ünite sloganı: **"JOIN satır eklemez; eşleşmeleri listeler. Eşleşme çoksa sonuç çoğalır."**

---

## Ders 7.1 — İlişki türleri: bir-çok ve çok-çok

### 🧑‍🏫 Öğretmen için
Tahtaya iki ilişki çiz. Birincisi bir-çok: "Bir bölümün çok öğrencisi var, ama bir öğrenci tek bölümde."
Okları çiz. İkincisi çok-çok: "Bir öğrenci çok kulüpte olabilir, bir kulüpte çok öğrenci olabilir." Sor:
"Çok-çok ilişkiyi tek tabloda nasıl tutarız?" Cevabı birlikte bul: tutamayız, araya bir **köprü tablo**
koyarız (club_memberships). Her satır bir "üyelik" (bir öğrenci-kulüp ikilisi).
- Tahtaya yaz: students --< club_memberships >-- clubs. Köprü iki yana FK ile bağlı.
- Sor: "Ayşe hem Robotik hem Müzik'te. Bu kaç üyelik satırı?" (İki.)
- Herkes burada takılır: köprü tablonun neden gerektiğini. "Çok-çok'u tek FK ile tutamazsın" de.

### Neden / nerede işime yarar
Gerçek dünyada çok-çok her yerde: öğrenci-ders, ürün-sipariş, etiket-yazı, oyuncu-takım. Hepsi araya bir
köprü tablo koyar. Bunu anlamak, gerçek şemaları okuyabilmenin anahtarı.

### Konu anlatımı
İki temel ilişki:
- **Bir-çok (one-to-many):** Bir bölümün çok öğrencisi var, ama bir öğrenci tek bölümde. Bunu tek FK ile
  tutarız: `students.department_id` (Ü6).
- **Çok-çok (many-to-many):** Bir öğrenci çok kulüpte, bir kulüpte çok öğrenci olabilir. Bunu tek FK ile
  tutamayız; araya bir **köprü tablo (bridge)** koyarız: `club_memberships`. Her satırı bir üyelik
  (bir öğrenci-kulüp ikilisi). Köprü, iki yana da FK taşır: `student_id` ve `club_id`.

Çok-çok'u sorgulamak iki JOIN ister: öğrenci -> köprü -> kulüp (Ü6.3'te tatmıştık).

> Mini slogan: **Çok-çok ilişki tek tabloda tutulamaz; araya, her satırı bir eşleşme olan bir köprü tablo girer.**

### Çözümlü örnek
- `club_memberships` tablosuna bak: her satır bir üyelik. Ayşe (id 1) iki satırda (kulüp 1 ve kulüp 2),
  çünkü iki kulüpte. Satranç hiçbir satırda yok, çünkü üyesi yok. Köprü tablo, çok-çok ilişkinin "kayıt
  defteri"dir.

### Sık hatalar & uyarılar
- Çok-çok'u `students` tablosuna bir `club_id` sütunu ekleyerek çözmeye çalışmak. O zaman bir öğrenci
  tek kulüpte kalır; çok-çok bozulur. Köprü tablo şart.
- Köprü tablodaki bir satırı "bir öğrenci" sanmak. O bir üyelik (öğrenci-kulüp ikilisi).

### Anlama soruları

**Soru 1 (kavram).** Öğrenci-ders ilişkisi (`enrollments`) ne tür bir ilişkidir ve neden köprü tablo
kullanılmış?
> **İpucu:** Bir öğrenci kaç derse, bir ders kaç öğrenciye?

> **Detaylı cevap:** **Çok-çok.** Bir öğrenci birçok derse kayıt olabilir, bir derse birçok öğrenci
> kayıt olabilir. Bu yüzden ne `students`'a tek bir `course_id`, ne `courses`'a tek bir `student_id`
> koymak yeterli olurdu (her biri ilişkiyi "bir-çok"a indirger). Çözüm, araya `enrollments` köprü
> tablosunu koymaktır: her satır bir kayıt (öğrenci-ders ikilisi), ve üstelik o ikiliye ait ek bilgi de
> taşır (`semester`, `grade`, `attendance_rate`). Köprü tablolar çoğu zaman böyle "ilişkiye ait" ek
> alanlar da tutar (üyelik rolü, kayıt notu gibi).

**Soru 2 (kavram).** `club_memberships` tablosunda Ayşe (id 1) kaç satırda görünür, neden?
> **İpucu:** Ayşe kaç kulüpte?

> **Detaylı cevap:** **İki satırda** (kulüp 1 Robotik ve kulüp 2 Müzik). Çünkü her satır bir üyeliktir
> ve Ayşe iki kulübe üye. Köprü tabloda bir öğrenci, üye olduğu her kulüp için ayrı bir satıra sahip
> olur. Bu, ileride çok önemli bir noktaya işaret eder: bu tabloyu öğrencilerle birleştirince Ayşe iki
> kez görünecek (satır çoğalması, 7.4). "Köprü tabloda kaç satır = kaç eşleşme/üyelik" diye düşün, "kaç
> öğrenci" değil.

### Çıkış bileti
Çok-çok ilişkiyi veritabanında ne ile çözeriz, ve köprü tablodaki bir satır neyi temsil eder?

---

## Ders 7.2 — Çok-çok'u sorgulamak: iki yana JOIN

### 🧑‍🏫 Öğretmen için
"Köprüden iki yana JOIN" kalıbını tahtaya yaz: students -> club_memberships -> clubs. Sonra iki yönlü
soru sor: "Ayşe hangi kulüplerde?" ve "Robotik'te kimler var?" İkisi de aynı üç tablodan, sadece nereye
filtre koyduğun değişir. Bu, çok-çok'un iki yönlü okunabildiğini gösterir.
- Sor: "Öğrenci başına kulüp listesi mi, kulüp başına öğrenci listesi mi? İkisi de aynı JOIN."
- Herkes burada takılır: hangi tablodan başlayacaklarını. "Köprüden başla, iki yana bağla; ya da
  öğrenciden başla, köprüye, oradan kulübe" de.

### Konu anlatımı
Çok-çok ilişkiyi okumak için köprü tabloyu iki yana JOIN'leriz. Aynı üç tablo, hangi yöne baktığına göre
iki soruyu da cevaplar:
- "Hangi öğrenci hangi kulüpte?" (genel liste)
- "Ayşe hangi kulüplerde?" (öğrenciye filtre)
- "Robotik'te kimler var?" (kulübe filtre)

```sql
SELECT s.first_name AS ogrenci, cl.name AS kulup
FROM students s
JOIN club_memberships cm ON cm.student_id = s.id
JOIN clubs cl ON cl.id = cm.club_id
WHERE s.first_name = 'Ayşe';
```

> Mini slogan: **Çok-çok'u köprüden iki yana JOIN'leyerek okursun; filtreyi nereye koyduğun yönü belirler.**

### Çözümlü örnekler

**Örnek 1 (Ayşe'nin kulüpleri)**
- Sorgu (yukarıdaki). Sonuç: Ayşe / Robotik, Ayşe / Müzik (2 satır). Ne anlıyoruz? Ayşe iki kulüpte,
  her biri ayrı satır. Köprü tablo bu iki üyeliği tutuyordu.

**Örnek 2 (Robotik'teki öğrenciler)**
- Sorgu:
```sql
SELECT cl.name AS kulup, s.first_name AS ogrenci
FROM clubs cl
JOIN club_memberships cm ON cm.club_id = cl.id
JOIN students s ON s.id = cm.student_id
WHERE cl.name = 'Robotik'
ORDER BY s.first_name;
```
- Sonuç: Robotik / Ayşe, Ali, Burak, Mehmet (4 satır). Ne anlıyoruz? Aynı üç tablo, bu sefer kulübe
  filtre koyduk, "kulüpteki öğrenciler" yönünden okuduk.

### Sık hatalar & uyarılar
- Köprü tabloyu atlayıp students ile clubs'ı doğrudan JOIN'lemeye çalışmak. Aralarında doğrudan FK yok;
  köprü (club_memberships) şart.
- İkinci JOIN'in ON'unu unutmak (Ü6.3). Her JOIN kendi ON'unu ister.

### Anlama soruları

**Soru 1 (yaz).** Elif (first_name = 'Elif') hangi kulüplerde? Kulüp adlarını getir.
> **İpucu:** students -> club_memberships -> clubs, WHERE first_name = 'Elif'.

> **Detaylı cevap:**
> ```sql
> SELECT cl.name AS kulup
> FROM students s
> JOIN club_memberships cm ON cm.student_id = s.id
> JOIN clubs cl ON cl.id = cm.club_id
> WHERE s.first_name = 'Elif';
> ```
> Köprüden iki yana JOIN yaptık, öğrenciye filtre koyduk. Sonuç: Müzik ve Fotoğrafçılık (Elif iki
> kulüpte). İki satır gelir çünkü Elif'in iki üyeliği var. Eğer "kaç kulüpte?" deseydik bunun üstüne
> `COUNT(*)` ve `GROUP BY` koyardık (Ü8).

**Soru 2 (yaz).** Girişimcilik kulübündeki öğrencilerin ad-soyadını getir.
> **İpucu:** clubs -> club_memberships -> students, WHERE cl.name = 'Girişimcilik'.

> **Detaylı cevap:**
> ```sql
> SELECT s.first_name, s.last_name
> FROM clubs cl
> JOIN club_memberships cm ON cm.club_id = cl.id
> JOIN students s ON s.id = cm.student_id
> WHERE cl.name = 'Girişimcilik';
> ```
> Bu sefer kulüpten başladık, köprüye, oradan öğrencilere bağladık ve kulübe filtre koyduk. Sonuç:
> Zeynep (başkan) ve Deniz (üye). Aynı üç tabloyu, sorunun yönüne göre farklı sırayla okuduk; çok-çok
> ilişkinin iki yönlü doğası bu.

### Çıkış bileti
Çok-çok ilişkiyi sorgularken neden köprü tabloyu iki yana JOIN'lemek gerekir?

---

## Ders 7.3 — Self join: bir tabloyu kendisiyle birleştirmek

### 🧑‍🏫 Öğretmen için
"Bazen bir tablo, kendi içindeki başka bir satıra işaret eder." instructors tablosunu aç, `mentor_id`
sütununu göster: "Selin'in mentor_id'si 1, yani Ayhan. Mentor da bir öğretim üyesi, aynı tabloda." Sor:
"Selin'in mentorunun ADINI nasıl getiririz?" Cevap: aynı tabloyu iki rolle kullan: biri "üye", biri
"mentor". İşte self join. Alias ZORUNLU, çünkü aynı tabloyu iki kez kullanıyoruz.
- Tahtaya yaz: `instructors i` (üye) ve `instructors m` (mentor), `ON i.mentor_id = m.id`.
- Benzetme: "Aynı tabloya iki farklı gözlükle bakıyoruz: bir sefer 'kişi', bir sefer 'o kişinin mentoru'."
- Herkes burada takılır: alias'sız self join. "Aynı tablo iki kez, hangi i hangisi belli olmaz; alias şart."

### Konu anlatımı
**Self join**, bir tabloyu kendisiyle birleştirmektir. Tablo kendi içinde bir satıra işaret ediyorsa
(örneğin `instructors.mentor_id` -> `instructors.id`) kullanılır. Aynı tabloyu iki kez kullandığımız
için **takma ad zorunludur**: birine "üye" (`i`), diğerine "mentor" (`m`) deriz.

```sql
SELECT i.first_name AS uye, m.first_name AS mentor
FROM instructors i
JOIN instructors m ON i.mentor_id = m.id;
```

> Mini slogan: **Self join, aynı tabloya iki rolle bakmaktır; alias zorunludur (i = kişi, m = mentor).**

### Çözümlü örnekler

**Örnek 1 (mentoru olanlar, INNER)**
- Sorgu (yukarıdaki). Sonuç:

| uye   | mentor |
|-------|--------|
| Selin | Ayhan  |
| Can   | Elif   |
| Deniz | Ayhan  |

- Ne anlıyoruz? INNER self join sadece mentoru OLAN öğretim üyelerini getirdi (3 kişi). Ayhan, Murat,
  Elif'in `mentor_id`'si NULL olduğu için (mentorları yok) eşleşmediler ve elendiler. Bu yine INNER'ın
  "eşleşmeyeni eler" davranışı (Ü6).

**Örnek 2 (herkes, mentoru olmayanlar da, LEFT)**
- Sorgu:
```sql
SELECT i.first_name AS uye, m.first_name AS mentor
FROM instructors i
LEFT JOIN instructors m ON i.mentor_id = m.id
ORDER BY i.first_name;
```
- Sonuç: 6 satır; Ayhan, Murat, Elif'in `mentor` değeri NULL (mentorları yok), diğerlerinin dolu. Ne
  anlıyoruz? LEFT JOIN ile herkesi koruduk; mentoru olmayanlar NULL mentorla göründü.

### Sık hatalar & uyarılar
- Self join'de alias kullanmamak -> "hangi instructors?" belirsizliği/hatası. İki rol, iki alias.
- Yönü karıştırmak: `i.mentor_id = m.id` (üyenin mentor_id'si, mentorun id'sine). Tersi yanlış sonuç verir.

### Anlama soruları

**Soru 1 (kavram).** Self join'de neden takma ad (alias) zorunludur?
> **İpucu:** Aynı tabloyu kaç kez kullanıyoruz?

> **Detaylı cevap:** Çünkü aynı tabloyu (`instructors`) sorguda iki kez kullanıyoruz ve SQL'in bu iki
> kopyayı birbirinden ayırması gerekir. Alias olmadan `instructors.first_name` yazsak, SQL "hangi
> kopyanın first_name'i, üyenin mi mentorun mu?" diye ayırt edemez (belirsizlik/ambiguous hatası).
> İki farklı alias (`i` = kişi, `m` = mentor) vererek aynı tabloya iki ayrı "rol" kazandırırız ve
> `i.first_name` (üyenin adı) ile `m.first_name` (mentorun adı) netleşir. Self join, alias'ın zorunlu
> olduğu klasik durumdur.

**Soru 2 (tahmin et).** Yukarıdaki INNER self join 3 satır döndürdü ama 6 öğretim üyesi var. Eksik 3 kim,
neden?
> **İpucu:** Kimlerin mentor_id'si NULL?

> **Detaylı cevap:** Eksik olanlar **Ayhan, Murat ve Elif**, çünkü `mentor_id` değerleri NULL (mentorları
> yok). INNER JOIN `i.mentor_id = m.id` koşuluyla eşleşen satırları arar; mentor_id NULL olunca eşleşecek
> bir mentor satırı bulunamaz (NULL hiçbir şeye eşit değil, Ü2), bu yüzden bu üç kişi elenir ve geriye
> mentoru olan 3 kişi (Selin, Can, Deniz) kalır. Hepsini görmek istersek (mentoru olmayanlar dahil) LEFT
> JOIN kullanırız, o zaman 6 satır gelir ve mentorsuzların mentoru NULL görünür.

### Çıkış bileti
Self join nedir ve neden alias olmadan yapılamaz?

---

## Ders 7.4 — Satır çoğalması (grain): JOIN sonrası "bir satır ne?"

### 🧑‍🏫 Öğretmen için
Bu ders Ü8'in (JOIN+aggregate) hayat-memat zemini. Tahtaya iki sayı yaz: `COUNT(*) FROM students` = 14.
Sonra öğrencileri üyeliklerle JOIN'le, tekrar say: bambaşka bir sayı (10). Sor: "Öğrenci sayısı 14'tü,
neden 10 ya da farklı çıktı?" Cevap: JOIN'den sonra bir satır artık 'bir öğrenci' değil, 'bir üyelik';
iki kulüplü Ayşe iki kez sayıldı, kulüpsüzler hiç gelmedi. **"JOIN'den sonra bir satır neyi temsil
ediyor?" sorusunu her zaman sor.**
- Canlı göster: `COUNT(*)` (10) vs `COUNT(DISTINCT s.id)` (8). "Satır saymak ile öğrenci saymak farklı."
- Bu, Ü8'deki çift sayma tuzaklarının kaynağı; sağlam oturt.

### Neden / nerede işime yarar
"Toplam ciro neden iki katı çıktı?", "müşteri sayısı neden şişti?" gibi gerçek hata raporlarının
neredeyse hepsi satır çoğalmasından kaynaklanır. Grain'i anlamak, bu hataları daha doğmadan görmeni sağlar.

### Konu anlatımı
Ü5'te "grain"i (bir satırın anlamı) öğrenmiştik. JOIN, grain'i değiştirir. Çok-çok bir JOIN'de bir satır
artık "bir öğrenci" değil, "bir eşleşme/üyelik"tir. Bu yüzden:
- Birden çok kulüpte olan öğrenci (Ayşe, Elif) **birden çok satırda** tekrar eder.
- Hiç kulübü olmayan öğrenci (INNER JOIN'de) hiç görünmez.

Sonuç: JOIN'den sonra `COUNT(*)` "öğrenci sayısı" değil "üyelik/eşleşme sayısı"dır. Öğrenci saymak
istiyorsan `COUNT(DISTINCT s.id)` gerekir.

> Mini slogan: **JOIN'den sonra "bir satır neyi temsil ediyor?" diye sor; çoğalma varsa COUNT(*) yanıltır.**

### Çözümlü örnekler

**Örnek 1 (çoğalmayı gör, önce tahmin et)**
- Önce tahmin: `students JOIN club_memberships` kaç satır? (Üyelik sayısı kadar, 10. Öğrenci sayısı değil.)
- Sorgu:
```sql
SELECT COUNT(*) AS satir, COUNT(DISTINCT s.id) AS farkli_ogrenci
FROM students s
JOIN club_memberships cm ON cm.student_id = s.id;
```
- Sonuç:

| satir | farkli_ogrenci |
|-------|----------------|
| 10    | 8              |

- Ne anlıyoruz? 10 satır (10 üyelik), ama sadece 8 farklı öğrenci (Ayşe ve Elif ikişer kez). Üstelik
  kulübü olmayan 6 öğrenci hiç yok (INNER). Yani bu join sonrası `COUNT(*)` ne "öğrenci sayısı" ne de
  "14"tür; "üyelik sayısı"dır. Öğrenci saymak için `COUNT(DISTINCT s.id)`.

**Örnek 2 (tekrarı gözle gör)**
- Sorgu:
```sql
SELECT s.first_name, cl.name AS kulup
FROM students s
JOIN club_memberships cm ON cm.student_id = s.id
JOIN clubs cl ON cl.id = cm.club_id
ORDER BY s.first_name;
```
- Sonuç (ilgili kısım): Ayşe / Robotik, Ayşe / Müzik, Elif / Müzik, Elif / Fotoğrafçılık, ... Ne
  anlıyoruz? Ayşe ve Elif iki satırda. Bu tekrar bir hata değil, JOIN'in doğası: her eşleşme bir satır.
  Ama bunu fark etmeden SUM/COUNT yaparsan sonuç şişer (Ü8).

### Sık hatalar & uyarılar
- JOIN'den sonra `COUNT(*)`'ı "ana tablonun satır sayısı" sanmak. Çoğalma varsa yanıltır.
- Çoğalmayı görmezden gelip SUM/AVG yapmak -> çift sayma (Ü8).
- "Öğrenci sayısı" için `COUNT(*)` yerine `COUNT(DISTINCT s.id)` gerektiğini unutmak.

### Anlama soruları

**Soru 1 (tahmin et).** `students JOIN club_memberships` 10 satır, 8 farklı öğrenci verdi. Neden 14
değil, ve hangi öğrenciler iki kez var?
> **İpucu:** Kim birden çok kulüpte, kim hiç kulüpte değil?

> **Detaylı cevap:** 14 değil, çünkü iki etki var. Birincisi: INNER JOIN, hiç kulübe üye olmayan 6
> öğrenciyi (Can, Ali Vural, Merve, Emre, Gizem, Okan) eler; onların eşleşeceği üyelik yok. İkincisi:
> birden çok kulüpte olan öğrenciler birden çok satırda tekrarlar. Sonuç 10 satır = 10 üyelik; bunların
> içinde 8 farklı öğrenci var, çünkü **Ayşe** (Robotik + Müzik) ve **Elif** (Müzik + Fotoğrafçılık)
> ikişer kez görünür (8 + 2 tekrar = 10). Yani satır sayısı (10) ne ana tabloya (14) ne de farklı
> öğrenciye (8) eşit; o "üyelik sayısı"dır. Grain'i sormadan COUNT(*) kullanırsan hangi soruyu
> cevapladığını bilemezsin.

**Soru 2 (kavram).** Bu join üstünde "kaç farklı öğrenci kulüpte?" sorusuna doğru cevabı hangi ifade verir?
> **İpucu:** Tekrarları teke indir.

> **Detaylı cevap:** `COUNT(DISTINCT s.id)` verir, sonuç **8**. `COUNT(*)` 10 verirdi ama o "üyelik
> sayısı"dır, Ayşe ve Elif iki kez sayıldığı için öğrenci sayısını şişirir. `COUNT(DISTINCT s.id)`
> aynı öğrenciyi bir kez sayarak gerçek "farklı öğrenci" sayısını (8) verir. Bu, satır çoğalması olan
> her JOIN'de aklında tutman gereken düzeltme: "kaç farklı X?" sorusunda neredeyse her zaman
> `COUNT(DISTINCT ...)` gerekir. Bu fikir Ü8'de çift saymayı önlemenin de anahtarı olacak.

### Çıkış bileti
Bir JOIN sonrası `COUNT(*)` neden "ana tablonun satır sayısı"nı vermeyebilir?

---

## Pratik (editörde dene)

> Deneme Tahtasında (⌘K) dene. Önce tahmin et, çalıştır, gözle, sonra cevaba bak. Seed: Kampüs.

**P1 (kolay).** [▶ Editörde dene] Müzik kulübündeki öğrencilerin adlarını getir.
> İpucu: clubs -> club_memberships -> students, WHERE cl.name = 'Müzik'.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT s.first_name
> FROM clubs cl
> JOIN club_memberships cm ON cm.club_id = cl.id
> JOIN students s ON s.id = cm.student_id
> WHERE cl.name = 'Müzik';
> ```
> Ayşe ve Elif. Köprüden iki yana JOIN, kulübe filtre.
> </details>

**P2 (orta).** [▶ Editörde dene] Birden çok kulüpte olan öğrencileri görmek için: her öğrenci ve üye
olduğu kulüp adını listele, öğrenci adına göre sırala. (Tekrar eden adları gözle gör.)
> İpucu: students -> club_memberships -> clubs, ORDER BY first_name.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT s.first_name, cl.name AS kulup
> FROM students s
> JOIN club_memberships cm ON cm.student_id = s.id
> JOIN clubs cl ON cl.id = cm.club_id
> ORDER BY s.first_name;
> ```
> Ayşe iki satırda (Robotik, Müzik), Elif iki satırda (Müzik, Fotoğrafçılık). Satır çoğalmasını gözle gör.
> </details>

**P3 (orta).** [▶ Editörde dene] Her öğretim üyesinin adını ve (varsa) mentorunun adını getir; mentoru
olmayanlar da görünsün.
> İpucu: instructors i LEFT JOIN instructors m ON i.mentor_id = m.id.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT i.first_name AS uye, m.first_name AS mentor
> FROM instructors i
> LEFT JOIN instructors m ON i.mentor_id = m.id
> ORDER BY i.first_name;
> ```
> 6 satır; Ayhan, Murat, Elif'in mentoru NULL. Self join + LEFT, alias zorunlu.
> </details>

**P4 (zorlayıcı).** [▶ Editörde dene] `students JOIN club_memberships` üstünde kaç satır var, kaç farklı
öğrenci var? İkisini tek sorguda göster ve farkı açıkla.
> İpucu: COUNT(*) ve COUNT(DISTINCT s.id).
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT COUNT(*) AS satir, COUNT(DISTINCT s.id) AS farkli_ogrenci
> FROM students s JOIN club_memberships cm ON cm.student_id = s.id;
> ```
> satir = 10 (üyelik sayısı), farkli_ogrenci = 8. Fark: Ayşe ve Elif iki kez. COUNT(*) öğrenci saymaz,
> üyelik sayar.
> </details>

**P5 (düşündürücü).** [▶ Editörde dene] Robotik kulübünde kaç öğrenci var? (Dikkat: doğru cevabı
COUNT(*) mı COUNT(DISTINCT) mı verir? Bu kulüpte tekrar var mı?)
> İpucu: clubs -> club_memberships, WHERE Robotik, COUNT.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT COUNT(*) AS uye_sayisi
> FROM clubs cl
> JOIN club_memberships cm ON cm.club_id = cl.id
> WHERE cl.name = 'Robotik';
> ```
> 4. Burada `COUNT(*)` doğru, çünkü bir öğrenci aynı kulübe iki kez üye olamaz (köprü tablonun PK'sı
> student_id+club_id). Yani bu yönde tekrar yok; ama yine de "bir satır = bir üyelik" demeyi alışkanlık
> yap. Genel kurtarıcı `COUNT(DISTINCT cm.student_id)` da 4 verir.
> </details>

---

## Ünite 7 özeti (öğrenciye)
- **Bir-çok** ilişki tek FK ile tutulur; **çok-çok** ilişki bir **köprü tablo** ister (her satır bir eşleşme).
- Çok-çok'u sorgulamak köprüden iki yana JOIN ile olur; filtreyi nereye koyduğun yönü belirler.
- **Self join**: bir tabloyu kendisiyle birleştirmek (örn. mentor). Alias **zorunlu** (iki rol, iki ad).
- **Satır çoğalması (grain):** JOIN'den sonra bir satır artık ana varlık değil, bir eşleşmedir. Çoğalma
  varsa `COUNT(*)` yanıltır; "kaç farklı X?" için `COUNT(DISTINCT ...)`.
- Her JOIN'den sonra **"bir satır neyi temsil ediyor?"** diye sor.

## 🧑‍🏫 Öğretmen notu (ünite geneli)
Bu ünitenin gerçek hedefi 7.4 (satır çoğalması); çok-çok ve self join onu somutlaştıran araçlar. `COUNT(*)`
(10) vs `COUNT(DISTINCT s.id)` (8) karşılaştırmasını canlı yap, çünkü Ü8'deki çift sayma ve LEFT JOIN +
COUNT tuzakları doğrudan buradan besleniyor. Öğrenci "JOIN satır çoğaltır, grain değişir" fikrini
içselleştirirse, Ü8 (JOIN+Aggregate) çok daha az korkutucu olur. Bir sonraki ünite tam da bu: birleştir,
sonra grupla, ama çift saymadan.
