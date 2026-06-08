# Ünite 9 — Alt Sorgular (Subquery), EXISTS ve Küme İşlemleri

> Kavram etiketleri: `scalar-subquery`, `subquery-in`, `exists`, `not-exists`, `not-in-null-trap`, `derived-table`, `set-ops`
> Ön koşul: Ü0-Ü8
> Kullanılan tablolar: students, club_memberships, orders, instructors, departments
> Tahmini süre: 60-70 dk
> Ünite sloganı: **"Sorgunun içinde sorgu: bir sorunun cevabını, başka bir sorunun girdisi yap."**

> Ü0.4'te demiştik: bir sorgunun sonucu da bir tablodur. Bu ünite tam olarak bunu kullanıyor; bir
> sorgunun çıktısını başka bir sorgunun içinde kullanacağız.

---

## Ders 9.1 — Skaler alt sorgu: tek değer üreten sorgu

### 🧑‍🏫 Öğretmen için
"Bursu ortalamanın üstünde olanları nasıl buluruz?" diye sor. Öğrenciler "önce ortalamayı bul, sonra
karşılaştır" der. Tahtaya iki adımı yaz: `SELECT AVG(scholarship_amount) FROM students` (tek sayı:
3444), sonra `WHERE scholarship_amount > 3444`. Sonra büyülü kısım: "Bu iki adımı tek sorguda
birleştirebiliriz; ortalamayı hesaplayan sorguyu parantez içinde WHERE'e koyarız." İşte skaler subquery.
- Vurgu: skaler = tek satır, tek değer üreten sorgu; bir sayı yerine geçer.
- Sor: "Ortalama değişirse sorguyu elle güncellememiz gerekir mi?" (Hayır; subquery her çalıştığında
  güncel ortalamayı hesaplar. Sabit 3444 yazmaktan üstün yanı bu.)
- Herkes burada takılır: subquery'i parantez içine almayı unuturlar.

### Neden / nerede işime yarar
"Ortalamanın üstünde", "en yüksek olan", "şu gruptakiler kadar" gibi karşılaştırmalar bir ara değer
gerektirir. Skaler subquery, o ara değeri sorgunun içinde, güncel şekilde hesaplar; sabit sayı
yazmaktan çok daha sağlamdır.

### Konu anlatımı
**Skaler alt sorgu (scalar subquery)**, tek bir değer (tek satır, tek sütun) döndüren bir sorgudur.
Bir sayının yazılabileceği her yere (WHERE'de, SELECT'te) parantez içinde konabilir.

```sql
SELECT first_name, scholarship_amount
FROM students
WHERE scholarship_amount > (SELECT AVG(scholarship_amount) FROM students);
```

İçteki `(SELECT AVG(...) FROM students)` tek bir sayı üretir (ortalama burs). Dıştaki sorgu bu sayıyı
bir eşik gibi kullanır. Ortalamayı elle yazmak yerine sorguya hesaplattığımız için, veri değişse bile
sorgu hep doğru kalır.

> Mini slogan: **Skaler subquery tek bir değer üretir ve bir sayının yerine geçer; sabit yazmak yerine hesaplatırsın.**

### Çözümlü örnekler

**Örnek 1 (WHERE'de skaler subquery)**
- Sorgu (yukarıdaki). Sonuç: Ayşe 5000, Elif 4500, Deniz 3500, Selin 5000, Gizem 4000 (ortalama ~3444'ün
  üstündekiler). Ne anlıyoruz? İçteki sorgu ortalamayı (3444.44) hesapladı, dıştaki sorgu bursu bundan
  büyük öğrencileri getirdi. NULL burslular (Ü2) yine elendi.

**Örnek 2 (SELECT'te skaler subquery)**
- Ne istiyoruz? Her öğrencinin bursu ve genel ortalama yan yana, farkıyla.
- Sorgu:
```sql
SELECT first_name, scholarship_amount,
       (SELECT AVG(scholarship_amount) FROM students) AS genel_ort,
       scholarship_amount - (SELECT AVG(scholarship_amount) FROM students) AS fark
FROM students
WHERE scholarship_amount IS NOT NULL
ORDER BY fark DESC;
```
- Ne anlıyoruz? Skaler subquery her satırda aynı genel ortalamayı verir; farkı hesaplayıp "kim
  ortalamanın ne kadar üstünde/altında" görürüz. Subquery bir değer gibi davrandığı için aritmetiğe sokulabilir.

### Sık hatalar & uyarılar
- Subquery'i parantezsiz yazmak. İç sorgu daima parantez içinde.
- Skaler beklenen yerde birden çok satır döndüren subquery yazmak (örn. `WHERE x = (SELECT city FROM
  students)` -> "birden fazla satır" hatası). Tek değer gerekiyorsa subquery tek satır döndürmeli (9.2'de IN).

### Anlama soruları

**Soru 1 (yaz).** Kredisi, derslerin ortalama kredisinden yüksek olan dersleri getir.
> **İpucu:** WHERE credits > (SELECT AVG(credits) FROM courses).

> **Detaylı cevap:**
> ```sql
> SELECT name, credits FROM courses
> WHERE credits > (SELECT AVG(credits) FROM courses);
> ```
> İçteki `(SELECT AVG(credits) FROM courses)` ortalama krediyi hesaplar (krediler 6,6,5,5,4,4,6,4 ->
> ortalama 40/8 = 5.0). Dıştaki sorgu kredisi 5'ten büyük dersleri getirir: 6 kredilik CS101, CS201,
> MATH101. Ortalamayı sabit yazmak yerine hesaplattığımız için, dersler değişse bile sorgu doğru kalır.
> Bu, skaler subquery'nin klasik kullanımı: "ortalamanın/bir eşiğin üstünde olanlar".

**Soru 2 (kavram).** `WHERE scholarship_amount > (SELECT AVG(scholarship_amount) FROM students)` sorgusunda
ortalama 3444 yerine elle `> 3444` yazmanın dezavantajı nedir?
> **İpucu:** Veri değişirse ne olur?

> **Detaylı cevap:** Elle `> 3444` yazarsan, ortalama bir gün değişince (yeni öğrenci eklenince, burslar
> güncellenince) sorgun yanlış sonuç verir; 3444 artık doğru ortalama olmaz ama sorgu bunu bilmez.
> Skaler subquery ise her çalıştığında ortalamayı **o anki** veriden hesaplar, bu yüzden hep doğru
> kalır. Genel ilke: sorguda bir ara değere ihtiyacın varsa, onu sabit yazmak yerine SQL'e hesaplat;
> hem daha doğru hem de bakımı kolay olur.

### Çıkış bileti
Skaler subquery nedir ve sabit bir sayı yazmaya göre avantajı nedir?

---

## Ders 9.2 — IN ile alt sorgu: çok değerli liste

### 🧑‍🏫 Öğretmen için
Ü2'deki `IN ('Ankara','Bursa')`'yı hatırlat: "Liste elle yazıyorduk. Ya liste bir sorgudan gelirse?"
Tahtaya yaz: `WHERE id IN (SELECT student_id FROM club_memberships)`. "Kulüpteki öğrenci id'lerini bir
sorgu üretiyor, biz de o listede olanları süzüyoruz." İşte subquery ile IN.
- Bunu Ü6'daki JOIN ile karşılaştır: "Kulüpteki öğrencileri JOIN ile de bulabilirdik. İkisi de geçerli;
  IN bazen daha okunur, JOIN bazen daha esnek." (Tartışma açar.)
- Herkes burada takılır: subquery'nin TEK sütun döndürmesi gerektiği (IN bir sütunluk liste bekler).

### Konu anlatımı
Ü2'de `IN` ile elle liste veriyorduk (`IN ('Ankara','Bursa')`). O listeyi bir **alt sorgu** da üretebilir:

```sql
SELECT first_name
FROM students
WHERE id IN (SELECT student_id FROM club_memberships);
```

İçteki sorgu kulüpteki öğrenci id'lerinin listesini üretir; dıştaki sorgu id'si bu listede olan
öğrencileri getirir. Subquery burada **tek sütun**, çok satır döndürür (bir liste). `NOT IN` ile tersini
de alabilirsin ama orada bir NULL tuzağı var (9.4).

> Mini slogan: **IN'in listesini elle yazmak yerine bir alt sorgu üretebilir; subquery tek sütunluk bir liste döndürür.**

### Çözümlü örnekler

**Örnek 1 (kulüpteki öğrenciler)**
- Sorgu (yukarıdaki). Sonuç: kulübe üye 8 öğrenci (Ayşe, Mehmet, Zeynep, Elif, Ali Çelik, Deniz, Burak,
  Selin). Ne anlıyoruz? Subquery üyelik tablosundan id listesi çıkardı; dış sorgu o id'lere sahip
  öğrencileri süzdü. (Aynı sonucu `JOIN ... DISTINCT` ile de alırdık; IN burada okunur bir alternatif.)

**Örnek 2 (belirli bölümlerdeki öğrenciler)**
- Ne istiyoruz? Mühendislik fakültesindeki bölümlerin öğrencileri.
- Sorgu:
```sql
SELECT first_name, department_id
FROM students
WHERE department_id IN (SELECT id FROM departments WHERE faculty = 'Mühendislik');
```
- Ne anlıyoruz? İçteki sorgu Mühendislik bölümlerinin id'lerini (1 ve 2) verdi; dıştaki sorgu bu
  bölümlerdeki öğrencileri getirdi. Liste bir sorgudan geldiği için, fakülte değişse bile doğru çalışır.

### Sık hatalar & uyarılar
- IN subquery'sinin birden çok sütun döndürmesi (`SELECT id, name ...`). IN tek sütunluk liste bekler.
- `NOT IN` ile NULL içerebilen bir sütun kullanmak -> sessiz boş sonuç (9.4). Dikkat.

### Anlama soruları

**Soru 1 (yaz).** Hiç kulübe üye olmayan öğrencileri `NOT IN` ile bulmaya çalış. (Sonra 9.4'te bunun
neden riskli olabileceğini göreceğiz; burada student_id NULL içermediği için çalışır.)
> **İpucu:** WHERE id NOT IN (SELECT student_id FROM club_memberships).

> **Detaylı cevap:**
> ```sql
> SELECT first_name
> FROM students
> WHERE id NOT IN (SELECT student_id FROM club_memberships);
> ```
> İçteki sorgu kulüpteki öğrenci id'lerini verir; `NOT IN` bu listede OLMAYAN öğrencileri getirir:
> Can, Ali Vural, Merve, Emre, Gizem, Okan (6 kişi). Burada güvenle çalışır, çünkü `club_memberships.
> student_id` sütunu NULL içermez (köprü tablonun anahtarı). Ama dikkat: eğer o sütun NULL içerseydi,
> `NOT IN` beklenmedik şekilde HİÇ satır döndürmeyebilirdi; bu tuzağı bir sonraki derste (9.4) ve
> güvenli alternatifini (NOT EXISTS) göreceğiz. Şimdilik: NOT IN çalıştı ama "NULL'a dikkat" notunu aklında tut.

**Soru 2 (kavram).** `WHERE id IN (SELECT student_id FROM club_memberships)` ile aynı sonucu veren bir
JOIN nasıl olurdu, ve hangisini ne zaman tercih ederiz?
> **İpucu:** JOIN + DISTINCT düşün.

> **Detaylı cevap:** JOIN versiyonu:
> ```sql
> SELECT DISTINCT s.first_name
> FROM students s JOIN club_memberships cm ON cm.student_id = s.id;
> ```
> İkisi de "kulüpteki öğrenciler"i verir. Farklar: IN versiyonu okuması kolaydır ve sadece "bu listede
> var mı?" sorusunu sorar (çoğalma olmaz, DISTINCT'e gerek kalmaz). JOIN versiyonu ise kulüp tablosundan
> da sütun göstermek istersek (örneğin kulüp adı) gerekir, ama satır çoğalmasına dikkat etmek ve
> `DISTINCT` koymak gerekebilir (Ü7.4). Kural: sadece "şu kümede var mı/yok mu" diye süzüyorsan IN/EXISTS
> genelde daha temiz; ilişkili tablodan veri de göstereceksen JOIN gerekir.

### Çıkış bileti
`IN` ile kullanılan bir alt sorgu kaç sütun döndürmelidir, neden?

---

## Ders 9.3 — EXISTS ve NOT EXISTS: "böyle bir satır var mı?"

### 🧑‍🏫 Öğretmen için
"EXISTS'i 'liste üret' diye değil, 'böyle bir satır VAR MI?' diye düşünün" de. Tahtaya yaz: "her öğrenci
için sor: bu öğrencinin bir siparişi var mı? Varsa al." İçteki sorgunun dıştaki satıra bağlı olduğunu
(correlated) göster: `WHERE o.student_id = s.id`. "İçteki sorgu, dıştaki her öğrenci için ayrı çalışır,
o öğrencinin siparişi var mı diye bakar."
- Sor: "EXISTS ne döndürür, satır mı, doğru/yanlış mı?" (Doğru/yanlış: var mı yok mu.)
- NOT EXISTS = "hiç böyle satır yok". "Siparişi olmayanlar" için ideal ve NULL'dan güvenli (9.4'e köprü).
- Herkes burada takılır: SELECT'in içine ne yazacaklarını (SELECT 1 yeter, çünkü değer değil varlık önemli).

### Konu anlatımı
`EXISTS (alt sorgu)`, alt sorgu **en az bir satır döndürüyorsa** doğru, döndürmüyorsa yanlış olur. Yani
"böyle bir satır var mı?" sorusudur; değer değil, varlık önemlidir.

Genelde **correlated** (ilişkili) kullanılır: içteki sorgu, dıştaki satıra atıfta bulunur.

```sql
SELECT first_name
FROM students s
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.student_id = s.id);
```

İçteki sorgu her öğrenci (`s`) için ayrı çalışır: "bu öğrencinin siparişi var mı?" Varsa öğrenci gelir.
`SELECT 1` yazarız çünkü ne döndürdüğü önemli değil, sadece satır olup olmadığı önemli.

`NOT EXISTS` tersidir: "hiç böyle satır yok". "Hiç siparişi olmayan öğrenciler" için idealdir ve `NOT
IN`'in NULL tuzağına düşmez (9.4).

> Mini slogan: **EXISTS "böyle bir satır var mı?" diye sorar; NOT EXISTS "hiç yok mu?" der ve NULL'dan güvenlidir.**

### Çözümlü örnekler

**Örnek 1 (siparişi olan öğrenciler)**
- Sorgu (yukarıdaki). Sonuç: sipariş veren 7 öğrenci (Ayşe, Zeynep, Elif, Ali Çelik, Deniz, Burak,
  Selin). Ne anlıyoruz? Her öğrenci için "siparişi var mı?" sorduk; olanlar geldi. EXISTS bir liste
  üretmedi, her öğrenci için doğru/yanlış üretti.

**Örnek 2 (hiç siparişi olmayanlar, NOT EXISTS)**
- Sorgu:
```sql
SELECT first_name
FROM students s
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.student_id = s.id)
ORDER BY first_name;
```
- Sonuç: Can, Mehmet, Ali Vural, Merve, Emre, Gizem, Okan (7 öğrenci). Ne anlıyoruz? Her öğrenci için
  "hiç siparişi yok mu?" sorduk; olmayanlar geldi. Bu, "hiç X'i olmayan Y" sorusunun anti-join (Ü6.5)
  yanında ikinci güvenli yolu.

### Sık hatalar & uyarılar
- EXISTS subquery'sinde correlation'ı (`WHERE o.student_id = s.id`) unutmak. O olmadan içteki sorgu
  tüm öğrenciler için aynı sonucu verir, mantık bozulur.
- EXISTS'i "değer döndürür" sanmak. EXISTS sadece var/yok (doğru/yanlış) söyler.

### Anlama soruları

**Soru 1 (yaz).** Hiç dersi olmayan (enrollments'ta hiç kaydı bulunmayan) öğrencileri NOT EXISTS ile bul.
> **İpucu:** WHERE NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id = s.id).

> **Detaylı cevap:**
> ```sql
> SELECT s.first_name
> FROM students s
> WHERE NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id = s.id);
> ```
> Her öğrenci için "bu öğrencinin hiç ders kaydı yok mu?" diye sorduk. İçteki sorgu dıştaki `s.id`'ye
> bağlı (correlated); bir öğrencinin enrollments'ta hiç satırı yoksa NOT EXISTS doğru olur ve o öğrenci
> gelir. Sonuç, hiç derse kayıt olmamış öğrencilerdir. Bu desen ("hiç ... olmayanlar") hem NOT EXISTS
> hem de LEFT JOIN + IS NULL (Ü6.5) ile çözülür; NOT EXISTS özellikle alt sorgu NULL üretebiliyorsa
> daha güvenlidir (9.4).

**Soru 2 (kavram).** EXISTS subquery'sinde neden genelde `SELECT 1` yazarız, `SELECT *` veya bir sütun değil?
> **İpucu:** EXISTS neye bakıyor, değere mi varlığa mı?

> **Detaylı cevap:** Çünkü EXISTS yalnızca alt sorgunun **satır döndürüp döndürmediğine** bakar, ne
> döndürdüğüne değil. `SELECT 1`, `SELECT *`, `SELECT student_id` hepsi aynı sonucu verir: önemli olan
> en az bir satır var mı. `SELECT 1` yazmak niyeti netleştirir ("değerle ilgilenmiyorum, sadece varlıkla")
> ve gereksiz sütun seçmekten kaçınır. Bu bir alışkanlık/okunurluk meselesidir; EXISTS'in mantığı her
> durumda aynıdır: bir satır bulursa "doğru" der ve durur.

### Çıkış bileti
EXISTS bir değer mi yoksa "var/yok" bilgisi mi döndürür?

---

## Ders 9.4 — NOT IN + NULL tuzağı (NULL'ın altıncı sınavı)

### 🧑‍🏫 Öğretmen için
NULL spiralinin son büyük halkası, ve en sinsisi. Tahtaya küçük bir örnek yaz: `x NOT IN (2, NULL)`.
Sor: "1 bu listede yok, gelmeli değil mi?" Çalıştır, HİÇBİR satır gelmesin, şaşırsınlar. Açıkla: liste
bir NULL içerince, "x bunların hiçbirine eşit değil mi?" sorusu NULL (bilinmiyor) yüzünden asla kesin
"doğru" olamaz. Sonra kurtarıcıyı göster: NOT EXISTS (9.3) bu tuzağa düşmez.
- Anahtar cümle: **"Alt sorgu NULL içerebiliyorsa NOT IN tehlikelidir; NOT EXISTS kullan."**
- Bu, Ü2'deki "NULL ile karşılaştırma = bilinmiyor" fikrinin en uç sonucu.

### Konu anlatımı
`NOT IN` çok kullanışlı ama bir tuzağı var: **liste (alt sorgu) bir NULL içeriyorsa, NOT IN beklenmedik
şekilde HİÇBİR satır döndürmeyebilir.** Sebep Ü2'den tanıdık: `x NOT IN (a, b, NULL)` aslında
"x <> a AND x <> b AND x <> NULL" demektir; `x <> NULL` her zaman "bilinmiyor"dur, ve bir "bilinmiyor"
tüm AND zincirini "bilinmiyor"a çeker, "doğru" olamaz. Sonuç: satır gelmez.

Güvenli alternatif: **`NOT EXISTS`** (9.3). O, NULL'dan etkilenmez, "böyle bir satır var mı" diye bakar.

> Mini slogan: **Alt sorgu NULL içerebiliyorsa NOT IN sessizce boş döndürebilir; bunun yerine NOT EXISTS kullan.**

### Çözümlü örnekler

**Örnek 1 (tuzağı küçük örnekte gör)**
- Sorgu:
```sql
SELECT x FROM (VALUES (1), (2), (3)) AS t(x)
WHERE x NOT IN (2, NULL);
```
- Sonuç: **0 satır.** Beklenti {1, 3} idi (2 listede, ama 1 ve 3 değil). Ne anlıyoruz? Listede NULL
  olduğu için `NOT IN` her satır için "bilinmiyor" üretti, hiçbiri "doğru" olamadı, sonuç boş. NULL
  olmasaydı (`NOT IN (2)`), {1, 3} gelirdi.

**Örnek 2 (güvenli yol: NOT EXISTS)**
- Aynı niyeti NOT EXISTS ile kur (gerçek veride, NULL'dan güvenli):
```sql
-- "hiç siparişi olmayan öğrenciler" — NOT IN yerine NOT EXISTS
SELECT first_name
FROM students s
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.student_id = s.id);
```
- Ne anlıyoruz? NOT EXISTS, alt sorguda NULL olsa bile doğru çalışır; "var/yok" sorusu NULL'dan
  etkilenmez. Bu yüzden "hiç ... olmayanlar" gibi negatif sorularda NOT EXISTS (ya da LEFT JOIN + IS
  NULL) tercih edilir, NOT IN değil.

### Sık hatalar & uyarılar
- NULL içerebilen bir alt sorguda `NOT IN` kullanıp "neden boş geldi?" diye şaşırmak. Cevap: NULL tuzağı.
- `NOT IN` yerine alışkanlık olarak `NOT EXISTS` kullanmamak. Negatif sorularda NOT EXISTS daha güvenli.

### Anlama soruları

**Soru 1 (hata avı).** Bir öğrenci "hiçbir derse atanmamış öğretim üyelerini" `NOT IN` ile aradı ama hiç
sonuç alamadı (oysa beklenti boş olmayabilirdi). `courses.instructor_id` bir NULL içeriyor (MATH101).
Sorun nedir, nasıl güvene alınır?
```sql
SELECT first_name FROM instructors
WHERE id NOT IN (SELECT instructor_id FROM courses);
```
> **İpucu:** Alt sorgu NULL içeriyor; NOT IN buna nasıl tepki verir?

> **Detaylı cevap:** Sorun: alt sorgu (`SELECT instructor_id FROM courses`) bir NULL içeriyor (MATH101'in
> öğretim üyesi atanmamış). `NOT IN` bir NULL gördüğünde, "id bu değerlerin hiçbirine eşit değil mi?"
> sorusu NULL yüzünden asla kesin "doğru" olamaz; sonuç her öğretim üyesi için "bilinmiyor" olur ve
> sorgu HİÇBİR satır döndürmez, alt sorguda gerçekten atanmamış biri olsa bile. Güvenli hali NOT EXISTS:
> ```sql
> SELECT i.first_name FROM instructors i
> WHERE NOT EXISTS (SELECT 1 FROM courses c WHERE c.instructor_id = i.id);
> ```
> NOT EXISTS, NULL'dan etkilenmez ve doğru cevabı verir (bizim veride tüm öğretim üyeleri bir derse
> atanmış olduğu için sonuç yine boş olur, ama bu sefer doğru sebeple boş, NULL tuzağı yüzünden değil).
> Kural: alt sorgu NULL içerebiliyorsa NOT IN yerine NOT EXISTS.

**Soru 2 (kavram).** `x NOT IN (2, NULL)` neden hiçbir satır döndürmez, ama `x IN (2, NULL)` neden
çalışır (2'yi bulur)?
> **İpucu:** NOT IN bir AND zinciri, IN bir OR zinciri gibi düşünülebilir.

> **Detaylı cevap:** `x IN (2, NULL)` aslında "x = 2 OR x = NULL" gibidir. `x = NULL` "bilinmiyor"
> olsa da, `x = 2` doğru olabilir; bir OR zincirinde tek bir "doğru" yeterlidir, o yüzden x=2 olanlar
> gelir (NULL sadece "bilinmiyor" katkısı verir, zararı olmaz). Ama `x NOT IN (2, NULL)` "x <> 2 AND
> x <> NULL" gibidir; `x <> NULL` her zaman "bilinmiyor"dur ve bir AND zincirinde tek bir "bilinmiyor"
> tüm sonucu "bilinmiyor"a çeker (kesin "doğru" olamaz). Bu yüzden hiçbir satır geçemez. Özet: NULL,
> OR zincirinde (IN) zararsız ama AND zincirinde (NOT IN) her şeyi bozar. Bu yüzden NOT IN + NULL =
> tehlike, NOT EXISTS = güvenli.

### Çıkış bileti
Alt sorgu NULL içerebiliyorsa neden `NOT IN` yerine `NOT EXISTS` tercih edilir?

---

## Ders 9.5 — FROM içinde alt sorgu (derived table) ve küme işlemleri

### 🧑‍🏫 Öğretmen için
İki şeyi birden tanıt. Birincisi: bir sorgunun sonucunu, başka bir sorgunun FROM'unda "geçici tablo"
gibi kullanmak (derived table). "Bölüm başına öğrenci sayısının ortalaması" gibi iki-aşamalı sorularda
şart. İkincisi: küme işlemleri (UNION/INTERSECT/EXCEPT) ile iki sorgunun sonucunu birleştirmek/kesiştirmek/
farkını almak. Tahtaya iki daire (Venn) çiz: kulüptekiler ve sipariş verenler; kesişim, birleşim, fark.
- Derived table için: "Ü0.4'te 'sorgunun sonucu da tablodur' demiştik, işte onu FROM'da kullanıyoruz."
- Küme işlemleri için: iki sorgunun sütun sayısı/tipi aynı olmalı; UNION tekrarları atar, UNION ALL atmaz.
- Bu ders Ü10'a (CTE) köprü: "derived table okunması zorlaşınca, ona isim veririz -> CTE."

### Konu anlatımı
**Derived table (FROM'da alt sorgu):** Bir sorgunun sonucunu, dış sorgunun FROM'unda bir tabloymuş gibi
kullanırsın. İki aşamalı hesaplarda gerekir: önce bir özet üret, sonra o özetin üstünde çalış.

```sql
SELECT AVG(cnt) AS ortalama_ogrenci
FROM (SELECT department_id, COUNT(*) AS cnt FROM students GROUP BY department_id) AS t;
```

İçteki sorgu "bölüm başına sayı"yı üretir (5,3,3,2,1); dıştaki sorgu bu sonucun ortalamasını alır (2.8).
Derived table'a bir takma ad (`t`) vermek zorunludur.

**Küme işlemleri:** İki sorgunun sonucunu satır kümesi olarak birleştirir. Sütun sayısı ve tipleri aynı olmalı.
- `UNION`: birleşim (tekrarları atar). `UNION ALL`: birleşim (tekrarları korur).
- `INTERSECT`: kesişim (ikisinde de olanlar).
- `EXCEPT`: fark (ilkinde olup ikincide olmayanlar).

> Mini slogan: **FROM'daki alt sorgu = geçici bir tablo; küme işlemleri iki sorgunun satırlarını birleştirir/kesiştirir/çıkarır.**

### Çözümlü örnekler

**Örnek 1 (derived table)**
- Sorgu (yukarıdaki). Sonuç: 2.8. Ne anlıyoruz? Tek bir sorguda bunu yapamazdık (önce grup sayıları,
  sonra onların ortalaması). İçteki sorgu bir "ara tablo" üretti, dıştaki onun üstünde çalıştı. Bu
  okunması zorlaşınca CTE ile isimlendireceğiz (Ü10).

**Örnek 2 (INTERSECT ve EXCEPT)**
- Ne istiyoruz? Hem kulüpte hem sipariş veren öğrenci id'leri; bir de kulüpte olup sipariş vermeyenler.
- Sorgu:
```sql
-- hem kulüpte hem sipariş veren
SELECT student_id FROM club_memberships
INTERSECT
SELECT student_id FROM orders;

-- kulüpte olup sipariş vermeyen
SELECT student_id FROM club_memberships
EXCEPT
SELECT student_id FROM orders;
```
- Ne anlıyoruz? INTERSECT iki kümenin ortak öğrenci id'lerini verir (kulüpte de sipariş listesinde de
  olanlar). EXCEPT ise kulüpte olup sipariş listesinde olmayanları verir (sonuç: sadece 2 = Mehmet).
  Küme işlemleri "iki listeyi karşılaştır" sorularını çok temiz çözer. (Not: INTERSECT/EXCEPT tekrarları
  da atar, küme mantığıyla çalışır.)

### Sık hatalar & uyarılar
- Derived table'a takma ad vermemek -> hata. FROM'daki alt sorgu mutlaka adlandırılır (`AS t`).
- Küme işlemlerinde iki sorgunun sütun sayısı/sırası/tipi uyuşmaması -> hata. İki taraf aynı şekil olmalı.
- `UNION` ile `UNION ALL` farkını unutmak: UNION tekrarları atar (ve bu maliyetlidir), UNION ALL atmaz.

### Anlama soruları

**Soru 1 (yaz).** Kulüpte olan VEYA sipariş veren öğrencilerin id'lerini (tekrarsız) getir.
> **İpucu:** İki SELECT'i UNION ile birleştir.

> **Detaylı cevap:**
> ```sql
> SELECT student_id FROM club_memberships
> UNION
> SELECT student_id FROM orders;
> ```
> İki sorgu da öğrenci id'leri (tek sütun) üretiyor; `UNION` ikisini birleştirip tekrarları atıyor.
> Sonuç: kulüpte ya da sipariş listesinde geçen tüm farklı öğrenci id'leri (bizim veride 8 farklı id;
> sipariş verenlerin hepsi zaten kulüp kümesinde olduğu için birleşim kulüp kümesine eşit çıkar). Eğer
> `UNION ALL` deseydik, bir öğrenci hem kulüpte hem siparişte ise iki kez (hatta daha çok) görünürdü;
> `UNION` tekilleştirir. "VEYA/birleşim" mantığı için UNION; tekrar istemiyorsak düz UNION.

**Soru 2 (kavram).** Bir derived table'a (FROM içindeki alt sorguya) neden takma ad vermek zorunludur?
> **İpucu:** Dış sorgu o "geçici tabloya" nasıl atıfta bulunacak?

> **Detaylı cevap:** Çünkü dış sorgu, o alt sorgunun ürettiği geçici tabloya bir isimle atıfta bulunmak
> zorundadır; SQL, FROM'daki her kaynağın bir adı olmasını bekler. `... FROM (SELECT ...) AS t` yazıp
> `t` adını verince, dış sorgu o sonucu `t` tablosu gibi kullanır (örneğin `t.cnt`). Ad vermezsen SQL
> "bu alt sorgunun adı ne?" diye hata verir. Bu zorunluluk, derived table'ları okurken bir noktadan
> sonra karmaşıklaşır (iç içe parantezler); işte tam burada, bir sonraki ünitede, bu geçici tablolara
> baştan anlamlı isimler veren CTE (WITH) devreye girecek.

### Çıkış bileti
`UNION` ile `INTERSECT` arasındaki fark nedir?

---

## Pratik (editörde dene)

> Deneme Tahtasında (⌘K) dene. Önce tahmin et, çalıştır, gözle, sonra cevaba bak. Seed: Kampüs.

**P1 (kolay).** [▶ Editörde dene] Bursu, genel ortalamanın altında olan öğrencileri getir.
> İpucu: WHERE scholarship_amount < (SELECT AVG(scholarship_amount) FROM students).
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT first_name, scholarship_amount FROM students
> WHERE scholarship_amount < (SELECT AVG(scholarship_amount) FROM students)
> ORDER BY scholarship_amount;
> ```
> Ortalama ~3444; altındakiler: Burak 1500, Ali Çelik 2000, Merve 2500, Zeynep 3000. NULL burslular gelmez.
> </details>

**P2 (orta).** [▶ Editörde dene] İşletme bölümündeki (departments.name = 'İşletme') öğrencileri, bölüm
id'sini subquery ile bularak getir.
> İpucu: WHERE department_id = (SELECT id FROM departments WHERE name = 'İşletme').
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT first_name FROM students
> WHERE department_id = (SELECT id FROM departments WHERE name = 'İşletme');
> ```
> İçteki sorgu İşletme'nin id'sini (3) verir (tek değer, skaler), dıştaki o bölümün öğrencilerini getirir:
> Zeynep, Deniz, Merve.
> </details>

**P3 (orta).** [▶ Editörde dene] En az bir kulübe üye olan öğrencileri EXISTS ile getir.
> İpucu: WHERE EXISTS (SELECT 1 FROM club_memberships cm WHERE cm.student_id = s.id).
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT s.first_name FROM students s
> WHERE EXISTS (SELECT 1 FROM club_memberships cm WHERE cm.student_id = s.id);
> ```
> 8 öğrenci. EXISTS her öğrenci için "kulüp üyeliği var mı?" sorar.
> </details>

**P4 (zorlayıcı, NULL tuzağı).** [▶ Editörde dene] Şu küçük sorguyu çalıştır: `SELECT x FROM (VALUES
(1),(2),(3)) AS t(x) WHERE x NOT IN (2, NULL);` Kaç satır geldi? Sonra NULL'ı çıkar (`NOT IN (2)`),
tekrar çalıştır. Farkı açıkla.
> İpucu: NULL bir AND zincirini bozar.
> <details><summary>Cevap</summary>
>
> `NOT IN (2, NULL)` -> 0 satır (NULL tuzağı). `NOT IN (2)` -> {1, 3}. Liste NULL içerince NOT IN her
> satır için "bilinmiyor" üretir, hiçbiri geçemez. NULL'sız liste beklendiği gibi çalışır. Negatif
> sorularda NOT EXISTS daha güvenli.
> </details>

**P5 (düşündürücü, küme).** [▶ Editörde dene] Kulüpte olup hiç sipariş vermemiş öğrenci id'lerini EXCEPT
ile bul.
> İpucu: (SELECT student_id FROM club_memberships) EXCEPT (SELECT student_id FROM orders).
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT student_id FROM club_memberships
> EXCEPT
> SELECT student_id FROM orders;
> ```
> Sonuç: 2 (Mehmet). Kulüp üyesi olan ama sipariş listesinde olmayan tek öğrenci. EXCEPT = "ilkinde
> olup ikincide olmayanlar".
> </details>

---

## Ünite 9 özeti (öğrenciye)
- **Skaler subquery** tek bir değer üretir (ortalama gibi) ve bir sayının yerine geçer; sabit yazmaktan üstün.
- **IN ile subquery**: listeyi bir sorgu üretir; subquery tek sütunluk olmalı.
- **EXISTS / NOT EXISTS**: "böyle bir satır var mı / hiç yok mu". Correlated (dıştaki satıra bağlı) kullanılır.
- **NOT IN + NULL tuzağı**: alt sorgu NULL içerebiliyorsa NOT IN sessizce boş döndürebilir; **NOT EXISTS** güvenli.
- **Derived table**: FROM'daki alt sorgu, geçici bir tablo (takma ad zorunlu); iki aşamalı hesaplar için.
- **Küme işlemleri**: `UNION` (birleşim, tekrarsız), `UNION ALL` (tekrarlı), `INTERSECT` (kesişim),
  `EXCEPT` (fark). İki sorgunun şekli (sütun sayısı/tipi) aynı olmalı.

## 🧑‍🏫 Öğretmen notu (ünite geneli)
NULL spiralinin altıncı ve son büyük halkası burada (NOT IN tuzağı); `x NOT IN (2, NULL)`'ı canlı
göster, çünkü gerçek hayatta sessizce yanlış sonuç veren en tehlikeli desenlerden biri. EXISTS'i "liste"
değil "var mı" diye çerçevele; correlated mantığı (içteki sorgu her dış satır için çalışır) bir kez
oturursa window functions (Ü13) de kolaylaşır. Derived table'ı kasıtlı biraz "hantal" bırak, çünkü bir
sonraki ünite (CTE) onu okunur hale getirip "neden CTE?" sorusunu doğal cevaplayacak.
