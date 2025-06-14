import React from 'react'
import { Heart, Phone, MapPin, Clock, Star, Shield, Users, AlertCircle, CheckCircle, Info } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  showHeader?: boolean
}

const Layout: React.FC<LayoutProps> = ({ children, showHeader = true }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {showHeader && (
        <>
          {/* Colorful Header */}
          <header className="bg-white shadow-lg border-b border-blue-100">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
                      Dr. Eren Sağıroğlu
                    </h1>
                    <p className="text-sm font-medium text-blue-600">Çocuk Doktoru</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center space-x-8 text-sm">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-medium">0531 893 16 22</span>
                  </div>
                </div>
              </div>
            </div>
          </header>
        </>
      )}
      
      {/* Main Content */}
      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Side - Randevu Formu */}
              <div className="lg:col-span-2">
                {children}
              </div>
              
              {/* Right Side - Colorful Info Cards */}
              <div className="space-y-6">
                {/* Working Hours - Blue Theme */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-blue-800">Çalışma Saatleri</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                      <span className="text-blue-700 font-medium">Pazartesi - Cuma</span>
                      <span className="font-bold text-blue-800">09:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                      <span className="text-blue-700 font-medium">Cumartesi</span>
                      <span className="font-bold text-blue-800">09:00 - 13:00</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/40 rounded-lg">
                      <span className="text-blue-600">Pazar</span>
                      <span className="text-blue-500 font-medium">Kapalı</span>
                    </div>
                  </div>
                </div>

                {/* Contact Info - Green Theme */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-sm border border-green-200 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-green-800">İletişim</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="p-3 bg-white/70 rounded-lg">
                      <div className="font-bold text-green-800 text-lg">0531 893 16 22</div>
                    </div>
                    <div className="p-3 bg-white/70 rounded-lg">
                      <div className="font-semibold text-green-800 mb-1">Adres</div>
                      <div className="text-sm text-green-700 leading-relaxed">
                        Yahyakaptan Mah. Şht. Ali İhsan Çakmak Sk. No:8<br />
                        <span className="font-medium">41050 İzmit/Kocaeli</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Information - Orange Theme */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl shadow-sm border border-orange-200 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                      <Info className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-orange-800">Önemli Bilgiler</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-orange-800">
                        <div className="font-semibold mb-1">Randevu Onayı</div>
                        <div>Randevunuz alındıktan sonra telefon ile onay verilecektir.</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg">
                      <Clock className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-orange-800">
                        <div className="font-semibold mb-1">Randevu Saati</div>
                        <div>Lütfen randevu saatinizden 10 dakika önce klinikte bulunun.</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-orange-800">
                        <div className="font-semibold mb-1">İptal/Değişiklik</div>
                        <div>Randevu iptali veya değişikliği için lütfen önceden arayın.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Colorful Footer */}
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white">Dr. Eren Sağıroğlu</h3>
                    <p className="text-blue-300 font-medium">Çocuk Doktoru</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Çocuklarınızın sağlığı için güvenilir ve profesyonel hizmet sunuyoruz. 
                  Modern tıp anlayışı ile kaliteli sağlık hizmeti.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-4 text-lg">İletişim Bilgileri</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-medium">0531 893 16 22</span>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-white/10 rounded-lg">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mt-0.5">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-200 leading-relaxed">
                      Yahyakaptan Mah. Şht. Ali İhsan Çakmak Sk. No:8, İzmit/Kocaeli
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-700 pt-8 mt-8 text-center">
              <p className="text-gray-400">
                © 2024 Dr. Eren Sağıroğlu. Tüm hakları saklıdır.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout