/*
  # Updated_at kolonu ekleme ve randevu güncelleme düzeltmesi

  1. Değişiklikler
    - `appointments` tablosuna `updated_at` kolonu ekleme
    - `doctors` tablosuna `updated_at` kolonu ekleme
    - `admin_users` tablosuna `updated_at` kolonu ekleme
    - `settings` tablosuna `updated_at` kolonu ekleme

  2. Güvenlik
    - Mevcut RLS politikaları korunuyor
    - UPDATE işlemleri için gerekli kolonlar ekleniyor

  3. Performans
    - Otomatik güncelleme trigger'ları ekleniyor
*/

-- Appointments tablosuna updated_at kolonu ekle
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE appointments ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Doctors tablosuna updated_at kolonu ekle
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'doctors' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE doctors ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Admin_users tablosuna updated_at kolonu ekle
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Settings tablosuna updated_at kolonu ekle
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE settings ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Otomatik updated_at güncelleme fonksiyonu oluştur
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appointments tablosu için trigger oluştur
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Doctors tablosu için trigger oluştur
DROP TRIGGER IF EXISTS update_doctors_updated_at ON doctors;
CREATE TRIGGER update_doctors_updated_at
    BEFORE UPDATE ON doctors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Admin_users tablosu için trigger oluştur
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Settings tablosu için trigger oluştur
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Mevcut kayıtların updated_at değerlerini güncelle
UPDATE appointments SET updated_at = created_at WHERE updated_at IS NULL;
UPDATE doctors SET updated_at = created_at WHERE updated_at IS NULL;
UPDATE admin_users SET updated_at = created_at WHERE updated_at IS NULL;
UPDATE settings SET updated_at = created_at WHERE updated_at IS NULL;

-- Test güncelleme
DO $$
DECLARE
    test_appointment_id uuid;
    old_status text;
    new_status text;
BEGIN
    -- İlk randevuyu bul
    SELECT id, status INTO test_appointment_id, old_status
    FROM appointments 
    LIMIT 1;
    
    IF test_appointment_id IS NOT NULL THEN
        -- Status'u güncelle
        UPDATE appointments 
        SET status = CASE 
            WHEN status = 'pending' THEN 'confirmed'
            WHEN status = 'confirmed' THEN 'pending'
            ELSE 'pending'
        END
        WHERE id = test_appointment_id
        RETURNING status INTO new_status;
        
        RAISE NOTICE 'Test güncelleme başarılı - ID: %, Eski: %, Yeni: %', test_appointment_id, old_status, new_status;
        
        -- Geri al
        UPDATE appointments 
        SET status = old_status
        WHERE id = test_appointment_id;
        
        RAISE NOTICE 'Test güncelleme geri alındı';
    ELSE
        RAISE NOTICE 'Test için randevu bulunamadı';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Test güncelleme hatası: %', SQLERRM;
END $$;

-- Tablo şemalarını kontrol et
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('appointments', 'doctors', 'admin_users', 'settings')
    AND column_name IN ('created_at', 'updated_at')
ORDER BY table_name, column_name;

-- Politikaları kontrol et
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'appointments' AND cmd = 'UPDATE'
ORDER BY policyname;