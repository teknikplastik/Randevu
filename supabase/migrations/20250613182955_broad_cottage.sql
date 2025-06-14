/*
  # Final RLS Fix - Tamamen Yeni Politikalar

  Bu migration:
  1. Tüm mevcut politikaları siler
  2. RLS'i geçici olarak kapatır
  3. Yeni, basit politikalar oluşturur
  4. RLS'i tekrar açar
  5. Test verileri ekler
*/

-- 1. Önce tüm politikaları sil
DROP POLICY IF EXISTS "doctors_select_anon" ON doctors;
DROP POLICY IF EXISTS "doctors_all_authenticated" ON doctors;
DROP POLICY IF EXISTS "Anyone can read active doctors" ON doctors;
DROP POLICY IF EXISTS "Public can read active doctors" ON doctors;
DROP POLICY IF EXISTS "Authenticated users can manage doctors" ON doctors;
DROP POLICY IF EXISTS "Admins can manage doctors" ON doctors;

DROP POLICY IF EXISTS "appointments_insert_anon" ON appointments;
DROP POLICY IF EXISTS "appointments_select_anon" ON appointments;
DROP POLICY IF EXISTS "appointments_all_authenticated" ON appointments;
DROP POLICY IF EXISTS "Anyone can create appointments" ON appointments;
DROP POLICY IF EXISTS "Public can create appointments" ON appointments;
DROP POLICY IF EXISTS "Public can read own appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can manage all appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can manage all appointments" ON appointments;

DROP POLICY IF EXISTS "admin_users_select_anon" ON admin_users;
DROP POLICY IF EXISTS "admin_users_all_authenticated" ON admin_users;
DROP POLICY IF EXISTS "Public can read admin users for login" ON admin_users;
DROP POLICY IF EXISTS "Authenticated users can manage admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can read admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can manage admin users" ON admin_users;

DROP POLICY IF EXISTS "settings_select_anon" ON settings;
DROP POLICY IF EXISTS "settings_all_authenticated" ON settings;
DROP POLICY IF EXISTS "Public can read active settings" ON settings;
DROP POLICY IF EXISTS "Authenticated users can manage settings" ON settings;
DROP POLICY IF EXISTS "Anyone can read settings" ON settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON settings;

-- 2. RLS'i geçici olarak kapat
ALTER TABLE doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- 3. RLS'i tekrar aç
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 4. Çok basit ve açık politikalar oluştur

-- DOCTORS: Herkes aktif doktorları okuyabilir, authenticated kullanıcılar her şeyi yapabilir
CREATE POLICY "doctors_public_read" ON doctors
  FOR SELECT TO public
  USING (is_active = true);

CREATE POLICY "doctors_auth_all" ON doctors
  FOR ALL TO authenticated
  USING (true);

-- APPOINTMENTS: Herkes randevu oluşturabilir ve okuyabilir, authenticated kullanıcılar her şeyi yapabilir
CREATE POLICY "appointments_public_insert" ON appointments
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "appointments_public_select" ON appointments
  FOR SELECT TO public
  USING (true);

CREATE POLICY "appointments_auth_all" ON appointments
  FOR ALL TO authenticated
  USING (true);

-- ADMIN_USERS: Herkes login için okuyabilir, authenticated kullanıcılar her şeyi yapabilir
CREATE POLICY "admin_users_public_read" ON admin_users
  FOR SELECT TO public
  USING (is_active = true);

CREATE POLICY "admin_users_auth_all" ON admin_users
  FOR ALL TO authenticated
  USING (true);

-- SETTINGS: Herkes aktif ayarları okuyabilir, authenticated kullanıcılar her şeyi yapabilir
CREATE POLICY "settings_public_read" ON settings
  FOR SELECT TO public
  USING (is_active = true);

CREATE POLICY "settings_auth_all" ON settings
  FOR ALL TO authenticated
  USING (true);

-- 5. Test verisi ekle (eğer yoksa)
INSERT INTO doctors (name, specialty, phone, address, working_hours, appointment_duration, is_active) 
VALUES (
  'Test Dr. Eren Sağıroğlu', 
  'Çocuk Doktoru', 
  '0531 893 16 22', 
  'Test Adres, İzmit/Kocaeli',
  '{
    "monday": [{"start": "09:00", "end": "17:00"}],
    "tuesday": [{"start": "09:00", "end": "17:00"}],
    "wednesday": [{"start": "09:00", "end": "17:00"}],
    "thursday": [{"start": "09:00", "end": "17:00"}],
    "friday": [{"start": "09:00", "end": "17:00"}],
    "saturday": [{"start": "09:00", "end": "13:00"}],
    "sunday": []
  }',
  30,
  true
) ON CONFLICT DO NOTHING;

-- 6. Test randevusu ekle
INSERT INTO appointments (full_name, phone, tc_number, appointment_type, doctor_id, appointment_date, appointment_time, status, created_by)
SELECT 
  'Test Hasta',
  '0532 123 45 67',
  '12345678901',
  'new',
  d.id,
  CURRENT_DATE + INTERVAL '1 day',
  '10:00',
  'pending',
  'web'
FROM doctors d 
WHERE d.name LIKE '%Test%' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- 7. Politikaları listele (kontrol için)
SELECT 
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('doctors', 'appointments', 'admin_users', 'settings')
ORDER BY tablename, policyname;

-- 8. Tablo sayılarını göster
SELECT 
  'doctors' as table_name, 
  count(*) as record_count 
FROM doctors
UNION ALL
SELECT 
  'appointments' as table_name, 
  count(*) as record_count 
FROM appointments
UNION ALL
SELECT 
  'admin_users' as table_name, 
  count(*) as record_count 
FROM admin_users
UNION ALL
SELECT 
  'settings' as table_name, 
  count(*) as record_count 
FROM settings;