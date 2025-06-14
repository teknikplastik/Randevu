import React, { useState, useEffect } from 'react'
import { Calendar, Clock, User, Phone, Search, Filter, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/admin/AdminLayout'
import AppointmentCalendar from '../../components/admin/AppointmentCalendar'

interface Appointment {
  id: string
  full_name: string
  phone: string
  tc_number: string
  appointment_type: 'new' | 'control'
  doctor_id: string
  appointment_date: string
  appointment_time: string
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
  created_by: string
  updated_at?: string
  doctors?: {
    name: string
    specialty: string
  }
}

const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list')

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          doctors (
            name,
            specialty
          )
        `)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false })

      if (error) {
        console.error('Error fetching appointments:', error)
        throw error
      }
      
      setAppointments(data || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
      alert('Randevular yüklenirken hata oluştu. Lütfen sayfayı yenileyin.')
    } finally {
      setLoading(false)
    }
  }

  const updateAppointmentStatus = async (appointmentId: string, newStatus: 'confirmed' | 'cancelled') => {
    setUpdatingStatus(appointmentId)

    try {
      // RPC fonksiyonu ile güncelleme
      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('update_appointment_status', {
          appointment_id: appointmentId,
          new_status: newStatus
        })

      if (rpcError) {
        console.error('RPC error:', rpcError)
        throw rpcError
      }

      if (!rpcResult?.success) {
        console.error('RPC failed:', rpcResult?.error)
        throw new Error(rpcResult?.error || 'RPC fonksiyonu başarısız oldu')
      }

      // Local state'i güncelle
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { 
                ...apt, 
                status: newStatus, 
                updated_at: rpcResult.updated_at 
              }
            : apt
        )
      )

      const statusText = newStatus === 'confirmed' ? 'onaylandı' : 'iptal edildi'
      // Başarı mesajını daha az dikkat çekici hale getir
      console.log(`Randevu başarıyla ${statusText}`)

    } catch (error: any) {
      console.error('Update error:', error)
      
      // Detaylı hata analizi
      if (error?.code === 'PGRST301') {
        alert('Veritabanı bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.')
      } else if (error?.code === 'PGRST116') {
        alert('RPC fonksiyonu bulunamadı. Lütfen migration dosyalarını çalıştırın.')
      } else if (error?.message?.includes('permission') || error?.message?.includes('policy')) {
        alert('Bu işlem için yetkiniz bulunmuyor. Lütfen admin olarak giriş yaptığınızdan emin olun.')
      } else {
        alert(`Randevu durumu güncellenirken hata oluştu: ${error?.message || 'Bilinmeyen hata'}`)
      }
      
      // Hata durumunda verileri yeniden yükle
      await fetchAppointments()
    } finally {
      setUpdatingStatus(null)
    }
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.phone.includes(searchTerm) ||
      appointment.tc_number.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter
    const matchesDate = !dateFilter || appointment.appointment_date === dateFilter

    return matchesSearch && matchesStatus && matchesDate
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Onaylandı'
      case 'pending':
        return 'Bekliyor'
      case 'cancelled':
        return 'İptal'
      default:
        return status
    }
  }

  const getAppointmentTypeText = (type: string) => {
    return type === 'new' ? 'Yeni Hasta' : 'Kontrol'
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Randevular yükleniyor...</span>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Randevular</h1>
            <p className="text-gray-600 mt-1">Tüm randevuları görüntüleyin ve yönetin</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchAppointments}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Yenile</span>
            </button>
            <div className="text-sm text-gray-500">
              Toplam: {filteredAppointments.length} randevu
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('list')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'list'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Liste Görünümü
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'calendar'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Takvim Görünümü
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'calendar' ? (
            <div className="p-6">
              <AppointmentCalendar />
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Search className="w-4 h-4 inline mr-1" />
                      Arama
                    </label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Ad, telefon veya TC ile ara..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Filter className="w-4 h-4 inline mr-1" />
                      Durum
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Tümü</option>
                      <option value="pending">Bekliyor</option>
                      <option value="confirmed">Onaylandı</option>
                      <option value="cancelled">İptal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Tarih
                    </label>
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setStatusFilter('all')
                        setDateFilter('')
                      }}
                      className="w-full px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Filtreleri Temizle
                    </button>
                  </div>
                </div>
              </div>

              {/* Appointments List */}
              <div>
                {filteredAppointments.length === 0 ? (
                  <div className="p-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Randevu bulunamadı</p>
                    <p className="text-gray-400 text-sm mt-2">
                      {searchTerm || statusFilter !== 'all' || dateFilter 
                        ? 'Arama kriterlerinizi değiştirmeyi deneyin'
                        : 'Henüz hiç randevu alınmamış'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hasta Bilgileri
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Randevu Detayları
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Doktor
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Durum
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            İşlemler
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAppointments.map((appointment) => (
                          <tr key={appointment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <User className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium text-gray-900">{appointment.full_name}</span>
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">{appointment.phone}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  TC: {appointment.tc_number}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm font-medium text-gray-900">
                                    {formatDate(appointment.appointment_date)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">{appointment.appointment_time}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {getAppointmentTypeText(appointment.appointment_type)}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {appointment.doctors?.name || 'Bilinmiyor'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {appointment.doctors?.specialty || ''}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                                {getStatusText(appointment.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-2">
                                {updatingStatus === appointment.id ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    <span className="text-sm text-gray-600">Güncelleniyor...</span>
                                  </div>
                                ) : (
                                  <>
                                    {appointment.status === 'pending' && (
                                      <>
                                        <button
                                          onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full hover:bg-green-200 transition-colors"
                                        >
                                          <CheckCircle className="w-3 h-3 mr-1" />
                                          Onayla
                                        </button>
                                        <button
                                          onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
                                        >
                                          <XCircle className="w-3 h-3 mr-1" />
                                          İptal
                                        </button>
                                      </>
                                    )}
                                    {appointment.status === 'confirmed' && (
                                      <button
                                        onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
                                      >
                                        <XCircle className="w-3 h-3 mr-1" />
                                        İptal Et
                                      </button>
                                    )}
                                    {appointment.status === 'cancelled' && (
                                      <button
                                        onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full hover:bg-green-200 transition-colors"
                                      >
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Yeniden Onayla
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default AppointmentsPage