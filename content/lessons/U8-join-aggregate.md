# Ünite 8 — JOIN + Aggregate: Birleştir, Sonra Grupla (Çift Saymadan)

> Kavram etiketleri: `join-then-group`, `left-join-count-trap`, `count-star-vs-column`, `double-counting`, `count-distinct-fix`, `multi-table-aggregate`
> Ön koşul: Ü0-Ü7 (özellikle Ü4, Ü5, Ü7)
> Kullanılan tablolar: clubs, club_memberships, students, departments, orders, order_items, products
> Tahmini süre: 60-70 dk
> Ünite sloganı: **"Önce join sonucuna bak: bir satır artık neyi temsil ediyor?"**

> Bu ünite, gerçek SQL becerisinin ayrıştığı yer. Aggregate'i (Ü4-5) ve JOIN'i (Ü6-7) biliyorsun;
> şimdi ikisini birleştirirken en sık ve en pahalı hataları (çift sayma, LEFT JOIN + COUNT tuzağı)
> nasıl önleyeceğini öğreneceğiz.

---

## Ders 8.1 — Birleştir, sonra grupla: JOIN + GROUP BY

### 🧑‍🏫 Öğretmen için
"Ü5'te 'her bölümde kaç öğrenci' diye gruplamıştık ama bölüm ADI yerine id görüyorduk. Şimdi JOIN ile
adı da getirebiliriz." Tahtaya çalışma sırasını hatırlat (Ü5.5): önce FROM/JOIN (tablolar birleşir),
sonra GROUP BY, sonra aggregate. Yani "önce birleştir, sonra grupla". Sor: "Kulüp başına üye sayısını ve
kulüp ADINI nasıl alırız?" Birlikte kur.
- Sor: "Bu sorguda GROUP BY'a ne yazmalıyım, cl.name mi cl.id mi?" (İsim benzersizse name; garanti için
  id'ye göre gruplayıp adı da seçmek daha sağlam; konuya göre tartış.)
- Herkes burada takılır: GROUP BY'daki sütun kuralı (Ü5.1) JOIN'den sonra da geçerli; hatırlat.

### Neden / nerede işime yarar
"Kategori başına satış", "müşteri başına sipariş sayısı", "bölüm başına ortalama not" gibi gerçek
raporların hepsi JOIN + GROUP BY'dır. Bu ikisini birlikte kullanmak, analiz işinin belkemiği.

### Konu anlatımı
Mantık basit ve Ü5.5'teki çalışma sırasından gelir: **önce JOIN tabloları birleştirir, sonra GROUP BY
grupları oluşturur, sonra aggregate her grubu özetler.** Böylece grupların yanında ilişkili tablodan
gelen adları da gösterebiliriz.

```sql
SELECT cl.name AS kulup, COUNT(*) AS uye_sayisi
FROM clubs cl
JOIN club_memberships cm ON cm.club_id = cl.id
GROUP BY cl.name
ORDER BY uye_sayisi DESC;
```

> Mini slogan: **Önce JOIN birleştirir, sonra GROUP BY gruplar, sonra aggregate sayar. Sırayı düşün, sonucu kestir.**

### Çözümlü örnekler

**Örnek 1 (kulüp başına üye sayısı, adıyla)**
- Sorgu (yukarıdaki). Sonuç:

| kulup        | uye_sayisi |
|--------------|------------|
| Robotik      | 4          |
| Müzik        | 2          |
| Fotoğrafçılık| 2          |
| Girişimcilik | 2          |

- Ne anlıyoruz? Üyeleri olan kulüpler ve sayıları. Dikkat: **Satranç burada YOK**, çünkü INNER JOIN
  üyesi olmayan kulübü eledi. "Üyesi 0 olan kulüp de görünsün" istiyorsak LEFT JOIN gerekir (8.2) ve
  orada bir tuzak var.

**Örnek 2 (bölüm başına öğrenci sayısı, ad ve fakülteyle)**
- Sorgu:
```sql
SELECT d.name AS bolum, d.faculty, COUNT(*) AS ogrenci
FROM departments d
JOIN students s ON s.department_id = d.id
GROUP BY d.name, d.faculty
ORDER BY ogrenci DESC;
```
- Sonuç: Bilgisayar Müh. 5, sonra İşletme 3, Elektrik 3, Psikoloji 2, Matematik 1. Ne anlıyoruz?
  Ü5'teki "bölüm başına sayı"yı artık bölüm ADIYLA görüyoruz. Burada her öğrencinin tek bölümü olduğu
  için çoğalma yok, COUNT(*) güvenli.

### Sık hatalar & uyarılar
- GROUP BY'a JOIN'den gelen ama SELECT'te kullanılan normal sütunu eklememek (Ü5.1 kuralı JOIN'de de geçerli).
- INNER JOIN + GROUP BY'ın "0 olan grupları" göstermediğini unutmak (Satranç gibi). Onlar için LEFT JOIN (8.2).

### Anlama soruları

**Soru 1 (yaz).** Her bölümün adını ve o bölümdeki öğrencilerin ortalama bursunu getir.
> **İpucu:** departments JOIN students, GROUP BY bölüm, AVG(scholarship_amount).

> **Detaylı cevap:**
> ```sql
> SELECT d.name AS bolum, AVG(s.scholarship_amount) AS ort_burs, COUNT(*) AS ogrenci
> FROM departments d
> JOIN students s ON s.department_id = d.id
> GROUP BY d.name
> ORDER BY ort_burs DESC NULLS LAST;
> ```
> Önce departments+students birleşir, sonra bölüme göre gruplanır, sonra her bölümün ortalama bursu
> hesaplanır. Ü4'teki AVG kuralı burada da geçerli: bursu NULL olan öğrenciler ortalamaya katılmaz
> (paydaya girmez). Örneğin Bilgisayar bölümünde 5 öğrenci var ama 2'sinin bursu NULL, o yüzden o
> bölümün ort_burs'u 3 öğrenci üzerinden hesaplanır. COUNT(*) ise 5 gösterir. Bu, "her öğrenciye tek
> bölüm" olduğu için çoğalma içermeyen güvenli bir JOIN+GROUP BY.

**Soru 2 (tahmin et).** Örnek 1'deki kulüp sayımı neden 5 değil 4 satır döndürdü (5 kulüp var)?
> **İpucu:** Hangi kulübün üyesi yok, INNER JOIN ona ne yapar?

> **Detaylı cevap:** Çünkü **Satranç** kulübünün hiç üyesi yok ve INNER JOIN eşleşmeyen satırı eler
> (Ü6). `clubs JOIN club_memberships` yalnızca en az bir üyeliği olan kulüpleri getirir; Satranç'ın
> club_memberships'te hiç satırı olmadığı için o hiç görünmez, geriye 4 kulüp kalır. Yani bu sorgu
> aslında "üyesi olan kulüpler ve sayıları"dır, "tüm kulüpler" değil. Eğer Satranç'ı da (0 üyeyle)
> görmek istiyorsak INNER yerine LEFT JOIN kullanmalıyız, ama dikkat: orada COUNT(*) bir tuzağa
> düşürür (8.2). Bu, INNER JOIN + GROUP BY'ın sessiz sınırı: 0 olan gruplar görünmez.

### Çıkış bileti
`clubs JOIN club_memberships ... GROUP BY` neden üyesi olmayan kulübü göstermez?

---

## Ders 8.2 — LEFT JOIN + COUNT tuzağı: COUNT(*) mı COUNT(sütun) mu?

### 🧑‍🏫 Öğretmen için
Bu, müfredatın en sinsi tuzağı; canlı göster. Satranç'ı da görmek için LEFT JOIN yap, `COUNT(*)` ile
say. Sor: "Satranç'ın üye sayısı kaç çıktı?" Cevap **1** çıkacak, oysa üyesi YOK. Sınıf "ama üyesi yoktu!"
desin. İşte öğretilecek an: LEFT JOIN, Satranç için NULL'lı tek bir satır üretti; `COUNT(*)` o satırı da
saydı. Doğrusu `COUNT(cm.student_id)`: NULL'ı saymaz, 0 verir.
- Tahtaya yan yana yaz: `COUNT(*)` (yanlış, 1) ve `COUNT(cm.student_id)` (doğru, 0).
- Ü4'ü hatırlat: COUNT(*) satır sayar, COUNT(sütun) NULL olmayanı sayar. Tuzağın kökü bu.
- Anahtar cümle: **"LEFT JOIN'de sayarken COUNT(*) değil, sağ tablodaki bir sütunu say."**

### Konu anlatımı
"Üyesi 0 olan kulüpler de görünsün" demek için LEFT JOIN kullanırız (Ü6.4). Ama bir tuzak var: LEFT JOIN,
eşleşmeyen kulüp (Satranç) için **NULL'larla dolu tek bir satır** üretir. Eğer `COUNT(*)` ile sayarsak,
o NULL satırı da bir satır olarak sayılır ve Satranç **1** görünür, oysa üyesi 0.

Çözüm Ü4'ten geliyor: `COUNT(*)` satırları sayar, `COUNT(sütun)` ise o sütunda **NULL olmayanları**
sayar. LEFT JOIN'de sağ tablodan bir sütunu (`cm.student_id`) sayarsak, eşleşmeyen kulübün NULL'ı
sayılmaz ve doğru 0 elde edilir.

> Mini slogan: **LEFT JOIN'de "kaç eşleşme?" sorusunu COUNT(*) değil, sağ tablonun bir sütunuyla (COUNT(cm.x)) sor.**

### Çözümlü örnekler

**Örnek 1 (tuzağı ve çözümü yan yana, önce tahmin et)**
- Önce tahmin: Satranç'ın üye sayısı `COUNT(*)` ile kaç, `COUNT(cm.student_id)` ile kaç?
- Sorgu:
```sql
SELECT cl.name AS kulup,
       COUNT(*) AS yanlis_sayim,
       COUNT(cm.student_id) AS dogru_sayim
FROM clubs cl
LEFT JOIN club_memberships cm ON cm.club_id = cl.id
GROUP BY cl.name
ORDER BY dogru_sayim DESC;
```
- Sonuç:

| kulup        | yanlis_sayim | dogru_sayim |
|--------------|--------------|-------------|
| Robotik      | 4            | 4           |
| Müzik        | 2            | 2           |
| Fotoğrafçılık| 2            | 2           |
| Girişimcilik | 2            | 2           |
| Satranç      | 1            | 0           |

- Ne anlıyoruz? Üyesi olan kulüplerde iki sayım aynı. Ama Satranç'ta `COUNT(*)` yanlışlıkla 1 dedi
  (LEFT JOIN'in ürettiği NULL satırı saydı); `COUNT(cm.student_id)` doğru şekilde 0 dedi (NULL sayılmaz).
  İşte LEFT JOIN ile sayarken neden hep sağ tablodan bir sütun saymamız gerektiği.

### Sık hatalar & uyarılar
- LEFT JOIN sonrası `COUNT(*)` kullanıp "0 olması gereken" grupları 1 saymak. Sağ tablodan sütun say.
- `COUNT(cl.id)` (sol tablodan) saymak: bu da yanlış, çünkü sol taraf hep dolu (kulüp her zaman var).
  Eşleşmeyi saymak için **sağ** tablodan bir sütun seç (`cm.student_id`).

### Anlama soruları

**Soru 1 (hata avı).** Bir öğrenci "her kulübün üye sayısı, üyesizler 0 olsun" istedi, şunu yazdı ve
Satranç'ı 1 gördü. Hata ne, doğrusu ne?
```sql
SELECT cl.name, COUNT(*) AS uye
FROM clubs cl LEFT JOIN club_memberships cm ON cm.club_id = cl.id
GROUP BY cl.name;
```
> **İpucu:** LEFT JOIN Satranç için nasıl bir satır üretir, COUNT(*) onu sayar mı?

> **Detaylı cevap:** Hata: `COUNT(*)` kullanılmış. LEFT JOIN, üyesi olmayan Satranç için sağ tarafı
> (club_memberships) NULL olan tek bir satır üretir. `COUNT(*)` satırları saydığı için bu NULL'lı satırı
> da 1 olarak sayar; Satranç yanlışlıkla 1 üyeli görünür. Doğrusu, sağ tablodan bir sütunu saymak:
> ```sql
> SELECT cl.name, COUNT(cm.student_id) AS uye
> FROM clubs cl LEFT JOIN club_memberships cm ON cm.club_id = cl.id
> GROUP BY cl.name;
> ```
> `COUNT(cm.student_id)` NULL olan değerleri saymaz (Ü4), bu yüzden Satranç doğru şekilde 0 olur.
> Kural: LEFT JOIN'de "kaç eşleşme" sorusunu hep sağ tablonun bir sütunuyla say, asla `COUNT(*)` ile değil.

**Soru 2 (kavram).** `COUNT(*)` ile `COUNT(cm.student_id)` üyesi OLAN kulüplerde neden aynı sonucu verir?
> **İpucu:** O gruplarda NULL var mı?

> **Detaylı cevap:** Çünkü üyesi olan kulüplerin gruplarındaki tüm satırlar gerçek üyelik satırlarıdır;
> `cm.student_id` o satırların hepsinde doludur (NULL yok). NULL olmadığı için `COUNT(*)` (tüm satırlar)
> ile `COUNT(cm.student_id)` (NULL olmayanlar) aynı sayıyı verir. Fark sadece eşleşmeyen grupta (Satranç)
> ortaya çıkar: orada LEFT JOIN tek bir NULL satır üretir, `COUNT(*)` onu 1 sayar, `COUNT(cm.student_id)`
> 0 sayar. Yani tuzak yalnızca "0 üyeli" gruplarda görünür; ama tam da o gruplar için doğru cevap
> vermek istediğimizden, alışkanlık olarak hep sağ sütunu saymak en güvenlisi.

### Çıkış bileti
LEFT JOIN ile bir şeyi sayarken neden `COUNT(*)` yerine sağ tablodan bir sütun sayarsın?

---

## Ders 8.3 — Çift sayma: çoğaltan JOIN üstünde SUM/COUNT şişer

### 🧑‍🏫 Öğretmen için
Ü7.4'teki satır çoğalmasını diri tut. "Ayşe iki kulüpte, JOIN'de iki satır. Şimdi onun bursunu
toplarsak ne olur?" Canlı göster: students'ı kulüp üyelikleriyle JOIN'leyip `SUM(scholarship)` al;
Ayşe ve Elif'in bursu iki kez toplanır, sonuç şişer ve hiçbir anlamlı şeye eşit olmaz. Sor: "Bu sayı ne?
Toplam burs mu? Hayır. Kulüptekilerin bursu mu? O da değil, çünkü bazıları iki kez." İşte çift sayma.
- Anahtar cümle: **"Çoğaltan (fan-out) bir tabloyu join edip dışındaki bir değeri SUM'larsan şişer."**
- Kurtarıcılar: ya o tabloyu join etme, ya COUNT(DISTINCT) kullan, ya önce doğru grain'de topla (CTE, Ü10).

### Neden / nerede işime yarar
"Ciro neden iki katı çıktı?", "toplam neden tutmuyor?" gerçek hayatta en sık bu yüzden olur: bir detay
tablosuyla join edip üst seviyedeki bir değeri toplamak. Bunu görebilmek, analizinin doğruluğunu kurtarır.

### Konu anlatımı
Ü7.4'te gördük: çok-çok bir JOIN satırları çoğaltır. Bir öğrenci iki kulüpteyse JOIN'de iki satırda
görünür. Eğer bu join üstünde o öğrenciye ait bir değeri (bursunu) `SUM`'larsak, o değer **iki kez**
toplanır; sonuç şişer ve anlamsızlaşır. Buna **çift sayma (double counting)** denir.

Üç kurtarıcı:
1. **Gereksiz join'i kaldır:** Sadece öğrenci toplamı istiyorsan, kulüp tablosunu hiç join etme.
2. **COUNT(DISTINCT):** "Kaç farklı öğrenci" gibi sayımlarda tekrarları teke indir (Ü7.4).
3. **Önce doğru grain'de topla:** Detay tabloyu kendi grain'inde özetleyip sonra birleştir (CTE ile, Ü10).

> Mini slogan: **Çoğaltan bir tabloyu join edip dışındaki bir değeri toplama; ya join'i kaldır, ya DISTINCT say, ya önce doğru seviyede topla.**

### Çözümlü örnekler

**Örnek 1 (çift sayma felaketi, önce tahmin et)**
- Önce tahmin: aşağıdaki toplam, tüm öğrencilerin toplam bursuna (31000) eşit mi?
- Sorgu:
```sql
SELECT SUM(s.scholarship_amount) AS sisirilmis_toplam
FROM students s
JOIN club_memberships cm ON cm.student_id = s.id;
```
- Sonuç: `34000`. Ne anlıyoruz? Bu sayı hiçbir anlamlı şeye eşit değil. Ne tüm öğrencilerin toplamı
  (31000), ne de "kulüptekilerin toplamı" (24500). Çünkü Ayşe (5000) ve Elif (4500) ikişer kulüpte
  oldukları için bursları iki kez toplandı; üstelik kulüpsüz öğrenciler hiç katılmadı. Join çoğalttı,
  SUM şişti.

**Örnek 2 (doğru sayım: COUNT(DISTINCT))**
- Ne istiyoruz? Kaç farklı öğrenci en az bir kulüpte?
- Sorgu:
```sql
SELECT COUNT(DISTINCT s.id) AS kulupteki_ogrenci
FROM students s
JOIN club_memberships cm ON cm.student_id = s.id;
```
- Sonuç: `8`. Ne anlıyoruz? `COUNT(*)` 10 (üyelik) verirdi; `COUNT(DISTINCT s.id)` Ayşe ve Elif'i bir
  kez sayarak doğru "8 farklı öğrenci"yi verdi. Çoğalan join üstünde sayım yaparken DISTINCT kurtarır.

**Örnek 3 (öğrenci başına kulüp sayısı, doğru yol)**
- Ne istiyoruz? Her öğrencinin kaç kulüpte olduğu (kulüpsüzler 0).
- Sorgu:
```sql
SELECT s.first_name, COUNT(cm.club_id) AS kulup_sayisi
FROM students s
LEFT JOIN club_memberships cm ON cm.student_id = s.id
GROUP BY s.first_name
ORDER BY kulup_sayisi DESC;
```
- Sonuç: Ayşe 2, Elif 2, sonra 1'liler (Ali Çelik, Burak, Mehmet, Selin, Zeynep, Deniz), sonra 0'lar
  (Can, Ali Vural, Merve, Emre, Gizem, Okan). Ne anlıyoruz? Burada gruplama öğrenci bazında olduğu için
  her öğrenci bir satır; `COUNT(cm.club_id)` (LEFT + sağ sütun, 8.2 dersi) kulüpsüzleri doğru 0 verdi.
  Bu, çoğalmayı "öğrenci başına" gruplayarak kontrol altına almanın doğru yolu.

### Sık hatalar & uyarılar
- Çoğaltan join üstünde bir üst-seviye değeri (öğrenci bursu, sipariş toplamı) doğrudan SUM'lamak -> şişme.
- "Kaç farklı X" sorusunda `COUNT(*)` kullanmak -> tekrarları sayar. `COUNT(DISTINCT x)` kullan.
- Sonucun mantıklı olup olmadığını kontrol etmemek. Toplam beklenenden büyükse, çift sayma şüphesi ilk akla gelmeli.

### Anlama soruları

**Soru 1 (kavram).** Örnek 1'deki `SUM(s.scholarship_amount)` neden ne 31000 (tüm öğrenciler) ne de
24500 (kulüptekiler) değil de 34000 çıktı?
> **İpucu:** Ayşe ve Elif kaç satırda? Kulüpsüzler bu join'de var mı?

> **Detaylı cevap:** İki etki birleşti. Birincisi çoğalma: Ayşe (5000) ve Elif (4500) ikişer kulüpte
> oldukları için JOIN'de ikişer satırda görünür, bursları iki kez toplanır (Ayşe 10000, Elif 9000
> katkı). İkincisi eksilme: INNER JOIN, hiç kulübü olmayan 6 öğrenciyi hariç tutar, onların bursu hiç
> toplanmaz. Sonuç (34000) bu yüzden ne tüm öğrencilerin toplamı (31000) ne de "kulüptekilerin gerçek
> toplamı" (her birini bir kez sayınca 24500). Yani sayı tamamen anlamsız. Doğru "kulüptekilerin burs
> toplamı" için her öğrenciyi bir kez saymalıyız (örn. önce DISTINCT öğrencileri bulup sonra toplamak,
> ki bunu CTE ile Ü10'da temiz yapacağız). Ders: çoğaltan join üstünde üst-seviye değer toplama.

**Soru 2 (yaz).** Kaç farklı öğrenci en az bir SİPARİŞ vermiş? (orders tablosu; bir öğrencinin birden
çok siparişi olabilir.)
> **İpucu:** students JOIN orders, ama "kaç farklı öğrenci" -> COUNT(DISTINCT).

> **Detaylı cevap:**
> ```sql
> SELECT COUNT(DISTINCT o.student_id) AS siparis_veren
> FROM orders o;
> ```
> (Ya da `SELECT COUNT(DISTINCT s.id) FROM students s JOIN orders o ON o.student_id = s.id;`)
> Bir öğrencinin birden çok siparişi olabildiği için (örneğin Ayşe'nin 1, 2, 8 numaralı siparişleri
> var), `COUNT(*)` sipariş sayısını verir, öğrenci sayısını değil. `COUNT(DISTINCT student_id)` aynı
> öğrenciyi bir kez sayar. Sonuç 5 (sipariş veren farklı öğrenciler: 1, 3, 5, 8, 9, 10... dikkat:
> orders'ta student_id'ler 1,1,3,6,5,8,9,1,10,3 -> farklılar: 1,3,5,6,8,9,10 = 7). Doğru cevap **7
> farklı öğrenci** sipariş vermiş (iptal/bekleyen dahil). "Kaç farklı X" gördüğünde refleksin DISTINCT
> olsun.

### Çıkış bileti
Çoğaltan (fan-out) bir tabloyla JOIN yaptıktan sonra bir değeri `SUM`'larsan ne risk var, nasıl önlenir?

---

## Ders 8.4 — Çok tablolu gerçek analiz: kategori ve öğrenci başına ciro

### 🧑‍🏫 Öğretmen için
Burada öğrenilen her şeyi gerçek bir iş sorusunda birleştir: "Kategori başına ciro, ama iptal siparişler
hariç." Üç tablo (order_items + products + orders), bir WHERE (iptal hariç), bir GROUP BY, bir SUM. Tahtaya
"ciro = adet × birim fiyat" yaz, `SUM(quantity * unit_price)` mantığını göster. Sonra iptal siparişi
dahil/hariç farkını canlı göster (Yiyecek 255 -> 155): "İptal edilmiş satış ciro sayılır mı? Hayır, o
yüzden WHERE."
- Çalışma sırasını hatırlat: JOIN -> WHERE (iptal ele) -> GROUP BY -> SUM.
- Bu ders bir "bitirme projesi" tadında; öğrenci JOIN+filtre+grup+aggregate'i bir arada görüyor.

### Konu anlatımı
Gerçek analizler genelde birkaç tabloyu birleştirir, filtreler ve gruplar. Kalıp:
**JOIN (tabloları birleştir) -> WHERE (ilgisiz/iptal satırları ele) -> GROUP BY (grupla) -> aggregate (özetle).**

Sipariş kalemi başına ciro = `quantity * unit_price`. Kategori başına ciroyu bulmak için order_items'ı
products (kategori için) ve orders (durum için) ile birleştirir, iptal/bekleyenleri eler, kategoriye
göre gruplar, toplarız.

> Mini slogan: **Birleştir, ilgisizi ele, grupla, topla; gerçek analiz bu dört adımın birleşimidir.**

### Çözümlü örnekler

**Örnek 1 (kategori başına ciro, sadece tamamlanan siparişler)**
- Sorgu:
```sql
SELECT p.category, SUM(oi.quantity * oi.unit_price) AS ciro
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
WHERE o.status = 'completed'
GROUP BY p.category
ORDER BY ciro DESC;
```
- Sonuç:

| category | ciro |
|----------|------|
| İçecek   | 270  |
| Yiyecek  | 155  |
| Tatlı    | 110  |

- Ne anlıyoruz? Üç tabloyu birleştirdik, iptal (order 4) ve bekleyen (order 7) siparişleri WHERE ile
  eledik, kategoriye göre topladık. İptalleri elemeseydik Yiyecek 255 çıkardı (iptal Sandviç 55 +
  bekleyen Tost 45 = 100 fazlası). "İptal satış ciro değildir" kararı sonucu doğrudan değiştirdi.

**Örnek 2 (öğrenci başına harcama, tamamlananlar)**
- Sorgu:
```sql
SELECT s.first_name, SUM(oi.quantity * oi.unit_price) AS harcama
FROM students s
JOIN orders o ON o.student_id = s.id
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status = 'completed'
GROUP BY s.first_name
ORDER BY harcama DESC;
```
- Sonuç: Ayşe 210, Selin 110, Zeynep 95, Elif 80, Deniz 40. Ne anlıyoruz? Öğrenci -> sipariş ->
  sipariş kalemi zinciriyle her öğrencinin tamamlanmış harcamasını topladık. Burada çift sayma yok,
  çünkü her sipariş kalemi tek bir öğrenciye/siparişe ait (zincir aşağı doğru, çoğaltmıyor).

### Sık hatalar & uyarılar
- İptal/bekleyen siparişleri ciroya dahil etmek. İş kuralını WHERE ile uygula.
- `SUM(oi.unit_price)` yazıp adedi unutmak. Ciro = `quantity * unit_price`; adetle çarpmadan toplama eksik olur.
- Üç tablolu zincirde bir ON'u atlamak -> kartezyen şişme (Ü6).

### Anlama soruları

**Soru 1 (tahmin et).** Örnek 1'de `WHERE o.status = 'completed'` satırını kaldırırsak Yiyecek cirosu ne
olur, neden?
> **İpucu:** Hangi Yiyecek satışları iptal/bekleyen siparişlerde?

> **Detaylı cevap:** Yiyecek cirosu **155'ten 255'e** çıkar. Çünkü WHERE'i kaldırınca iptal ve bekleyen
> siparişlerdeki Yiyecek kalemleri de toplama girer: 4 numaralı (iptal) siparişteki Sandviç (1 × 55 =
> 55) ve 7 numaralı (bekleyen) siparişteki Tost (1 × 45 = 45), toplam 100 eklenir; 155 + 100 = 255.
> İş açısından bu yanlış olurdu: iptal edilmiş bir satışı ciro saymak geliri olduğundan yüksek gösterir.
> Bu yüzden `WHERE o.status = 'completed'` kritik bir iş kuralıdır. Ders: aggregate'ten önce hangi
> satırların "sayılması gerektiğine" karar ver ve WHERE ile uygula; çalışma sırasında WHERE,
> GROUP BY/SUM'dan öncedir (Ü5.5), yani doğru satırları önceden eler.

**Soru 2 (yaz).** Her ürünün (adıyla) kaç adet (toplam quantity) satıldığını, sadece tamamlanmış
siparişlerde, çoktan aza getir.
> **İpucu:** order_items JOIN products JOIN orders, WHERE completed, GROUP BY ürün, SUM(quantity).

> **Detaylı cevap:**
> ```sql
> SELECT p.name, SUM(oi.quantity) AS toplam_adet
> FROM order_items oi
> JOIN products p ON p.id = oi.product_id
> JOIN orders o ON o.id = oi.order_id
> WHERE o.status = 'completed'
> GROUP BY p.name
> ORDER BY toplam_adet DESC;
> ```
> order_items'tan başlayıp products (ad için) ve orders (durum için) ile birleştirdik, iptal/bekleyenleri
> eledik, ürün adına göre gruplayıp adetleri topladık. `SUM(oi.quantity)` "kaç adet satıldı"yı verir
> (kaç satır değil; bir kalemde quantity 2 olabilir). Örneğin Latte birkaç siparişte geçtiği için üst
> sıralarda olur. Bu, gerçek bir "en çok satan ürün" raporunun temel kalıbıdır.

### Çıkış bileti
Çok tablolu bir analiz sorgusunda dört temel adım (JOIN, WHERE, GROUP BY, aggregate) hangi sırayla işler?

---

## Pratik (editörde dene)

> Deneme Tahtasında (⌘K) dene. Önce tahmin et, çalıştır, gözle, sonra cevaba bak. Seed: Kampüs.

**P1 (kolay).** [▶ Editörde dene] Her kulübün adını ve üye sayısını getir (üyesiz kulüpler 0 olsun).
> İpucu: clubs LEFT JOIN club_memberships, COUNT(cm.student_id), GROUP BY.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT cl.name, COUNT(cm.student_id) AS uye
> FROM clubs cl LEFT JOIN club_memberships cm ON cm.club_id = cl.id
> GROUP BY cl.name ORDER BY uye DESC;
> ```
> Robotik 4, Müzik/Fotoğrafçılık/Girişimcilik 2, Satranç 0. COUNT(*) deseydin Satranç 1 olurdu (tuzak).
> </details>

**P2 (orta).** [▶ Editörde dene] Her bölümün adını ve öğrenci sayısını getir, çoktan aza.
> İpucu: departments JOIN students, GROUP BY, COUNT(*).
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT d.name AS bolum, COUNT(*) AS ogrenci
> FROM departments d JOIN students s ON s.department_id = d.id
> GROUP BY d.name ORDER BY ogrenci DESC;
> ```
> Bilgisayar 5, İşletme 3, Elektrik 3, Psikoloji 2, Matematik 1. Her öğrenci tek bölümde, çoğalma yok,
> COUNT(*) güvenli.
> </details>

**P3 (orta).** [▶ Editörde dene] Kaç farklı öğrenci sipariş vermiş (iptal/bekleyen dahil)?
> İpucu: COUNT(DISTINCT student_id).
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT COUNT(DISTINCT student_id) AS siparis_veren FROM orders;
> ```
> 7. COUNT(*) sipariş sayısını (10) verirdi; DISTINCT öğrenciyi sayar.
> </details>

**P4 (zorlayıcı).** [▶ Editörde dene] Kategori başına ciroyu, SADECE tamamlanmış siparişlerde, çoktan
aza getir.
> İpucu: order_items JOIN products JOIN orders, WHERE completed, GROUP BY category, SUM(quantity*unit_price).
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT p.category, SUM(oi.quantity * oi.unit_price) AS ciro
> FROM order_items oi
> JOIN products p ON p.id = oi.product_id
> JOIN orders o ON o.id = oi.order_id
> WHERE o.status = 'completed'
> GROUP BY p.category ORDER BY ciro DESC;
> ```
> İçecek 270, Yiyecek 155, Tatlı 110. WHERE iptal/bekleyeni eler.
> </details>

**P5 (düşündürücü, çift sayma).** [▶ Editörde dene] Şu sorgu "kulüptekilerin toplam bursu"nu doğru
veriyor mu? `SELECT SUM(s.scholarship_amount) FROM students s JOIN club_memberships cm ON cm.student_id
= s.id;` Çalıştır, sonra neden yanlış olduğunu açıkla ve doğru "kaç farklı öğrenci kulüpte" sorusunu yaz.
> İpucu: Ayşe ve Elif kaç kez sayılıyor? COUNT(DISTINCT).
> <details><summary>Cevap</summary>
>
> Yanlış: 34000 verir, çünkü Ayşe (5000) ve Elif (4500) iki kulüpte oldukları için bursları iki kez
> toplanır (çift sayma); kulüpsüzler de hiç katılmaz. Bu sayı anlamlı bir toplam değil.
> ```sql
> SELECT COUNT(DISTINCT s.id) AS kulupteki_ogrenci
> FROM students s JOIN club_memberships cm ON cm.student_id = s.id;   -- 8
> ```
> "Kaç farklı öğrenci kulüpte" sorusu DISTINCT ile 8 verir. (Doğru burs toplamı için önce öğrencileri
> teke indirip toplamak gerekir, ki bunu CTE ile Ü10'da temiz yapacağız.)
> </details>

---

## Ünite 8 özeti (öğrenciye)
- **Önce JOIN birleştirir, sonra GROUP BY gruplar, sonra aggregate özetler.** Böylece grup özetlerini
  ilişkili tablodan gelen adlarla gösterirsin.
- INNER JOIN + GROUP BY, **0 olan grupları göstermez** (üyesiz Satranç gibi); onlar için LEFT JOIN.
- **LEFT JOIN + COUNT tuzağı:** `COUNT(*)` eşleşmeyen grubu 1 sayar; doğrusu sağ tablodan
  `COUNT(cm.student_id)` (NULL sayılmaz, 0 verir).
- **Çift sayma:** çoğaltan bir join üstünde üst-seviye değeri `SUM`'lama; ya join'i kaldır, ya
  `COUNT(DISTINCT)` say, ya önce doğru grain'de topla (CTE, Ü10).
- Gerçek analiz = **JOIN -> WHERE -> GROUP BY -> aggregate** (iş kuralını WHERE ile uygula, örn. iptal hariç).

## 🧑‍🏫 Öğretmen notu (ünite geneli)
Bu, MVP'nin (Ü0-Ü8) zirvesi ve gerçek SQL becerisinin ayraç noktası. Üç tuzağı canlı göster: (1) INNER
+ GROUP BY 0'lı grupları gizler, (2) LEFT JOIN + COUNT(*) tuzağı (Satranç=1), (3) çift sayma (SUM şişer).
Bunları gören öğrenci, gerçek hayatta "rakam neden tutmuyor" sorusunu kendi kendine çözer. Hepsi Ü7.4'teki
grain fikrine dayanıyor, o yüzden "bir satır neyi temsil ediyor?" sorusunu burada da tekrar tekrar sordur.
Bundan sonrası (Ü9 subquery/set, Ü10 CTE) bu temelin üstüne kuruluyor; özellikle Ü10'da çift saymayı CTE
ile temiz çözeceğiz.
