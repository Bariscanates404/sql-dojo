# Codex prompt — Soru Bankası + Drill tasarımı (eğitmen/ölçme-değerlendirme/ürün modu)

> Bariş bunu Codex'e (veya ChatGPT Pro'ya) yapıştırır. Amaç: SQL Dojo için 100-200 soruluk,
> üniteye/derse hizalı, otomatik değerlendirilebilir bir SORU BANKASI ve bir DRILL (alıştırma)
> modunu en iyi nasıl kurarız sorusuna pedagojik + ölçme-değerlendirme + ürün gözüyle somut yanıt almak.
> Dönüş, benim (Claude) görüşümle BİRLEŞTİRİLİP planlanacak. Müfredat ve 16 ders ZATEN YAZILDI;
> bu tur sıfırdan içerik değil, mevcut korpusu ölçeklemek/yapılandırmak + drill'i tasarlamak hakkında.

---

Sen kıdemli bir SQL eğitmeni, bir ölçme-değerlendirme (assessment) tasarımcısı ve bir eğitim-ürünü
tasarımcısısın. Aşağıdaki bağlamı dikkatle oku ve sonundaki istekleri **somut, doğrudan uygulanabilir**
biçimde yanıtla. Postgres'e özgü ol; genel laf etme.

## Ürün: SQL Dojo (kısa)
- Türkçe konuşan, çoğu sıfırdan başlayan lise/üniversite öğrencilerine SQL öğreten web uygulaması.
- Pratik motoru tarayıcıda gerçek Postgres (PGlite): öğrenci sunucusuz sorgu çalıştırır, sonucu anında görür.
- Otomatik değerlendirme: öğrenci sorgusunun SONUÇ KÜMESİ ile referans sorgunun sonucu karşılaştırılır
  (metin değil sonuç). Sıra yalnız `orderMatters=true` ise önemsenir.
- Roller: öğretmen (Bariş) + öğrenci. Öğretmen ilerlemeyi/hataları görür.
- Tek tutarlı seed evreni: "Kampüs".

## Kampüs seed şeması (tek dünya, tüm sorular bunun üstünde)
- departments(id, name, faculty)
- instructors(id, first_name, last_name, department_id, title, mentor_id → instructors.id [self-ref])
- students(id, first_name, last_name, city [bazıları NULL], department_id, birth_date, email, scholarship_amount [bazıları NULL], created_at) — 14 öğrenci
- courses(id, code, name, department_id, credits, instructor_id [biri NULL])
- enrollments(student_id, course_id, semester, grade [devam edende NULL; bazı notlar eşit], attendance_rate)
- clubs(id, name, founded_year)
- club_memberships(student_id, club_id, role, joined_at)
- events(id, club_id, title, event_date, capacity)
- event_attendance(event_id, student_id, attended boolean)
- products(id, name, category, price)
- orders(id, student_id, ordered_at, status ∈ completed|cancelled|pending)
- order_items(order_id, product_id, quantity, unit_price)
- Bilerek gömülü edge case'ler: NULL şehir, NULL not (devam eden ders), siparişi olmayan öğrenci,
  üyesi olmayan kulüp, not eşitliği (RANK için), çok kulüplü öğrenci, iptal sipariş, çok kalemli sipariş,
  az kayıtlı bölüm, atanmamış (NULL) eğitmenli ders.

## Müfredat (KİLİTLİ, 16 ders dosyası YAZILDI ve uygulamada render oluyor)
Ü0 Temeller · Ü1 SELECT · Ü2 WHERE(+NULL) · Ü3 ifadeler/tipler/COALESCE/CASE · ÜG Güvenlik
(WHERE'siz DELETE/UPDATE, transaction/ROLLBACK, DROP/TRUNCATE; Ü3'ten sonra) · Ü4 Aggregate I ·
Ü5 GROUP BY/HAVING · Ü6 JOIN I (INNER/LEFT) · Ü7 JOIN II (çok-çok/self/grain/satır çoğalması) ·
Ü8 JOIN+Aggregate · Ü9 subquery/EXISTS/küme · Ü10 CTE · Ü11 DML/transaction · Ü12 DDL ·
Ü13 window · Ü14 view/index.

## ÖNEMLİ: Elimizde ZATEN olan soru korpusu (sıfırdan başlamıyoruz)
16 dersin içinde, markdown olarak, halihazırda şunlar yazılı (ipucu + detaylı cevap + kavram etiketleriyle):
- **~78 "Pratik" görevi** (her derste 3-6 tane; kademeli: taklit → transfer → birleştirme → tuzaklı).
  Her birinde prompt + ipucu + (öğrencinin açabildiği) referans çözüm-SQL + açıklama var. Auto-grade için
  referans sorgu hazıra yakın.
- **~133 "Anlama sorusu"** (write_sql / multiple_choice / predict / fill_blank karışık), ipucu + uzun
  "neden-niçinli" cevap açıklamasıyla.
- **~49 "önce tahmin et, sonra çalıştır"** istemi.
Yani ham madde ~200 soruluk. Sorun: bunlar prose içinde gömülü, yapılandırılmış veri (auto-grade'e hazır
JSON/tablo) değil ve zorluk/kapsam dağılımı bilinçli ölçülmedi.

## Zaten verdiğimiz kararlar (bunları eleştir, ama temel al)
**Soru/pratik şeması (taslak):** `{ type: write_sql|multiple_choice|predict_output|fill_blank,
prompt{tr,en}, hint1, hint2, answerExplanation{tr,en}, referenceSql, orderMatters, choices/correctIndex,
conceptTags[], difficulty, lessonId, commonWrongPatterns[] }`.
**5 katmanlı auto-grade:** (1) çalıştı mı (syntax/runtime/timeout) (2) şekil (sütun sayısı/ad/tip, satır
sayısı) (3) değerler (eksik/fazla satır, **multiset**/duplicate, NULL vs 0 vs '') (4) sıra (yalnız
orderMatters) (5) kavram hedefi (görev "LEFT JOIN ile çöz" diyorsa). Geri bildirim her zaman:
**"Ne doğru? / Ne farklı? / Nereye bak?"**
**"Üç soru" omurgası (etiketleme ekseni):** Hangi satırlar (WHERE/JOIN ON/HAVING) · Hangi sütunlar
(SELECT/ifade/alias) · Hangi grain (satır mı / eşleşme mi / grup mu); window'da +"satırı koruyup yanına ne".
**Sorular modülü (KULLANICI NETLEŞTİRDİ — derslerden AYRI, bağımsız modül):** Üst menüde kendi başlığı
("Sorular" / Questions), derslerin İÇİNDE değil. İçinde ÜNİTE-KAPSAM filtresi (örn. "Ü1-Ü4 arası" seç) +
zorluk/kavram/tip filtreleri; seçilen kapsamdan RASTGELE soru gelir; öğrenci editörde çözer (çalıştır +
ipucu + cevap), sonuç ilerlemeye işlenir. Ayrıca: günlük 5 soruluk mini drill (ısınma/zayıf/yeni/karışık/
iyi-his), zayıf konuları nazikçe geri getirme (spaced repetition), hata koleksiyonu kartları.
**Soru metni NETLİK kuralı (KULLANICI'nın EN ÖNEMLİ isteği):** Her soru ifadesi AŞIRI açık, net, adım adım
ve gerekirse "gereğinden fazla" detaylı olmalı. Öğrenci hangi tablodan, hangi sütunları, hangi koşulla,
hangi sırayla çekeceğini TEREDDÜTSÜZ anlamalı. Kısa/üstü kapalı/akademik dil YASAK. İstenen netlik örneği:
"students tablosundan, şehri (city) İstanbul olan öğrencilerin sadece adını (first_name) ve soyadını
(last_name) çek. Dikkat: city değeri NULL olanlar gelmemeli; sadece bu iki sütun, fazlası değil." Hedef
kitle SQL'e sıfırdan başlıyor; muğlak ifade = anlamazlar.

## Senden istediklerim (somut, Postgres'e özgü, doğrudan uygulanabilir)
1. **Kapsam matrisi:** Ünite ünite, hangi kavramlar × hangi zorluk seviyeleri için kaç soru olmalı ki
   100-200'lük banka hem dengeli hem de "öğreten" olsun? Net bir hedef dağılım tablosu ver (ünite × zorluk ×
   adet). Hangi kavramlar (NULL mantığı, grain/çift sayma, LEFT JOIN+WHERE tuzağı, HAVING vs WHERE,
   COUNT(*) vs COUNT(col), window vs GROUP BY) ekstra ağırlık almalı?
2. **Mevcut korpusu kullanma stratejisi:** Eldeki ~78 görev + ~133 soruyu nasıl en iyi değerlendiririz
   (çıkar → yapılandır)? Hangileri olduğu gibi kalır, hangileri birleştirilir/elenir/yeniden yazılır?
   Bankayı 100-200'e taşırken nereye YENİ soru gerekir (boşluk analizi)?
3. **Soru tipi karışımı:** write_sql / multiple_choice / predict_output / fill_blank / "hatayı bul" /
   "neden böyle açıkla" — her birini ne zaman kullanmalı, önerilen oran nedir, ve hangileri kopyala-yapıştıra/
   yapay zekâ ile kopyaya en dirençli? "Üç farklı doğru çözüm" olan sorularda ne yapmalı?
4. **Zorluk kalibrasyonu ve ilerleme:** Zorluğu nasıl tanımlayıp sıralamalı (taklit→transfer→birleştirme→
   tuzaklı)? Drill bir oturumda soruları hangi sırayla/mantıkla seçmeli?
5. **Bağımsız "Sorular" modülü UX + seçim algoritması:** Derslerden ayrı bu sayfa için somut tasarım:
   ÜNİTE-KAPSAM filtresi (çoklu seçim / aralık, örn. Ü1-Ü4) + zorluk/kavram/tip filtreleri; seçilen kapsamdan
   rastgele çekiş; zayıf-konu ağırlıklandırma + spaced repetition yöntemi (örn. SM-2 sadeleştirmesi?),
   günlük-5 kompozisyonu, oturum uzunluğu + durdurma kuralı. Soru tek tek mi yoksa liste olarak mı sunulmalı?
   Öğrenci "aynı soruları ezberlemesin" diye ne yapmalı?
6. **Büyük bankada auto-grade sağlamlığı:** Çoklu doğru çözüm, ORDER BY belirsizliği (eşitlikte sıra),
   float toleransı, multiset/duplicate, NULL vs 0 vs '', "hard-code" tespiti (gizli seed varyantı mantıklı
   mı?), DML görevlerinde izolasyon + reset. Adil notlama için her soruda hangi metadata gerekir?
7. **Bütünlük / oyunlamayı önleme:** Öğrenci auto-grade'i veya "Cevap" butonunu nasıl suistimal eder, nasıl
   engelleriz? Kısmi puan ve "neredeyse doğru" geri bildirimi nasıl tasarlanır (öğretici, moral bozmayan)?
8. **Soru bankası veri şeması:** Yukarıdaki taslağı eleştirip, uygulamaya + drill seçimine + öğretmen
   analitiğine uygun NET bir JSON/tablo şeması öner (kavram etiketleri, zorluk, ön koşul, commonWrongPatterns,
   kaynak-ders bağı dahil). Versiyonlama/i18n'i nasıl çözeriz?
9. **Ölçekte yazım + KALİTE GÜVENCE iş akışı:** 200 soruya kaliteyle çıkmak için nasıl bir üretim + doğrulama
   akışı? Her sorunun referenceSql'i seed'e karşı otomatik nasıl doğrulanır? Soru kalitesini ölçen bir sinyal
   (güçlü öğrenci de takılıyorsa soru kötü) nasıl tasarlanır? İnceleme rubriği ver.
10. **Tuzaklar / yapmayalım:** Bu tür bir soru bankası + drill'de en sık yapılan tasarım hataları neler?

11. **Soru metni yazım rehberi (netlik rubriği):** Yukarıdaki "aşırı açık" kuralı için somut bir yazım
    rehberi + kontrol listesi ver; ayrıca tipik bir "kısa/muğlak" prompt'u alıp "gereğinden fazla açık"
    haline getiren EN AZ 2 önce/sonra örneği yaz.

Ayrıca **en az 3 tam örnek soru nesnesi** ver (farklı ünite + farklı tip; biri NULL tuzağı, biri JOIN grain,
biri window), önerdiğin şemada, referenceSql + commonWrongPatterns + hint1/hint2 + "Ne farklı?" geri bildirim
örnekleriyle — ve bu örneklerin prompt'ları yukarıdaki AŞIRI NETLİK barını karşılasın. Sonunda, önerdiğin
**bağımsız "Sorular" modülünün yapısını, soru bankası şemasını ve seçim/drill akışını** net bir özetle topla.
Yanıtını başlıklar halinde, doğrudan uygulayabileceğim kararlarla yaz.
