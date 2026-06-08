# Kaynak: Codex yanıtı (SQL eğitim tasarımı)

> Arşiv. Bariş tarafından CODEX_PROMPT.md ile alınan yanıt. Aynen saklanıyor.
> Tarih: 2026-06-07. Bu içerik CURRICULUM_MASTER.md'de sentezlendi.

---

**Kısa Teşhis**

Müfredatın yönü doğru: önce okuma (`SELECT`), sonra filtreleme, özetleme, birleştirme, alt sorgu, en son veri değiştirme ve tasarım. Ama başlangıç seviyesi için bazı üniteler fazla büyük. Özellikle `JOIN`, `GROUP BY`, `NULL`, subquery ve window functions ayrı zihinsel modeller ister. Bunları küçük derslere bölmek öğrenmeyi ciddi rahatlatır.

**Önerilen Ünite Planı**

| Ünite | Konu | Not |
|---|---|---|
| Ü0 | Tablo mantığı, ilk `SELECT`, sonuç kümesi | "SQL tabloyu değiştirmez, sonuç üretir" fikri |
| Ü1 | `SELECT`, alias, expression, `DISTINCT`, `ORDER BY`, `LIMIT` | Sütun seçme + sonucu şekillendirme |
| Ü2 | `WHERE` 1: karşılaştırma, `AND/OR/NOT` | Satır eleme mantığı |
| Ü3 | `WHERE` 2: `IN`, `BETWEEN`, `LIKE`, `NULL` | `NULL` ayrı mini ders olmalı |
| Ü4 | Aggregate 1: `COUNT/SUM/AVG`, tek sonuç | "Satırlardan özet çıkarma" |
| Ü5 | Aggregate 2: `GROUP BY`, `HAVING` | `WHERE` vs `HAVING` çok görünür anlatılmalı |
| Ü6 | Veri modeli: PK/FK, tablo ilişkileri, ERD okuma | `JOIN` öncesi şart |
| Ü7 | `JOIN` 1: `INNER JOIN`, one-to-many | En kritik pratik ünite |
| Ü8 | `JOIN` 2: `LEFT JOIN`, eksik eşleşmeler, self join | `RIGHT/FULL` opsiyonel veya kısa demo |
| Ü9 | Subquery, `IN`, `EXISTS`, derived table | Önce "sorgunun içinde tablo üretmek" |
| Ü10 | Küme işlemleri: `UNION`, `INTERSECT`, `EXCEPT` | Subquery'den sonra güzel oturur |
| Ü11 | DML + transaction: `INSERT/UPDATE/DELETE`, `BEGIN/ROLLBACK` | Sandbox senaryolarıyla |
| Ü12 | DDL: `CREATE TABLE`, tipler, constraints, `ALTER` | En sona yakın, proje tadında |
| Ü13 | İleri okuma: `CASE`, CTE, window functions, view/index kavramı | Window ayrı ders olsun |

Eksik kritik konular: tarih/saat filtreleme, metin fonksiyonları, `COALESCE`, type casting, sorgu formatlama, hata mesajı okuma, veri kalitesi problemleri, duplicate satır mantığı.

**En Sık Hatalar ve Önleyici Uyarılar**

| Konu | Sık hata | Anlatımda önleyici mini cümle |
|---|---|---|
| `SELECT` | `SELECT *` alışkanlığı | "Yıldız keşif içindir; cevap verirken ihtiyacın olan sütunları seç." |
| Alias | Alias'ı `WHERE` içinde kullanmak | "`WHERE`, sonuç başlıkları oluşmadan önce çalışır." |
| `ORDER BY` | Sıralamayı değerlendirme sanmak | "Sıralama sadece gösterimi değiştirir, hangi satırların geldiğini değil." |
| `WHERE` | `AND/OR` önceliğini karıştırmak | "Karışıyorsa parantez koy; SQL senin niyetini tahmin etmez." |
| `LIKE` | Büyük/küçük harf farkını unutmak | PostgreSQL'de `LIKE` duyarlı, `ILIKE` duyarsızdır. |
| `NULL` | `= NULL` yazmak | "`NULL` değer değil, bilinmiyor işaretidir; `IS NULL` kullanılır." |
| Aggregate | `COUNT(*)` ve `COUNT(column)` farkı | "`COUNT(*)` satır sayar; `COUNT(column)` NULL olmayan değer sayar." |
| `GROUP BY` | Seçilmiş her normal sütunu gruplamamak | "Özet sorgusunda her sütun ya grup anahtarıdır ya hesaplamadır." |
| `HAVING` | Satır filtresiyle grup filtresini karıştırmak | "`WHERE` satırlar içindir, `HAVING` oluşmuş gruplar içindir." |
| `JOIN` | Join koşulunu unutup patlayan satır sayısı | "Join'de eşleştirme kuralı yoksa herkes herkesle eşleşir." |
| `LEFT JOIN` | Sağ tablo filtresini `WHERE`'e koyup inner join'e çevirmek | "Eksik eşleşmeyi korumak istiyorsan sağ tablo filtresini çoğu zaman `ON` içine koy." |
| Subquery | Tek değer beklenen yerde çok satır döndürmek | "`=` tek cevap ister; çok cevap varsa `IN` düşün." |
| DML | `WHERE` olmadan `UPDATE/DELETE` | Arayüzde "kaç satır etkilenecek?" önizlemesi göster. |

**Anlama Sorusu Şablonları**

İyi şablon şu ritimde olmalı: küçük veri parçası, tek kavram, tahmin et, sonra çalıştır, sonra nedenini açıkla.

Örnek 1, `NULL`:

Soru: `ogrenciler` tablosunda `mezuniyet_yili` bazı öğrenciler için boş. "Henüz mezun olmayan öğrencileri getir" sorgusu hangisi olmalı?

```sql
-- A
SELECT * FROM ogrenciler WHERE mezuniyet_yili = NULL;

-- B
SELECT * FROM ogrenciler WHERE mezuniyet_yili IS NULL;
```

İpucu: `NULL` normal bir değer gibi karşılaştırılmaz. "Bilinmiyor/boş" durumunu özel olarak sorarız.

Detaylı cevap: Doğru cevap B. Çünkü `NULL`, `2025` veya `'Ali'` gibi bir değer değildir. SQL'de `mezuniyet_yili = NULL` ifadesi "mezuniyet yılı bilinmeyene eşit mi?" gibi belirsiz kalır ve beklenen satırları getirmez. `IS NULL`, "bu hücrede değer yok mu?" sorusunu sorar.

Örnek 2, `GROUP BY` / `HAVING`:

Soru: "Her kulüpte kaç öğrenci var, ama sadece 3 veya daha fazla öğrencisi olan kulüpleri göster."

```sql
SELECT kulup_id, COUNT(*) AS ogrenci_sayisi
FROM kulup_uyelikleri
GROUP BY kulup_id
HAVING COUNT(*) >= 3;
```

İpucu: Önce kulüplere göre gruplar oluşur, sonra grup sayısı filtrelenir.

Detaylı cevap: Burada `WHERE COUNT(*) >= 3` yazamayız, çünkü `WHERE` satırlar gruplanmadan önce çalışır. `COUNT(*)` ise grup oluşunca hesaplanır. Bu yüzden grup sonrası filtre için `HAVING` kullanılır.

Örnek 3, `JOIN`:

Soru: "Öğrencilerin adını ve kayıtlı oldukları kulüp adını getir."

İpucu: Öğrenci adı bir tabloda, kulüp adı başka tabloda. Aradaki köprü üyelik tablosudur.

Detaylı cevap: Öğrenci ile kulüp doğrudan değil, `kulup_uyelikleri` üzerinden bağlanır. Bu tür ilişkiye many-to-many denir. İki join gerekir: öğrenci -> üyelik -> kulüp.

**Çözümlü Örnek Tasarımı**

Kötü örnek:

```sql
SELECT c.name, COUNT(*)
FROM a
JOIN b ON a.id = b.aid
JOIN c ON c.id = b.cid
GROUP BY c.name;
```

Sorun: Tablo isimleri anlamsız, gerçek soru yok, öğrenci sadece şekil ezberler.

İyi örnek:

```sql
-- Her kulüpte kaç öğrenci var?
SELECT k.ad AS kulup_adi, COUNT(*) AS ogrenci_sayisi
FROM kulup_uyelikleri ku
JOIN kulupler k ON k.id = ku.kulup_id
GROUP BY k.ad
ORDER BY ogrenci_sayisi DESC;
```

Neden iyi: Önce günlük dilde hedef var, tablo ilişkisi anlaşılır, alias'lar anlamlı, sonuç sütunları okunur, `ORDER BY` çıktıyı yorumlatır.

Her çözümlü örnekte şu dört parça olsun: "Ne istiyoruz?", "Hangi tablolar lazım?", "Sorgu", "Sonuçtan ne anlıyoruz?"

**Pratik ve Drill Tasarımı**

Zorluk kademeleri:

| Seviye | Görev tipi |
|---|---|
| 1 | Tek tablo, tek kavram: "İsmi A ile başlayanları getir." |
| 2 | İki koşul veya sıralama: "Puanı 70 üstü olanları ada göre sırala." |
| 3 | Aggregate/join: "Her kulübün öğrenci sayısı." |
| 4 | Kenar durum: `NULL`, duplicate, eşleşmeyen kayıtlar |
| 5 | Mini iş problemi: "Etkinliğe katılmayan öğrencileri bul." |

Kısmi puanlama fikirleri:

| Durum | Geri bildirim |
|---|---|
| Doğru satırlar, yanlış sıralama | "Satırlar doğru, ama beklenen sıralama farklı. `ORDER BY` kontrol et." |
| Doğru değerler, fazla sütun | "Cevabın veri olarak doğru, fakat istenenden fazla sütun döndürüyorsun." |
| Eksik satır | "Bazı beklenen kayıtlar yok. Filtren fazla dar olabilir." |
| Fazla satır | "Beklenmeyen kayıtlar geliyor. `WHERE` veya `JOIN ON` koşulunu kontrol et." |
| Aynı satırlar tekrar ediyor | "Duplicate oluşmuş. Join ilişkisi veya `DISTINCT/GROUP BY` ihtiyacını düşün." |

Drill modu rastgele değil, ağırlıklı rastgele olmalı: öğrenci `NULL` sorularında zorlandıysa sistem onu daha sık, ama bıktırmadan geri getirmeli.

**Motivasyon**

Abartılı rozet sistemi yerine öğrenmeye bağlı ilerleme daha iyi çalışır:

| Mekanik | Kullanım |
|---|---|
| Konu ustalığı | `WHERE: %78`, `JOIN: %42` gibi görünür seviye |
| Geri çağırma | 1 gün, 3 gün, 7 gün sonra kısa tekrar |
| Hata günlüğü | "Bu hafta en çok `GROUP BY` ve `NULL` hatası yaptın." |
| Mikro hedef | "Bugün 5 dakikada 3 filtreleme sorusu" |
| Öğrenciye açıklama yazdırma | Bazen "Bu sorgu neden çalışıyor?" sorusu |

**Seed Veri Seti**

Ana önerim: tek tutarlı evren kullan. Öğrenci tablo ilişkilerini tekrar tekrar görürse bilişsel yük azalır. En iyi evren: "Kampüs yaşamı".

Tablolar:

| Tablo | Öğretir |
|---|---|
| `ogrenciler` | temel SELECT, WHERE, NULL |
| `bolumler` | FK, join |
| `dersler` | filtreleme, kategori |
| `kayitlar` | many-to-many, notlar, aggregate |
| `ogretmenler` | join, self-contained örnekler |
| `kulupler` | many-to-many |
| `kulup_uyelikleri` | bridge table |
| `etkinlikler` | tarih filtreleme |
| `etkinlik_katilimlari` | anti-join, eksik katılım |
| `odemeler` veya `kantin_siparisleri` | SUM/AVG, tarih, CASE |

Ünite bazlı mini veri setleri de olabilir ama "ana evren" korunmalı. İleri ünitelerde küçük yan evrenler ekleyebilirsin: mağaza siparişleri, film kataloğu, spor turnuvası.

**Auto-Grading Tuzakları**

Sonuç kümesi karşılaştırması iyi ama tek başına pedagojik olarak kör kalabilir.

| Tuzak | Çözüm |
|---|---|
| Sıra önemli değilken yanlış saymak | Görevde `ORDER BY` istenmediyse sıralamayı yok say |
| Fazla sütun döndüren doğru mantık | Ayrı kontrol: satırlar doğru, kolon seçimi yanlış |
| Duplicate farkı | Multiset karşılaştırması yap; duplicate sayısını önemse |
| Eşdeğer sorguları cezalandırmak | SQL metnini değil sonucu değerlendir, ama anti-pattern uyarısı ver |
| Rastgele veriyle tesadüfen doğru sonuç | Hidden test dataset kullan |
| `LIMIT` ile şans eseri doğru cevap | Birden fazla veri varyantında çalıştır |
| `NULL` karşılaştırmaları | Özellikle NULL içeren test satırları koy |
| Float/ortalama farkları | Toleranslı karşılaştırma kullan |
| DML görevleri | Son tablo durumunu ve etkilenen satır sayısını kontrol et |

En iyi geri bildirim formatı: "Ne doğru?", "Ne farklı?", "Nereye bakmalısın?"
Örneğin: "Beklenen 8 satırdı, sen 11 satır getirdin. Fazla gelen satırlar kulüpsüz öğrencilerle ilgili. `LEFT JOIN` sonrası `WHERE` filtresini kontrol et."

**Eğitmen Paneli**

Öğretmene en faydalı görüntüler:

| Görünüm | Ne işe yarar |
|---|---|
| Sınıf ısı haritası | Konu x öğrenci başarı oranı |
| Hata kümeleri | "12 öğrenci `= NULL` kullandı" gibi ortak sorunlar |
| Soru bazlı dağılım | Hangi görev sınıfı kilitledi? |
| Deneme geçmişi | Öğrenci kaç denemede çözdü, hangi hatalardan geçti? |
| Kavram ustalığı | `JOIN ON`, `GROUP BY`, `HAVING`, `NULL` ayrı ayrı |
| Canlı ders modu | Şu an kim takıldı, kim boş editörde bekliyor? |
| Müdahale önerisi | "Bu öğrenciye LEFT JOIN mini tekrarını öner." |
| Yanlış sorgu örnekleri | Anonimleştirilmiş, derste birlikte düzeltmek için |

Öğretmen için en değerli metrik yalnızca doğru/yanlış değil: "kaç deneme", "hangi hata tipi", "ipucu kullandı mı", "çözüm açıklamasını açtı mı", "aynı hatayı tekrar ediyor mu?"

**En Önemli Tasarım İlkesi**

SQL'i komut ezberi gibi değil, veriyle soru-cevap dili gibi öğret. Her derste öğrenci şu üç şeyi söyleyebilmeli: "Hangi satırları istiyorum?", "Hangi sütunları göstereceğim?", "Birden fazla tablo/grup varsa sonuç hangi seviyede?" Bu zihinsel model oturursa `JOIN`, `GROUP BY`, subquery ve window functions çok daha az korkutucu olur.
