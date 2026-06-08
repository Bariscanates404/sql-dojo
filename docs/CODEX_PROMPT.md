# Codex'e verilecek prompt (eğitmen/ürün modu)

> Bariş bunu Codex'e (veya başka bir modele) yapıştırır. Amaç: SQL'i en iyi nasıl öğretiriz
> sorusuna pedagojik + ürün gözüyle somut fikir, müfredat eleştirisi ve soru şablonları almak.
> Dönüş PLAN.md'ye işlenecek, fikirler birleştirilecek.

---

Sen deneyimli bir SQL eğitmeni ve eğitim ürünü tasarımcısısın. Lise/üniversite seviyesi, çoğu
hiç SQL bilmeyen öğrencilere SQL öğretmek için bir web uygulaması tasarlıyorum. Aşağıda bağlamı
ve mevcut planımı veriyorum. Senden bunu "en iyi nasıl öğretiriz" gözüyle güçlendirmeni istiyorum.

## Bağlam
- Hedef kitle: SQL'e sıfırdan başlayan öğrenciler (Türkçe konuşan; arayüz ve içerik Türkçe + İngilizce).
- Eğitmen (ben) sınıfta canlı ders verecek; uygulama hem ders aracı hem öğrencinin bireysel pratiği.
- Teknik: Tarayıcıda gerçek Postgres (PGlite) ile öğrenci sunucusuz sorgu çalıştırıp anında sonuç görüyor.
  Cevaplar, öğrencinin sorgusu ile referans sorgunun SONUÇ KÜMESİ karşılaştırılarak otomatik değerlendiriliyor.
- Roller: öğretmen + öğrenci. Öğretmen, öğrencinin ilerlemesini ve hatalarını görüyor; ileride canlı izleme.

## Uygulamanın akışı (her ders)
1. Konu anlatımı (sade dil).
2. 3-5 çözümlü örnek (çalıştırılabilir).
3. 2-3 anlama sorusu: her birinde "ipucu" ve "çok detaylı cevap açıklaması" var.
4. Pratik ekranı (serbest sorgu + auto-grade'li görevler).
Ayrıca bir "drill" modu: öğrenci ünite/ders seçer, rastgele sorular gelir (ipucu + cevap + canlı editör).

## Mevcut müfredat taslağım (basitten ileriye, ünite ünite)
- Ü0 Temeller: DB/tablo/satır/sütun kavramı, ilk SELECT.
- Ü1 SELECT temelleri: sütun seçimi, AS, DISTINCT, LIMIT, ORDER BY.
- Ü2 WHERE: karşılaştırma, AND/OR/NOT, BETWEEN/IN, LIKE, NULL.
- Ü3 Aggregate: COUNT/SUM/AVG/MIN/MAX, GROUP BY, HAVING.
- Ü4 JOIN: PK/FK kavramı, INNER, LEFT, RIGHT/FULL, self join.
- Ü5 Subquery + küme işlemleri: subquery çeşitleri, IN/EXISTS, UNION/INTERSECT/EXCEPT.
- Ü6 DML: INSERT/UPDATE/DELETE, transaction.
- Ü7 DDL: CREATE TABLE, veri tipleri, kısıtlar, PK/FK, ALTER/DROP.
- Ü8 İleri: CTE, window functions, CASE, VIEW/indeks kavramı.

## Senden istediklerim (somut ve uygulanabilir olsun)
1. Müfredat eleştirisi: sıralama doğru mu? Hangi ünite bölünmeli/birleşmeli? Eksik kritik konu var mı?
   Başlangıçta öğrencileri en çok zorlayan kavramlar (NULL mantığı, JOIN, GROUP BY vs WHERE farkı,
   window functions) için özel öğretim sırası/önerisi.
2. Her ünite için: öğrencilerin yaptığı EN SIK HATALAR ve bunları daha anlatım aşamasında önleyecek
   mini-açıklama/uyarı fikirleri.
3. Anlama sorusu şablonları: "mal bile anlasın" düzeyinde, ama sıkmadan. İyi bir soru + ipucu +
   detaylı cevap örneği (en az 2 ünite için somut örnek ver).
4. Çözümlü örnek tasarımı: bir örneği gerçekten öğretici yapan nedir? Kötü örnek vs iyi örnek.
5. Pratik/drill görev fikirleri: zorluk kademelendirme, kısmi puanlama, "neredeyse doğru" geri bildirim.
6. Motivasyon/akılda kalıcılık: spaced repetition, zayıf konuları tekrar getirme, ilerleme hissi;
   abartmadan, eğitime hizmet edecek kadar.
7. Seed veri seti önerisi: tek bir tutarlı, tanıdık, eğlenceli evren mi (örn. bir okul/mağaza),
   yoksa üniteye göre değişen setler mi? Hangi tablolar/ilişkiler öğretmeye en uygun?
8. Otomatik değerlendirmenin pedagojik tuzakları: sonuç-kümesi karşılaştırması ne zaman yanıltır,
   nasıl daha adil/öğretici geri bildirim veririz?
9. Eğitmen paneli: bir öğretmenin bir öğrencinin nerede takıldığını anlaması için hangi metrikler/
   görünümler gerçekten faydalı?

Cevabını başlıklar halinde, doğrudan uygulayabileceğim önerilerle ver. Gerekirse müfredatı
yeniden düzenleyip net bir "önerilen ünite/ders planı" olarak da sun.
