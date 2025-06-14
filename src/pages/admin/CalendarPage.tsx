import React from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import AppointmentCalendar from '../../components/admin/AppointmentCalendar'

const CalendarPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Randevu Takvimi</h1>
          <p className="text-gray-600 mt-1">Randevuları takvim görünümünde inceleyin ve yönetin</p>
        </div>

        {/* Calendar */}
        <AppointmentCalendar />
      </div>
    </AdminLayout>
  )
}

export default CalendarPage