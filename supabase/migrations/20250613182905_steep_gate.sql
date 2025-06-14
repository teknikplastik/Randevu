/*
  # RLS Politikalarını Düzelt
  
  Bu migration mevcut RLS politikalarını temizleyip yeniden oluşturur.
  401 Unauthorized hatalarını çözmek için anon kullanıcılarına gerekli izinleri verir.
*/

-- Önce tüm mevcut politikaları sil
DO $$ 
DECLARE
    pol_name text;
BEGIN
    -- doctors tablosu politikaları
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'doctors'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON doctors', pol_name);
    END LOOP;
    
    -- appointments tablosu politikaları
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'appointments'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON appointments', pol_name);
    END LOOP;
    
    -- admin_users tablosu politikaları
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'admin_users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON admin_users', pol_name);
    END LOOP;
    
    -- settings tablosu politikaları
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'settings'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON settings', pol_name);
    END LOOP;
END $$;

-- Yeni politikalar oluştur

-- DOCTORS tablosu için politikalar
CREATE POLICY "doctors_select_anon"
  ON doctors
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "doctors_all_authenticated"
  ON doctors
  FOR ALL
  TO authenticated
  USING (true);

-- APPOINTMENTS tablosu için politikalar
CREATE POLICY "appointments_insert_anon"
  ON appointments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "appointments_select_anon"
  ON appointments
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "appointments_all_authenticated"
  ON appointments
  FOR ALL
  TO authenticated
  USING (true);

-- ADMIN_USERS tablosu için politikalar
CREATE POLICY "admin_users_select_anon"
  ON admin_users
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "admin_users_all_authenticated"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (true);

-- SETTINGS tablosu için politikalar
CREATE POLICY "settings_select_anon"
  ON settings
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "settings_all_authenticated"
  ON settings
  FOR ALL
  TO authenticated
  USING (true);

-- Politikaları kontrol et
SELECT 
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('doctors', 'appointments', 'admin_users', 'settings')
ORDER BY tablename, policyname;