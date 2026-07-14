# Ünite 0 — Temeller: Veritabanı, Tablo ve İlk Sorgu

> Kavram etiketleri: `table-basics`, `select-all`, `result-set`
> Ön koşul: yok (sıfırdan başlayan öğrenci)
> Kullanılan tablolar: students, departments, products
> Tahmini süre: 25-30 dk
> Ünite sloganı: **"SQL'de bilgisayara ne yapacağını değil, hangi cevabı istediğini söylersin."**

---

## Ders 0.1 — Veritabanı, tablo, satır, sütun

### 🧑‍🏫 Öğretmen için (sınıfta şöyle aç)
"Çocuklar, aslında veritabanını hepiniz biliyorsunuz, sadece adını bilmiyorsunuz. Telefonunuzdaki
rehber bir tablodur: her satır bir kişi, her sütun o kişinin bir bilgisi (ad, numara). İşte
veritabanı, bu tür tabloların düzenli durduğu yerdir." Tahtaya 3 satırlık bir rehber çiz, sonra
"peki ben sadece İstanbul'dakileri istesem?" diye sor. SQL'in tam da bu soruyu sormak için
olduğunu söyle.
- Sorabileceğin soru: "Excel'de bir tablo açtınız mı? SQL ona soru sormanın dili."
- Herkes burada şunu karıştırır: tablodaki satırların "sırası" olduğunu sanırlar. Yok. Buna geleceğiz.

### Neden / nerede işime yarar
Bir uygulamanın arkasında ne varsa (Instagram'daki gönderiler, bankadaki hesabın, okuldaki notların)
neredeyse hepsi bir veritabanında, tablolar halinde durur. SQL, bu tablolardan bilgi çekmenin
evrensel dilidir. Yani SQL öğrenmek, "verinin olduğu her yerle konuşabilmek" demek.

### Konu anlatımı
Üç kelimeyi netleştirelim, çünkü dersin geri kalanı tamamen bunların üstüne kurulu:

- **Tablo (table):** Belirli bir konunun verisini tutan ızgara. Bizim evrenimizde `students`
  (öğrenciler) bir tablo, `departments` (bölümler) başka bir tablo.
- **Sütun (column):** Tablonun dikey başlıkları. Her sütun bir tür bilgiyi tutar ve bir adı vardır:
  `first_name`, `city`, `scholarship_amount`. Bir sütundaki bütün hücreler aynı türdendir (hepsi
  metin, ya da hepsi sayı).
- **Satır (row):** Tablonun yatay kayıtları. Her satır tek bir varlıktır: bir öğrenci, bir bölüm.

`students` tablosunun bir kısmı şöyle görünür:

| id | first_name | last_name | city     | department_id | scholarship_amount |
|----|------------|-----------|----------|---------------|--------------------|
| 1  | Ayşe       | Yılmaz    | İstanbul | 1             | 5000               |
| 2  | Mehmet     | Demir     | NULL     | 1             | NULL               |
| 3  | Zeynep     | Kaya      | Ankara   | 3             | 3000               |

Burada gördüğün `NULL` kelimesi çok önemli ve ileride ayrı ders olacak. Şimdilik tek cümle:
**`NULL`, "bu hücrede değer yok / bilinmiyor" demektir. Sıfır değildir, boş yazı değildir.**
Mehmet'in şehri silinmemiş, "bilmiyoruz" diye işaretlenmiş.

Son ve en önemli fikir, ünitenin sloganı:
> SQL'de bilgisayara adım adım "şunu yap, sonra şunu yap" demezsin. Sadece **hangi cevabı
> istediğini** tarif edersin, gerisini o halleder.

### Sık hatalar & uyarılar
- "Tablo Excel gibi, satırların sabit bir sırası var" sanmak. Hayır. Tabloda doğal sıra yoktur;
  sıralı görmek istiyorsan bunu ileride `ORDER BY` ile sen istersin.
- `id` sütununu "satır numarası" sanmak. `id` sadece bir bilgi sütunudur (kimlik numarası gibi),
  satırın yerini belirtmez.

### Anlama soruları

**Soru 1 (çoktan seçmeli).** Aşağıdakilerden hangisi bir "satır"a en iyi örnektir?
- A) `city` sütunundaki tüm şehirler
- B) Tek bir öğrencinin tüm bilgileri (Ayşe Yılmaz, İstanbul, ...)
- C) Tablonun adı
- D) `NULL` değeri

> **İpucu:** Satır = yatay bir kayıt = tek bir varlık.

> **Detaylı cevap:** Doğru cevap **B**. Bir satır, tablodaki tek bir kaydı temsil eder. `students`
> tablosunda bir satır = bir öğrenci, ve o satırda o öğrencinin bütün sütun değerleri yan yana durur
> (adı, soyadı, şehri, bölümü...). A şıkkı bir "sütun"u tarif ediyor (dikey, tek tür bilgi). C şıkkı
> tablonun kendisiyle ilgili. D ise sadece "değer yok" işareti, tek bir hücrenin içeriği olabilir ama
> bir satır değil. Aklında tut: **sütun dikey ve tek tür, satır yatay ve tek varlık.**

**Soru 2 (kavram).** Mehmet'in `city` değeri `NULL`. Bu ne anlama gelir?
- A) Mehmet'in şehri boş bir metin (`''`)
- B) Mehmet İstanbul'da yaşıyor
- C) Mehmet'in şehri bilinmiyor / girilmemiş
- D) Mehmet'in şehri sıfır

> **İpucu:** NULL bir değer değil, bir "yokluk/bilinmezlik" işaretidir.

> **Detaylı cevap:** Doğru cevap **C**. `NULL`, "bu hücrede bir değer yok, bilinmiyor" demektir.
> Çok kişi bunu sıfır (D) veya boş yazı (A) ile karıştırır, ama üçü de farklıdır: sıfır bir sayıdır,
> boş yazı uzunluğu 0 olan bir metindir, `NULL` ise "hiç değer girilmemiş" anlamına gelir. Neden
> önemli? Çünkü ileride `city = 'İstanbul'` gibi bir filtre yazdığında, `NULL` olan satırlar bu
> karşılaştırmaya "ne evet ne hayır" cevabı verir ve beklediğin gibi davranmaz. Bu yüzden NULL'a
> ayrı bir ders ayıracağız. Şimdilik sadece "değer yok demek" diye aklında kalsın.

### Çıkış bileti
Tek cümleyle: Bir tabloda **sütun** ile **satır** arasındaki fark nedir?

---

## Ders 0.2 — İlk sorgu: SELECT

### 🧑‍🏫 Öğretmen için
"Şimdi tabloya ilk soruyu soracağız. SQL'de soru sormanın kelimesi `SELECT`, yani 'seç/getir'.
En basit hali: 'şu tablodaki her şeyi göster'." Canlı editörde birlikte yaz, çalıştır, sonucu göster.
İlk kez bir şey "çalıştığında" sınıfta küçük bir heyecan olur, bunu kullan.
- Sorabileceğin soru: "Sizce `SELECT * FROM students` kaç satır getirir?" (Cevap: tablodaki kadar, 14.)

### Neden / nerede işime yarar
`SELECT`, SQL'in en çok kullanılan komutudur. Veriyle yapacağın işlerin belki %80'i "bana şu
veriyi getir" demektir, ve bunu hep `SELECT` ile yaparsın.

### Konu anlatımı
Bir sorgunun en temel iki parçası var:
- **`SELECT`**: hangi sütunları istiyorum?
- **`FROM`**: hangi tablodan?

En basit sorgu, "şu tablodaki bütün sütunları, bütün satırları getir" demektir. "Bütün sütunlar"
için yıldız (`*`) kullanırız:

```sql
SELECT * FROM students;
```

Bunu okuması çok kolay: "students tablosundan (`FROM students`) her şeyi seç (`SELECT *`)". Sonuç,
tablodaki 14 öğrencinin tamamı, bütün sütunlarıyla.

Noktalı virgül (`;`) bir sorgunun bittiğini söyler. Tek sorgu yazarken çoğu zaman olmadan da
çalışır, ama alışkanlık olarak koymak iyidir.

Satırları belli bir sırada görmek istiyorsan sorgunun sonuna `ORDER BY sütun ASC` eklersin; `ASC`
küçükten büyüğe demektir. Örneğin `SELECT name FROM products ORDER BY id ASC;` ürün adlarını id'ye
göre sıralı gösterir; detayını Ü1'de işleyeceğiz.

> Mini slogan: **`SELECT` ne istediğini, `FROM` nereden istediğini söyler.**

### Çözümlü örnekler

**Örnek 1**
- Ne istiyoruz? Bütün bölümlerin listesini, tüm bilgileriyle.
- Hangi tablolar? `departments`.
- Sorgu:
```sql
SELECT * FROM departments;
```
- Sonuçtan ne anlıyoruz? 5 satır gelir, çünkü 5 bölüm var. Her satırda `id`, `name`, `faculty`
  sütunları dolu. Yani `SELECT *`, o tablonun bütün sütunlarını olduğu gibi döker.

| id | name                     | faculty                    |
|----|--------------------------|----------------------------|
| 1  | Bilgisayar Mühendisliği  | Mühendislik                |
| 2  | Elektrik-Elektronik      | Mühendislik                |
| 3  | İşletme                  | İktisadi ve İdari Bilimler |
| 4  | Psikoloji                | Edebiyat                   |
| 5  | Matematik                | Fen                        |

**Örnek 2**
- Ne istiyoruz? Öğrencileri görmek istiyoruz ama ekrana 14 satır sığmıyor, ilk birkaçına bakalım.
- Hangi tablolar? `students`.
- Sorgu (sadece ilk 3 satır için, `LIMIT`'i Ü1'de detaylı göreceğiz):
```sql
SELECT * FROM students LIMIT 3;
```
- Sonuçtan ne anlıyoruz? `SELECT *` yine bütün sütunları getirir, ama `LIMIT 3` "bana sadece 3
  satır yeter" der. Tabloya hızlı bir göz atmak için pratik bir yol.

### Sık hatalar & uyarılar
- `FROM`'u unutmak. `SELECT *` tek başına anlamsızdır, "nereden?" sorusu cevapsız kalır.
- Tablo adını yanlış yazmak (`student` yerine `students`). SQL tablo adını harfi harfine arar;
  bulamazsa "relation does not exist" hatası verir. Bu hata mesajını görmek normaldir, korkma,
  sadece yazımı kontrol et.

### Anlama soruları

**Soru 1 (tahmin et).** Aşağıdaki sorgu kaç satır döndürür?
```sql
SELECT * FROM departments;
```
> **İpucu:** `departments` tablosunda kaç bölüm vardı?

> **Detaylı cevap:** **5 satır.** `SELECT *` filtre içermiyor, yani "bütün satırları getir" diyor.
> `departments` tablosunda 5 bölüm olduğu için sonuç 5 satırdır. Buradaki kilit fikir: bir sorgu, sen
> onu sınırlamadıkça (örneğin `WHERE` ile filtreleyip, `LIMIT` ile kesmedikçe) tablodaki **bütün**
> satırları döndürür. Sütun sayısı da tablonun sütun sayısı kadardır: burada 3 (`id`, `name`, `faculty`).

**Soru 2 (hata avı).** Bir öğrenci şunu yazdı ve hata aldı. Neden?
```sql
SELECT * student;
```
> **İpucu:** Bir sorguda "nereden?" sorusunu cevaplayan kelime hangisiydi?

> **Detaylı cevap:** `FROM` anahtar kelimesi eksik. Doğrusu `SELECT * FROM students;` olmalı. İki hata
> var aslında: (1) `FROM` yazılmamış, bu yüzden SQL `student` kelimesini nereye koyacağını anlamıyor;
> (2) tablo adı da yanlış, tablomuzun adı `student` değil `students` (çoğul). SQL çok titizdir: hem
> doğru anahtar kelimeleri hem de tam tablo adını bekler. Bu tür "syntax error" mesajları öğrenirken
> çok normaldir; panik yapma, mesajı oku, çoğu zaman tam olarak nerede takıldığını söyler.

### Çıkış bileti
`SELECT * FROM courses;` sorgusu ne yapar, tek cümleyle anlat.

---

## Ders 0.3 — SELECT * ne zaman iyi, ne zaman kötü?

### 🧑‍🏫 Öğretmen için
"Yıldız (`*`) çok pratik ama tembel bir alışkanlık. Keşfederken harika, ama 'şu soruya cevap ver'
derken genelde sadece birkaç sütun istersin." Burada öğrenciye seçicilik fikrini ver: cevabı net
tutmak için gereksiz sütunları getirme.

### Konu anlatımı
`SELECT *` "bütün sütunları getir" demek. İki yüzü var:

- **İyi olduğu yer:** Bir tabloyu ilk kez görüyorsun, içinde ne var diye keşfediyorsun. `SELECT *`
  ile hızlıca bakarsın.
- **Kötü olduğu yer:** Belirli bir soruya cevap veriyorsun. "Öğrencilerin sadece adı ve şehri lazım"
  diyorsan, 9 sütunun hepsini getirmek hem gözünü yorar hem de gereksiz iştir. Cevap, soruya birebir
  olmalı.

Yani sütunları tek tek de seçebilirsin. Aralarına virgül koyarsın:

```sql
SELECT first_name, city FROM students;
```

Bu, sadece iki sütun getirir: ad ve şehir. Daha temiz, daha okunur, soruya birebir cevap.

> Mini slogan: **Yıldız keşif içindir; cevap verirken ihtiyacın olan sütunları seç.**

### Çözümlü örnekler

**Örnek 1**
- Ne istiyoruz? Öğrencilerin sadece ad ve soyadını.
- Hangi tablolar? `students`.
- Sorgu:
```sql
SELECT first_name, last_name FROM students;
```
- Sonuçtan ne anlıyoruz? 14 satır gelir ama sadece 2 sütun (`first_name`, `last_name`). `city`,
  `scholarship_amount` gibi sütunlar sonuçta yok, çünkü istemedik. Satır sayısı değişmedi (hâlâ 14),
  değişen şey kaç sütun gördüğümüz.

**Örnek 2 (önce eksik düşünce, sonra doğru)**
- Ne istiyoruz? Bölümlerin sadece adlarını.
- Eksik deneme:
```sql
SELECT * FROM departments;
```
Bu çalışır ama `id` ve `faculty`'yi de getirir, oysa sadece ad istemiştik.
- Doğru:
```sql
SELECT name FROM departments;
```
- Sonuçtan ne anlıyoruz? Tek sütun, 5 satır. Soruya tam olarak cevap veren, gürültüsüz bir sonuç.

### Sık hatalar & uyarılar
- Sütun adlarını yazarken aralarına virgül koymayı unutmak: `SELECT first_name last_name` yanlış
  (SQL `last_name`'i `first_name`'in takma adı sanır, bu da Ü1 konusu). Doğrusu virgülle ayırmak.
- Her şeye `SELECT *` deyip sonra gözle aramak. Soruya odaklan, gereken sütunu iste.

### Anlama soruları

**Soru 1 (yaz).** `students` tablosundan sadece öğrencilerin e-postalarını (`email`) getiren sorguyu yaz.
> **İpucu:** Tek sütun istiyorsan `SELECT` ile o sütunun adını yaz.

> **Detaylı cevap:**
> ```sql
> SELECT email FROM students;
> ```
> `SELECT` ile istediğimiz sütunun adını (`email`), `FROM` ile tabloyu (`students`) söyledik. Sonuç
> 14 satır, tek sütun olur. `SELECT *` da çalışırdı ama soruda "sadece e-posta" denmişti, o yüzden
> tek sütun seçmek doğru ve temiz cevaptır. Unutma: sonuçtaki **satır sayısı** seçtiğin sütun
> sayısından bağımsızdır, hâlâ tablodaki tüm öğrenciler gelir.

**Soru 2 (çoktan seçmeli).** "Bir raporu müdüre sunuyorsun ve sadece öğrenci adları lazım." Hangi
yaklaşım daha doğru?
- A) `SELECT * FROM students;` çünkü her ihtimale karşı her şey gelsin
- B) `SELECT first_name, last_name FROM students;`
- C) İkisi de aynı, fark etmez

> **İpucu:** Cevap soruya birebir olmalı, fazlası gürültü.

> **Detaylı cevap:** Doğru cevap **B**. Soru sadece adları istiyor, o yüzden sadece ad sütunlarını
> seçmek en temiz ve profesyonel yoldur. A şıkkı "her şeyi getir" diyor, bu bir rapora gereksiz
> sütunlar (id, burs miktarı, e-posta) sokar ve hem dağınık görünür hem de gizli kalması gereken
> bilgileri ortaya dökebilir. C yanlış: ikisi farklı sonuç döndürür, B daha azını ve doğrusunu
> getirir. Gerçek hayatta `SELECT *` raporlarda neredeyse hiç kullanılmaz, tam da bu yüzden.

### Çıkış bileti
`SELECT *` ne zaman iyi bir fikir, ne zaman kötü bir fikir? Birer örnek ver.

---

## Ders 0.4 — Sonuç kümesi: SQL tabloyu değiştirmez

### 🧑‍🏫 Öğretmen için
"En önemli kafa netliği bu: bir `SELECT` sorgusu tabloya dokunmaz. Tabloyu olduğu gibi bırakır,
sana sadece bir 'cevap tablosu' üretir." Tahtaya kaynak tablo + ondan çıkan sonuç tablosu çiz, ok
ile bağla. Bu görsel çoğu öğrencinin kafasındaki "sorgu veriyi siler mi?" korkusunu siler.

### Konu anlatımı
Bir `SELECT` çalıştırdığında ne olur? SQL, kaynak tablona bakar ve senin tarifine uyan yeni bir
geçici tablo üretir. Buna **sonuç kümesi (result set)** denir.

İki şeyi netleştirelim:
1. **Kaynak tablo değişmez.** `SELECT first_name FROM students` çalıştırmak `students` tablosundan
   hiçbir şey silmez, değiştirmez. Sadece okur. Veriyi değiştirmek için bambaşka komutlar var
   (`UPDATE`, `DELETE`) ve onları çok sonra, ayrı ünitede göreceğiz.
2. **Sonuç bir tablodur.** `SELECT`'in çıktısı yine satır ve sütunlardan oluşur. Yani bir sorgunun
   sonucu, başka bir sorgunun girdisi gibi düşünülebilir. Bu fikir ileride alt sorgular (subquery)
   ve CTE'lerde çok işine yarayacak.

> Mini slogan: **SELECT bir soru sorar, cevabı yeni bir tablo olarak verir; aslına dokunmaz.**

Bu yüzden `SELECT` ile dilediğin kadar deneme yapabilirsin. Yanlış sorgu yazsan bile veriye zarar
gelmez. Sınıfta öğrencilere bunu söyle, korkmadan denesinler.

### Çözümlü örnekler

**Örnek 1**
- Ne istiyoruz? "Öğrenci adlarını getirsem, tablo bozulur mu?" sorusunu test etmek.
- Sorgu:
```sql
SELECT first_name FROM students;   -- sadece okur
SELECT * FROM students;            -- tablo hâlâ 14 satır, hiçbir şey değişmedi
```
- Sonuçtan ne anlıyoruz? İlk sorgu tek sütunluk bir sonuç kümesi üretti. İkinci sorgu hâlâ bütün
  tabloyu, tüm satır ve sütunlarıyla gösteriyor. Yani okuma işlemi tabloyu olduğu gibi bıraktı.

### Sık hatalar & uyarılar
- "Yanlış SELECT yazarsam veriyi silerim" korkusu. Hayır. `SELECT` salt okur. Rahatça dene.
- Sonuç kümesindeki satır sırasının "garantili" olduğunu sanmak. `ORDER BY` yazmadıysan, SQL
  satırları istediği sırada verebilir. Sıra istiyorsan açıkça istemelisin (Ü1).

### Anlama soruları

**Soru 1 (çoktan seçmeli).** `SELECT * FROM students;` çalıştırdıktan sonra `students` tablosuna ne olur?
- A) Tablo silinir
- B) Tablo değişmez, sadece bir sonuç kümesi gösterilir
- C) Tablodaki NULL'lar sıfıra dönüşür
- D) Tablo sıralanır ve öyle kaydedilir

> **İpucu:** SELECT okur mu, yazar mı?

> **Detaylı cevap:** Doğru cevap **B**. `SELECT` bir okuma komutudur: kaynağa dokunmaz, sadece senin
> istediğin gibi bir cevap tablosu (sonuç kümesi) üretip gösterir. A yanlış, hiçbir şey silinmez.
> C yanlış, NULL'lar olduğu gibi kalır, SELECT veriyi dönüştürüp kaydetmez. D yanlış, ekranda sıralı
> görsen bile bu kaynağa yazılmaz; üstelik `ORDER BY` yazmadıysan sıra garanti bile değildir. Bu
> yüzden SELECT ile gönül rahatlığıyla deneme yapabilirsin, veriyi bozma riskin yok.

**Soru 2 (kavram).** "Bir sorgunun sonucu da bir tablodur" demek neden işimize yarar?
> **İpucu:** Cevabı tekrar bir şeyin girdisi olarak kullanabilmeyi düşün.

> **Detaylı cevap:** Çünkü bir sorgunun ürettiği sonuç kümesini, başka bir sorgunun üzerinde
> çalıştığı "tablo" gibi kullanabiliriz. Örneğin önce "her şehirdeki öğrenci sayısı"nı üreten bir
> sorgu yazarız, sonra bu sonucun üzerine "sadece 3'ten fazla olanları göster" diye ikinci bir
> filtre koyarız. Bu "sorgu içinde sorgu" fikri (subquery ve CTE) ileride karmaşık problemleri küçük
> adımlara bölmemizi sağlar. Şimdilik aklında kalsın yeter: **SELECT girdi olarak tablo alır, çıktı
> olarak yine tablo (sonuç kümesi) verir.** Bu simetri, SQL'i güçlü yapan şeylerden biri.

### Çıkış bileti
"SELECT tabloyu değiştirir mi?" Cevabını tek cümleyle ve nedeniyle yaz.

---

## Pratik (editörde dene)

> Deneme Tahtasında (⌘K) dene. Önce kendin yaz, çalıştır, gözle, sonra cevaba bak. Seed: Kampüs.

**P1 (kolay).** [▶ Editörde dene] Tüm bölümleri (departments) bütün sütunlarıyla getir.
> İpucu: SELECT * FROM ...
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT * FROM departments;
> ```
> 5 satır, 3 sütun (id, name, faculty). `*` tüm sütunları getirir.
> </details>

**P2 (kolay).** [▶ Editörde dene] Öğrencilerin sadece adını ve şehrini getir.
> İpucu: İstediğin sütunları virgülle yaz.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT first_name, city FROM students;
> ```
> 14 satır, 2 sütun. Mehmet ve Can gibi bazılarının şehri NULL görünür (bilinmiyor).
> </details>

**P3 (kolay).** [▶ Editörde dene] Derslerin sadece adını (name) getir.
> İpucu: Tek sütun seç.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT name FROM courses;
> ```
> 8 ders adı, tek sütun. Soruya birebir cevap (gereksiz sütun yok).
> </details>

**P4 (düşündürücü).** [▶ Editörde dene] Önce `SELECT first_name FROM students;` çalıştır, sonra
`SELECT * FROM students;` çalıştır. İlk sorgu tabloyu değiştirdi mi? Neden?
> İpucu: SELECT okur mu, yazar mı? (Ü0.4)
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT first_name FROM students;   -- sadece adları okur
> SELECT * FROM students;            -- tablo hâlâ 14 satır, tüm sütunlar; hiçbir şey değişmedi
> ```
> SELECT salt okur; tabloya dokunmaz, sana bir sonuç kümesi üretir. Bu yüzden korkmadan deneyebilirsin.
> </details>

---

## Ünite 0 özeti (öğrenciye)
- Veri, **tablolarda** durur. Tablo = **sütunlar** (dikey, tek tür bilgi) + **satırlar** (yatay, tek varlık).
- `NULL` = "değer yok / bilinmiyor". Sıfır veya boş yazı değil.
- Soru sormak için `SELECT ... FROM ...` kullanırız. `*` bütün sütunlar demek.
- Cevap verirken sadece gereken sütunları seç; `*`'ı keşif için sakla.
- `SELECT` tabloyu **değiştirmez**, sana bir **sonuç kümesi** üretir. Korkmadan dene.

## 🧑‍🏫 Öğretmen notu (ünite geneli)
Bu ünitede hiç filtre, sıralama yok, bilerek. Amaç "tablo + sorgu + sonuç" zihinsel modelini
oturtmak. Bir sonraki ünitede sütun seçme, sıralama ve sınırlamayı işleyeceğiz. Öğrencilerin
"SELECT veriyi bozmaz" fikrini içselleştirmesi çok önemli, çünkü bundan sonraki tüm cesur denemeler
buna güveniyor.
