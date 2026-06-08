-- ============================================================
-- SQL Trainer — "Kampüs" seed evreni (PostgreSQL / PGlite)
-- Tek tutarlı dünya. Tüm dersler ve örnekler bu veriyi kullanır.
-- "DB'yi default'a çek" = bu dosyayı baştan çalıştır.
--
-- Tablo/sütun adları İngilizce (gerçek dünya), veriler Türkçe bağlam.
-- Bilerek gömülü EDGE CASE'ler aşağıda [EDGE] ile işaretli.
-- ============================================================

-- Bağımlılık sırasına göre temizle (tersten)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS event_attendance CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS club_memberships CASCADE;
DROP TABLE IF EXISTS clubs CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS instructors CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- ---------- Bölümler ----------
CREATE TABLE departments (
  id      INTEGER PRIMARY KEY,
  name    TEXT NOT NULL,
  faculty TEXT NOT NULL
);
INSERT INTO departments (id, name, faculty) VALUES
  (1, 'Bilgisayar Mühendisliği', 'Mühendislik'),
  (2, 'Elektrik-Elektronik',     'Mühendislik'),
  (3, 'İşletme',                  'İktisadi ve İdari Bilimler'),
  (4, 'Psikoloji',               'Edebiyat'),
  (5, 'Matematik',               'Fen'); -- [EDGE] az öğrencili bölüm

-- ---------- Öğretim üyeleri (self join için mentor_id) ----------
CREATE TABLE instructors (
  id            INTEGER PRIMARY KEY,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  department_id INTEGER REFERENCES departments(id),
  title         TEXT,
  mentor_id     INTEGER REFERENCES instructors(id) -- [EDGE] self-reference (kendi tablosuna)
);
INSERT INTO instructors (id, first_name, last_name, department_id, title, mentor_id) VALUES
  (1, 'Ayhan', 'Demir',   1, 'Prof', NULL),
  (2, 'Selin', 'Kaya',    1, 'Doç',  1),
  (3, 'Murat', 'Şahin',   2, 'Dr',   NULL),
  (4, 'Elif',  'Yıldız',  3, 'Prof', NULL),
  (5, 'Can',   'Aydın',   4, 'Dr',   4),
  (6, 'Deniz', 'Arslan',  1, 'Doç',  1);

-- ---------- Öğrenciler ----------
CREATE TABLE students (
  id                 INTEGER PRIMARY KEY,
  first_name         TEXT NOT NULL,
  last_name          TEXT NOT NULL,
  city               TEXT,            -- [EDGE] bazıları NULL (bilinmiyor)
  department_id      INTEGER REFERENCES departments(id),
  birth_date         DATE,
  email              TEXT,
  scholarship_amount NUMERIC(8,2),    -- [EDGE] bazıları NULL (burs yok/bilinmiyor)
  created_at         DATE
);
INSERT INTO students (id, first_name, last_name, city, department_id, birth_date, email, scholarship_amount, created_at) VALUES
  (1,  'Ayşe',  'Yılmaz',  'İstanbul', 1, '2003-04-12', 'ayse.yilmaz@kampus.edu',  5000, '2024-09-01'),
  (2,  'Mehmet','Demir',   NULL,       1, '2002-11-30', 'mehmet.demir@kampus.edu', NULL, '2024-09-01'), -- [EDGE] city NULL, burs NULL
  (3,  'Zeynep','Kaya',    'Ankara',   3, '2004-01-22', 'zeynep.kaya@kampus.edu',  3000, '2024-09-02'),
  (4,  'Can',   'Öztürk',  NULL,       2, '2003-07-19', 'can.ozturk@kampus.edu',   NULL, '2024-09-02'), -- [EDGE] city NULL
  (5,  'Elif',  'Şahin',   'İzmir',    4, '2003-03-03', 'elif.sahin@kampus.edu',   4500, '2024-09-03'),
  (6,  'Ali',   'Çelik',   'İstanbul', 1, '2002-05-15', 'ali.celik@kampus.edu',    2000, '2024-09-03'), -- [EDGE] "Ali" #1
  (7,  'Ali',   'Vural',   'Bursa',    2, '2004-08-09', 'ali.vural@kampus.edu',    NULL, '2024-09-04'), -- [EDGE] "Ali" #2 (aynı ad)
  (8,  'Deniz', 'Aksoy',   'Ankara',   3, '2003-12-01', 'deniz.aksoy@kampus.edu',  3500, '2024-09-05'),
  (9,  'Burak', 'Koç',     'İzmir',    1, '2001-10-25', 'burak.koc@kampus.edu',    1500, '2024-09-06'),
  (10, 'Selin', 'Aydın',   'İstanbul', 4, '2004-02-14', 'selin.aydin@kampus.edu',  5000, '2024-09-06'),
  (11, 'Merve', 'Arslan',  NULL,       3, '2003-06-30', 'merve.arslan@kampus.edu', 2500, '2024-09-07'), -- [EDGE] city NULL
  (12, 'Emre',  'Polat',   'Bursa',    2, '2002-09-17', 'emre.polat@kampus.edu',   NULL, '2024-09-08'),
  (13, 'Gizem', 'Yıldız',  'Ankara',   5, '2003-04-12', 'gizem.yildiz@kampus.edu', 4000, '2024-09-09'), -- [EDGE] tek Matematik öğrencisi; kulüpsüz, siparişsiz
  (14, 'Okan',  'Erden',   'İstanbul', 1, '2004-11-05', 'okan.erden@kampus.edu',   NULL, '2024-09-10'); -- [EDGE] kulüpsüz, siparişsiz

-- ---------- Dersler ----------
CREATE TABLE courses (
  id            INTEGER PRIMARY KEY,
  code          TEXT NOT NULL,
  name          TEXT NOT NULL,
  department_id INTEGER REFERENCES departments(id),
  credits       INTEGER,
  instructor_id INTEGER REFERENCES instructors(id) -- [EDGE] biri NULL (atanmamış)
);
INSERT INTO courses (id, code, name, department_id, credits, instructor_id) VALUES
  (1, 'CS101',   'Programlamaya Giriş',  1, 6, 1),
  (2, 'CS201',   'Veri Yapıları',        1, 6, 2),
  (3, 'CS305',   'Veritabanı Sistemleri',1, 5, 6),
  (4, 'EE101',   'Devre Teorisi',        2, 5, 3),
  (5, 'BUS101',  'İşletmeye Giriş',      3, 4, 4),
  (6, 'PSY101',  'Psikolojiye Giriş',    4, 4, 5),
  (7, 'MATH101', 'Kalkülüs I',           5, 6, NULL), -- [EDGE] öğretim üyesi atanmamış
  (8, 'CS210',   'Web Programlama',      1, 4, 2);

-- ---------- Kayıtlar (öğrenci x ders, çok-çok + not) ----------
CREATE TABLE enrollments (
  student_id      INTEGER REFERENCES students(id),
  course_id       INTEGER REFERENCES courses(id),
  semester        TEXT NOT NULL,
  grade           NUMERIC(5,2),   -- [EDGE] devam edenlerde NULL; bazı notlar eşit (RANK için)
  attendance_rate NUMERIC(4,1),
  PRIMARY KEY (student_id, course_id, semester)
);
INSERT INTO enrollments (student_id, course_id, semester, grade, attendance_rate) VALUES
  (1, 1, '2024-Guz', 95.00, 98.0),
  (1, 2, '2025-Bahar', NULL, 90.0),     -- [EDGE] devam ediyor, not yok
  (2, 1, '2024-Guz', 70.00, 75.0),
  (3, 5, '2024-Guz', 85.00, 88.0),      -- [EDGE] 85 ile eşit (bkz. 6 ve 8)
  (4, 4, '2024-Guz', 60.00, 65.0),
  (5, 6, '2024-Guz', 78.00, 80.0),
  (6, 1, '2024-Guz', 85.00, 92.0),      -- [EDGE] 85 eşitlik
  (6, 2, '2024-Guz', 88.00, 85.0),
  (7, 4, '2024-Guz', 55.00, 50.0),      -- [EDGE] düşük not + düşük devam
  (8, 5, '2024-Guz', 85.00, 95.0),      -- [EDGE] 85 eşitlik (3 ve 6 ile)
  (9, 1, '2024-Guz', 92.00, 96.0),
  (9, 3, '2025-Bahar', NULL, 100.0),    -- [EDGE] devam ediyor
  (10, 6, '2024-Guz', 73.00, 70.0),
  (1, 3, '2025-Bahar', NULL, 85.0),     -- [EDGE] devam ediyor
  (2, 8, '2024-Guz', 64.00, 60.0),
  (11, 5, '2024-Guz', 90.00, 91.0),
  (12, 4, '2024-Guz', 48.00, 40.0),     -- [EDGE] kalma sınırı altı
  (13, 7, '2024-Guz', 100.00, 100.0),
  (6, 3, '2025-Bahar', NULL, 80.0),
  (8, 3, '2025-Bahar', 77.00, 82.0);

-- ---------- Kulüpler ----------
CREATE TABLE clubs (
  id           INTEGER PRIMARY KEY,
  name         TEXT NOT NULL,
  founded_year INTEGER
);
INSERT INTO clubs (id, name, founded_year) VALUES
  (1, 'Robotik',        2015),
  (2, 'Müzik',          2010),
  (3, 'Satranç',        2018), -- [EDGE] hiç üyesi yok
  (4, 'Fotoğrafçılık',  2012),
  (5, 'Girişimcilik',   2020);

-- ---------- Kulüp üyelikleri (ara tablo / bridge) ----------
CREATE TABLE club_memberships (
  student_id INTEGER REFERENCES students(id),
  club_id    INTEGER REFERENCES clubs(id),
  role       TEXT,
  joined_at  DATE,
  PRIMARY KEY (student_id, club_id)
);
INSERT INTO club_memberships (student_id, club_id, role, joined_at) VALUES
  (1, 1, 'başkan', '2024-10-01'),
  (6, 1, 'üye',    '2024-10-05'),
  (9, 1, 'üye',    '2024-10-06'),
  (2, 1, 'üye',    '2024-10-10'),
  (1, 2, 'üye',    '2024-10-02'),  -- [EDGE] Ayşe birden çok kulüpte
  (5, 2, 'başkan', '2024-10-03'),
  (5, 4, 'üye',    '2024-11-01'),  -- [EDGE] Elif birden çok kulüpte
  (10,4, 'üye',    '2024-11-02'),
  (3, 5, 'başkan', '2024-10-15'),
  (8, 5, 'üye',    '2024-10-20');
-- [EDGE] kulüpsüz öğrenciler: 4,7,11,12,13,14

-- ---------- Etkinlikler ----------
CREATE TABLE events (
  id         INTEGER PRIMARY KEY,
  club_id    INTEGER REFERENCES clubs(id),
  title      TEXT NOT NULL,
  event_date DATE,
  capacity   INTEGER
);
INSERT INTO events (id, club_id, title, event_date, capacity) VALUES
  (1, 1, 'Robot Yarışması',   '2025-03-15', 50),
  (2, 2, 'Bahar Konseri',     '2025-04-20', 200),
  (3, 1, 'Arduino Atölyesi',  '2025-02-10', 30),
  (4, 5, 'Startup Günü',      '2025-05-05', 100);

-- ---------- Etkinlik katılımları (anti-join malzemesi) ----------
CREATE TABLE event_attendance (
  event_id   INTEGER REFERENCES events(id),
  student_id INTEGER REFERENCES students(id),
  attended   BOOLEAN,
  PRIMARY KEY (event_id, student_id)
);
INSERT INTO event_attendance (event_id, student_id, attended) VALUES
  (1, 1, TRUE),
  (1, 6, TRUE),
  (1, 9, FALSE),   -- [EDGE] kayıtlı ama katılmadı
  (2, 5, TRUE),
  (2, 1, TRUE),
  (2, 10, FALSE),
  (3, 1, TRUE),
  (3, 6, TRUE),
  (4, 3, TRUE),
  (4, 8, FALSE);

-- ---------- Ürünler (kampüs kafesi) ----------
CREATE TABLE products (
  id       INTEGER PRIMARY KEY,
  name     TEXT NOT NULL,
  category TEXT,
  price    NUMERIC(8,2)
);
INSERT INTO products (id, name, category, price) VALUES
  (1, 'Filtre Kahve', 'İçecek', 25.00),
  (2, 'Latte',        'İçecek', 40.00),
  (3, 'Su',           'İçecek', 10.00),
  (4, 'Tost',         'Yiyecek',45.00),
  (5, 'Sandviç',      'Yiyecek',55.00),
  (6, 'Kek',          'Tatlı',  35.00),
  (7, 'Çikolata',     'Tatlı',  20.00),
  (8, 'Çay',          'İçecek', 15.00);

-- ---------- Siparişler ----------
CREATE TABLE orders (
  id         INTEGER PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  ordered_at TIMESTAMP,
  status     TEXT  -- 'completed' | 'cancelled' | 'pending'
);
INSERT INTO orders (id, student_id, ordered_at, status) VALUES
  (1,  1,  '2025-03-01 09:15', 'completed'),
  (2,  1,  '2025-03-02 12:30', 'completed'),
  (3,  3,  '2025-03-01 10:00', 'completed'),
  (4,  6,  '2025-03-03 08:45', 'cancelled'),  -- [EDGE] iptal
  (5,  5,  '2025-03-04 14:20', 'completed'),
  (6,  8,  '2025-03-05 16:00', 'completed'),
  (7,  9,  '2025-03-06 11:10', 'pending'),    -- [EDGE] beklemede
  (8,  1,  '2025-03-07 13:00', 'completed'),
  (9,  10, '2025-03-08 09:30', 'completed'),
  (10, 3,  '2025-03-09 15:45', 'completed');
-- [EDGE] hiç siparişi olmayan öğrenciler: 2,4,7,11,12,13,14

-- ---------- Sipariş kalemleri (çok ürünlü sipariş) ----------
CREATE TABLE order_items (
  order_id   INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity   INTEGER NOT NULL,
  unit_price NUMERIC(8,2) NOT NULL,
  PRIMARY KEY (order_id, product_id)
);
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
  (1, 1, 1, 25.00),
  (1, 4, 1, 45.00),   -- [EDGE] sipariş 1 çok kalemli
  (2, 2, 2, 40.00),
  (3, 3, 1, 10.00),
  (3, 6, 1, 35.00),
  (4, 5, 1, 55.00),   -- iptal siparişin kalemi (analizde dikkat)
  (5, 1, 1, 25.00),
  (5, 7, 2, 20.00),
  (5, 8, 1, 15.00),   -- [EDGE] sipariş 5 üç kalemli
  (6, 2, 1, 40.00),
  (7, 4, 1, 45.00),
  (8, 1, 1, 25.00),
  (8, 6, 1, 35.00),
  (9, 5, 2, 55.00),
  (10, 2, 1, 40.00),
  (10, 3, 1, 10.00);

-- ============================================================
-- Hızlı doğrulama (manuel): seed sonrası beklenenler
--   students: 14, departments: 5, courses: 8, instructors: 6
--   enrollments: 20, clubs: 5, club_memberships: 10
--   events: 4, event_attendance: 10, products: 8, orders: 10, order_items: 16
-- ============================================================
