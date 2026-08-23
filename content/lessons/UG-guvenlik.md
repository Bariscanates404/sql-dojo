# Ünite G — Güvenlik: Veriyi Değiştiren ve Yok Eden Komutlar

> Kavram etiketleri: `read-vs-write`, `delete-without-where`, `update-without-where`, `transaction-safety`, `drop-truncate`, `safe-habits`
> Ön koşul: Ü0-Ü3 (özellikle Ü2 WHERE)
> Önerilen yer: Ü3'ten sonra, JOIN'lerden önce (hafif-orta). Tam DML Ü11, tam DDL Ü12'de derinleşir.
> Kullanılan tablolar: students, enrollments, clubs, events (sandbox'ta, resetlenebilir)
> Tahmini süre: 35-45 dk
> Ünite sloganı: **"Bazı komutlar veriyi okur, bazıları değiştirir, bazıları geri dönüşü olmadan yok eder."**

> NOT (öğrenciye): Bu ünitedeki tehlikeli komutları burada GÖNÜL RAHATLIĞIYLA dene. Çünkü buradaki
> veritabanı bir kum havuzu; "↺ Sıfırla" ile her şey eski haline döner. Amacımız, gerçek hayatta
> (sıfırlama olmayan yerde) bu komutları nasıl güvenle kullanacağını öğrenmek.

---

## Ders G.1 — İki dünya: okuyan komutlar vs değiştiren/yok eden komutlar

### 🧑‍🏫 Öğretmen için
Tahtayı ikiye böl. Sol tarafa "OKUR (güvenli)" yaz: `SELECT`. Sağ tarafa "DEĞİŞTİRİR / YOK EDER
(dikkat)" yaz: `INSERT`, `UPDATE`, `DELETE`, `DROP`, `TRUNCATE`. Sınıfa şunu söyle: "Şimdiye kadar hep
sol taraftaydık, hiçbir şeyi bozmadık. Bugün sağ tarafa geçiyoruz ve orada bir yanlış, gerçek hayatta
geri dönülmez sonuçlar doğurabilir." Sonra rahatlat: "Ama burada kum havuzundayız, Sıfırla butonumuz
var, o yüzden korkmadan deneyeceğiz; korkmayı değil, dikkati öğreneceğiz."
- Sor: "Sizce `SELECT` bir satırı silebilir mi?" (Hayır, sadece okur, Ü0.4'te demiştik.)
- Anahtar cümle: **"Sağ taraftaki komutları çalıştırmadan önce bir saniye dur ve düşün."**

#### 🧑‍🏫 Sınıfta anlatılacak gerçek olay: GitLab, 31 Ocak 2017

Bu üniteye başlarken uydurma bir örnek verme. Gerçeğini anlat; çocuklar "abartıyor" diyemesin.
Olay herkese açık: GitLab kendi hata raporunu yayımladı, hatta kurtarma çalışmasını YouTube'dan
**canlı yayınladı.** Aşağıdaki anlatımı sahne sahne kur, aralarda sınıfa sor.

**Sahne 1: Sıradan bir gece.** GitLab, dünyada milyonlarca yazılımcının kodunu tuttuğu bir şirket.
31 Ocak 2017 gecesi veritabanı aşırı yükleniyor. Nöbetteki mühendis saatlerdir uğraşıyor, gece
yarısını geçmiş, yorgun. İki veritabanı sunucusu var: **db1** asıl sunucu (canlı veri burada),
**db2** yedek kopya. db2'nin kopyalaması bozulmuş, düzeltmek için db2'nin klasörünü silip sıfırdan
kopyalamaya karar veriyor. Gayet makul bir plan.

> Sor: "Yorgunken, gece yarısı, iki tane birbirine çok benzeyen sunucu... Sizce ne olabilir?"

**Sahne 2: Yanlış pencere.** Mühendis silme komutunu çalıştırıyor. Ama komutu db2'ye değil,
**db1'e** yazıyor. Yani yedeği değil, canlının kendisini siliyor. Yaklaşık 300 gigabaytlık
veritabanı silinmeye başlıyor. Birkaç saniye içinde fark edip durduruyor, ama iş işten geçmiş:
geriye neredeyse hiçbir şey kalmamış.

> Sor: "Bir saniye durup 'ben hangi sunucudayım?' diye baksaydı ne değişirdi?"
> Cevap: her şey. Bizim `SELECT` provasının yaptığı tam olarak bu, sadece komut yerine hedefi kontrol.

**Sahne 3: Asıl felaket burada başlıyor.** "Olsun, yedekten döneriz" diyorlar. GitLab'ın **beş ayrı**
yedekleme yöntemi vardı. O gece beşini de denediler:
- Düzenli yedek alan program aylardır **sessizce boş dosya üretiyormuş** (sürüm uyuşmazlığı). Hata
  bildirimi e-postaları da kimseye ulaşmıyormuş.
- Bulut disk anlık görüntüsü veritabanı sunucularında **açık değilmiş**.
- Yedeklerin gideceği bulut klasörü **bomboşmuş**.
- Kopyalama (replication) zaten yedek değil; silinen şey anında kopyaya da yansır.
- Beş yöntemin **hiçbiri** işe yaramadı.

> Sor sınıfa: "Yedeğiniz var mı diye sorulsa, GitLab 'evet, beş tane' derdi. Kaç tanesi çalışıyormuş?"
> Vurgula: **Denenmemiş yedek, yedek değildir. Sadece yedek olduğunu sandığın bir şeydir.**

**Sahne 4: Şans eseri kurtuluş.** Tesadüfen, o gün başka bir test için alınmış yaklaşık **6 saat
öncesine ait** bir kopya bulunuyor. Tek kurtaran o oluyor. Sistem saatlerce kapalı kalıyor ve o 6
saatte yapılan işler geri gelmiyor: binlerce proje, binlerce yorum, yüzlerce yeni kullanıcı hesabı.
Hepsi kayıp. Şirket bunu gizlemiyor, olayı bütün ayrıntısıyla yayımlıyor.

**Kapanış (tahtaya yaz).** Bu hikâyeden çocuğun aklında kalması gereken üç cümle:
1. Hatayı yapan **beceriksiz biri değildi**; yorgun, acele eden, dikkatli bir mühendisti. Bu bizim de
   başımıza gelir.
2. Komut çalıştı, hata vermedi, tam istendiği gibi çalıştı. **Yanlış olan komut değil, hedefti.**
3. Kurtaran şey zekâ değil, **tesadüftü.** Tesadüfe güvenmemek için: önce bak, sonra yap.

> Bir dürüstlük notu (sorarlarsa söyle): oradaki komut SQL değil, dosya silme komutuydu. Ama hatanın
> cinsi birebir aynı: geri dönüşü olmayan bir komut, yanlış hedefe. Bizim ünitede bunun SQL'deki
> karşılığı `WHERE`'siz `DELETE` ve `DROP TABLE`.
>
> Sınıfa göstermek istersen olay raporu ve canlı yayın hâlâ internette; "GitLab database incident
> 2017" diye aratman yeterli.

### Neden / nerede işime yarar
Bir gün gerçek bir veritabanında çalışacaksın: müşteri, sipariş, kullanıcı verisi. Orada yanlış bir
`DELETE` ya da `UPDATE`, saniyeler içinde binlerce kaydı bozabilir ve çoğu zaman geri alınamaz. Bu
dersin amacı sana komutları değil, **disiplini** vermek.

### Konu anlatımı
SQL komutlarını üç gruba ayıralım:

1. **Okuyan (güvenli):** `SELECT`. Veriye dokunmaz, sadece sonuç kümesi üretir (Ü0.4). İstediğin kadar
   çalıştır, hiçbir şey bozulmaz.
2. **Veriyi değiştiren (dikkat):** `INSERT` (ekler), `UPDATE` (değiştirir), `DELETE` (satır siler).
   Bunlar tablonun **içeriğini** kalıcı değiştirir. (Detay: Ü11.)
3. **Yapıyı değiştiren/yok eden (yüksek dikkat):** `DROP TABLE` (tabloyu komple siler), `TRUNCATE`
   (tüm satırları bir anda boşaltır), `ALTER` (yapıyı değiştirir). (Detay: Ü12.)

#### Her komutun en basit hali

Şimdi bu komutların **yazılışını** görelim. Ayrıntıya girmiyoruz (INSERT/UPDATE/DELETE'in tamamı
Ü11'de, DROP/TRUNCATE/ALTER'ın tamamı Ü12'de). Buradaki tek amacımız şu: bir komutu görünce
**ne yaptığını ve hangi dünyaya ait olduğunu** anında tanıyabilmek.

| Komut | En basit hali | Ne yapar | Dünya |
|-------|---------------|----------|-------|
| `SELECT` | `SELECT sütunlar FROM tablo;` | Satırları okur, sonuç kümesi üretir | okur |
| `INSERT` | `INSERT INTO tablo (sütunlar) VALUES (değerler);` | Tabloya yeni satır ekler | değiştirir |
| `UPDATE` | `UPDATE tablo SET sütun = değer WHERE koşul;` | Var olan satırların değerini değiştirir | değiştirir |
| `DELETE` | `DELETE FROM tablo WHERE koşul;` | Satır siler, tablonun kendisi kalır | değiştirir |
| `TRUNCATE` | `TRUNCATE tablo;` | Tüm satırları bir anda boşaltır | yok eder |
| `DROP` | `DROP TABLE tablo;` | Tabloyu yapısıyla birlikte yok eder | yok eder |
| `ALTER` | `ALTER TABLE tablo ADD COLUMN ad tip;` | Tablonun yapısını değiştirir | yapıyı değiştirir |

#### Peki bu kelimeler ne demek? (`SET`, `INTO`, `VALUES`...)

Tabloda `SET`, `INTO`, `VALUES` gibi kelimeler geçti. Bunlar sihirli değil, her biri cümlenin bir
parçasını işaretliyor. SQL'i İngilizce bir emir cümlesi gibi düşün; bu kelimeler o cümlenin
bağlaçları.

| Kelime | Hangi komutta | Ne işi var | Minik örnek |
|--------|---------------|------------|-------------|
| `FROM` | SELECT, DELETE | hangi tablodan | `DELETE FROM clubs` = "clubs tablosun**dan**" |
| `INTO` | INSERT | hangi tabloya | `INSERT INTO clubs` = "clubs tablosun**a**" |
| `VALUES` | INSERT | eklenecek değerler | `VALUES (6, 'Tiyatro', 2024)` |
| `SET` | UPDATE | neyi ne yapacağız | `SET founded_year = 2020` = "yılı 2020 **yap**" |
| `WHERE` | SELECT, UPDATE, DELETE | hangi satırlarda | `WHERE id = 3` = "sadece 3 numaralı satırda" |
| `TABLE` | DROP, ALTER | işlem tablonun kendisine | `DROP TABLE clubs` = tabloyu komple |
| `ADD COLUMN` | ALTER | sütun ekle | `ADD COLUMN aciklama text` |
| `DROP COLUMN` | ALTER | sütun sil | `DROP COLUMN aciklama` |

Bir komutu kelime kelime okuyalım. Bu, tüm SQL boyunca işine yarayacak bir alışkanlık:

```sql
UPDATE clubs SET founded_year = 2020 WHERE id = 3;
```

| Parça | Nasıl okunur |
|-------|--------------|
| `UPDATE clubs` | "clubs tablosunu güncelleyeceğim" |
| `SET founded_year = 2020` | "founded_year sütununu 2020 yap" |
| `WHERE id = 3` | "ama sadece id'si 3 olan satırda" |

Hepsini birleştir: *"clubs tablosunda, id'si 3 olan satırın founded_year'ını 2020 yap."* Türkçesini
bu şekilde söyleyebiliyorsan komutu anlamışsın demektir.

**Buradaki en sinsi ayrıntı: `=` işareti iki farklı anlama geliyor.** Şu komuta bak, ikisi de aynı
cümlede:

```sql
UPDATE clubs SET founded_year = 2020 WHERE founded_year = 2018;
SELECT id, name, founded_year FROM clubs ORDER BY id;
```
- Sonuç:

| id | name          | founded_year |
|----|---------------|--------------|
| 1  | Robotik       | 2015 |
| 2  | Müzik         | 2010 |
| 3  | Satranç       | **2020** |
| 4  | Fotoğrafçılık | 2012 |
| 5  | Girişimcilik  | 2020 |

- Gözlem: 1 satır değişti (Satranç, 2018'di). İki `=` işaretinin işi tamamen farklıydı:
  - `SET founded_year = 2020` → buradaki `=` **atama**: "bunu şu yap".
  - `WHERE founded_year = 2018` → buradaki `=` **karşılaştırma**: "bu şuna eşit mi?".

  Yani aynı sembol, `SET`'ten sonra emir veriyor, `WHERE`'den sonra soru soruyor. Karıştırırsan
  komut yine çalışır ama bambaşka bir şey yapar, ve bu ünitenin bütün derdi tam olarak bu:
  **çalışan komut, doğru komut demek değil.**

`INSERT`'te de küçük bir kural var: iki parantez birbirine karşılık gelir.

```sql
INSERT INTO clubs (id, name) VALUES (7);
```
- Sonuç: hata verir.

```
HATA: INSERT has more target columns than expressions
```

- Gözlem: 2 sütun saydık ama 1 değer verdik, sayılar tutmayınca SQL komutu reddetti. İlk
  parantezdeki sütun sırası ile ikinci parantezdeki değer sırası birebir eşleşmeli. Sıraları
  değiştirmek serbest, yeter ki ikisi aynı sırada olsun: `(name, id, founded_year)` yazıp
  `('Tiyatro', 6, 2024)` verirsen sorunsuz çalışır.

#### Son bir tespit

Şimdi yukarıdaki **komut tablosuna** (ilk tablo) bir daha bak ve şunu fark et: **`WHERE` yalnızca
`UPDATE` ve `DELETE` satırlarında var.**
Bu bir tesadüf değil, bu ünitenin en önemli ayrıntısı. `UPDATE` ve `DELETE` hedef seçebilir, yani
"sadece şu satırlara dokun" diyebilirsin. `TRUNCATE` ve `DROP` hedef seçemez; onlar ya hep ya hiç
çalışır. Bir sonraki derste (G.2) göreceğiz ki asıl felaket, hedef seçebilen komutta hedefi
söylemeyi unutmaktan çıkıyor.

Bu ünitede bu komutları derinlemesine değil, **tehlikelerini ve güvenli kullanımını** öğreneceğiz.
En önemli fikir: **2. ve 3. gruptaki komutların gerçek hayatta çoğu zaman "geri al" tuşu yoktur.**

> Mini slogan: **SELECT okur ve güvenlidir; UPDATE/DELETE/DROP değiştirir ya da yok eder, geri dönüşü çoğu zaman yoktur.**

### Çözümlü örnekler

Hepsini `clubs` tablosunda yapacağız, çünkü küçük: 5 satır, 3 sütun. Gözle takip etmesi kolay.
Her örnekten sonra **↺ Sıfırla** ile başlangıç haline dönebilirsin.

Başlangıç hali (her örnek buradan başlıyor):

```sql
SELECT id, name, founded_year FROM clubs ORDER BY id;
```
- Sonuç:

| id | name          | founded_year |
|----|---------------|--------------|
| 1  | Robotik       | 2015 |
| 2  | Müzik         | 2010 |
| 3  | Satranç       | 2018 |
| 4  | Fotoğrafçılık | 2012 |
| 5  | Girişimcilik  | 2020 |

**Örnek 1 (`SELECT`: okuyan dünya)**
- Sorgu: yukarıdaki sorgunun kendisi.
- Ne anlıyoruz? Tekrar tekrar çalıştır; hep aynı 5 satır gelir, hiçbir şey bozulmaz. Okuyan
  dünyanın rahatlığı budur: deneme yapmak bedava.

**Örnek 2 (`INSERT`: yeni satır ekler)**
- Sorgu:
```sql
INSERT INTO clubs (id, name, founded_year) VALUES (6, 'Tiyatro', 2024);
SELECT id, name, founded_year FROM clubs WHERE id = 6;
```
- Sonuç:

| id | name    | founded_year |
|----|---------|--------------|
| 6  | Tiyatro | 2024 |

- Ne anlıyoruz? Tabloda 5 kulüp vardı, şimdi 6 var. `INSERT` var olan satırlara dokunmaz, sona
  yeni bir satır ekler. Parantezlerin sırası önemli: önce hangi sütunlara yazacağını söylersin,
  sonra `VALUES` ile o sıradaki değerleri verirsin.

Şimdi iki küçük varyasyon dene. Her birinden sonra ↺ Sıfırla, sonra bir sonrakini çalıştır.
Amaç ezber değil: çalıştır, sonuca bak, farkı kendin gör.

**2a. Bir sütunu hiç yazmazsan ne olur?**
```sql
INSERT INTO clubs (id, name) VALUES (7, 'Münazara');
SELECT id, name, founded_year FROM clubs WHERE id = 7;
```
- Sonuç:

| id | name     | founded_year |
|----|----------|--------------|
| 7  | Münazara | *NULL*       |

- Gözlem: `founded_year` yazmadık, hata da almadık. O sütun `NULL` (boş) kaldı. SQL "eksik bıraktın"
  demiyor, "bilinmiyor" diye işaretliyor. NULL'ı Ü2'de görmüştün, işte yine karşındasın.

**2b. Tek komutla iki satır ekleyebilir misin?**
```sql
INSERT INTO clubs (id, name, founded_year) VALUES (8, 'Sinema', 2021), (9, 'Doğa Sporları', 2019);
SELECT id, name, founded_year FROM clubs ORDER BY id;
```
- Sonuç:

| id | name          | founded_year |
|----|---------------|--------------|
| 1  | Robotik       | 2015 |
| 2  | Müzik         | 2010 |
| 3  | Satranç       | 2018 |
| 4  | Fotoğrafçılık | 2012 |
| 5  | Girişimcilik  | 2020 |
| 8  | Sinema        | 2021 |
| 9  | Doğa Sporları | 2019 |

- Gözlem: `VALUES`'tan sonra parantezleri virgülle çoğaltınca 2 satır birden eklendi. 5 kulüp 7 oldu.
  Bu, 100 satır eklerken de aynı: tek komut, çok satır. Aklında tut, çünkü aynı "tek komut, çok
  satır" gücü `DELETE`'te felakete dönüşecek (G.2).

**Örnek 3 (`UPDATE`: var olan satırı değiştirir)**
- Sorgu:
```sql
UPDATE clubs SET founded_year = 2020 WHERE id = 3;
SELECT id, name, founded_year FROM clubs WHERE id = 3;
```
- Sonuç:

| id | name    | founded_year |
|----|---------|--------------|
| 3  | Satranç | 2020 |

- Ne anlıyoruz? Satranç kulübünün kuruluş yılı 2018'di, 2020 oldu. Satır sayısı değişmedi (hâlâ
  5 kulüp), **satırın içindeki bir değer** değişti. `WHERE id = 3` olmasaydı 5 kulübün hepsinin
  yılı 2020 olurdu; bu, G.2'nin konusu.

Üç küçük varyasyon. Yine: çalıştır, bak, Sıfırla, sonrakine geç.

**3a. Aynı anda iki sütunu değiştirebilir misin?**
```sql
UPDATE clubs SET name = 'Satranç Kulübü', founded_year = 2019 WHERE id = 3;
SELECT id, name, founded_year FROM clubs WHERE id = 3;
```
- Sonuç:

| id | name           | founded_year |
|----|----------------|--------------|
| 3  | Satranç Kulübü | 2019 |

- Gözlem: `SET`'ten sonra virgülle istediğin kadar sütun sayabilirsin. Tek `WHERE`, tek satır,
  ama iki değer birden değişti.

**3b. Yeni değeri, eski değerden hesaplayabilir misin?**
```sql
UPDATE clubs SET founded_year = founded_year + 1 WHERE id = 1;
SELECT id, name, founded_year FROM clubs WHERE id = 1;
```
- Sonuç:

| id | name    | founded_year |
|----|---------|--------------|
| 1  | Robotik | 2016 |

- Gözlem: Robotik 2015'ti, 2016 oldu. Eşitliğin sağındaki `founded_year`, **o satırın şu anki
  değeri** demek. Yani "sütunu kendi değerinin bir fazlası yap" dedik. Sabit bir sayı yazmak
  zorunda değilsin.

**3c. Koşula birden çok satır uyarsa ne olur?**
```sql
UPDATE clubs SET founded_year = 2000 WHERE founded_year < 2013;
SELECT id, name, founded_year FROM clubs ORDER BY id;
```
- Sonuç:

| id | name          | founded_year |
|----|---------------|--------------|
| 1  | Robotik       | 2015 |
| 2  | Müzik         | **2000** |
| 3  | Satranç       | 2018 |
| 4  | Fotoğrafçılık | **2000** |
| 5  | Girişimcilik  | 2020 |

- Gözlem: Koşula uyan 2 satır (Müzik 2010, Fotoğrafçılık 2012) **birlikte** değişti. `UPDATE` tek
  satırlık bir komut değil; koşula kaç satır uyuyorsa hepsine uygular. Şimdi şunu düşün: koşulu
  hiç yazmasaydın kaç satıra uygulardı? İşte G.2 tam olarak bu sorunun cevabı.

**Örnek 4 (`DELETE`: satırı siler, tablo kalır)**
- Sorgu:
```sql
DELETE FROM clubs WHERE id = 3;
SELECT id, name FROM clubs ORDER BY id;
```
- Sonuç:

| id | name          |
|----|---------------|
| 1  | Robotik       |
| 2  | Müzik         |
| 4  | Fotoğrafçılık |
| 5  | Girişimcilik  |

- Ne anlıyoruz? Satranç satırı gitti, 5 kulüp 4'e düştü. Ama `clubs` tablosunun kendisi duruyor:
  hâlâ SELECT atabiliyoruz, sütunları yerinde. **Satır silmek, tablo silmek değildir.** Bu ayrım
  G.4'ün konusu.

İki varyasyon, ikisi de şaşırtıcı.

**4a. Koşula hiçbir satır uymazsa hata alır mısın?**
```sql
DELETE FROM clubs WHERE id = 99;
SELECT COUNT(*) AS kulup_sayisi FROM clubs;
```
- Sonuç:

| kulup_sayisi |
|--------------|
| 5 |

- Gözlem: **Hata yok.** 99 numaralı kulüp diye bir şey olmadığı için hiçbir satır silinmedi,
  komut sessizce "0 satır etkilendi" deyip geçti. Bunu aklında tut: SQL'in hata vermemesi
  "doğru şeyi yaptın" demek değildir, sadece "cümlen geçerliydi" demektir. Yanlış bir `WHERE`
  yazsan da aynı sessizlikle karşılaşırsın.

**4b. Neden Satranç'ı sildik de Robotik'i silmedik?**
```sql
DELETE FROM clubs WHERE id = 1;
```
- Sonuç: komut çalışmaz, hata verir:

```
HATA: update or delete on table "clubs" violates foreign key constraint
      "club_memberships_club_id_fkey" on table "club_memberships"
DETAY: Key (id)=(1) is still referenced from table "club_memberships".
```

- Gözlem: Robotik kulübünün 4 üyesi var ve bu üyelikler `club_memberships` tablosunda duruyor.
  Robotik silinseydi, o 4 üyelik **var olmayan bir kulübü** işaret ediyor olurdu. Veritabanı
  buna izin vermiyor ve seni durduruyor. Satranç'ın ise hiç üyesi yok, o yüzden silinebildi.
  Bu koruma mekanizmasını G.4'te tekrar göreceğiz, orada adını da koyacağız.

**Örnek 5 (`ALTER`: yapıyı değiştirir, veriye dokunmaz)**
- Sorgu:
```sql
ALTER TABLE clubs ADD COLUMN aciklama text;
SELECT id, name, founded_year, aciklama FROM clubs WHERE id = 1;
```
- Sonuç:

| id | name    | founded_year | aciklama |
|----|---------|--------------|----------|
| 1  | Robotik | 2015         | *NULL*   |

- Ne anlıyoruz? Tabloya 4. bir sütun eklendi. Satır sayısı değişmedi, var olan veri bozulmadı,
  ama artık her satırda bir `aciklama` alanı var ve hepsi boş (`NULL`), çünkü henüz kimse bir
  şey yazmadı. `ALTER` içeriğe değil **yapıya** dokunur.

**5a. Eklediğin sütunu geri alabilir misin?**
```sql
ALTER TABLE clubs ADD COLUMN aciklama text;
ALTER TABLE clubs DROP COLUMN aciklama;
SELECT id, name, founded_year FROM clubs WHERE id = 1;
```
- Sonuç:

| id | name    | founded_year |
|----|---------|--------------|
| 1  | Robotik | 2015 |

- Gözlem: Sütunu ekledik, sonra sildik, tablo eski haline döndü. Ama dikkat: burada sütun boştu.
  Eğer o sütunda **veri olsaydı**, `DROP COLUMN` o verinin tamamını da götürürdü ve geri
  getiremezdin. `ALTER` masum görünür, çünkü satır saymaz; oysa bir sütunu düşürmek, o sütundaki
  bütün satırların değerini silmektir.

> Bu beş örnekte `TRUNCATE` ve `DROP` yok, çünkü onlar en tehlikeli uçta ve kendi dersleri var:
> G.4. Orada ikisini de göreceğiz.

### Sık hatalar & uyarılar
- "Her komut SELECT gibi masumdur" sanmak. Değil. UPDATE/DELETE/DROP veriye kalıcı dokunur.
- Gerçek bir veritabanında "önce dene, olmazsa geri alırım" diye düşünmek. Çoğu zaman geri alamazsın.

### Anlama soruları

**Soru 1 (çoktan seçmeli).** Aşağıdakilerden hangisi tabloyu DEĞİŞTİRMEZ, sadece okur?
- A) `DELETE FROM students;`
- B) `UPDATE students SET city = 'İzmir';`
- C) `SELECT * FROM students;`
- D) `DROP TABLE students;`

> **İpucu:** Hangisi sonuç üretir ama veriye dokunmaz?

> **Detaylı cevap:** Doğru cevap **C**. `SELECT` salt okur; tabloyu olduğu gibi bırakır, sana bir
> sonuç kümesi gösterir (Ü0.4). Diğer üçü tehlikelidir: A tüm öğrenci satırlarını siler, B tüm
> öğrencilerin şehrini İzmir yapar (WHERE yok!), D ise `students` tablosunu komple yok eder. Bu üçü
> gerçek bir veritabanında geri dönülmez hasar verebilir. Bu yüzden sol-dünya (SELECT) ile sağ-dünya
> (değiştiren/yok eden) ayrımını her zaman aklında tut.

### Çıkış bileti
`SELECT` ile `DELETE` arasındaki en temel fark nedir?

---

## Ders G.2 — En sık felaket: WHERE'siz UPDATE ve DELETE

### 🧑‍🏫 Öğretmen için
Bu dersi canlı ve dramatik yap. Tahtaya yaz: `DELETE FROM enrollments;` Sınıfa sor: "Bu kaç satır
siler?" (Hepsini, 20'yi.) Sonra editörde GERÇEKTEN çalıştır, `SELECT COUNT(*)` ile 0 olduğunu göster,
sınıf "aaa" desin, sonra "↺ Sıfırla" bas, geri gelsin. Bu an unutulmaz olur. Mesaj: "WHERE'i unutmak,
'şu öğrenciyi sil' derken 'tüm öğrencileri sil' demektir."
- Altın kural (tahtaya büyük yaz): **"UPDATE/DELETE yazmadan önce, aynı WHERE ile bir SELECT çalıştır,
  kaç satırı etkileyeceğini gör."**
- Sor: "Önce hangi 3 öğrenciyi sileceğimi nasıl görürüm?" (Aynı WHERE ile SELECT.)
- Herkes burada takılır: heyecanla WHERE'siz çalıştırırlar. Refleks haline getir: "WHERE nerede?"

### Konu anlatımı
`DELETE` ve `UPDATE` bir `WHERE` ile hangi satırlara dokunacağını belirler. **WHERE'i yazmazsan,
komut TÜM satırlara uygulanır.** Bu, en sık ve en pahalı SQL hatasıdır.

Önce iki komutun yazılışına yakından bakalım:

```sql
DELETE FROM tablo WHERE koşul;
--     ^^^^^^^^^^ ^^^^^^^^^^^^
--     nereden     kimi  (bu kısmı yazmazsan: HEPSİNİ)

UPDATE tablo SET sütun = değer WHERE koşul;
--     ^^^^^ ^^^^^^^^^^^^^^^^^ ^^^^^^^^^^^^
--     neyi   neyi ne yapacağız  kimi (bu kısmı yazmazsan: HEPSİNİ)
```

Dikkat et: `WHERE` her iki komutta da **cümlenin sonunda ve isteğe bağlı**. SQL sana "WHERE'i
unuttun" demez, çünkü WHERE'siz `DELETE` de geçerli bir cümledir; sadece anlamı "hepsini sil"
olur. İşte tehlike tam burada: yazım hatası değil, **anlam** hatası. Bilgisayar seni uyarmaz,
komutu sessizce ve eksiksiz uygular.

Bir de şunu fark et: `WHERE` kullandığın koşul, Ü2'de öğrendiğin koşulun aynısı. Yani yeni bir
şey öğrenmiyorsun; bildiğin `WHERE`'i bu sefer okumak için değil, **silmek ve değiştirmek** için
kullanıyorsun. Aynı araç, çok daha ağır sonuç.

Güvenli alışkanlık, üç adım:
1. **Önce prova:** Silmek/değiştirmek istediğin satırları, aynı WHERE ile bir `SELECT` yazıp gör.
2. **Kaç satır?** Beklediğin sayı mı? (3 öğrenci silecektim ama SELECT 14 gösteriyorsa, WHERE yanlış.)
3. **Sonra uygula:** Aynı WHERE ile `DELETE`/`UPDATE`.

```sql
-- 1) ÖNCE PROVA: kimi sileceğim?
SELECT * FROM enrollments WHERE student_id = 7;

-- 2) Beklediğim satırlar mı? Evetse:
DELETE FROM enrollments WHERE student_id = 7;
```

> Mini slogan: **WHERE'siz UPDATE/DELETE = "hepsine yap" demektir. Silmeden önce aynı WHERE ile SELECT çek.**

### Çözümlü örnekler

**Örnek 1 (felaket, sandbox'ta güvenle)**
- Ne oluyor? WHERE unutulursa.
- Sorgu:
```sql
SELECT COUNT(*) FROM enrollments;   -- 20
DELETE FROM enrollments;            -- WHERE yok: HEPSİ silinir
SELECT COUNT(*) FROM enrollments;   -- 0
```
- Ne anlıyoruz? `DELETE FROM enrollments;` 20 kaydın hepsini sildi. Gerçek hayatta bu felaket olurdu.
  Burada güvendeyiz: **↺ Sıfırla** ile 20 kayıt geri gelir. Şimdi sıfırla ve doğrusunu yap.

**Örnek 2 (doğru yol: önce prova, sonra hedefli sil)**
- Sorgu:
```sql
-- prova: Ali Vural'ın (id 7) kayıtları
SELECT * FROM enrollments WHERE student_id = 7;   -- 1 satır görünür
-- beklediğim buysa:
DELETE FROM enrollments WHERE student_id = 7;     -- sadece o 1 satır silinir
```
- Ne anlıyoruz? Önce SELECT ile tam olarak neyi sileceğimizi gördük (1 satır), sonra aynı WHERE ile
  sildik. Sürpriz yok. (Bitince sıfırla.)

**Örnek 3 (UPDATE'te aynı tuzak)**
- Ne yapmak istiyoruz? Ali Vural (id 7) Bursa'dan İzmir'e taşındı, sadece onun şehrini güncelleyeceğiz.
- Sorgu (YANLIŞ, WHERE yok):
```sql
UPDATE students SET city = 'İzmir';
SELECT DISTINCT city FROM students;
```
- Sonuç:

| city  |
|-------|
| İzmir |

- Ne anlıyoruz? Tek satır döndü, çünkü artık **14 öğrencinin hepsi İzmirli.** Ankara'lılar,
  Bursa'lılar, hatta şehri boş (`NULL`) olan 3 öğrenci bile İzmir oldu. Tek bir öğrenciyi
  güncellemek isterken tüm tabloyu ezdik. (Şimdi ↺ Sıfırla.)

- Sorgu (DOĞRU, önce prova sonra hedefli):
```sql
-- 1) prova: kimi güncelleyeceğim?
SELECT id, first_name, last_name, city FROM students WHERE id = 7;
-- 2) beklediğim kişi mi? Evetse uygula:
UPDATE students SET city = 'İzmir' WHERE id = 7;
-- 3) doğrula:
SELECT id, first_name, last_name, city FROM students WHERE id = 7;
```
- Sonuç (1. adım, prova):

| id | first_name | last_name | city  |
|----|------------|-----------|-------|
| 7  | Ali        | Vural     | Bursa |

- Sonuç (3. adım, doğrulama):

| id | first_name | last_name | city  |
|----|------------|-----------|-------|
| 7  | Ali        | Vural     | İzmir |

- Ne anlıyoruz? Aynı komut, tek farkla: `WHERE id = 7`. Bu sefer 14 satır değil 1 satır etkilendi,
  ve etkilenenin kim olduğunu **daha uygulamadan önce** gördük. Aradaki fark bir satır kod, sonucu
  ise 13 öğrencinin verisi.

### Sık hatalar & uyarılar
- WHERE'i unutmak. En pahalı hata. Refleksin "WHERE nerede?" olsun.
- Provayı atlamak. Silmeden/değiştirmeden önce aynı WHERE ile SELECT, kaç satır göreceğine bak.
- Yanlış WHERE (örn. `WHERE id = 9` yerine `WHERE id > 9`). Prova bunu da yakalar.

### Anlama soruları

**Soru 1 (tahmin et).** `DELETE FROM students WHERE city = 'Bursa';` kaç satırı siler? (Bursa'da Ali
Vural ve Emre var.)
> **İpucu:** Önce aynı WHERE ile SELECT düşün.

> **Detaylı cevap:** **2 satır** siler (Ali Vural id 7, Emre id 12). Çünkü `WHERE city = 'Bursa'`
> sadece Bursa'lı öğrencileri hedefler. Bunu silmeden önce `SELECT * FROM students WHERE city =
> 'Bursa';` ile prova etsen, tam olarak bu 2 satırı görür ve "evet, bunları silmek istiyorum" diye
> emin olurdun. Eğer yanlışlıkla `WHERE`'i hiç yazmasaydın, 14 öğrencinin hepsi silinirdi. Prova
> alışkanlığı işte bu farkı yakalar.

**Soru 2 (hata avı).** Bir öğrenci "sadece 9. öğrencinin bursunu sıfırlamak" istedi, şunu yazdı ve tüm
öğrencilerin bursu sıfırlandı. Hata ne, doğrusu ne?
```sql
UPDATE students SET scholarship_amount = 0;
```
> **İpucu:** Hangi satırlara uygulandı? WHERE var mı?

> **Detaylı cevap:** Hata: `WHERE` yok. WHERE olmadan `UPDATE`, tablodaki **tüm** satırlara uygulanır;
> bu yüzden 14 öğrencinin hepsinin bursu 0 oldu. Doğrusu hedefi WHERE ile belirtmek:
> ```sql
> -- önce prova:
> SELECT * FROM students WHERE id = 9;
> -- doğruysa:
> UPDATE students SET scholarship_amount = 0 WHERE id = 9;
> ```
> Böylece sadece 9. öğrenci (Burak) etkilenir. Genel kural: bir `UPDATE` ya da `DELETE` yazarken,
> cümleyi `WHERE` olmadan ASLA bitmiş sayma; ve uygulamadan önce aynı WHERE ile bir SELECT çekip kaç
> satır geleceğini gör. (Sandbox'ta zaten Sıfırla var ama bu alışkanlığı gerçek hayat için kazan.)

### Çıkış bileti
Bir `DELETE` çalıştırmadan önce hangi tek adımı yaparak felaketi önlersin?

---

## Ders G.3 — Transaction kalkanı: BEGIN, ROLLBACK, COMMIT

### 🧑‍🏫 Öğretmen için
"Ya WHERE'i doğru yazdığını sandın ama yine de yanlışsa? İşte bir güvenlik ağı daha: transaction."
Benzetme kullan: "BEGIN, 'kalemle yazmaya başla' demek; COMMIT 'mürekkeple sabitle'; ROLLBACK
'sildim, hiç olmadı'." Canlı göster: BEGIN, sil, SELECT ile gittiğini gör, ROLLBACK, geri geldi.
- Sor: "ROLLBACK'ten sonra veri geri geldi mi?" (Evet, COMMIT etmediğimiz için.)
- Uyarı: "COMMIT dersen artık kalıcı; ROLLBACK'in penceresi kapanır."
- Bu, "geri al" tuşunun SQL'deki hali; ama sadece COMMIT'ten önce çalışır.

### Konu anlatımı
Bir **transaction** (işlem), birkaç komutu "ya hep ya hiç" paketine koyar:
- `BEGIN;` işlemi başlatır.
- Komutlarını çalıştırırsın (DELETE, UPDATE...). Değişiklikler henüz **geçici**.
- `COMMIT;` dersen değişiklikler **kalıcı** olur.
- `ROLLBACK;` dersen tüm değişiklikler **geri alınır**, hiç olmamış gibi.

Yazılışı çok basit, üç komutun da parametresi yok:

| Komut | En basit hali | Ne yapar |
|-------|---------------|----------|
| `BEGIN` | `BEGIN;` | İşlemi başlatır, bundan sonrası geçici |
| `COMMIT` | `COMMIT;` | Yapılanları kalıcı yapar, işlemi kapatır |
| `ROLLBACK` | `ROLLBACK;` | Yapılanları iptal eder, işlemi kapatır |

Kalıbı hep aynı, ezberlenecek tek şey bu:

```sql
BEGIN;                    -- 1) kalkanı aç
  DELETE FROM ... ;       -- 2) tehlikeli işi yap
  SELECT ... ;            -- 3) sonucu KONTROL ET
COMMIT;                   -- 4a) doğruysa sabitle
-- ya da
ROLLBACK;                 -- 4b) yanlışsa hiç olmamışa çevir
```

Bu, tehlikeli bir işlemi yapmadan önce bir güvenlik ağı kurmanı sağlar: BEGIN ile başla, yap,
SELECT ile sonucu kontrol et; iyiyse COMMIT, kötüyse ROLLBACK.

3. adımı atlama. Kontrol etmeden COMMIT dersen, transaction seni korumamış olur; sadece felaketi
bir komut geciktirmiş olursun.

```sql
BEGIN;
DELETE FROM clubs WHERE id = 3;     -- Satranç kulübünü sildim
SELECT * FROM clubs;                -- kontrol: gitti mi? doğru olan mı gitti?
ROLLBACK;                           -- fikrim değişti / yanlış oldu: geri al
SELECT * FROM clubs;                -- Satranç geri geldi, 5 kulüp
```

#### Ya sadece SON adımı geri almak istersen? SAVEPOINT

`ROLLBACK` sert bir araçtır: transaction içinde ne yaptıysan **hepsini** siler. Ama uzun bir
işlemde bazen sadece son adım yanlış gider ve öncekileri korumak istersin. `SAVEPOINT` tam
bunun içindir: transaction'ın içine **ara kayıt noktaları** koyarsın.

| Komut | Ne yapar |
|-------|----------|
| `SAVEPOINT ad;` | Bu noktaya bir işaret koyar |
| `ROLLBACK TO SAVEPOINT ad;` | Sadece o işaretten SONRASINI geri alır, öncesi kalır |
| `RELEASE SAVEPOINT ad;` | İşareti siler (artık o noktaya dönemezsin) |

Adım adım izleyelim. `clubs` tablosunda 5 kulüp var:

```sql
BEGIN;
DELETE FROM clubs WHERE id = 3;                                  -- 1. adım: Satranç gitti
SAVEPOINT sp1;                                                    -- buraya işaret koy
INSERT INTO clubs (id, name, founded_year) VALUES (6,'Tiyatro',2024);  -- 2. adım
ROLLBACK TO SAVEPOINT sp1;                                        -- sadece 2. adımı geri al
COMMIT;                                                           -- 1. adım kalıcı olur
```

Her adımda tablo şöyle:

| Adım | clubs tablosu |
|------|---------------|
| başlangıç | Robotik, Müzik, **Satranç**, Fotoğrafçılık, Girişimcilik |
| 1. adım (DELETE) | Robotik, Müzik, Fotoğrafçılık, Girişimcilik |
| 2. adım (INSERT) | Robotik, Müzik, Fotoğrafçılık, Girişimcilik, **Tiyatro** |
| `ROLLBACK TO sp1` | Robotik, Müzik, Fotoğrafçılık, Girişimcilik |
| `COMMIT` | Robotik, Müzik, Fotoğrafçılık, Girişimcilik *(kalıcı)* |

- Gözlem: `ROLLBACK TO sp1` sadece Tiyatro'yu geri aldı; Satranç'ın silinmesi **korundu** ve
  `COMMIT` ile kalıcı oldu.
- Karşılaştır: aynı adımların sonunda düz `ROLLBACK;` yazsaydın **ikisi de** geri alınırdı ve
  Satranç geri gelirdi (5 kulüp). Fark tam olarak budur.

Ne zaman işine yarar? Uzun bir veri düzeltme işleminde: 50 kaydı düzelttin, 51.'de hata yaptın.
`ROLLBACK` desen 50'sini de kaybedersin; `SAVEPOINT` koymuş olsaydın sadece son adımı atardın.

> Mini slogan: **`ROLLBACK` her şeyi siler, `ROLLBACK TO SAVEPOINT` yalnızca işaretten sonrasını.**

> Mini slogan: **BEGIN ile başla, ROLLBACK ile geri al, COMMIT ile sabitle. ROLLBACK sadece COMMIT'ten önce kurtarır.**

### Çözümlü örnekler

**Örnek 1 (geri alma)**
- Sorgu (yukarıdaki). Ne anlıyoruz? `DELETE` çalıştı ama `BEGIN` içinde olduğu için kalıcı değildi;
  `ROLLBACK` her şeyi eski haline getirdi. Transaction, "emin değilsem önce deneyip geri alabilirim"
  imkânı verir.

**Örnek 2 (sabitleme)**
- Sorgu:
```sql
BEGIN;
UPDATE students SET scholarship_amount = 6000 WHERE id = 1;  -- Ayşe'ye zam
SELECT scholarship_amount FROM students WHERE id = 1;        -- 6000, doğru
COMMIT;                                                       -- artık kalıcı
```
- Ne anlıyoruz? Kontrol ettik, doğruydu, `COMMIT` ile sabitledik. Artık `ROLLBACK` işe yaramaz, karar
  kesinleşti. (Sandbox'ta yine de Sıfırla seed'e döndürür.)

### Sık hatalar & uyarılar
- `BEGIN` açıp `COMMIT` ya da `ROLLBACK` ile kapatmayı unutmak. İşlem açık kalır.
- COMMIT'ten sonra ROLLBACK beklemek. COMMIT kalıcıdır; geri alma penceresi kapanmıştır.

### Anlama soruları

**Soru 1 (tahmin et).** Şu adımların sonunda `students` tablosunda kaç satır olur?
```sql
BEGIN;
DELETE FROM students;     -- 14 satır gitti gibi görünür
ROLLBACK;
SELECT COUNT(*) FROM students;
```
> **İpucu:** ROLLBACK ne yapar?

> **Detaylı cevap:** **14.** `DELETE FROM students;` işlem içinde tüm satırları sildi, ama bu
> değişiklik henüz geçiciydi (BEGIN içindeydik, COMMIT etmedik). `ROLLBACK;` tüm transaction'ı geri
> aldığı için silme hiç olmamış gibi olur ve 14 öğrenci geri gelir. Eğer `ROLLBACK` yerine `COMMIT`
> yazsaydık, 0 satır kalırdı (silme kalıcı olurdu). Transaction'ın gücü tam burada: COMMIT'e kadar her
> şey "kurşun kalemle", istediğin an silebilirsin.

**Soru 2 (kavram).** `COMMIT` ile `ROLLBACK` arasındaki fark nedir?
> **İpucu:** Biri sabitler, biri geri alır.

> **Detaylı cevap:** `COMMIT`, transaction içinde yaptığın tüm değişiklikleri **kalıcı** yapar; artık
> geri alınamaz. `ROLLBACK` ise transaction içinde yaptığın tüm değişiklikleri **iptal eder**, veri
> BEGIN'den önceki haline döner. İkisi de transaction'ı kapatır. Pratikte: tehlikeli bir işlemi
> `BEGIN` ile sarıp yaparsın, `SELECT` ile kontrol edersin; sonuç doğruysa `COMMIT`, yanlışsa
> `ROLLBACK`. Bu, "önce gör, sonra karar ver" güvenliği sağlar. (Tam detay Ü11.)

### Çıkış bileti
Yanlış bir `DELETE` yaptın ama henüz `COMMIT` etmedin. Seni ne kurtarır?

---

## Ders G.4 — Yok etmek: DROP ve TRUNCATE (geri dönüşü yok)

### 🧑‍🏫 Öğretmen için
"DELETE satırları siler ama tablo durur. DROP ise tabloyu komple yok eder, sütunlarıyla birlikte.
TRUNCATE ise tüm satırları bir anda, çok hızlı boşaltır." Tahtaya farkı çiz.
- **Canlı demoda sıra önemli, çünkü ilk komut BİLEREK hata verecek:** önce `DROP TABLE events;`
  çalıştır. Reddedilir ("cannot drop table events because other objects depend on it"). Sınıfa sor:
  "Veritabanı bizi neden durdurdu?" Cevap: `event_attendance` bu tabloya bağlı, o satırlar sahipsiz
  kalırdı. Sonra `SELECT COUNT(*) FROM events;` ile tablonun hâlâ yerinde olduğunu göster (4).
  Ardından hatanın ipucunu okut ve `DROP TABLE events CASCADE;` çalıştır; şimdi `SELECT` "relation
  events does not exist" der, sınıf görsün, Sıfırla ile geri gelsin.
- Bu iki adımlı demo tek adımlıdan çok daha değerli: çocuk hem DROP'un yıkıcılığını hem de
  veritabanının onu korumaya çalıştığını görüyor. Vurgu: "`CASCADE` yazmak, kemer takmamayı
  seçmektir."
- Uyarı (büyük yaz): "DROP ve TRUNCATE genelde transaction'la bile zor kurtarılır; gerçek hayatta
  bunları çalıştırmadan önce iki kez düşün, yedek al."
- Sor: "DELETE ile DROP arasındaki fark ne?" (DELETE satır siler/tablo kalır; DROP tabloyu yok eder.)

### Konu anlatımı
- `DELETE FROM tablo;` satırları siler ama tablo (yapısı, sütunları) durur. WHERE ile seçici olunur.
- `TRUNCATE tablo;` tablodaki **tüm** satırları bir anda boşaltır (DELETE'ten hızlı, ama topluca, WHERE
  yok). Tablo durur ama bomboş kalır.
- `DROP TABLE tablo;` tabloyu **komple yok eder**: satırlar, sütunlar, yapı, hepsi gider. Artık o tablo
  yoktur.

Üçünü yan yana koyunca fark netleşiyor:

| Komut | En basit hali | Satırlar | Tablonun kendisi | `WHERE` alır mı? |
|-------|---------------|----------|------------------|------------------|
| `DELETE` | `DELETE FROM tablo WHERE koşul;` | seçtiklerin gider | kalır | **evet** |
| `TRUNCATE` | `TRUNCATE tablo;` | hepsi gider | kalır | hayır |
| `DROP` | `DROP TABLE tablo;` | hepsi gider | **yok olur** | hayır |

Yani aşağı doğru indikçe kapsam büyüyor ve kontrolün azalıyor. `DELETE` ile "şu 3 satırı sil"
diyebilirsin; `TRUNCATE` ile sadece "hepsini boşalt" diyebilirsin; `DROP` ile "böyle bir tablo
hiç olmasın" demiş olursun.

#### DROP her zaman çalışmaz: bağlı tablolar onu durdurur

Burada çoğu kişinin şaşırdığı bir şey var. Bir tabloyu DROP etmeye çalıştığında, **başka bir tablo
ona bağlıysa Postgres komutu reddeder.** Kampüs veritabanımızda deneyelim:

```sql
DROP TABLE events;
```
- Sonuç: komut çalışmaz, şu hatayı alırsın:

```
HATA: cannot drop table events because other objects depend on it
DETAY: constraint event_attendance_event_id_fkey on table event_attendance
       depends on table events
İPUCU: Use DROP ... CASCADE to drop the dependent objects too.
```

- Ne anlıyoruz? `event_attendance` tablosu, hangi etkinliğe kimin katıldığını tutuyor ve her satırı
  `events` tablosundaki bir etkinliğe bağlı. Eğer `events` yok olsaydı, `event_attendance`
  içindeki satırlar **var olmayan bir etkinliği** işaret ediyor olurdu. Postgres buna izin vermez
  ve seni durdurur. Bu bir arıza değil, **bir koruma.** (Bu bağlantının adı yabancı anahtar; tam
  konusu Ü12 ve ÜM.)

Postgres'in verdiği ipucu şunu söylüyor: gerçekten ısrar ediyorsan `CASCADE` ekle.

```sql
DROP TABLE events CASCADE;
SELECT * FROM events;
```
- Sonuç: ilk komut bu sefer çalışır, ikincisi hata verir:

```
HATA: relation "events" does not exist
```

- Ne anlıyoruz? `CASCADE`, "bana bağlı olan şeyleri de hallet" demek ve korumayı devre dışı
  bırakır. Artık `events` tablosu gerçekten yok, ona SELECT bile atamıyorsun. Dikkat: `CASCADE`
  burada `event_attendance` **tablosunu silmedi**, sadece ona bağlayan bağlantıyı kaldırdı; ama
  o satırlar artık hangi etkinliğe ait olduğunu söyleyemiyor, yani anlamlarını kaybettiler.

Buradan çıkan ders, bu ünitenin özeti gibi: **veritabanı seni korumaya çalışır, `CASCADE` gibi
kelimeler o korumayı kapatır.** Bir hata mesajı gördüğünde ilk tepkin "nasıl susturarım" değil,
"bu bana ne söylemeye çalışıyor" olsun.

Bunlar "yok edici" uçtur. Gerçek hayatta DROP/TRUNCATE çoğu zaman geri alınamaz (yedekten dönmek
gerekir). Bu yüzden en yüksek dikkat bunlarda. (Tam syntax ve kullanım: Ü12.)

İyi haber: burada kum havuzundayız. DROP'u dene, tabloyu uçur, sonra **↺ Sıfırla** ile geri getir.
Korkuyu değil, "gerçek hayatta bunu yapmadan önce dur ve yedek al" disiplinini öğreniyoruz.

> Mini slogan: **DELETE satır siler (tablo kalır), TRUNCATE hepsini boşaltır, DROP tabloyu yok eder. Üçü de gerçek hayatta geri dönülmez olabilir.**

### Çözümlü örnekler

**Örnek 1 (DROP: önce reddedilir, sonra CASCADE ile geçer)**
- Sorgu (1. deneme):
```sql
SELECT COUNT(*) FROM events;   -- 4 etkinlik var
DROP TABLE events;             -- reddedilir!
SELECT COUNT(*) FROM events;   -- hâlâ 4: tablo yerinde duruyor
```
- Ne anlıyoruz? `DROP TABLE events;` **çalışmadı**, çünkü `event_attendance` tablosu ona bağlı
  (yukarıdaki hata mesajı). Önemli ayrıntı: komut reddedildiği için hiçbir şey değişmedi, tablo
  ve 4 etkinlik yerli yerinde. Postgres yarım iş bırakmadı.

- Sorgu (2. deneme, korumayı kapatarak):
```sql
DROP TABLE events CASCADE;     -- bu sefer çalışır
SELECT COUNT(*) FROM events;   -- HATA: relation "events" does not exist
```
- Ne anlıyoruz? `CASCADE` ile tablo gerçekten yok oldu; artık ona SELECT bile atamıyoruz. Gerçek
  hayatta bu, yedekten dönmeyi gerektiren bir kayıptır. Burada **↺ Sıfırla** ile `events` geri gelir.
- Aklında kalsın: ilk denemede aldığın hata bir engel değil, **son uyarıdı.** `CASCADE` yazarak o
  uyarıyı kendi ellerinle kapattın. Gerçek bir veritabanında `CASCADE` yazmadan önce iki kez düşün.

**Örnek 2 (TRUNCATE vs DELETE)**
- Sorgu:
```sql
TRUNCATE event_attendance;          -- tüm satırlar bir anda gitti, tablo boş ama duruyor
SELECT COUNT(*) FROM event_attendance;  -- 0
```
- Ne anlıyoruz? `TRUNCATE` tablodaki tüm katılım kayıtlarını boşalttı. Tablo hâlâ var (SELECT hata
  vermedi, 0 döndü), ama içi boş. WHERE ile seçici olamazsın; ya hep ya hiç. (Sıfırla ile geri gelir.)

### Sık hatalar & uyarılar
- `DROP` ile `DELETE`'i karıştırmak. DELETE satır siler (tablo kalır); DROP tabloyu yok eder.
- Gerçek bir veritabanında yedeksiz DROP/TRUNCATE çalıştırmak. Önce yedek, sonra iki kez düşün.
- TRUNCATE'i "WHERE ile sınırlarım" sanmak. TRUNCATE topludur, WHERE almaz; seçici silme DELETE iledir.

### Anlama soruları

**Soru 1 (çoktan seçmeli).** `clubs` tablosundaki tüm satırları silmek ama tabloyu (yapısını) korumak
istiyorsun. Hangisi DOĞRU?
- A) `DROP TABLE clubs;`
- B) `DELETE FROM clubs;` (veya `TRUNCATE clubs;`)
- C) `SELECT * FROM clubs;`
- D) `ALTER TABLE clubs;`

> **İpucu:** Tablo kalsın ama içi boşalsın istiyorsun.

> **Detaylı cevap:** Doğru cevap **B**. `DELETE FROM clubs;` (WHERE'siz) tüm satırları siler ama tablo
> yapısı durur; `TRUNCATE clubs;` de aynı sonucu daha hızlı verir. A (`DROP TABLE`) tabloyu komple yok
> ederdi, yapıyı da kaybederdin. C sadece okur, hiçbir şey silmez. D yapıyı değiştirmek içindir
> (örneğin sütun ekleme) ve tek başına bu haliyle anlamsız. Özet: "satırları sil, tablo kalsın" =
> DELETE/TRUNCATE; "tabloyu yok et" = DROP.

**Soru 2 (kavram).** Neden DROP ve TRUNCATE, DELETE'ten daha "tehlikeli" sayılır?
> **İpucu:** Geri alınabilirlik ve kapsam.

> **Detaylı cevap:** Çünkü hem kapsamları geniştir hem de geri alınmaları zordur. `DELETE` seçici
> olabilir (WHERE ile sadece birkaç satır) ve bir transaction içinde ROLLBACK ile geri alınabilir.
> `TRUNCATE` ise tüm satırları topluca boşaltır (WHERE yok) ve birçok sistemde transaction'la bile zor
> kurtarılır; `DROP TABLE` ise tablonun kendisini, yapısıyla birlikte yok eder, geri getirmek için
> genelde yedekten dönmek gerekir. Yani yanlışlık ihtimali daha pahalıdır. Pratik kural: DROP/TRUNCATE
> öncesi mutlaka "emin miyim, yedek var mı?" diye dur. (Sandbox'ta Sıfırla seni korur, gerçek hayatta korumaz.)

### Çıkış bileti
`DELETE FROM clubs;` ile `DROP TABLE clubs;` arasındaki fark nedir?

---

## Pratik (editörde dene)

> Bu pratikte BİLEREK tehlikeli komutlar çalıştıracağız, çünkü kum havuzundayız. Her görevden sonra
> **↺ Sıfırla** ile veriyi geri getir. Amaç: ne olduğunu gözle gör, güvenli alışkanlığı kas hafızası yap.

**P1 (kolay).** [▶ Editörde dene] Önce `SELECT * FROM clubs WHERE id = 3;` ile Satranç kulübünü gör.
Sonra sadece onu sil. Sonra `SELECT * FROM clubs;` ile 4 kulüp kaldığını doğrula. (Bitince Sıfırla.)
> İpucu: Önce prova SELECT, sonra `DELETE ... WHERE id = 3;`.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT * FROM clubs WHERE id = 3;     -- prova: Satranç
> DELETE FROM clubs WHERE id = 3;       -- sadece onu sil
> SELECT * FROM clubs;                  -- 4 kulüp kaldı
> ```
> Hedefli silme: önce gördük, sonra sildik. Sıfırla ile 5'e döner.
> </details>

**P2 (orta, felaketi gör).** [▶ Editörde dene] `enrollments` tablosunda kaç satır olduğunu say.
Sonra WHERE'siz `DELETE` çalıştır, tekrar say. Ne oldu? (Sonra Sıfırla.)
> İpucu: `DELETE FROM enrollments;` WHERE yok = hepsi.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT COUNT(*) FROM enrollments;   -- 20
> DELETE FROM enrollments;            -- WHERE yok!
> SELECT COUNT(*) FROM enrollments;   -- 0
> ```
> 20 kayıt tek komutla gitti. Gerçek hayatta felaket; burada Sıfırla kurtarır. WHERE'in önemini
> hisset.
> </details>

**P3 (orta, transaction).** [▶ Editörde dene] Bir transaction aç, tüm öğrencilerin şehrini 'Test' yap,
SELECT ile gör, sonra ROLLBACK ile geri al. Şehirler eski haline döndü mü?
> İpucu: BEGIN; UPDATE ...; SELECT ...; ROLLBACK;
> <details><summary>Cevap</summary>
>
> ```sql
> BEGIN;
> UPDATE students SET city = 'Test';
> SELECT DISTINCT city FROM students;   -- hepsi 'Test'
> ROLLBACK;
> SELECT DISTINCT city FROM students;   -- eski şehirler geri geldi
> ```
> ROLLBACK, COMMIT etmediğimiz değişiklikleri sildi. Transaction = güvenlik ağı.
> </details>

**P4 (zorlayıcı, DROP ve koruma).** [▶ Editörde dene] Önce `events` tablosunu düz `DROP TABLE` ile
silmeyi dene. Hata alacaksın: hatayı OKU, sana ne söylüyor? Tablo gerçekten gitti mi, kontrol et.
Sonra hatanın ipucundaki yolu kullanarak tabloyu gerçekten sil ve ona SELECT atmayı dene. Bitince Sıfırla.
> İpucu: İlk komut reddedilir çünkü başka bir tablo `events`'e bağlıdır. Hata mesajının son satırı
> sana ne yapman gerektiğini yazıyor.
> <details><summary>Cevap</summary>
>
> ```sql
> DROP TABLE events;             -- REDDEDİLİR: event_attendance buna bağlı
> SELECT COUNT(*) FROM events;   -- 4: komut reddedildiği için tablo yerinde duruyor
>
> DROP TABLE events CASCADE;     -- korumayı kapattık, bu sefer çalışır
> SELECT COUNT(*) FROM events;   -- HATA: relation "events" does not exist
> ```
> İki ders birden: (1) `DROP`, tabloyu yapısıyla birlikte yok eder, `DELETE`'ten farkı bu.
> (2) Veritabanı, bağlı tablolar varken seni durdurur; bu bir arıza değil koruma, ve `CASCADE`
> yazmak o korumayı kendi ellerinle kapatmaktır. Sıfırla seed'i yeniden kurar.
> </details>

**P5 (düşündürücü).** [▶ Editörde dene] Önce `SELECT COUNT(*) FROM students WHERE city = 'İstanbul';`
ile kaç İstanbullu olduğunu gör (4). Sonra "güvenli silme" disipliniyle SADECE İstanbulluları sil.
Sonra toplamı kontrol et (10 kalmalı). (Sonra Sıfırla.)
> İpucu: Prova SELECT'i gördün; aynı WHERE ile DELETE.
> <details><summary>Cevap</summary>
>
> ```sql
> SELECT COUNT(*) FROM students WHERE city = 'İstanbul';  -- 4 (prova)
> DELETE FROM students WHERE city = 'İstanbul';           -- aynı WHERE ile sil
> SELECT COUNT(*) FROM students;                          -- 14 - 4 = 10
> ```
> Önce kaç satır etkileneceğini gördük (4), sonra aynı WHERE ile sildik, sonucu doğruladık (10).
> Bu üç adımlı disiplin (gör, doğrula, uygula) gerçek hayatta seni felaketlerden korur.
> </details>

---

## Ünite G özeti (öğrenciye)
- Komutlar üç dünya: **okuyan** (SELECT, güvenli), **değiştiren** (INSERT/UPDATE/DELETE), **yok eden**
  (DROP/TRUNCATE/ALTER).
- **WHERE'siz UPDATE/DELETE tüm satırlara uygulanır** = en sık felaket. Uygulamadan önce **aynı WHERE
  ile SELECT** çek, kaç satır göreceğine bak.
- **Transaction** güvenlik ağıdır: `BEGIN` ile başla, `ROLLBACK` ile geri al, `COMMIT` ile sabitle.
  ROLLBACK yalnız COMMIT'ten önce kurtarır.
- Her komutun **en basit hali** var ve `WHERE` yalnızca `UPDATE`/`DELETE` alır. `TRUNCATE` ve
  `DROP` hedef seçemez, ya hep ya hiç çalışır.
- **DELETE** satır siler (tablo kalır), **TRUNCATE** hepsini boşaltır, **DROP** tabloyu yok eder.
  DROP/TRUNCATE gerçek hayatta çoğu zaman geri dönülmez; önce yedek, iki kez düşün.
- Bağlı tablo varsa **DROP reddedilir**; bu bir arıza değil, korumadır. `CASCADE` o korumayı kapatır.
  Hata mesajı gördüğünde ilk işin susturmak değil, okumak olsun.
- Burada sandbox + **↺ Sıfırla** var, korkmadan dene; ama disiplini gerçek hayat için kazan.

## 🧑‍🏫 Öğretmen notu (ünite geneli)
Bu ünite bilerek erken (Ü3'ten sonra) ve hafif-orta: amaç öğrenciye DML/DDL'i tam öğretmek değil,
tehlikeyi tanıtmak ve "önce SELECT, WHERE, transaction, yedek" disiplinini kas hafızası yapmak. En
güçlü an, WHERE'siz DELETE'i canlı çalıştırıp her şeyin gittiğini, sonra Sıfırla ile geri geldiğini
göstermek; öğrenciler bunu unutmaz. Tam syntax ve detaylar Ü11 (DML) ve Ü12'de (DDL) gelecek; orada bu
disipline geri atıfta bulun. Sandbox'ın resetlenebilir olması bu üniteyi mümkün kılıyor: gerçek
ortamda asla yaptırmayacağın denemeleri burada güvenle yaptırabilirsin.
