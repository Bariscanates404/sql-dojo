// Kullanıcı dostu SQL hata katmanı (iki kademe).
//   Kademe 1: gerçek Postgres hata mesajı (message + SQLSTATE) — gerçek araçlarda ne
//             görürlerse aynısı; öğrenci önce gerçek hatayla yüzleşir.
//   Kademe 2: anlaşılır Türkçe "ne demek + şunu yap" açıklaması — öğrenci gerçek
//             mesajı çözemezse, butonla açar.
// PGlite'ın fırlattığı DatabaseError, Postgres wire-protokol alanlarını (code, hint, ...)
// taşır; onları okuyup eşliyoruz. Bu modül saf (React/PGlite bağımlılığı yok), hem
// tarayıcı bileşenleri hem de node smoke testi import edebilir.

export interface FriendlyHint {
  /** Kısa, insan dili başlık. Örn "Böyle bir sütun yok". */
  title: string;
  /** Hata ne demek (bir iki cümle, günlük dil). */
  what: string;
  /** Somut "şunu yap" adımı. */
  fix: string;
}

export interface SqlError {
  /** Kademe 1: gerçek Postgres hata mesajı (İngilizce, gerçek araçlardaki gibi). */
  message: string;
  /** SQLSTATE kodu (varsa), örn "42P01". */
  code?: string;
  /** Postgres'in kendi verdiği ipucu (varsa) — bu da gerçek hatanın parçası. */
  dbHint?: string;
  /** Kademe 2: anlaşılır açıklama. Her zaman doludur (bilinmeyen kod -> genel metin). */
  friendly: FriendlyHint;
}

interface RawErr {
  message?: unknown;
  code?: unknown;
  hint?: unknown;
}

function str(v: unknown): string {
  return v == null ? '' : String(v);
}

function readField(e: unknown, key: keyof RawErr): string | undefined {
  if (e && typeof e === 'object' && key in e) {
    const v = (e as RawErr)[key];
    return v == null ? undefined : String(v);
  }
  return undefined;
}

// Hiçbir koda/kalıba uymayan hatalar için genel, yine de eyleme dönük açıklama.
const GENERIC: FriendlyHint = {
  title: 'Bir şeyler ters gitti',
  what: 'Sorgu çalışmadı. Çoğu zaman sebep basittir: bir tablo ya da sütun adı yanlış yazılmış, bir tırnak/parantez eksik, veya komutların sırası bozuk.',
  fix: 'Mesajı soldan sağa oku, tırnak ile parantez dengesini ve tablo/sütun adlarını kontrol et. Şablon: SELECT sütunlar FROM tablo WHERE koşul. Takılırsan "↺ Sıfırla" ile temiz veriye dön.',
};

// SQLSTATE -> anlaşılır açıklama. Öğrencinin en sık gördükleri.
function byCode(code: string): FriendlyHint | null {
  switch (code) {
    case '42P01': // undefined_table
      return {
        title: 'Böyle bir tablo yok',
        what: 'Sorguda yazdığın tablo adını veritabanı bulamadı. Genelde ad yanlış yazılmıştır, ya da o tablo bu evrende yok.',
        fix: 'Tablo adının yazımını kontrol et (örn. students, courses, enrollments). Türkçe karakter/harf hatası olmasın. Emin değilsen "Deneme Tahtası"ndaki tablo listesine bak.',
      };
    case '42703': // undefined_column
      return {
        title: 'Böyle bir sütun yok',
        what: 'Belirttiğin sütunu, sorgudaki tablolarda bulamadı. Ya ad yanlış yazıldı, ya da sütun aslında başka bir tabloda.',
        fix: 'Sütun adını ve hangi tabloya ait olduğunu kontrol et (örn. first_name, department_id). JOIN varsa sütunu tablo.sütun diye nitele. Önce SELECT * ile o tablonun gerçek sütunlarına bakabilirsin.',
      };
    case '42601': // syntax_error
      return {
        title: 'Yazım (syntax) hatası',
        what: 'SQL cümlesinin dil bilgisi bozuk: veritabanı bir yerde beklemediği bir şeyle karşılaştı. Sebep genelde eksik virgül, dengesiz tırnak/parantez, ya da yanlış anahtar kelime sırasıdır.',
        fix: 'Mesajdaki "at or near" ifadesinin işaret ettiği yere bak. Anahtar kelime sırası doğru mu (SELECT ... FROM ... WHERE ...)? Parantez ve tek tırnaklar dengeli mi? Sütunlar arasına virgül koy, sonuncudan sonra koyma.',
      };
    case '42803': // grouping_error
      return {
        title: 'GROUP BY ile uyumsuz sütun',
        what: 'SELECT (ya da ORDER BY) içinde, gruplanmayan ve bir toplama fonksiyonu (SUM/COUNT/AVG...) içinde de olmayan bir sütun var. Grup başına tek satır dönerken veritabanı o sütunun hangi değerini göstereceğini bilemez.',
        fix: 'O sütunu ya GROUP BY listesine ekle, ya da bir toplama fonksiyonuna sar. Kural: SELECT’teki her sütun ya GROUP BY’da olmalı, ya da SUM/COUNT/AVG gibi bir özetin içinde olmalı.',
      };
    case '42702': // ambiguous_column
      return {
        title: 'Belirsiz sütun (iki tabloda da var)',
        what: 'Yazdığın sütun adı, JOIN’lediğin tabloların birden fazlasında bulunuyor; veritabanı hangisini kastettiğini bilemiyor (örn. iki tabloda da id var).',
        fix: 'Sütunu tablo adıyla nitele: students.id gibi. Tablolara alias verdiysen (s, c) alias.sütun kullan.',
      };
    case '42883': // undefined_function
      return {
        title: 'Böyle bir fonksiyon yok (ya da tip uymuyor)',
        what: 'Çağırdığın fonksiyonu, verdiğin argüman tipleriyle bulamadı. Ya fonksiyon adı yanlış, ya da yanlış tipte bir değer verdin (örn. metin beklenen yere sayı).',
        fix: 'Fonksiyon adını ve argüman tiplerini kontrol et. Metin birleştirmek için || ya da CONCAT, tip çevirmek için CAST(x AS INTEGER) kullan.',
      };
    case '42P07': // duplicate_table
      return {
        title: 'Bu tablo zaten var',
        what: 'Oluşturmaya çalıştığın adda bir tablo halihazırda mevcut. Postgres aynı adı ikinci kez yaratmaz.',
        fix: 'Önce eskiyi sil (DROP TABLE ad), ya da CREATE TABLE IF NOT EXISTS kullan, ya da farklı bir ad seç. "↺ Sıfırla" da her şeyi temiz seed’e döndürür.',
      };
    case '42701': // duplicate_column
      return {
        title: 'Aynı sütun adı iki kez',
        what: 'Tablo tanımında (ya da sonuç sütunlarında) aynı adı birden fazla kez kullandın.',
        fix: 'Sütun adlarını tekilleştir; gerekirse AS ile farklı takma adlar ver.',
      };
    case '23505': // unique_violation
      return {
        title: 'Bu değer zaten var (tekrar edemez)',
        what: 'Eklediğin/güncellediğin satır bir UNIQUE ya da PRIMARY KEY kısıtını çiğniyor: o sütunda aynı değer başka bir satırda zaten var.',
        fix: 'Farklı (benzersiz) bir değer kullan. Anahtarın (örn. id) çakışmadığından emin ol. Aynı satırı tekrar ekliyorsan zaten gerek yok.',
      };
    case '23503': // foreign_key_violation
      return {
        title: 'İşaret ettiğin kayıt yok (FOREIGN KEY)',
        what: 'Bir yabancı anahtar (FK) var olmayan bir kaydı gösteriyor. Örneğin olmayan bir kitap_id ile ödünç kaydı açmak, ya da hâlâ bağlı kaydı olan bir satırı silmek. Buna referans bütünlüğü denir.',
        fix: 'Önce işaret edilen ana kaydı ekle (ya da doğru id’yi ver). Silerken sıra: önce bağlı (referans veren) satırlar, sonra ana satır.',
      };
    case '23502': // not_null_violation
      return {
        title: 'Zorunlu sütun boş bırakıldı (NOT NULL)',
        what: 'NOT NULL kısıtlı bir sütuna değer vermeden satır eklemeye/güncellemeye çalıştın. O sütun boş (NULL) olamaz.',
        fix: 'O sütuna bir değer ver. Hangi sütun olduğunu mesajdaki "column ..." kısmı söyler.',
      };
    case '23514': // check_violation
      return {
        title: 'CHECK kuralına takıldı',
        what: 'Girdiğin değer, tabloya konmuş bir CHECK koşulunu sağlamıyor (örn. fiyat >= 0 iken -5 vermek).',
        fix: 'Koşulu sağlayan bir değer gir. Kuralı görmek için tablonun CREATE TABLE tanımına bak.',
      };
    case '22P02': // invalid_text_representation
      return {
        title: 'Değer beklenen tipe çevrilemedi',
        what: 'Bir değeri, sütunun ya da ifadenin tipine dönüştüremedi. En sık sebep: sayı beklenen yere metin vermek, ya da tarih biçimini karıştırmak.',
        fix: 'Değerin tipini kontrol et. Sayıları tırnaksız yaz (tırnakla yazarsan metin sanır). Metinleri tek tırnak içine al. Tarihleri YYYY-AA-GG biçiminde ver.',
      };
    case '22012': // division_by_zero
      return {
        title: 'Sıfıra bölme',
        what: 'Bir bölme işleminde payda 0 oldu. Matematikte olduğu gibi SQL de buna izin vermez.',
        fix: 'Paydanın 0 olabileceği durumu ele al: NULLIF(payda, 0) kullan (payda 0 ise NULL döner, sonuç da NULL olur), ya da 0 olan satırları WHERE ile ele.',
      };
    case '21000': // cardinality_violation
      return {
        title: 'Alt sorgu birden çok satır döndürdü',
        what: 'Tek bir değer beklenen yerde (örn. = (SELECT ...)) alt sorgu birden fazla satır getirdi. Veritabanı hangisini kullanacağını bilemez.',
        fix: 'Alt sorguyu tek satıra indir (bir toplama fonksiyonu ya da LIMIT 1), ya da = yerine IN kullan (bir liste bekliyorsan).',
      };
    default:
      return null;
  }
}

// Kod yoksa ya da eşleşmediyse, mesaj kalıbından yakala (savunma amaçlı; genelde
// PGlite kodu verir ama kod gelmezse de yardımcı olalım).
function byMessage(message: string): FriendlyHint | null {
  const m = message.toLowerCase();
  if (/relation .* does not exist|table .* does not exist/.test(m)) return byCode('42P01');
  if (/column .* does not exist/.test(m)) return byCode('42703');
  if (/must appear in the group by/.test(m)) return byCode('42803');
  if (/is ambiguous/.test(m)) return byCode('42702');
  if (/function .* does not exist/.test(m)) return byCode('42883');
  if (/already exists/.test(m)) return byCode('42P07');
  if (/division by zero/.test(m)) return byCode('22012');
  if (/more than one row/.test(m)) return byCode('21000');
  if (/syntax error/.test(m)) return byCode('42601');
  return null;
}

/** SQLSTATE kodu (ve gerekirse mesaj) -> anlaşılır açıklama. Eşleşme yoksa null. */
export function explainSqlError(code: string | undefined, message: string): FriendlyHint | null {
  if (code) {
    const byC = byCode(code);
    if (byC) return byC;
  }
  return byMessage(message);
}

/** Yakalanan bir hatayı iki kademeli SqlError'a çevir (friendly her zaman dolu). */
export function toSqlError(e: unknown): SqlError {
  const message = readField(e, 'message') || str(e) || 'Bilinmeyen hata';
  const code = readField(e, 'code');
  const dbHint = readField(e, 'hint');
  const friendly = explainSqlError(code, message) ?? GENERIC;
  return { message, code, dbHint, friendly };
}
