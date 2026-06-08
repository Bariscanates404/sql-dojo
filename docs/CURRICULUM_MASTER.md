# SQL Trainer — MASTER Eğitim Tasarımı (sentez)

> Bu doküman üç kaynağın sentezidir: Codex yanıtı (docs/research/codex-response.md),
> ChatGPT 5.5 Pro yanıtı (docs/research/gpt5.5-pro-response.md) ve benim eğitmen görüşüm.
> Dersleri buradaki ilkelere ve şablona göre yazacağız. KOD YAZMADAN ÖNCE tüm dersler bitecek.
> Tarih: 2026-06-07.

## 0. İki kaynağın ortak yargısı (özet)
Her iki kaynak da aynı yerlerde birleşiyor, bu da bize güven veriyor:
- Müfredat omurgası doğru: SELECT -> WHERE -> aggregate -> GROUP BY -> JOIN -> subquery -> DML -> DDL -> ileri.
- Ama büyük üniteleri böl: GROUP BY ayrı, NULL'a özel yer, JOIN'i ikiye böl, ayrı bir "JOIN + aggregate" ünitesi şart.
- NULL, JOIN-grain ve aggregation tek seferlik konu değil, spiral (tekrar tekrar dönen) kavram olmalı.
- Tek tutarlı "kampüs" evreni kullan; içine bilerek edge case'ler göm.
- Değerlendirme: sonuç-kümesi (multiset) karşılaştırması + kavram etiketi kontrolü + öğretici geri bildirim.
- Eğitmen panelinde "başarı sayısı" değil "hangi kavram yanılgısı" gösterilmeli.
- Her ders: tek cümle kavram -> küçük veri -> tahmin ettir -> çalıştır -> yanlış örnek -> pratik -> çıkış bileti.

## 1. Eğitim felsefesi (uygulayacağımız ilkeler)

1. **SQL bir komut listesi değil, veriyle konuşma dilidir.** Öğrenci her sorguda üç soruyu cevaplayabilmeli:
   - Hangi **satırları** istiyorum? (WHERE)
   - Hangi **sütunları** göstereceğim? (SELECT)
   - Sonuç hangi **seviyede / grain**: satır mı, grup mu? (GROUP BY / JOIN)
   Bu "üç soru" tüm müfredatın belkemiği. Her derste buna döneceğiz.

2. **Önce yanlış zihinsel modeli yüzeye çıkar, sonra düzelt.** Öğrenci zaten kafasında bir model
   getiriyor ("tablo Excel gibi sıralı", "= NULL çalışır", "JOIN satır eklemez"). Dersi bu yanlış
   sezgiyle açıp çürütmek, doğrudan doğruyu söylemekten daha kalıcı.

3. **Küçük veri, görünür sonuç.** Her kavram 4-8 satırlık, gözle takip edilebilir tabloyla anlatılır.
   Önce "sence ne döner?" diye tahmin ettir, sonra çalıştır. Tahmin, pasif okumayı aktif düşünceye çevirir.

4. **Gerçek insan ağzı.** Dersler akademik/robotik değil; bir öğretmenin sınıfta anlattığı gibi,
   sıcak, örnekli, ara ara "şuna dikkat", "burada herkes takılır" diyen bir tonda yazılır.

5. **Spiral öğretim.** Zor kavramlar (NULL, grain/çift sayma, aggregation) tek derste bitmez;
   ileri ünitelerde yeni bağlamda geri gelir (bkz. bölüm 4).

6. **Öğretmene cephane.** Her ders, Bariş'in sınıfta söyleyebileceği "konuşma metni" ve
   "burada şunu sorabilirsin" notları içerir. Öğretmen hiçbir zaman "ne anlatsam" demesin.

## 2. Final ünite/ders planı (KİLİTLENDİ)

GPT 5.5 Pro'nun 0-14 planını esas alıyoruz (Codex ile uyumlu, sadece daha ince bölünmüş).
Her ünite 2-5 ders. Her ders şablonu bölüm 5'te.

| # | Ünite | Dersler (taslak) | Kilit kavram |
|---|---|---|---|
| Ü0 | Temeller | Veritabanı/tablo/satır/sütun · İlk SELECT · SELECT * ne zaman · Sonuç kümesi | "SQL tabloyu değiştirmez, cevap üretir" |
| Ü1 | SELECT temelleri | Sütun seçimi · AS (alias) · Hesaplanan sütun · DISTINCT · ORDER BY · LIMIT | Sonucu seçme + şekillendirme |
| Ü2 | WHERE | Karşılaştırma · AND/OR/NOT + parantez · BETWEEN/IN · LIKE/ILIKE · NULL (IS NULL) | Satır eleme; NULL ilk temas |
| Ü3 | İfadeler & tipler | Veri tipleri · metin fonksiyonları · tarih (EXTRACT) · COALESCE · basit CASE | İfade gücü, "geçti/kaldı" etiketi |
| **ÜG** | **Güvenlik: yıkıcı komutlar** (ara ünite, hafif-orta) | Okuyan vs değiştiren/yok eden komutlar · WHERE'siz UPDATE/DELETE felaketi (önce SELECT prova) · transaction kalkanı (BEGIN/ROLLBACK/COMMIT) · DROP/TRUNCATE geri dönüşü yok · sandbox'ta "Sıfırla" ile korkusuz deneme | Tehlikeyi tanı + güvenli alışkanlık |
| Ü4 | Aggregate I | COUNT(*) vs COUNT(col) · SUM/AVG/MIN/MAX · aggregate + NULL | Satırlardan tek özet |
| Ü5 | GROUP BY & HAVING | Grain ("bir satır ne?") · GROUP BY · grup başına aggregate · HAVING · WHERE vs HAVING | Grup başına özet |
| Ü6 | JOIN I | PK/FK & ilişki · ERD okuma · INNER JOIN · LEFT JOIN · ON | Tabloları birleştirme |
| Ü7 | JOIN II | Bir-çok · çok-çok & ara tablo · self join · alias zorunluluğu · satır çoğalması | "JOIN eşleşmeleri listeler" |
| Ü8 | JOIN + Aggregate | grain tekrar · LEFT JOIN + COUNT(col) tuzağı · kategori başına toplam · çift sayma | En kritik kırılma noktası |
| Ü9 | Subquery & küme | scalar subquery · IN · EXISTS/NOT EXISTS · derived table · UNION/INTERSECT/EXCEPT · NOT IN+NULL | "Sorgu içinde sorgu" |
| Ü10 | CTE | WITH · sorguyu adımlara bölme · okunabilirlik · zincirleme CTE | "İsimlendirilmiş ara sonuç" |
| Ü11 | DML & transaction | INSERT · UPDATE · DELETE · RETURNING · BEGIN/COMMIT/ROLLBACK | Veriyi değiştirmek; WHERE'siz tehlikesi |
| Ü12 | DDL & tasarım | CREATE TABLE · veri tipleri · NOT NULL/UNIQUE/CHECK/DEFAULT · PK/FK · ALTER/DROP | "Tablolar nasıl tasarlanır" |
| Ü13 | Window functions | OVER/PARTITION BY · ROW_NUMBER/RANK/DENSE_RANK · running total · LAG/LEAD | "Satır korunur, yanına hesap" |
| Ü14 | View & index (bonus) | VIEW · index nedir · EXPLAIN'e bakış · doğru vs hızlı | Performans sezgisi |

MVP (ilk yayın): Ü0-Ü8. Sonra Ü9-Ü14. (İçerik olarak hepsini önceden yazacağız; kodda fazlı açacağız.)

Sabit kararlar:
- RIGHT/FULL JOIN başlangıçta zorunlu değil; kısa demo olarak Ü7/Ü8'de geçilir. INNER + LEFT derinleşir.
- CASE erken (Ü3), sona bırakılmaz.
- **ÜG (Güvenlik: yıkıcı komutlar)** ara ünitesi Ü3'ten sonra, JOIN'lerden önce gelir (hafif-orta).
  Amaç: tehlikeyi tanı + güvenli alışkanlık (önce SELECT, WHERE, transaction, reset). Tam DML Ü11,
  tam DDL Ü12'de derinleşir. Sandbox resetlenebilir olduğu için DELETE/DROP korkusuzca denenir.
  (Numara yerine "G" verdik ki Ü0-Ü14 numaralandırması ve mevcut çapraz referanslar bozulmasın.)
- Her görev bir veya birden çok **kavram etiketi** taşır (örn: `null-comparison`, `where-vs-having`,
  `left-join-unmatched`, `join-duplication`). Drill motoru ve eğitmen paneli bunları kullanır.

## 3. "Üç soru" omurgası (her derste döner)
- Hangi satırlar? -> WHERE / JOIN ON / HAVING
- Hangi sütunlar? -> SELECT / ifadeler / alias
- Hangi seviye (grain)? -> tek tablo satırı mı, JOIN sonrası eşleşme mi, GROUP BY sonrası grup mu?
Window'da dördüncü: "Satırı koruyup yanına ne ekliyorum?"

## 4. Spiral plan (zor kavramlar geri gelir)

NULL:
1. Ü2 WHERE: IS NULL / IS NOT NULL, `= NULL` neden yanlış.
2. Ü3: COALESCE ile NULL'ı yönetme.
3. Ü4: COUNT(*) vs COUNT(col), AVG NULL'ı saymaz.
4. Ü6/Ü8: LEFT JOIN sonrası eşleşmeyen taraf neden NULL.
5. Ü9: NOT IN + NULL tuzağı, NOT EXISTS güvenli yolu.

Grain / çift sayma:
1. Ü5: "bir satır neyi temsil ediyor" (grup).
2. Ü7: JOIN satır çoğaltır.
3. Ü8: JOIN + aggregate'te çift sayma ve doğru COUNT(col).

Aggregation:
1. Ü4 tüm tablo özeti -> 2. Ü5 grup başına -> 3. Ü8 join sonrası -> 4. Ü13 satır koruyarak (window).

## 5. Ders şablonu (her ders bu yapıda yazılır)

Her ders dosyası şu bölümleri içerir (markdown):

1. **Başlık + meta**: ünite, ders no, slug, kavram etiketleri, ön koşul, kullanılan seed tabloları,
   tahmini süre.
2. **Öğretmen için (talk track)**: 3-6 cümlelik "sınıfta şöyle aç" metni + "şunu sor" + "herkes
   burada takılır" notu. (Bariş'in cephanesi.)
3. **Neden / nerede işime yarar**: kısa, gerçek dünya kancası (motivasyon).
4. **Konu anlatımı**: gerçek insan ağzıyla, yanlış sezgiyi açıp düzelterek, küçük veriyle.
   İçinde 1 "mini slogan" ve gerektiğinde "Sorgu çalışma sırası" hatırlatması.
5. **Çözümlü örnekler (3-5)**: her biri dört parça -> "Ne istiyoruz / Hangi tablolar /
   Sorgu / Sonuçtan ne anlıyoruz". En az biri "önce yanlış/eksik deneme, sonra doğru".
6. **Sık hatalar & uyarılar**: bu derse özel, önleyici mini cümleler.
7. **Anlama soruları (2-3)**: tip (write_sql | multiple_choice | predict | fill_blank),
   prompt, **İpucu**, **Detaylı cevap** (uzun, "mal bile anlasın", adım adım, neden-niçinli).
8. **Pratik görevleri (3-6)**: kademeli (taklit -> transfer -> birleştirme -> tuzaklı).
   Her görevde: prompt, referenceSql, orderMatters, hint1, hint2, detaylı açıklama, kavram etiketi,
   beklenen "common wrong patterns".
9. **Çıkış bileti**: tek cümlelik kavram-kontrol sorusu.

**İnteraktiflik kuralı (kullanıcı isteği):** Her ünite, öğrencinin editörde DENEYECEĞİ bir
"Pratik (editörde dene)" bölümü içerir: kademeli görevler, her birinde [▶ Editörde aç/dene] +
ipucu + (öğrencinin açabileceği) referans çözüm ve açıklama + kavram etiketi. Örneklerde bolca
"önce tahmin et, sonra çalıştır" kullan; veriler küçük ve gözle takip edilebilir olsun; mümkün
olduğunca çok şey editörde çalıştırılıp gözle görülebilsin. Öğrenmesi/anlaması kolay, çok interaktif.

Bilingual: dersleri önce **Türkçe** (gerçek insan ağzı, asıl öğretim dili) yazıyoruz; SQL tablo/
sütun adları İngilizce. İngilizce çeviri sonradan i18n pass'i olarak eklenir. [KARAR: TR-önce, sonra EN.]

## 5b. Rol bazlı görünürlük (ÖĞRETMEN vs ÖĞRENCI) — kullanıcı kuralı
Kullanıcı isteği: "Öğretmen için" notları SADECE öğretmen hesabında görünsün; öğrenci sadece konu
anlatımını görsün. Ayrıca kullanıcı bu öğretmen-notlarını çok sevdi ("öğretmeni içeri sokan örnekler"),
hepsini ZENGİNLEŞTİRECEĞİZ (tahtaya ne yazılır, ne sorulur, hangi hata kasıtlı gösterilir, herkes
nerede takılır, hangi benzetme kullanılır).

İşaretleme kuralı (importer'ın öğrenci sürümünde ÇIKARACAĞI bloklar):
- Başlığı **🧑‍🏫** ile başlayan her bölüm öğretmen-only: `### 🧑‍🏫 Öğretmen için` ve
  `## 🧑‍🏫 Öğretmen notu (ünite geneli)`. Blok, bir sonraki aynı/daha üst seviye başlığa kadar sürer.
- Pratik görevlerinin **referans çözümü** de öğretmen-only (canlı yardım bağlamı).

ÖĞRENCİNİN GÖRDÜĞÜ (öğretmen-only bloklar hariç her şey):
- Neden/nerede işime yarar, Konu anlatımı, Çözümlü örnekler, Sık hatalar & uyarılar,
- Anlama soruları + **İpucu** + **Detaylı cevap** (bunlar tasarım gereği öğrenciye açık, buton arkasında),
- Çıkış bileti, Ünite özeti.

Yani öğrenci tarafı = saf, akıcı bir ders kitabı; öğretmen tarafı = aynısı + sınıf cephanesi.

## 6. Seed evreni: "Kampüs" (tek tutarlı dünya)
Detaylı şema ve veri: content/seed/campus_seed.sql. Özet tablolar:
- students, departments, courses, enrollments (çok-çok + not), instructors
- clubs, club_memberships (ara tablo), events, event_attendance (anti-join)
- products, orders, order_items (kampüs kafesi: SUM/AVG, çift sayma, window)
Bilerek gömülü edge case'ler: NULL şehir, NULL not, siparişi olmayan öğrenci, üyesi olmayan kulüp,
puan eşitliği (RANK için), çok kulüplü öğrenci, iptal sipariş, çok ürünlü sipariş, az kayıtlı bölüm.
Tablo/sütun adları İngilizce; açıklama ve kavram kartları TR+EN.

## 7. Değerlendirme (otomatik geri bildirim mimarisi)
Katman katman (PGlite'ta, client-side):
1. Çalıştı mı? (syntax/runtime/timeout)
2. Şekil doğru mu? (sütun sayısı, adları, tipleri, satır sayısı)
3. Değerler doğru mu? (eksik/fazla satır, yanlış aggregate, **multiset** -> duplicate sayısı, NULL vs 0 vs '')
4. Sıra doğru mu? (yalnız orderMatters=true ise)
5. Kavram hedefi tutuyor mu? (görev "LEFT JOIN ile çöz" diyorsa kontrol; yoksa serbest)
Geri bildirim formatı her zaman: **"Ne doğru? / Ne farklı? / Nereye bak?"**
Örn: "Beklenen 8 satır, sen 11 getirdin. Fazlalar kulüpsüz öğrenciler. LEFT JOIN sonrası WHERE filtreni kontrol et."
Tuzaklar (akılda tut): hard-code'a karşı gizli seed varyantı (faz 2); float toleransı; DML görevlerinde
her görev izole + sonunda reset; referans sorgu tek doğru yol değil (sonucu değerlendir, metni değil).

## 8. Ürün-içi öğretim bileşenleri (kodda hedef)
- "Sorgu çalışma sırası" yan paneli (FROM->WHERE->GROUP BY->aggregate->HAVING->SELECT->ORDER BY->LIMIT).
- "Tahmin et, sonra çalıştır" modu.
- "Sonuç farkı" görselleştirmesi (eksik/fazla/yanlış değer satırları renkli).
- "Mini kavram kartı" (aynı hatayı 2. kez yapınca otomatik açılır).
- "Benzer ama daha kolay" düşüşü (3 başarısız denemede küçük veriyle aynı kavram).
- "DB'yi sıfırla" butonu (her an temiz seed).

## 9. Motivasyon (abartmadan, öğrenmeye bağlı)
- Kavram ustalığı haritası (WHERE %, JOIN % ...), "kaç soru"dan iyi.
- Zayıf konuyu nazikçe geri getirme (spaced repetition).
- Günlük 5 soruluk mini drill (ısınma, zayıf konu, yeni, karışık, iyi-his ile biten).
- "Açıklayarak çöz" (neden HAVING? A/B/C) -> kopyala-yapıştırı kırar.
- Hata koleksiyonu kartları, drill'de geri döner.

## 10. Eğitmen paneli metrikleri (kodda hedef)
- Sınıf kavram ısı haritası (öğrenci x kavram).
- En yaygın hata panosu (=NULL kaç kişi vb.).
- Öğrenci detay: son görevler, deneme sayısı, ipucu kullanımı, en çok 3 hata, ort süre, ilk-denemede
  başarı, son gönderdiği sorgular, beklenenle fark, öğretmen notu.
- (Faz 2) Canlı izleme: kim hangi görevde, durum (yazıyor/hata/3+ deneme/ipucu açtı/geçti/pasif), otomatik
  sınıf uyarısı.
- Soru kalitesi analizi (güçlü öğrenci de takılıyorsa soru kötü).
**İlke: başarıyı değil yanılgıyı göster.** "JOIN bilmiyor" değil, "LEFT JOIN sonrası WHERE ile kayıt kaybediyor".

## 11. Yazım/kalite barı (dersleri nasıl yazacağım)
- Ton: sıcak, net, sınıf havası. Kısa paragraflar. Bol "yani", "şöyle düşün", "dikkat".
- Her soyut kavramın hemen yanında günlük dil karşılığı ve küçük örnek.
- Hiçbir örnek bağlamsız değil; hepsi kampüs evreninden, anlamlı alias'larla.
- Em-dash/en-dash yok (kullanıcı tercihi): virgül/nokta/iki nokta.
- Detaylı cevaplar gerçekten detaylı: adım adım, "neden A değil B", sonuç tablosu dahil.
- Uzunluktan korkma; öğretici olması kısalıktan önemli.

## 12. İçerik üretim sırası ve durum takibi
Sıra: seed -> Ü0 -> Ü1 -> ... -> Ü14. Her ünite ayrı dosya: content/lessons/U0.md, U1.md, ...
Önce Ü0+Ü1 yazılıp kalite/ton onayı alınır, sonra kalanlar üretilir.

| Ünite | Durum |
|---|---|
| Seed (campus) | bitti |
| Ü0 Temeller | bitti |
| Ü1 SELECT | bitti |
| Ü2 WHERE+NULL | bitti |
| Ü3 ifadeler/tipler/COALESCE/CASE | bitti |
| Ü4 Aggregate I | bitti (Pratik bölümlü) |
| Ü5 GROUP BY/HAVING + çalışma sırası | bitti (Pratik bölümlü) |
| ÜG Güvenlik (yıkıcı komutlar) | bitti (Pratik bölümlü) |
| Ü6 JOIN I (INNER/LEFT/anti-join) | bitti (Pratik bölümlü) |
| Ü7 JOIN II (çok-çok/self/grain) | bitti (Pratik bölümlü) |
| Ü8 JOIN+Aggregate (çift sayma, LEFT+COUNT tuzağı) | bitti (Pratik bölümlü) |
| --- MVP içeriği (Ü0-Ü8 + ÜG) TAMAM --- | |
| Ü9 Subquery/EXISTS/küme + NOT IN-NULL | bitti (Pratik bölümlü) |
| Ü10 CTE (WITH) + çift sayma çözümü | bitti (Pratik bölümlü) |
| Ü11 DML (INSERT/UPDATE/DELETE/transaction) | bitti (Pratik bölümlü) |
| Ü12 DDL (CREATE/kısıtlar/PK-FK/ALTER/DROP) | bitti (Pratik bölümlü) |
| Ü13 Window functions | bitti (Pratik bölümlü) |
| Ü14 View & index (bonus) | bitti (Pratik bölümlü) |
| === TÜM ANLATIM ÜNİTELERİ TAMAM (Ü0-Ü14 + ÜG) === | |
| U0-U3 "Pratik (editörde dene)" backfill | bitti |
| ==== TÜM EĞİTİM İÇERİĞİ TAMAM: 15 ders + seed + planlar. Sıradaki: DEVELOPMENT ==== | |

Tüm üniteler "bitti" olmadan KOD YAZILMAYACAK (kullanıcı talebi).
