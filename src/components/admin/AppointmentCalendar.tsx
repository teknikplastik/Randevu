import React, { useState, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Phone, Eye, Plus, Filter, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AppointmentDetailModal from './AppointmentDetailModal'

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
  doctors?: {
    name: string
    specialty: string
  }
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  appointments: Appointment[]
}

const AppointmentCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)
  const [showDayModal, setShowDayModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ]

  const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']

  useEffect(() => {
    fetchAppointments()
  }, [currentDate])

  useEffect(() => {
    generateCalendarDays()
  }, [currentDate, appointments])

  const fetchAppointments = async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          doctors (
            name,
            specialty
          )
        `)
        .gte('appointment_date', startOfMonth.toISOString().split('T')[0])
        .lte('appointment_date', endOfMonth.toISOString().split('T')[0])
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })

      if (error) throw error
      setAppointments(data || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const firstDayOfWeek = firstDayOfMonth.getDay()
    
    const days: CalendarDay[] = []
    
    // Previous month days
    const prevMonth = new Date(year, month - 1, 0)
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i)
      days.push({
        date,
        isCurrentMonth: false,
        appointments: getAppointmentsForDate(date)
      })
    }
    
    // Current month days
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day)
      days.push({
        date,
        isCurrentMonth: true,
        appointments: getAppointmentsForDate(date)
      })
    }
    
    // Next month days
    const remainingDays = 42 - days.length // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      days.push({
        date,
        isCurrentMonth: false,
        appointments: getAppointmentsForDate(date)
      })
    }
    
    setCalendarDays(days)
  }

  const getAppointmentsForDate = (date: Date): Appointment[] => {
    const dateString = date.toISOString().split('T')[0]
    return appointments.filter(apt => apt.appointment_date === dateString)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'cancelled':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-700'
      case 'pending':
        return 'text-yellow-700'
      case 'cancelled':
        return 'text-red-700'
      default:
        return 'text-gray-700'
    }
  }

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowDetailModal(true)
  }

  const handleDayClick = (day: CalendarDay) => {
    if (day.appointments.length > 0) {
      setSelectedDay(day)
      setShowDayModal(true)
    }
  }

  const closeDayModal = () => {
    setShowDayModal(false)
    setSelectedDay(null)
    setStatusFilter('all')
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const getAppointmentStats = (appointments: Appointment[]) => {
    const stats = {
      confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
      pending: appointments.filter(apt => apt.status === 'pending').length,
      cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
      total: appointments.length
    }
    return stats
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const filteredDayAppointments = selectedDay?.appointments.filter(apt => 
    statusFilter === 'all' || apt.status === statusFilter
  ) || []

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Takvim yükleniyor...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Calendar Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">Randevu Takvimi</h2>
            </div>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Bugün
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h3 className="text-lg font-medium text-gray-800 min-w-[140px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const stats = getAppointmentStats(day.appointments)
            return (
              <div
                key={index}
                onClick={() => handleDayClick(day)}
                className={`min-h-[100px] p-2 border border-gray-100 transition-all cursor-pointer hover:bg-gray-50 ${
                  day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isToday(day.date) ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
              >
                {/* Date Number */}
                <div className={`text-sm font-medium mb-2 ${
                  day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                } ${isToday(day.date) ? 'text-blue-600 font-bold' : ''}`}>
                  {day.date.getDate()}
                </div>

                {/* Appointment Summary */}
                {day.appointments.length > 0 && (
                  <div className="space-y-1">
                    {/* Show first 2 appointments as mini cards */}
                    {day.appointments.slice(0, 2).map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`text-xs p-1 rounded border-l-2 bg-gray-50 ${
                          appointment.status === 'confirmed' ? 'border-green-500' :
                          appointment.status === 'pending' ? 'border-yellow-500' : 'border-red-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{appointment.appointment_time.slice(0, 5)}</span>
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(appointment.status)}`}></div>
                        </div>
                        <div className="truncate text-gray-600">{appointment.full_name}</div>
                      </div>
                    ))}
                    
                    {/* Summary for more appointments */}
                    {day.appointments.length > 2 && (
                      <div className="text-xs bg-blue-50 border border-blue-200 rounded p-1 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Plus className="w-3 h-3" />
                          <span className="font-medium">{day.appointments.length - 2} daha</span>
                        </div>
                      </div>
                    )}

                    {/* Status dots summary */}
                    <div className="flex items-center justify-center space-x-1 mt-1">
                      {stats.confirmed > 0 && (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-700">{stats.confirmed}</span>
                        </div>
                      )}
                      {stats.pending > 0 && (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-xs text-yellow-700">{stats.pending}</span>
                        </div>
                      )}
                      {stats.cancelled > 0 && (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-xs text-red-700">{stats.cancelled}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-center space-x-6 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Onaylandı</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600">Bekliyor</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">İptal</span>
          </div>
          <div className="text-gray-500">|</div>
          <div className="text-gray-600">Günlük detaylar için tarihe tıklayın</div>
        </div>
      </div>

      {/* Day Detail Modal */}
      {showDayModal && selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {formatDate(selectedDay.date)}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Toplam {selectedDay.appointments.length} randevu
                </p>
              </div>
              <button
                onClick={closeDayModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Filter */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="confirmed">Onaylandı</option>
                  <option value="pending">Bekliyor</option>
                  <option value="cancelled">İptal</option>
                </select>
                <div className="text-sm text-gray-500">
                  {filteredDayAppointments.length} randevu gösteriliyor
                </div>
              </div>
            </div>

            {/* Appointments List */}
            <div className="p-6">
              {filteredDayAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Bu tarihte randevu bulunmuyor</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleAppointmentClick(appointment)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {appointment.appointment_time.slice(0, 5)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {appointment.full_name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{appointment.phone}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {appointment.status === 'confirmed' ? 'Onaylandı' :
                             appointment.status === 'pending' ? 'Bekliyor' : 'İptal'}
                          </span>
                          <Eye className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        {appointment.doctors?.name} - {appointment.appointment_type === 'new' ? 'Yeni Hasta' : 'Kontrol'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={closeDayModal}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      <AppointmentDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        appointment={selectedAppointment}
        onStatusUpdate={fetchAppointments}
      />
    </div>
  )
}

export default AppointmentCalendar