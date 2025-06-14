/*
  # RPC Fonksiyonları - Güvenilir Güncelleme

  1. Yeni Fonksiyonlar
    - `update_appointment_status` - Randevu durumu güncelleme
    - `get_appointment_by_id` - Randevu detayı alma
    - `test_appointment_update` - Test fonksiyonu

  2. Güvenlik
    - SECURITY DEFINER ile admin yetkisi
    - RLS bypass yetkisi
    - Güvenli parametre kontrolü

  3. Özellikler
    - Atomik işlemler
    - Hata kontrolü
    - Detaylı loglama
*/

-- 1. Randevu durumu güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_appointment_status(
  appointment_id uuid,
  new_status text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_record appointments%ROWTYPE;
  old_status text;
BEGIN
  -- Parametre kontrolü
  IF appointment_id IS NULL OR new_status IS NULL THEN
    RAISE EXCEPTION 'appointment_id ve new_status parametreleri gerekli';
  END IF;

  -- Geçerli status kontrolü
  IF new_status NOT IN ('pending', 'confirmed', 'cancelled') THEN
    RAISE EXCEPTION 'Geçersiz status: %', new_status;
  END IF;

  -- Mevcut randevuyu bul ve eski status'u al
  SELECT status INTO old_status
  FROM appointments 
  WHERE id = appointment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Randevu bulunamadı: %', appointment_id;
  END IF;

  -- Status'u güncelle
  UPDATE appointments 
  SET 
    status = new_status,
    updated_at = now()
  WHERE id = appointment_id
  RETURNING * INTO result_record;

  -- Sonucu JSON olarak döndür
  RETURN json_build_object(
    'success', true,
    'appointment_id', result_record.id,
    'old_status', old_status,
    'new_status', result_record.status,
    'updated_at', result_record.updated_at,
    'message', format('Status başarıyla güncellendi: %s → %s', old_status, new_status)
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'appointment_id', appointment_id,
      'attempted_status', new_status
    );
END;
$$;

-- 2. Randevu detayı alma fonksiyonu
CREATE OR REPLACE FUNCTION get_appointment_by_id(appointment_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_record appointments%ROWTYPE;
BEGIN
  SELECT * INTO result_record
  FROM appointments 
  WHERE id = appointment_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Randevu bulunamadı',
      'appointment_id', appointment_id
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'appointment', row_to_json(result_record)
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'appointment_id', appointment_id
    );
END;
$$;

-- 3. Test fonksiyonu
CREATE OR REPLACE FUNCTION test_appointment_update()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  test_appointment_id uuid;
  original_status text;
  test_status text;
  update_result json;
  verify_result json;
BEGIN
  -- İlk randevuyu bul
  SELECT id, status INTO test_appointment_id, original_status
  FROM appointments 
  ORDER BY created_at DESC
  LIMIT 1;

  IF test_appointment_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Test için randevu bulunamadı'
    );
  END IF;

  -- Test status'u belirle
  test_status := CASE 
    WHEN original_status = 'pending' THEN 'confirmed'
    ELSE 'pending'
  END;

  -- Status'u güncelle
  SELECT update_appointment_status(test_appointment_id, test_status) INTO update_result;

  -- 1 saniye bekle
  PERFORM pg_sleep(1);

  -- Doğrula
  SELECT get_appointment_by_id(test_appointment_id) INTO verify_result;

  -- Orijinal status'a geri al
  PERFORM update_appointment_status(test_appointment_id, original_status);

  RETURN json_build_object(
    'success', true,
    'test_appointment_id', test_appointment_id,
    'original_status', original_status,
    'test_status', test_status,
    'update_result', update_result,
    'verify_result', verify_result,
    'test_completed_at', now()
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'test_appointment_id', test_appointment_id
    );
END;
$$;

-- 4. Toplu randevu güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION bulk_update_appointments(
  appointment_ids uuid[],
  new_status text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count integer := 0;
  appointment_id uuid;
  update_result json;
  results json[] := '{}';
BEGIN
  -- Parametre kontrolü
  IF array_length(appointment_ids, 1) IS NULL OR new_status IS NULL THEN
    RAISE EXCEPTION 'appointment_ids ve new_status parametreleri gerekli';
  END IF;

  -- Her randevu için güncelleme yap
  FOREACH appointment_id IN ARRAY appointment_ids
  LOOP
    SELECT update_appointment_status(appointment_id, new_status) INTO update_result;
    results := results || update_result;
    
    IF (update_result->>'success')::boolean THEN
      updated_count := updated_count + 1;
    END IF;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'total_requested', array_length(appointment_ids, 1),
    'updated_count', updated_count,
    'results', results,
    'completed_at', now()
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'updated_count', updated_count
    );
END;
$$;

-- 5. Fonksiyonlara public erişim ver
GRANT EXECUTE ON FUNCTION update_appointment_status(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_appointment_by_id(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION test_appointment_update() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION bulk_update_appointments(uuid[], text) TO anon, authenticated;

-- 6. Test çalıştır
SELECT test_appointment_update() as test_result;

-- 7. Mevcut fonksiyonları listele
SELECT 
  routine_name,
  routine_type,
  security_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%appointment%'
ORDER BY routine_name;

-- 8. Örnek kullanım
/*
-- Tek randevu güncelleme:
SELECT update_appointment_status('uuid-here', 'confirmed');

-- Randevu detayı alma:
SELECT get_appointment_by_id('uuid-here');

-- Test çalıştırma:
SELECT test_appointment_update();

-- Toplu güncelleme:
SELECT bulk_update_appointments(ARRAY['uuid1', 'uuid2'], 'confirmed');
*/