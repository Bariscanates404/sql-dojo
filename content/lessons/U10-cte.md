# Ünite 10 — CTE (WITH): Sorguyu Okunur Adımlara Bölmek

> Kavram etiketleri: `cte-basic`, `with-clause`, `chained-cte`, `cte-readability`, `cte-double-count-fix`
> Ön koşul: Ü0-Ü9 (özellikle Ü8 çift sayma, Ü9.5 derived table)
> Kullanılan tablolar: students, departments, club_memberships, orders, order_items
> Tahmini süre: 45-55 dk
> Ünite sloganı: **"CTE = sorgu içinde isimlendirilmiş ara sonuç; karmaşığı adımlara böler."**

> Ü9.5'te FROM içine alt sorgu (derived table) koymuştuk; okunması zorlaşıyordu. CTE, o ara sonuçlara
> baştan anlamlı bir isim verip sorguyu yukarıdan aşağıya, adım adım okunur yapar.

---

## Ders 10.1 — WITH temel: ara sonuca isim vermek

### 🧑‍🏫 Öğretmen için
Ü9.5'teki derived table'ı (bölüm sayılarının ortalaması) tahtaya yaz, iç içe parantezleri göster, sor:
"Bunu altı ay sonra açsanız ilk ne anlarsınız?" (Karışık.) Sonra aynı sorguyu CTE ile yaz: önce
`WITH dept_counts AS (...)`, sonra `SELECT AVG(cnt) FROM dept_counts`. "Gördünüz mü? Önce 'bölüm
sayıları' diye bir ara tablo tanımladık, ona isim verdik, sonra onu kullandık. Yukarıdan aşağıya okunuyor."
- Anahtar cümle: **"CTE bir hesabı saklamaz; sadece bu sorgu boyunca yaşayan, isimli bir ara sonuçtur."**
- Sor: "dept_counts gerçek bir tablo mu?" (Hayır, sadece bu sorgu çalışırken var.)
- Herkes burada takılır: WITH'i sorgunun en başına yazmayı, ve ana SELECT'i WITH'ten sonra koymayı unuturlar.

### Neden / nerede işime yarar
Gerçek analiz sorguları çok adımlıdır: önce bir özet çıkar, sonra onu filtrele, sonra başka bir şeyle
birleştir. Bunları tek bir dev iç içe sorguya tıkmak okunmaz olur. CTE, her adımı isimlendirip sorguyu
bir hikaye gibi okunur kılar. Bu, hem yazarken hem de aylar sonra okurken hayat kurtarır.

### Konu anlatımı
**CTE (Common Table Expression)**, `WITH` ile tanımlanan, sorgunun başında durup ona bir isim verdiğimiz
geçici bir ara sonuçtur. Sadece o sorgu çalışırken yaşar (bir tablo oluşturmaz).

```sql
WITH dept_counts AS (
  SELECT department_id, COUNT(*) AS cnt
  FROM students
  GROUP BY department_id
)
SELECT AVG(cnt) AS ortalama_ogrenci
FROM dept_counts;
```

Yapı: `WITH ad AS (sorgu)` ile bir ara sonuç tanımlarsın, sonra ana sorguda onu bir tabloymuş gibi
kullanırsın (`FROM dept_counts`). Ü9.5'teki derived table ile aynı işi yapar, ama çok daha okunur:
önce "bölüm sayıları"nı tanımladık, sonra ortalamasını aldık.

> Mini slogan: **WITH ile ara sonuca isim ver, sonra onu tabloymuş gibi kullan; sorgu yukarıdan aşağıya okunur olur.**

### Çözümlü örnekler

**Örnek 1 (derived table -> CTE)**
- Sorgu (yukarıdaki). Sonuç: 2.8. Ne anlıyoruz? Ü9.5'teki iç içe parantezli sorguyla aynı sonuç (bölüm
  başına ortalama öğrenci), ama burada `dept_counts` adını verdiğimiz için niyet açık: önce bölüm
  sayıları, sonra ortalaması.

**Örnek 2 (CTE'yi filtrelemek)**
- Ne istiyoruz? En az 3 öğrencisi olan bölümler.
- Sorgu:
```sql
WITH dept_counts AS (
  SELECT department_id, COUNT(*) AS cnt FROM students GROUP BY department_id
)
SELECT department_id, cnt
FROM dept_counts
WHERE cnt >= 3
ORDER BY cnt DESC;
```
- Sonuç: bölüm 1 (5), bölüm 2 (3), bölüm 3 (3). Ne anlıyoruz? CTE'yi tanımladık, sonra ana sorguda
  onu normal bir tablo gibi filtreledik. (Bunu HAVING ile de yapabilirdik; CTE yolu, ara sonucu
  yeniden kullanmak ya da daha okunur kılmak istediğimizde parlar.)

### Sık hatalar & uyarılar
- `WITH`'ten sonra ana sorguyu (SELECT) yazmayı unutmak. WITH tek başına bir sorgu değil; bir ana sorgu ister.
- CTE'yi "kalıcı tablo" sanmak. Sadece o sorgu boyunca yaşar; bittiğinde yok olur.

### Anlama soruları

**Soru 1 (yaz).** Her şehirdeki öğrenci sayısını bir CTE'de hesapla, sonra sadece 2'den fazla öğrencisi
olan şehirleri getir.
> **İpucu:** WITH sehir_sayilari AS (... GROUP BY city), sonra WHERE.

> **Detaylı cevap:**
> ```sql
> WITH sehir_sayilari AS (
>   SELECT city, COUNT(*) AS cnt FROM students GROUP BY city
> )
> SELECT city, cnt FROM sehir_sayilari WHERE cnt > 2 ORDER BY cnt DESC;
> ```
> Önce `sehir_sayilari` adında bir ara sonuç tanımladık (her şehir ve öğrenci sayısı), sonra ana
> sorguda onu filtreledik. Sonuç: İstanbul (4), ve 3'er kişiyle Ankara ve NULL şehir grubu (cnt > 2).
> Bunu tek sorguda `GROUP BY ... HAVING cnt > 2` ile de yapabilirdik; CTE versiyonu özellikle ara
> sonucu birden çok yerde kullanacaksak veya adım adım okunur olsun istiyorsak tercih edilir.

**Soru 2 (kavram).** CTE ile FROM içindeki derived table (Ü9.5) arasındaki temel fark nedir?
> **İpucu:** İkisi de ara sonuç üretir; fark okunabilirlik ve kullanımda.

> **Detaylı cevap:** İkisi de aynı işi yapar: bir ara sonuç (geçici tablo) üretip onun üstünde çalışmak.
> Fark pratikte okunabilirlik ve yeniden kullanımdır. Derived table, sorgunun FROM'una gömülü iç içe
> bir parantezdir; karmaşık sorgularda iç içe geçer ve okunması zorlaşır. CTE ise bu ara sonuca sorgunun
> EN BAŞINDA anlamlı bir isim verir (`WITH dept_counts AS ...`), sorguyu yukarıdan aşağıya bir hikaye
> gibi okunur kılar, ve aynı CTE'ye birden çok yerden atıfta bulunabilirsin (derived table'ı her seferinde
> yeniden yazman gerekir). Sonuç aynı; CTE daha temiz ve bakımı kolaydır. Karmaşık sorgularda CTE tercih edilir.

### Çıkış bileti
CTE bir kalıcı tablo mu yoksa sadece o sorgu boyunca yaşayan bir ara sonuç mu?

---

## Ders 10.2 — Zincirleme CTE: problemi adımlara bölmek

### 🧑‍🏫 Öğretmen için
"Karmaşık bir soruyu tek hamlede çözmeye çalışmak yerine, adımlara böleriz; her adım bir CTE." Tahtaya
bir iş sorusu yaz: "Tamamlanmış siparişlerde öğrenci başına harcama." Sonra adımları say: (1) tamamlanmış
siparişler, (2) her siparişin/öğrencinin kalem toplamı. Her adımı bir CTE yap, sonuncuda birleştir. "Büyük
sorguyu küçük, anlaşılır parçalara böldük; her birini ayrı ayrı kontrol edebiliriz."
- Vurgu: Bir CTE, kendinden önceki CTE'yi kullanabilir (zincir). Sırayla okunur.
- Pratik fayda: her CTE'yi ayrı ayrı `SELECT * FROM cte` ile test edip doğrulayabilirsin (hata ayıklama kolaylaşır).

### Konu anlatımı
Bir `WITH` içinde **birden çok CTE** tanımlayabilirsin, virgülle ayırarak. Sonraki CTE'ler öncekileri
kullanabilir. Böylece karmaşık bir sorgu, sırayla okunan adımlara bölünür:

```sql
WITH
completed AS (
  SELECT id, student_id FROM orders WHERE status = 'completed'
),
student_totals AS (
  SELECT c.student_id, SUM(oi.quantity * oi.unit_price) AS harcama
  FROM completed c
  JOIN order_items oi ON oi.order_id = c.id
  GROUP BY c.student_id
)
SELECT student_id, harcama
FROM student_totals
ORDER BY harcama DESC;
```

Her adım bir isim taşır: önce `completed` (tamamlanmış siparişler), sonra `student_totals` (öğrenci
başına harcama, `completed`'i kullanarak). Ana sorgu en sonda sonucu okur.

> Mini slogan: **Birden çok CTE'yi virgülle zincirle; her adım bir öncekini kullanabilir, sorgu adım adım okunur.**

### Çözümlü örnek
- Sorgu (yukarıdaki). Sonuç: Ayşe 210, Selin 110, Zeynep 95, Elif 80, Deniz 40. Ne anlıyoruz? Aynı
  sonucu Ü8.4'te tek (çok JOIN'li) sorguyla almıştık; burada adımlara böldük: önce tamamlanmışları
  süzdük (`completed`), sonra öğrenci başına topladık (`student_totals`). Her adımı ayrı test edebilir,
  hatayı kolay bulabiliriz. Karmaşık sorgularda bu bölme paha biçilmez.

### Sık hatalar & uyarılar
- CTE'leri ayırırken virgülü unutmak ya da son CTE'den sonra fazladan virgül koymak. CTE'ler arası virgül,
  son CTE'den sonra ana sorgu (virgülsüz) gelir.
- Bir CTE'de, henüz tanımlanmamış (aşağıdaki) bir CTE'yi kullanmaya çalışmak. Sıra önemli: önce tanımla, sonra kullan.

### Anlama soruları

**Soru 1 (yaz).** İki CTE ile: önce her bölümün ortalama bursunu hesapla (`dept_avg`), sonra ortalaması
4000'den yüksek olan bölümleri getir.
> **İpucu:** WITH dept_avg AS (... AVG ... GROUP BY department_id), sonra WHERE.

> **Detaylı cevap:**
> ```sql
> WITH dept_avg AS (
>   SELECT department_id, AVG(scholarship_amount) AS ort
>   FROM students GROUP BY department_id
> )
> SELECT department_id, ort
> FROM dept_avg
> WHERE ort > 4000
> ORDER BY ort DESC;
> ```
> Önce `dept_avg` adında her bölümün ortalama bursunu tutan bir ara sonuç tanımladık, sonra ana sorguda
> 4000'den yüksek olanları süzdük. AVG'nin NULL'ları yok saydığını (Ü4) unutma: bursu NULL olan
> öğrenciler bölüm ortalamasına katılmaz. Bu, tek CTE'lik basit bir bölme; ara sonuca isim vermek, "neyi
> filtrelediğimi" netleştirir. (HAVING ile de olurdu; CTE okunurluk ve yeniden kullanım için.)

**Soru 2 (kavram).** Zincirleme CTE'lerde hata ayıklamak neden tek dev sorgudan daha kolaydır?
> **İpucu:** Her adımı ayrı ayrı ne yapabilirsin?

> **Detaylı cevap:** Çünkü her CTE'yi ayrı ayrı çalıştırıp doğrulayabilirsin. Karmaşık bir sorgu yanlış
> sonuç verdiğinde, tek dev iç içe sorguda hatanın nerede olduğunu bulmak zordur. CTE'lerle ise, ana
> sorguyu geçici olarak `SELECT * FROM completed` ya da `SELECT * FROM student_totals` ile değiştirip
> her adımın çıktısını tek tek görebilirsin: "tamamlanmış siparişler doğru mu? evet. öğrenci toplamları
> doğru mu? işte hata burada." Bu adım adım kontrol, CTE'lerin sadece okunurluk değil, hata ayıklama
> avantajı da sağladığını gösterir. Büyük sorguları küçük, doğrulanabilir parçalara bölmek iyi SQL
> yazımının temelidir.

### Çıkış bileti
Bir `WITH` içinde birden çok CTE'yi nasıl ayırırsın, ve sonraki CTE öncekini kullanabilir mi?

---

## Ders 10.3 — CTE ile çift saymayı temiz çözmek (Ü8 geri dönüş)

### 🧑‍🏫 Öğretmen için
Ü8.3'teki çift sayma felaketini hatırlat: kulüptekilerin bursunu toplayınca 34000 (şişmiş) çıkmıştı,
çünkü Ayşe ve Elif iki kez sayılmıştı. Sor: "Bunu nasıl düzeltiriz?" Cevabı birlikte bul: önce
öğrencileri TEKE indir (DISTINCT bir CTE'de), sonra topla. Tahtaya iki adım yaz: `club_students` (farklı
öğrenciler), sonra onların bursunu topla. 34000 -> 24500, doğru. "Doğru grain'de topladık: önce her
öğrenci bir kez, sonra toplam."
- Anahtar cümle: **"Çift saymayı önlemek için önce doğru seviyede (her varlık bir kez) topla, sonra birleştir."**
- Bu, çift saymanın en temiz çözümü ve CTE'nin neden güçlü olduğunun en iyi kanıtı.

### Konu anlatımı
Ü8.3'te çoğaltan bir JOIN üstünde `SUM` yapınca sonucun şiştiğini görmüştük (Ayşe ve Elif iki kulüpte
oldukları için bursları iki kez toplanmıştı, 34000). CTE bunu temiz çözer: **önce doğru grain'de bir ara
sonuç üret (her öğrenci bir kez), sonra onun üstünde topla.**

```sql
WITH club_students AS (
  SELECT DISTINCT student_id FROM club_memberships
)
SELECT SUM(s.scholarship_amount) AS dogru_toplam
FROM students s
JOIN club_students cs ON cs.student_id = s.id;
```

`club_students` CTE'si her öğrenciyi **bir kez** içerir (DISTINCT). Bu yüzden onunla JOIN yapınca çoğalma
olmaz; toplam doğru çıkar.

> Mini slogan: **Çift saymayı önlemek için: önce bir CTE'de doğru grain'e indir (her varlık bir kez), sonra topla.**

### Çözümlü örnek
- Sorgu (yukarıdaki). Sonuç: `24500`. Ne anlıyoruz? Ü8.3'te şişmiş 34000 almıştık; burada önce
  `club_students` ile öğrencileri teke indirdik, sonra topladık. Artık Ayşe ve Elif bir kez sayıldı,
  toplam doğru (5000+3000+4500+2000+3500+1500+5000 = 24500; Mehmet'in NULL bursu SUM'da yok sayıldı).
  CTE, "önce doğru grain'e indir, sonra hesapla" desenini çok okunur yapar.

### Sık hatalar & uyarılar
- DISTINCT'i unutup yine çoğaltan tabloyla doğrudan toplamak -> yine şişme. Önce teke indir.
- "Doğru grain" sorusunu atlamak. Toplamadan önce "bir satır neyi temsil ediyor, varlık tekrar ediyor mu?" diye sor.

### Anlama soruları

**Soru 1 (kavram).** Ü8'de aynı toplam 34000 çıkmıştı, burada CTE ile 24500 çıktı. CTE tam olarak hangi
sorunu çözdü?
> **İpucu:** Ayşe ve Elif kaç kez sayılıyordu?

> **Detaylı cevap:** CTE, çift saymayı (satır çoğalmasını) çözdü. Ü8'de `students JOIN club_memberships`
> sonucunda Ayşe ve Elif iki kulüpte oldukları için iki satırda görünüyor, bursları iki kez toplanıyordu
> (34000, şişmiş). `club_students AS (SELECT DISTINCT student_id FROM club_memberships)` CTE'si, kulüpteki
> her öğrenciyi yalnızca **bir kez** içerir; bu teke-indirilmiş listeyle JOIN yapınca her öğrencinin
> bursu bir kez toplanır ve doğru sonuç (24500) çıkar. Yani CTE, toplamadan önce veriyi doğru grain'e
> (her öğrenci bir satır) getirdi. Genel ders: çoğaltan bir ilişki üstünde toplama yapacaksan, önce bir
> CTE ile doğru seviyeye indir.

**Soru 2 (yaz).** Tamamlanmış siparişlerde, kaç farklı öğrencinin siparişi olduğunu CTE kullanarak bul.
> **İpucu:** WITH completed_students AS (SELECT DISTINCT student_id FROM orders WHERE status='completed'), sonra COUNT(*).

> **Detaylı cevap:**
> ```sql
> WITH completed_students AS (
>   SELECT DISTINCT student_id FROM orders WHERE status = 'completed'
> )
> SELECT COUNT(*) AS farkli_ogrenci FROM completed_students;
> ```
> Önce `completed_students` CTE'si tamamlanmış siparişi olan farklı öğrenci id'lerini (DISTINCT) toplar;
> sonra ana sorgu onları sayar. Sonuç 5 (tamamlanmış sipariş veren öğrenciler: 1, 3, 5, 8, 10). DISTINCT
> sayesinde Ayşe'nin 3 tamamlanmış siparişi olsa da bir kez sayılır. Bunu `COUNT(DISTINCT student_id)`
> ile tek satırda da yapabilirdik; CTE versiyonu adımı görünür kılar ve `completed_students`'ı başka
> hesaplarda yeniden kullanmak istersek hazır durur.

### Çıkış bileti
Çoğaltan bir ilişki üstünde toplama yapmadan önce CTE ile hangi adımı atarsın?

---

## Pratik (editörde dene)

> Deneme Tahtasında (⌘K) dene. Önce tahmin et, çalıştır, gözle, sonra cevaba bak. Seed: Kampüs.

**P1 (kolay).** [▶ Editörde dene] Bir CTE ile her bölümün öğrenci sayısını hesapla, sonra hepsini sayıya
göre çoktan aza listele.
> İpucu: WITH dc AS (... GROUP BY department_id), SELECT * FROM dc ORDER BY cnt DESC.
> <details><summary>Cevap</summary>
>
> ```sql
> WITH dc AS (SELECT department_id, COUNT(*) AS cnt FROM students GROUP BY department_id)
> SELECT * FROM dc ORDER BY cnt DESC;
> ```
> Bölüm 1 (5), 2 (3), 3 (3), 4 (2), 5 (1). CTE'yi tanımla, ana sorguda kullan.
> </details>

**P2 (orta).** [▶ Editörde dene] İki CTE ile: önce tamamlanmış siparişler, sonra öğrenci başına harcama;
en çok harcayan öğrenciyi en üste koy.
> İpucu: completed AS (... WHERE status='completed'), student_totals AS (... JOIN order_items ... GROUP BY student_id).
> <details><summary>Cevap</summary>
>
> ```sql
> WITH
> completed AS (SELECT id, student_id FROM orders WHERE status = 'completed'),
> student_totals AS (
>   SELECT c.student_id, SUM(oi.quantity * oi.unit_price) AS harcama
>   FROM completed c JOIN order_items oi ON oi.order_id = c.id
>   GROUP BY c.student_id
> )
> SELECT student_id, harcama FROM student_totals ORDER BY harcama DESC;
> ```
> Ayşe(1) 210, Selin(10) 110, Zeynep(3) 95, Elif(5) 80, Deniz(8) 40. Adım adım: önce süz, sonra topla.
> </details>

**P3 (zorlayıcı, çift sayma çözümü).** [▶ Editörde dene] Kulüpteki öğrencilerin TOPLAM bursunu, her
öğrenciyi bir kez sayarak (doğru şekilde) bul. (Ü8'deki şişmiş 34000 değil, doğrusu.)
> İpucu: WITH club_students AS (SELECT DISTINCT student_id ...), sonra JOIN + SUM.
> <details><summary>Cevap</summary>
>
> ```sql
> WITH club_students AS (SELECT DISTINCT student_id FROM club_memberships)
> SELECT SUM(s.scholarship_amount) AS dogru_toplam
> FROM students s JOIN club_students cs ON cs.student_id = s.id;
> ```
> 24500. DISTINCT ile öğrencileri teke indirdik, çoğalma olmadan topladık. Ü8'deki 34000 çift saymaydı.
> </details>

**P4 (düşündürücü).** [▶ Editörde dene] Bir CTE ile her şehrin öğrenci sayısını bul, sonra "şehir başına
ortalama öğrenci sayısı" ile her şehrin sayısını yan yana göster (CTE'yi iki kez kullan: biri liste, biri
ortalama için skaler subquery).
> İpucu: WITH sc AS (...), SELECT city, cnt, (SELECT AVG(cnt) FROM sc) AS ortalama FROM sc.
> <details><summary>Cevap</summary>
>
> ```sql
> WITH sc AS (SELECT city, COUNT(*) AS cnt FROM students GROUP BY city)
> SELECT city, cnt, (SELECT AVG(cnt) FROM sc) AS sehir_ortalamasi
> FROM sc
> ORDER BY cnt DESC;
> ```
> Her şehrin sayısı + tüm şehirlerin ortalama büyüklüğü yan yana. `sc` CTE'sini hem FROM'da hem skaler
> subquery'de kullandık; CTE'nin yeniden kullanılabilirliği bu.
> </details>

---

## Ünite 10 özeti (öğrenciye)
- **CTE (WITH)**, sorgu içinde isimlendirilmiş, sadece o sorgu boyunca yaşayan bir ara sonuçtur; kalıcı
  tablo değildir.
- Derived table (Ü9.5) ile aynı işi yapar ama çok daha okunur ve yeniden kullanılabilir.
- **Birden çok CTE** virgülle zincirlenir; sonraki bir öncekini kullanabilir; her adımı ayrı test edebilirsin.
- **Çift sayma çözümü:** çoğaltan bir ilişki üstünde toplamadan önce, bir CTE'de **doğru grain'e indir**
  (örn. DISTINCT öğrenciler), sonra topla. Böylece Ü8'deki şişme (34000 yerine doğru 24500) önlenir.

## 🧑‍🏫 Öğretmen notu (ünite geneli)
CTE'yi "ileri konu" değil, "okunurluk ve adım adım düşünme aracı" olarak sun. En güçlü an, Ü8'deki çift
sayma felaketini (34000) CTE ile temiz çözüp 24500'e indirmek; bu, hem CTE'nin değerini hem de "doğru
grain'de topla" ilkesini bir arada gösterir. Öğrenci karmaşık soruları CTE'lerle adımlara bölmeyi
öğrenirse, hem yazması hem hata ayıklaması kolaylaşır. Bundan sonra Ü11 (DML) ve Ü12 (DDL) ile veriyi
değiştirme/tablo tasarımı tarafına geçiyoruz; Güvenlik ünitesinde (ÜG) tanıştığımız komutları artık
derinlemesine ve doğru kullanımıyla göreceğiz.
