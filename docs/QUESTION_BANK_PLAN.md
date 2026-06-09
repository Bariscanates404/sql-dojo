# Soru Bankası + Sorular Modülü — Sentez & Plan (KİLİTLİ kararlar)

> Codex yanıtı (docs/research/codex-questionbank-response.md) + Claude'un mühendislik/eğitmen görüşü
> birleştirildi. Bu doküman NE YAPACAĞIMIZI kilitler. Tarih: 2026-06-09.

## A. Codex'le tam mutabık olduğumuz çekirdek (temel alıyoruz)
- **"Kaç soru çözdün" değil "hangi kavram oturdu"**: her soru kavram-etiketli, zorluk-kalibreli, versiyonlu.
- Hedef: v1'de **180 yapılandırılmış soru** (Codex'in ünite × D1-D4 matrisi aynen hedef). Sonra varyantlarla 220+.
- D1 taklit / D2 transfer / D3 birleştirme / D4 tuzaklı zorluk ekseni.
- Tip karışımı ~%50 write_sql + kalanı predict_output / multiple_choice / find_bug / fill_blank / explain_why.
- Katmanlı auto-grade + "Ne doğru / Ne farklı / Nereye bak" geri bildirim dili.
- Bağımsız **Sorular** modülü, tek-tek soru akışı, ünite-kapsam filtresi, zayıf-konu + SR ağırlıklı seçim.
- **Aşırı net prompt** kuralı (kullanıcının #1 isteği) + Codex'in netlik rehberi/rubriği.
- Cevap butonu yasak değil; hint1 -> hint2 -> iskelet -> çözüm kademeli; cevap görülürse "mastered" sayılmaz.

## B. Claude'un eklediği/ayrıştığı MÜHENDİSLİK kararları (kod tabanına oturtma)
Codex pedagoji/ürün tarafında güçlü ama bizim kodumuzu bilmiyor. Net kararlar:

1. **Veri yeri:** Sorular `content/questions/<unite>.json` (kaynak doğruluk), Zod ile doğrulanır,
   `public/content/questions/` altına sync edilir (dersler gibi). Tek motor: aynı sync script.
2. **Grading motoru PGlite'ta (client), mevcut `execSql`'i yeniden kullanır.** `compareMode`:
   `set` (sırasız, duplicate yok) / `multiset` (sırasız, duplicate sayılır) / `ordered_multiset` (sıralı).
   Kanonikleştir: satırları stringe çevir, set/multiset'te stabil anahtara göre sırala, ordered'da koru.
3. **`orderMatters` VARSAYILAN false.** Sıra yalnız prompt açıkça "şu sıraya göre sırala" diyor VE
   tie-breaker veriyorsa true. (Codex §10 ile uyumlu: belirsiz sırayı notlama.) Haksız "yanlış" engellenir.
4. **`requiredConcepts` / `forbiddenPatterns` v1 = regex** (normalize edilmiş SQL üstünde; örn. window ->
   `/OVER\s*\(/`, rank -> `/\bRANK\s*\(/`, select_star -> `/SELECT\s+\*/`). Regex yaklaşıktır; sınırları
   belgeli; gerekirse Q2'de AST. Sonuç doğru ama hedef kavram yok -> kısmi puan + "amaç X kullanmaktı".
5. **Hidden-seed grading Q2'ye ERTELENDİ.** Sebep: v1'de tek global PGlite örneğimiz var; varyant seed'e
   karşı çalıştırmak ayrı geçici (ephemeral) PGlite örneği gerektirir. v1 Kampüs seed'ine karşı notlar;
   `forbiddenPatterns` (literal id listesi vb.) en bariz hard-code'u kısmen yakalar. (Şema alanı baştan var.)
6. **Attempt geçmişi + SR LOKAL** (Zustand + persist, roleStore gibi). Böylece Sorular modülü Supabase'i
   BEKLEMEDEN çalışır. Supabase gelince attempt'ler oraya taşınır (öğretmen görünürlüğü için). Mimari ayrım net.
7. **Reuse:** SqlEditor + execSql + sonuç görünümü Faz 0'dan. Soru çözüm ekranı = SqlRunner benzeri ama
   "Çalıştır" yerine "Gönder & değerlendir" + hint kademesi + feedback.
8. **v1 şeması = Codex şemasının pragmatik alt kümesi** (aşağıda). Tam şema hedef; gereksiz alanları baştan
   yazmayız ama isimlendirmeyi Codex'le uyumlu tutarız (ileride genişler).

## C. v1 soru şeması (Zod ile doğrulanacak — Codex şemasının çalıştırılabilir alt kümesi)
```
Question {
  id, version, status('draft'|'ready'), type('write_sql'|'multiple_choice'|'predict_output'),
  lessonId, unit (U0..U14/UG), conceptTags[], difficulty(1..4),
  tr: { title, prompt, hint1, hint2?, answerExplanation },   // EN sonra (i18n pass)
  // write_sql:
  assessment?: { referenceSql, orderMatters(false), compareMode, expectedColumns?[],
                 numericTolerance?, requiredConcepts?[], forbiddenPatterns?[], timeoutMs(2000) },
  // multiple_choice / predict_output:
  choices?: string[], correctIndex?,          // MC
  predictExpectedSql?,                          // predict: referans sorgu sonucu = beklenen çıktı
  commonWrongPatterns?: [{ id, sqlRegex?, feedback }],
  variantFamily?
}
```
Attempt (lokal, v1): `{ questionId, version, type, submittedSql?, choiceIndex?, score(0-1), result('correct'|'partial'|'wrong'|'ran'|'error'), buckets[], hintsUsed, solutionViewed, at }`.

## D. Grading katmanları (write_sql, sırayla)
1. Çalıştı mı (yoksa hata mesajı). 2. Kolon şekli (expectedColumns: eksik/fazla/ad). 3. Değer kümesi
(compareMode'a göre set/multiset; numericTolerance; NULL!=0!=''). 4. Sıra (yalnız orderMatters).
5. requiredConcepts var mı / forbiddenPatterns yok mu. Skor = Codex'in boyut tablosu (çalıştı 10 / şekil 20 /
küme 35 / değer 20 / sıra 10 / kavram 5). Feedback hep "Ne doğru / Ne farklı / Nereye bak" + commonWrongPattern eşleşirse ona özel mesaj.
predict_output: öğrencinin yazdığı beklenen-çıktı tablosu, referans sonuçla kıyas. multiple_choice: correctIndex.

## E. Sorular modülü (/sorular) — v1 UX
- Üst menüye **"Sorular"** eklenir.
- Üstte filtre çubuğu: **ünite-kapsam (çoklu seçim)**, zorluk (D1-D4), tip. (kavram chip'leri + "durum" Q3'te.)
- "Başla" -> tek-tek soru ekranı: prompt (aşırı net) + (write_sql) SqlEditor + [Gönder] + [İpucu] kademeli +
  [Çözümü gör] + sonuç feedback kartı + [Sonraki soru]. MC/predict için uygun giriş.
- Seçim v1: filtre + ağırlıklı rastgele (due + zayıf-kavram + yenilik + son-görülme cezası), lokal istatistikten.
  Tam SR takvimi (yanlış=1g, kısmi=2g, ipuçlu=4g, temiz=7g, üst üste=14g) lokal store'da.
- Günlük-5 / odak-modu Q3.

## F. Fazlama (inşa sırası)
- **Q1 (ŞİMDİ): uçtan uca dikey dilim.** Zod şema + grading motoru (write_sql katmanları + MC + predict) +
  ~12-15 elle yazılmış ÖRNEK soru (netlik barında, Ü1/Ü2/Ü4/Ü8/Ü13 + tipler) + /sorular modülü (filtre +
  tek-tek + hint kademesi + feedback) + lokal attempt store + nav. Node + tarayıcı ile DOĞRULA.
- **Q2: ölçek + kalite.** Markdown'dan çıkarma pipeline'ı (78 görev + anlama soruları -> JSON draft) +
  prompt netlik linter'ı + referenceSql'i seed'e karşı doğrulayan checker (beklenen kolon/satır/hash) +
  180'e tamamlama (boşluk analizi) + review rubriği + hidden-seed grading + find_bug/fill_blank tipleri.
- **Q3: ustalık & öğretmen.** SR takvimi tam + günlük-5 + zayıf-konu ısı haritası + hata kartları +
  öğretmen analitiği (Supabase track'iyle birleşir).

## G. Paralel/pending (değişmedi)
Supabase auth/roller/RLS/ilerleme (dışa dönük, sor) — attempt'leri buraya taşıyınca öğretmen görünürlüğü.
İçerik-QA turu (ders "Sonuç: X" iddiaları). ESLint. Playground kalıyor.
