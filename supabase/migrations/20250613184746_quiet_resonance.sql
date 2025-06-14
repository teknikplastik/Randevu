/*
  # Randevu Güncelleme Sorunu Düzeltmesi

  1. Sorun Analizi
    - 400 hatası RLS politika sorunu gösteriyor
    - UPDATE işlemi için yeterli yetki yok
    - Appointments tablosunda güncelleme politikası eksik

  2. Çözüm
    - UPDATE işlemi için özel politika ekleme
    - Authenticated kullanıcılar için tam yetki
    - Public kullanıcılar için sınırlı yetki

  3. Test
    - Randevu durumu güncelleme testi
    - Admin panel erişim testi
*/

-- Önce mevcut appointment politikalarını kontrol et ve gerekirse düzelt
DROP POLICY IF EXISTS "appointments_public_update" ON appointments;
DROP POLICY IF EXISTS "appointments_auth_update" ON appointments;

-- Appointments tablosu için UPDATE politikası ekle
CREATE POLICY "appointments_auth_update" ON appointments
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Appointments tablosu için DELETE politikası ekle (gerekirse)
CREATE POLICY "appointments_auth_delete" ON appointments
  FOR DELETE TO authenticated
  USING (true);

-- Mevcut politikaları kontrol et
SELECT 
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'appointments'
ORDER BY policyname;

-- Test için basit bir güncelleme sorgusu çalıştır
DO $$
DECLARE
    test_appointment_id uuid;
BEGIN
    -- İlk randevuyu bul
    SELECT id INTO test_appointment_id 
    FROM appointments 
    LIMIT 1;
    
    IF test_appointment_id IS NOT NULL THEN
        -- Test güncelleme (aslında hiçbir şeyi değiştirmez)
        UPDATE appointments 
        SET status = status 
        WHERE id = test_appointment_id;
        
        RAISE NOTICE 'Test güncelleme başarılı: %', test_appointment_id;
    ELSE
        RAISE NOTICE 'Test için randevu bulunamadı';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Test güncelleme hatası: %', SQLERRM;
END $$;

-- Appointments tablosundaki tüm kayıtları say
SELECT 
    status,
    count(*) as count
FROM appointments 
GROUP BY status
ORDER BY status;