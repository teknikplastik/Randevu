import React, { useState, useEffect } from 'react'
import { Calendar, Clock, User, Phone, CreditCard, Stethoscope, CheckCircle, AlertCircle, ArrowRight, UserPlus, RefreshCw, Heart } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Doctor {
  id: string
  name: string
  specialty: string
  working_hours: any
  appointment_duration: number
}

const AppointmentForm: React.FC = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    tc_number: '',
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
  const [refreshKey, setRefreshKey] = useState(0)

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
  }, [formData.doctor_id, formData.appointment_date, doctors, refreshKey])

  useEffect(() => {
    if (doctors.length > 0 && !success && !formData.appointment_date) {
      const today = new Date()
      const todayString = today.toISOString().split('T')[0]
      setFormData(prev => ({ ...prev, appointment_date: todayString }))
    }
  }, [doctors, success])

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('is_active', true)

      if (error) return

      if (data && data.length > 0) {
        setDoctors(data)
        setFormData(prev => ({ ...prev, doctor_id: data[0].id }))
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
      const { data: existingAppointments, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', formData.doctor_id)
        .eq('appointment_date', formData.appointment_date)
        .order('appointment_time', { ascending: true })

      if (error) {
        setBookedTimes([])
      } else {
        const activeAppointments = existingAppointments?.filter(apt => apt.status !== 'cancelled') || []
        const bookedTimesList = activeAppointments.map(apt => apt.appointment_time)
        setBookedTimes(bookedTimesList)
      }

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
      handlePhoneChange(value)
    } else if (name === 'tc_number') {
      handleTcChange(value)
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    if (name === 'appointment_date' || name === 'doctor_id') {
      setFormData(prev => ({ ...prev, appointment_time: '' }))
      setRefreshKey(prev => prev + 1)
    }
  }

  const handlePhoneChange = (value: string) => {
    // Sadece rakamları al
    const numbersOnly = value.replace(/\D/g, '')
    
    // Maksimum 10 haneli telefon numarası
    if (numbersOnly.length <= 10) {
      setFormData(prev => ({ ...prev, phone: numbersOnly }))
    }
  }

  const handleTcChange = (value: string) => {
    // Sadece rakamları al
    const numbersOnly = value.replace(/\D/g, '')
    
    // Maksimum 11 haneli TC kimlik numarası
    if (numbersOnly.length <= 11) {
      setFormData(prev => ({ ...prev, tc_number: numbersOnly }))
    }
  }

  const handleAppointmentTypeSelect = (type: 'new' | 'control') => {
    setFormData(prev => ({ ...prev, appointment_type: type }))
  }

  const isTimeBooked = (time: string): boolean => {
    const timeFormats = [
      time,
      `${time}:00`,
      time.padStart(5, '0')
    ]
    
    return bookedTimes.some(bookedTime => {
      const normalizedBookedTime = bookedTime.slice(0, 5)
      return timeFormats.includes(normalizedBookedTime) || timeFormats.includes(bookedTime)
    })
  }

  const handleTimeSelect = (time: string) => {
    if (isTimeBooked(time)) {
      return false
    }
    
    setFormData(prev => ({ ...prev, appointment_time: time }))
    return true
  }

  const handleTimeClick = (time: string) => {
    if (isTimeBooked(time)) {
      return false
    }
    
    return handleTimeSelect(time)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isTimeBooked(formData.appointment_time)) {
        alert('⚠️ Seçtiğiniz saat artık dolu! Lütfen başka bir saat seçin.')
        setLoading(false)
        setRefreshKey(prev => prev + 1)
        return
      }

      const fullPhoneNumber = `+90${formData.phone}`
      
      const { error } = await supabase
        .from('appointments')
        .insert([{
          ...formData,
          phone: fullPhoneNumber,
          status: 'pending',
          created_by: 'web'
        }])

      if (error) throw error

      setSuccess(true)
      
      setFormData({
        full_name: '',
        phone: '',
        tc_number: '',
        appointment_type: '',
        doctor_id: doctors[0]?.id || '',
        appointment_date: '',
        appointment_time: ''
      })
      
      setTimeout(() => setSuccess(false), 8000)
    } catch (error) {
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
    maxDate.setDate(maxDate.getDate() + 30)
    return maxDate.toISOString().split('T')[0]
  }

  const formatPhoneDisplay = (phone: string) => {
    if (!phone) return ''
    
    // Telefon numarasını formatla: 532 123 45 67
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

  const handleNewAppointment = () => {
    setSuccess(false)
    setFormData({
      full_name: '',
      phone: '',
      tc_number: '',
      appointment_type: '',
      doctor_id: doctors[0]?.id || '',
      appointment_date: '',
      appointment_time: ''
    })
    setAvailableTimes([])
    setBookedTimes([])
    setRefreshKey(prev => prev + 1)
  }

  if (success) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-lg border border-green-200 p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-green-800 mb-3">Randevunuz Alındı!</h2>
        <p className="text-green-700 mb-8 text-lg leading-relaxed">
          Randevunuz başarıyla oluşturuldu. Kısa süre içinde onay için size ulaşılacaktır.
        </p>
        <button
          onClick={handleNewAppointment}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold text-lg shadow-lg transform hover:scale-105"
        >
          Yeni Randevu Al
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Colorful Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Randevu Al</h2>
            <p className="text-blue-100">Çocuğunuz için randevu oluşturun</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ad Soyad
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-blue-500" />
              </div>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Çocuğunuzun adı soyadı"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Telefon Numarası
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="w-4 h-4 text-green-500" />
              </div>
              <div className="absolute inset-y-0 left-10 pl-2 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm font-medium">+90</span>
              </div>
              <input
                type="text"
                name="phone"
                value={formatPhoneDisplay(formData.phone)}
                onChange={handleInputChange}
                required
                inputMode="numeric"
                pattern="[0-9\s]*"
                className="w-full pl-20 pr-3 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="532 123 45 67"
                onKeyPress={(e) => {
                  // Sadece rakam ve boşluk karakterlerine izin ver
                  if (!/[\d\s]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                    e.preventDefault()
                  }
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              TC Kimlik Numarası
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard className="w-4 h-4 text-purple-500" />
              </div>
              <input
                type="text"
                name="tc_number"
                value={formData.tc_number}
                onChange={handleInputChange}
                required
                maxLength={11}
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder="12345678901"
                onKeyPress={(e) => {
                  // Sadece rakam karakterlerine izin ver
                  if (!/\d/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                    e.preventDefault()
                  }
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Doktor
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Stethoscope className="w-4 h-4 text-indigo-500" />
              </div>
              <select
                name="doctor_id"
                value={formData.doctor_id}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              >
                {doctors.length === 0 ? (
                  <option value="">Doktor yükleniyor...</option>
                ) : (
                  doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Appointment Type - Colorful Cards */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Randevu Türü
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleAppointmentTypeSelect('new')}
              className={`p-4 rounded-xl border-2 transition-all text-left transform hover:scale-105 ${
                formData.appointment_type === 'new'
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 shadow-lg'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  formData.appointment_type === 'new' ? 'bg-blue-500' : 'bg-gray-200'
                }`}>
                  <UserPlus className={`w-5 h-5 ${
                    formData.appointment_type === 'new' ? 'text-white' : 'text-gray-500'
                  }`} />
                </div>
                <div>
                  <div className="font-semibold">Yeni Hasta</div>
                  <div className="text-sm opacity-75">İlk muayene</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleAppointmentTypeSelect('control')}
              className={`p-4 rounded-xl border-2 transition-all text-left transform hover:scale-105 ${
                formData.appointment_type === 'control'
                  ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 text-green-700 shadow-lg'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  formData.appointment_type === 'control' ? 'bg-green-500' : 'bg-gray-200'
                }`}>
                  <RefreshCw className={`w-5 h-5 ${
                    formData.appointment_type === 'control' ? 'text-white' : 'text-gray-500'
                  }`} />
                </div>
                <div>
                  <div className="font-semibold">Kontrol</div>
                  <div className="text-sm opacity-75">Takip muayenesi</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Randevu Tarihi
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="w-4 h-4 text-orange-500" />
            </div>
            <input
              type="date"
              name="appointment_date"
              value={formData.appointment_date}
              onChange={handleInputChange}
              required
              min={getTodayDate()}
              max={getMaxDate()}
              className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
          </div>
        </div>

        {/* Time Selection - Colorful Grid */}
        {availableTimes.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Randevu Saati
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {availableTimes.map(time => {
                const isBooked = isTimeBooked(time)
                const isSelected = formData.appointment_time === time
                
                return (
                  <button
                    key={`${time}-${refreshKey}`}
                    type="button"
                    disabled={isBooked}
                    onClick={() => handleTimeClick(time)}
                    className={`p-3 text-sm font-semibold rounded-lg border-2 transition-all transform hover:scale-105 ${
                      isSelected && !isBooked
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg'
                        : isBooked
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md'
                    }`}
                  >
                    {time}
                  </button>
                )
              })}
            </div>
            
            <div className="mt-4 flex items-center justify-center space-x-6 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded shadow-sm"></div>
                <span className="text-gray-600 font-medium">Seçili</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded shadow-sm"></div>
                <span className="text-gray-600 font-medium">Müsait</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-100 border-2 border-gray-200 rounded"></div>
                <span className="text-gray-600 font-medium">Dolu</span>
              </div>
            </div>
          </div>
        )}

        {formData.appointment_date && availableTimes.length === 0 && (
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800 font-medium">
                Seçilen tarihte doktor çalışma saati bulunmamaktadır.
              </p>
            </div>
          </div>
        )}

        {/* Submit Button - Gradient */}
        <button
          type="submit"
          disabled={loading || !formData.appointment_time || !formData.appointment_type}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-lg shadow-lg transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-3"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Randevu Oluşturuluyor...</span>
            </>
          ) : (
            <>
              <Heart className="w-5 h-5" />
              <span>Randevu Al</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default AppointmentForm