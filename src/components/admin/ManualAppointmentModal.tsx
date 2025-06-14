import React, { useState, useEffect } from 'react'
import { X, Calendar, Clock, User, Phone, CreditCard, Stethoscope, Save } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Doctor {
  id: string
  name: string
  specialty: string
  working_hours: any
  appointment_duration: number
}

interface ManualAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const ManualAppointmentModal: React.FC<ManualAppointmentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    tc_number: '',
    appointment_type: 'new' as 'new' | 'control',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    status: 'confirmed' as 'pending' | 'confirmed'
  })
  
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchDoctors()
    }
  }, [isOpen])

  useEffect(() => {
    if (formData.doctor_id && formData.appointment_date) {
      generateAvailableTimes()
    }
  }, [formData.doctor_id, formData.appointment_date])

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('is_active', true)

      if (data && !error) {
        setDoctors(data)
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, doctor_id: data[0].id }))
        }
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
    }
  }

  const generateAvailableTimes = async () => {
    const doctor = doctors.find(d => d.id === formData.doctor_id)
    if (!doctor) return

    const selectedDate = new Date(formData.appointment_date)
    const dayOfWeek = selectedDate.getDay()
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayName = dayNames[dayOfWeek]

    const workingHours = doctor.working_hours?.[dayName]
    if (!workingHours || workingHours.length === 0) {
      setAvailableTimes([])
      return
    }

    try {
      // Get existing appointments for this date and doctor
      const { data: existingAppointments } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('doctor_id', formData.doctor_id)
        .eq('appointment_date', formData.appointment_date)
        .neq('status', 'cancelled')

      const bookedTimes = existingAppointments?.map(apt => apt.appointment_time) || []

      // Generate available time slots
      const times: string[] = []
      workingHours.forEach((period: { start: string; end: string }) => {
        const start = new Date(`2024-01-01T${period.start}:00`)
        const end = new Date(`2024-01-01T${period.end}:00`)
        
        while (start < end) {
          const timeString = start.toTimeString().slice(0, 5)
          times.push(timeString) // Admin manuel randevu eklerken çakışma kontrolü yapmıyoruz
          start.setMinutes(start.getMinutes() + doctor.appointment_duration)
        }
      })

      setAvailableTimes(times)
    } catch (error) {
      console.error('Error generating available times:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (name === 'appointment_date' || name === 'doctor_id') {
      setFormData(prev => ({ ...prev, appointment_time: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('appointments')
        .insert([{
          ...formData,
          created_by: 'admin'
        }])

      if (error) throw error

      // Reset form
      setFormData({
        full_name: '',
        phone: '',
        tc_number: '',
        appointment_type: 'new',
        doctor_id: doctors[0]?.id || '',
        appointment_date: '',
        appointment_time: '',
        status: 'confirmed'
      })
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error creating appointment:', error)
      alert('Randevu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 90)
    return maxDate.toISOString().split('T')[0]
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Manuel Randevu Ekle</h2>
            <p className="text-sm text-gray-600 mt-1">Admin tarafından manuel randevu oluşturma</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4" />
                <span>Hasta Adı Soyadı</span>
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Hasta adı soyadı"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4" />
                <span>Telefon</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0532 123 45 67"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="w-4 h-4" />
                <span>TC Kimlik No</span>
              </label>
              <input
                type="text"
                name="tc_number"
                value={formData.tc_number}
                onChange={handleInputChange}
                required
                maxLength={11}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="12345678901"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Stethoscope className="w-4 h-4" />
                <span>Randevu Türü</span>
              </label>
              <select
                name="appointment_type"
                value={formData.appointment_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="new">Yeni Hasta</option>
                <option value="control">Kontrol</option>
              </select>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4" />
                <span>Doktor</span>
              </label>
              <select
                name="doctor_id"
                value={formData.doctor_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {doctors.length === 0 ? (
                  <option value="">Doktor yükleniyor...</option>
                ) : (
                  doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialty}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                <span>Randevu Durumu</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="confirmed">Onaylanmış</option>
                <option value="pending">Bekliyor</option>
              </select>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                <span>Randevu Tarihi</span>
              </label>
              <input
                type="date"
                name="appointment_date"
                value={formData.appointment_date}
                onChange={handleInputChange}
                required
                min={getTodayDate()}
                max={getMaxDate()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4" />
                <span>Randevu Saati</span>
              </label>
              <select
                name="appointment_time"
                value={formData.appointment_time}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Saat seçiniz</option>
                {availableTimes.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          {formData.appointment_date && availableTimes.length === 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                Seçilen tarihte doktor çalışma saati bulunmamaktadır.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || !formData.appointment_time}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Kaydediliyor...' : 'Randevu Oluştur'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ManualAppointmentModal