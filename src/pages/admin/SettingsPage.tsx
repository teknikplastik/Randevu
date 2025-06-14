import React, { useState, useEffect } from 'react'
import { Settings, Save, Globe, Phone, Smartphone, Key } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/admin/AdminLayout'

interface SettingsData {
  id: string
  site_title: string
  site_description: string
  recaptcha_key: string | null
  whatsapp_number: string | null
  mobile_app_link: string | null
  is_active: boolean
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SettingsData>({
    id: '',
    site_title: '',
    site_description: '',
    recaptcha_key: null,
    whatsapp_number: null,
    mobile_app_link: null,
    is_active: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      if (settings.id) {
        // Update existing settings
        const { error } = await supabase
          .from('settings')
          .update({
            site_title: settings.site_title,
            site_description: settings.site_description,
            recaptcha_key: settings.recaptcha_key || null,
            whatsapp_number: settings.whatsapp_number || null,
            mobile_app_link: settings.mobile_app_link || null
          })
          .eq('id', settings.id)

        if (error) throw error
      } else {
        // Create new settings
        const { data, error } = await supabase
          .from('settings')
          .insert([{
            site_title: settings.site_title,
            site_description: settings.site_description,
            recaptcha_key: settings.recaptcha_key || null,
            whatsapp_number: settings.whatsapp_number || null,
            mobile_app_link: settings.mobile_app_link || null,
            is_active: true
          }])
          .select()
          .single()

        if (error) throw error
        if (data) {
          setSettings(prev => ({ ...prev, id: data.id }))
        }
      }

      setMessage({ type: 'success', text: 'Ayarlar başarıyla kaydedildi!' })
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'Ayarlar kaydedilirken hata oluştu!' })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof SettingsData, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ayarlar</h1>
          <p className="text-gray-600 mt-1">Site ayarlarını ve yapılandırmalarını yönetin</p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Site Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Globe className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">Site Bilgileri</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Başlığı
                </label>
                <input
                  type="text"
                  value={settings.site_title}
                  onChange={(e) => handleInputChange('site_title', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Dr. Eren Sağıroğlu - Çocuk Doktoru"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Bu başlık tarayıcı sekmesinde ve arama motorlarında görünür
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Açıklaması
                </label>
                <textarea
                  value={settings.site_description}
                  onChange={(e) => handleInputChange('site_description', e.target.value)}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Uzm. Dr. Eren Sağıroğlu ile çocuk doktoru randevusu alın..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Bu açıklama arama motorlarında ve sosyal medyada paylaşımlarda görünür
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Phone className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-800">İletişim Bilgileri</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Numarası
                </label>
                <input
                  type="tel"
                  value={settings.whatsapp_number || ''}
                  onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="905318931622"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ülke kodu ile birlikte, boşluk ve özel karakter olmadan (örn: 905318931622)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Smartphone className="w-4 h-4 inline mr-1" />
                  Mobil Uygulama Linki
                </label>
                <input
                  type="url"
                  value={settings.mobile_app_link || ''}
                  onChange={(e) => handleInputChange('mobile_app_link', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://play.google.com/store/apps/details?id=..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Google Play Store veya App Store linki
                </p>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Key className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-semibold text-gray-800">Güvenlik Ayarları</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  reCAPTCHA Site Anahtarı
                </label>
                <input
                  type="text"
                  value={settings.recaptcha_key || ''}
                  onChange={(e) => handleInputChange('recaptcha_key', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Spam koruması için Google reCAPTCHA v2 site anahtarı
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}</span>
            </button>
          </div>
        </form>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">💡 İpucu: Site Başlığı</h3>
            <p className="text-sm text-blue-700">
              Site başlığı Google'da arama sonuçlarında görünen ana başlıktır. 
              Doktor adı ve uzmanlık alanını içermesi SEO için önemlidir.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-800 mb-2">📱 WhatsApp Entegrasyonu</h3>
            <p className="text-sm text-green-700">
              WhatsApp numarası eklendiğinde, hastalar doğrudan WhatsApp üzerinden 
              iletişim kurabilir. Numara uluslararası formatta olmalıdır.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-2">🔒 reCAPTCHA Koruması</h3>
            <p className="text-sm text-yellow-700">
              reCAPTCHA anahtarı eklenerek spam randevu taleplerinin önüne geçilebilir. 
              Google reCAPTCHA konsolundan ücretsiz alınabilir.
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-medium text-purple-800 mb-2">📱 Mobil Uygulama</h3>
            <p className="text-sm text-purple-700">
              Mobil uygulama linki eklendiğinde, kullanıcılar uygulamayı 
              indirmeleri için yönlendirilebilir.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default SettingsPage