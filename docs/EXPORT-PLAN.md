# Dışa Aktarma Planı: PDF ve tek dosya HTML

> **Owner kuralı (2026-08-12, bağlayıcı):** Ders sayfalarında "PDF olarak indir" ve "HTML olarak
> indir" olacak. Çocuklara indirip yollanacak, evde çalışsınlar.
>
> Bu özellik kardeş proje `html-dojo` ile **ortak tasarlandı** ve iki projede de birebir aynı
> davranacak. Ortak tasarımın kaynağı: `../html-dojo/docs/PLAN.md` bölüm 6b. Bu doküman sadece
> sql-dojo'ya özgü kısımları ve buradaki uygulama planını taşır.
>
> Durum: PLANLANDI, kod yazılmadı.

---

## 1. Neden

Sınıftaki öğrencinin evde internet erişimi, hesabı veya bilgisayarı olmayabilir. Ders notu elden
gitmeli ve tek başına çalışmalı. Bu, uygulamanın ikinci dağıtım kanalıdır ve öğretmenin günlük
işinde birincisi kadar kullanılır.

---

## 2. En kritik kural: hangi sürüm dışa aktarılıyor

**Dışa aktarma her zaman ÖĞRENCİ sürümüdür ve bu varsayılan sessizce değişemez.**

sql-dojo'da 🧑‍🏫 ile işaretli bölümler ve pratik görevlerinin referans çözümleri öğretmene özeldir
(`src/lib/content/strip-teacher.ts`). Yanlışlıkla öğretmen sürümünü sınıfa yollamak, tüm cevap
anahtarını dağıtmak demektir ve geri alınamaz.

Bu yüzden tek düğme + gizli ayar değil, **üç ayrı düğme:**

| Düğme | İçerik | Dosya adı |
|---|---|---|
| **Öğrenci notu** | 🧑‍🏫 bölümler yok, referans sorgular yok | `U6-join-ogrenci.pdf` |
| **Ödev kağıdı** | Sadece pratik görevleri + boş çalışma alanı, anlatım yok | `U6-join-odev.pdf` |
| **Öğretmen notu** | Her şey, referans sorgular dahil | `U6-join-OGRETMEN.pdf` |

- Öğretmen sürümü dosya adında **büyük harfle** `OGRETMEN` taşır ve her sayfanın alt bilgisinde
  "ÖĞRETMEN KOPYASI, öğrenciyle paylaşmayın" yazar.
- Öğretmen sürümü indirmeden önce tek tıklık onay ister ("Bu kopyada cevaplar var, emin misin?").
- **Ödev kağıdı** ayrı bir çıktıdır çünkü öğretmenin asıl ihtiyacı budur: anlatımı sınıfta yaptı,
  öğrenciye sadece görevleri yollamak istiyor.

**İyi haber:** `strip-teacher.ts` bu işin yarısını zaten yapıyor ve `qa:strip` ile 17 ders üzerinde
gerçekten doğrulanıyor. Dışa aktarma bu modülü yeniden kullanır, yeni bir gizleme mantığı yazılmaz.
Tek SSOT, tek kural.

---

## 3. Üç format

### 3.1 PDF (yazdırılabilir)

Ayrı bir PDF kütüphanesi kullanılmaz. Tarayıcının kendi yazdırma motoru + adanmış bir `print.css`
yeterlidir ve daha iyi sonuç verir.

Gereken print kuralları:
- SQL kod blokları ve sonuç tabloları sayfa ortasından bölünmez (`break-inside: avoid`).
- Ders ve alt ders başlıkları sayfa sonunda yalnız kalmaz (`break-after: avoid`).
- Bağlantıların adresi yanına dipnot olarak basılır.
- Renk yerine tonlama ve kenarlık (siyah beyaz yazıcı varsayımı). Sonuç tablolarındaki `NULL`
  vurgusu renkle değil, italik ve köşeli parantezle gösterilir.
- Gezinme, düğmeler, SQL editörü basılmaz (`@media print { display: none }`).
- Her sayfada alt bilgi: ünite adı, sayfa numarası, sürüm etiketi.
- **Kapak sayfası:** ünite adı, ünite sloganı, öğretmen adı, tarih, "Ad Soyad: ............"
  satırı. Ödev kağıdında zorunlu.

### 3.2 Tek dosya HTML (statik)

Tek bir `.html` dosyası, tamamen kendine yeter: CSS gömülü, dış bağlantı yok. Öğrenci indirir,
çift tıklar, internet olmadan açılır ve düzgün görünür. Telefonda da açılır.

Sonuç tabloları **hazır basılıdır** (dersteki markdown tablolar zaten var ve `qa:lessons` bunları
seed'e karşı kontrol ediyor). Yani öğrenci sorguyu ve sonucunu görür, çalıştıramaz.

### 3.3 Tek dosya HTML (canlı, internet varsa)

sql-dojo ile html-dojo arasındaki **tek gerçek fark burada.**

html-dojo'da motor tarayıcının kendisi olduğu için dışa aktarılan dosya çalışan bir editör
taşıyabiliyor: bir `textarea`, bir `iframe`, otuz satır script. sql-dojo'nun motoru PGlite'tır ve
birkaç megabaytlık bir WASM ikilisidir. Tek dosya HTML'e gömmek pratik değil.

Karar:
- **Varsayılan statik dışa aktarma.** Her zaman çalışır, hiçbir şeye bağımlı değil.
- **İnternet varsa canlı mod (opsiyonel işaret kutusu):** dosya açıldığında PGlite'ı CDN'den çeker
  ve seed'i yükler, öğrenci sorguları gerçekten çalıştırabilir. Çekemezse statiğe düşer ve
  **açıkça söyler:** "Çevrimdışısın, sorgular çalıştırılamıyor, aşağıdaki sonuçlar hazır basılı."
  Sessizce bozulmaz (no-silent-failure).

Yani söz aynı: öğrenci dosyayı indirir, çevrimdışı okur. html-dojo'da alıştırmayı da yapabilir,
sql-dojo'da okuyabilir ve internet varsa çalıştırabilir. Bu fark motorun doğasından geliyor,
tasarım tercihi değil, ve öğrenciye de böyle söylenir.

---

## 4. Kapsam seçimi

| Kapsam | Kullanım |
|---|---|
| Tek alt ders | "Sadece 6.3'ü tekrar et" |
| Tek ünite | Haftalık ders notu |
| Seçili üniteler (paket) | "Ü0-Ü5 arası, ara tatil çalışması" |
| Tüm müfredat | Kitap gibi tek dosya, içindekiler tablosu ile |

Çoklu ünite dışa aktarımında otomatik içindekiler tablosu ve ünite arası sayfa sonu eklenir.

---

## 5. Uygulama notları (sql-dojo'ya özgü)

- Dışa aktarma **istemci tarafında** olur, sunucu gerekmez (proje zaten böyle çalışıyor).
- Kaynak, `public/content/lessons/*.md` dosyasının kendisidir. Aynı markdown, aynı renderer,
  farklı stil. Ayrı bir "export içeriği" tutulmaz (duplikasyon = drift).
- Öğrenci sürümü üretimi: mevcut `stripTeacherSections()`. Ödev kağıdı üretimi için ek bir
  seçici gerekir (sadece `### Pratik (editörde dene)` ve `### Anlama soruları` bölümlerini al).
- `print.css` ayrı bir dosyadır, `globals.css` şişirilmez.
- Dosya adı üretimi tek bir yardımcıda toplanır, üç düğme aynı fonksiyonu farklı sürüm etiketiyle
  çağırır. `OGRETMEN` etiketi bu fonksiyonun içinde zorunludur, çağıranın insafına bırakılmaz.

### Kalite kapısı

`npm run check` zincirine eklenecek:

| Komut | Ne yapar |
|---|---|
| `qa:export` | Her ünite için öğrenci ve ödev sürümü üretilir, çıktıda 🧑‍🏫 başlık **ve** referans sorgu kalmadığı doğrulanır |

Bu, `qa:strip`'in dışa aktarma tarafındaki karşılığıdır ve aynı sebeple vardır: "cevap anahtarı
sızmadı" bir niyet değil, doğrulanabilir bir kısıt olmalı. Elle gözden geçirmeye bırakılırsa bir
gün delinir ve delindiği gün geri alınamaz.

---

## 6. Sıra

Bu özellik mevcut yol haritasında **Supabase'den önce** gelir. Sebebi basit: öğretmenin bugünkü
ihtiyacı bu. Hesap sistemi olmadan da ders notu dağıtılabilir, ama ders notu dağıtılamadan hesap
sisteminin bir anlamı yok.

| Adım | İş |
|---|---|
| 1 | `print.css` + PDF çıktısı (üç sürüm) |
| 2 | Tek dosya HTML (statik, üç sürüm) |
| 3 | Kapsam seçimi (çoklu ünite + içindekiler) |
| 4 | `qa:export` kalite kapısı |
| 5 | Canlı mod (CDN'den PGlite, çevrimdışı geri düşüş) |
