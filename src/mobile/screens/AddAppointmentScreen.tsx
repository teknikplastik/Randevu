import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Calendar, Clock, User, Phone, Stethoscope, Users, CheckCircle, ArrowLeft, UserPlus, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import MobileHeader from '../components/MobileHeader'

interface Doctor {
  id: string
  name: string
  specialty: string
  working_hours: any
  appointment_duration: number
}

interface Contact {
  name: string
  phone: string
}

const AddAppointmentScreen: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const selectedContact = location.state?.contact as Contact | undefined

  const [formData, setFormData] = useState({
    full_name: selectedContact?.name || '',
    phone: selectedContact?.phone || '',
    appointment_type: '' as 'new' | 'control' | '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: ''
  })
  
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [bookedTimes, setBookedTimes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchDoctors()
  }, [])

  useEffect(() => {
    if (formData.doctor_id && formData.appointment_date && doctors.length > 0) {
      generateAvailableTimes()
    } else {
      setAvailableTimes([])
      setBookedTimes([])
    }
  }, [formData.doctor_id, formData.appointment_date, doctors])

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
      // Silent error handling
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
      setBookedTimes([])
      return
    }

    try {
      const { data: existingAppointments } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('doctor_id', formData.doctor_id)
        .eq('appointment_date', formData.appointment_date)
        .neq('status', 'cancelled')

      const bookedTimesList = existingAppointments?.map(apt => apt.appointment_time) || []
      setBookedTimes(bookedTimesList)

      const allTimes: string[] = []
      workingHours.forEach((period: { start: string; end: string }) => {
        const start = new Date(`2024-01-01T${period.start}:00`)
        const end = new Date(`2024-01-01T${period.end}:00`)
        
        while (start < end) {
          const timeString = start.toTimeString().slice(0, 5)
          allTimes.push(timeString)
          start.setMinutes(start.getMinutes() + doctor.appointment_duration)
        }
      })

      setAvailableTimes(allTimes)
    } catch (error) {
      setBookedTimes([])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name === 'phone') {
      // Telefon numarası formatlaması
      const numbersOnly = value.replace(/\D/g, '')
      if (numbersOnly.length <= 10) {
        setFormData(prev => ({ ...prev, phone: numbersOnly }))
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    if (name === 'appointment_date' || name === 'doctor_id') {
      setFormData(prev => ({ ...prev, appointment_time: '' }))
    }
  }

  const isTimeBooked = (time: string): boolean => {
    return bookedTimes.some(bookedTime => {
      const normalizedBookedTime = bookedTime.slice(0, 5)
      return normalizedBookedTime === time || bookedTime === time
    })
  }

  const handleTimeSelect = (time: string) => {
    if (isTimeBooked(time)) return
    setFormData(prev => ({ ...prev, appointment_time: time }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isTimeBooked(formData.appointment_time)) {
        alert('⚠️ Seçtiğiniz saat artık dolu! Lütfen başka bir saat seçin.')
        setLoading(false)
        return
      }

      const { error } = await supabase
        .from('appointments')
        .insert([{
          ...formData,
          status: 'confirmed',
          created_by: 'admin'
        }])

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        navigate('/appointments')
      }, 2000)
    } catch (error) {
      alert('Randevu oluşturulurken bir hata oluştu.')
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

  const formatPhoneDisplay = (phone: string) => {
    if (!phone) return ''
    
    if (phone.length >= 3) {
      let formatted = phone.slice(0, 3)
      if (phone.length >= 6) {
        formatted += ' ' + phone.slice(3, 6)
        if (phone.length >= 8) {
          formatted += ' ' + phone.slice(6, 8)
          if (phone.length >= 10) {
            formatted += ' ' + phone.slice(8, 10)
          } else if (phone.length > 8) {
            formatted += ' ' + phone.slice(8)
          }
        } else if (phone.length > 6) {
          formatted += ' ' + phone.slice(6)
        }
      } else if (phone.length > 3) {
        formatted += ' ' + phone.slice(3)
      }
      return formatted
    }
    
    return phone
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Randevu Oluşturuldu!</h2>
          <p className="text-gray-600 mb-6">
            Randevu başarıyla eklendi.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader 
        title="Yeni Randevu" 
        showBack 
        onBack={() => navigate(-1)}
      />
      
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Selection */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Hasta Bilgileri</h3>
              <button
                type="button"
                onClick={() => navigate('/contact-picker')}
                className="bg-blue-100 text-blue-600 px-3 py-2 rounded-xl text-sm font-medium"
              >
                <Users className="w-4 h-4 inline mr-1" />
                Rehber
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Soyad
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Hasta adı soyadı"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="absolute inset-y-0 left-10 pl-2 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">+90</span>
                  </div>
                  <input
                    type="text"
                    name="phone"
                    value={formatPhoneDisplay(formData.phone)}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-20 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="532 123 45 67"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Type */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Randevu Türü</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, appointment_type: 'new' }))}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.appointment_type === 'new'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                <UserPlus className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Yeni Hasta</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, appointment_type: 'control' }))}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.appointment_type === 'control'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                <RefreshCw className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Kontrol</div>
              </button>
            </div>
          </div>

          {/* Doctor Selection */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Doktor</h3>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Stethoscope className="w-5 h-5 text-gray-400" />
              </div>
              <select
                name="doctor_id"
                value={formData.doctor_id}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Selection */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tarih</h3>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="date"
                name="appointment_date"
                value={formData.appointment_date}
                onChange={handleInputChange}
                required
                min={getTodayDate()}
                max={getMaxDate()}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Time Selection */}
          {availableTimes.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Saat</h3>
              <div className="grid grid-cols-3 gap-3">
                {availableTimes.map(time => {
                  const isBooked = isTimeBooked(time)
                  const isSelected = formData.appointment_time === time
                  
                  return (
                    <button
                      key={time}
                      type="button"
                      disabled={isBooked}
                      onClick={() => handleTimeSelect(time)}
                      className={`p-3 text-sm font-medium rounded-xl border-2 transition-all ${
                        isSelected && !isBooked
                          ? 'bg-blue-500 text-white border-blue-500'
                          : isBooked
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                      }`}
                    >
                      {time}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !formData.appointment_time || !formData.appointment_type}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Oluşturuluyor...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Randevu Oluştur</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddAppointmentScreen