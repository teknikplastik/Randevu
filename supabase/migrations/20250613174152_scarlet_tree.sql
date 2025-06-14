/*
  # Doktor Randevu Sistemi - İlk Veritabanı Şeması

  1. Yeni Tablolar
    - `doctors` - Doktor bilgileri ve çalışma saatleri
    - `appointments` - Randevu kayıtları
    - `admin_users` - Admin kullanıcıları
    - `settings` - Sistem ayarları

  2. Güvenlik
    - Tüm tablolarda RLS aktif
    - Admin kullanıcıları için özel politikalar
    - Public erişim sadece randevu oluşturma için

  3. Özellikler
    - Doktor çalışma saatleri JSON formatında
    - Randevu durumu takibi
    - TC kimlik bazlı hasta geçmişi
    - Sistem ayarları yönetimi
*/

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialty text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  working_hours jsonb DEFAULT '{}',
  appointment_duration integer DEFAULT 30,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  tc_number text NOT NULL,
  appointment_type text NOT NULL CHECK (appointment_type IN ('new', 'control')),
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  created_by text DEFAULT 'web' CHECK (created_by IN ('web', 'admin', 'doctor'))
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'doctor')),
  doctor_id uuid REFERENCES doctors(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title text DEFAULT 'Doktor Randevu Sistemi',
  site_description text DEFAULT 'Online randevu alma sistemi',
  recaptcha_key text,
  whatsapp_number text,
  mobile_app_link text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for doctors
CREATE POLICY "Anyone can read active doctors"
  ON doctors
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage doctors"
  ON doctors
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for appointments
CREATE POLICY "Anyone can create appointments"
  ON appointments
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can manage all appointments"
  ON appointments
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for admin_users
CREATE POLICY "Admins can read admin users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage admin users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for settings
CREATE POLICY "Anyone can read settings"
  ON settings
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage settings"
  ON settings
  FOR ALL
  TO authenticated
  USING (true);

-- Insert initial data
INSERT INTO doctors (name, specialty, phone, address, working_hours, appointment_duration) VALUES
('Uzm. Dr. Eren Sağıroğlu', 'Çocuk Doktoru', '0531 893 16 22', 'Yahyakaptan Mah. Şht. Ali İhsan Çakmak Sk. No:8, 41050 İzmit/Kocaeli', 
'{
  "monday": [{"start": "09:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
  "tuesday": [{"start": "09:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
  "wednesday": [{"start": "09:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
  "thursday": [{"start": "09:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
  "friday": [{"start": "09:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
  "saturday": [{"start": "09:00", "end": "13:00"}],
  "sunday": []
}', 30);

INSERT INTO admin_users (username, password_hash, role) VALUES
('admin', 'admin123', 'admin');

INSERT INTO settings (site_title, site_description) VALUES
('Dr. Eren Sağıroğlu - Çocuk Doktoru', 'Uzm. Dr. Eren Sağıroğlu ile çocuk doktoru randevusu alın. Kocaeli İzmit''te güvenilir pediatri hizmeti.');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_tc ON appointments(tc_number);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);