import React, { useState } from 'react'
import { X, Calendar, Clock, User, Phone, CreditCard, Stethoscope, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

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
  doctors?: {
    name: string
    specialty: string
  }
}

interface AppointmentDetailModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: Appointment | null
  onStatusUpdate: () => void
}

const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onStatusUpdate
}) => {
  const [updating, setUpdating] = useState(false)

  if (!isOpen || !appointment) return null

  const updateAppointmentStatus = async (newStatus: 'confirmed' | 'cancelled') => {
    setUpdating(true)
    try {
      const { data, error } = await supabase
        .rpc('update_appointment_status', {
          appointment_id: appointment.id,
          new_status: newStatus
        })

      if (error) throw error

      if (data?.success) {
        onStatusUpdate()
        onClose()
      } else {
        throw new Error(data?.error || 'Güncelleme başarısız')
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
      alert('Randevu durumu güncellenirken hata oluştu')
    } finally {
      setUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
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

  const getCreatedByText = (createdBy: string) => {
    switch (createdBy) {
      case 'web':
        return 'Web Sitesi'
      case 'admin':
        return 'Admin'
      case 'doctor':
        return 'Doktor'
      default:
        return createdBy
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Randevu Detayları</h2>
            <p className="text-sm text-gray-600 mt-1">#{appointment.id.slice(0, 8)}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(appointment.status)}`}>
                {getStatusText(appointment.status)}
              </span>
              <span className="text-sm text-gray-500">
                {getCreatedByText(appointment.created_by)} tarafından oluşturuldu
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(appointment.created_at).toLocaleDateString('tr-TR')}
            </div>
          </div>

          {/* Patient Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Hasta Bilgileri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                <p className="text-gray-900 font-medium">{appointment.full_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <p className="text-gray-900 flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  {appointment.phone}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">TC Kimlik No</label>
                <p className="text-gray-900 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                  {appointment.tc_number}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Randevu Türü</label>
                <p className="text-gray-900">{getAppointmentTypeText(appointment.appointment_type)}</p>
              </div>
            </div>
          </div>

          {/* Appointment Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Randevu Bilgileri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tarih</label>
                <p className="text-gray-900 font-medium">{formatDate(appointment.appointment_date)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Saat</label>
                <p className="text-gray-900 flex items-center font-medium">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  {formatTime(appointment.appointment_time)}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Doktor</label>
                <p className="text-gray-900 flex items-center">
                  <Stethoscope className="w-4 h-4 mr-2 text-gray-400" />
                  {appointment.doctors?.name || 'Bilinmiyor'} - {appointment.doctors?.specialty || ''}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {appointment.status !== 'cancelled' && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">İşlemler</h3>
              <div className="flex space-x-3">
                {appointment.status === 'pending' && (
                  <button
                    onClick={() => updateAppointmentStatus('confirmed')}
                    disabled={updating}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                  >
                    {updating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Randevuyu Onayla
                  </button>
                )}
                
                {appointment.status === 'confirmed' && (
                  <div className="flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Randevu Onaylanmış
                  </div>
                )}

                <button
                  onClick={() => updateAppointmentStatus('cancelled')}
                  disabled={updating}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  {updating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Randevuyu İptal Et
                </button>
              </div>
            </div>
          )}

          {appointment.status === 'cancelled' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800 font-medium">Bu randevu iptal edilmiştir.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  )
}

export default AppointmentDetailModal