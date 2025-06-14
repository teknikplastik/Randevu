import React, { useState, useEffect } from 'react'
import { Users, Search, Calendar, Phone, User, FileText } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/admin/AdminLayout'

interface Patient {
  full_name: string
  phone: string
  tc_number: string
  appointment_count: number
  last_appointment: string
  first_appointment: string
  appointment_types: string[]
}

const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      // Get unique patients with their appointment statistics
      const { data, error } = await supabase
        .from('appointments')
        .select('full_name, phone, tc_number, appointment_date, appointment_type, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group appointments by patient (using TC number as unique identifier)
      const patientMap = new Map<string, Patient>()

      data?.forEach(appointment => {
        const key = appointment.tc_number
        
        if (!patientMap.has(key)) {
          patientMap.set(key, {
            full_name: appointment.full_name,
            phone: appointment.phone,
            tc_number: appointment.tc_number,
            appointment_count: 0,
            last_appointment: appointment.appointment_date,
            first_appointment: appointment.appointment_date,
            appointment_types: []
          })
        }

        const patient = patientMap.get(key)!
        patient.appointment_count++
        
        // Update last appointment (most recent)
        if (new Date(appointment.appointment_date) > new Date(patient.last_appointment)) {
          patient.last_appointment = appointment.appointment_date
        }
        
        // Update first appointment (earliest)
        if (new Date(appointment.appointment_date) < new Date(patient.first_appointment)) {
          patient.first_appointment = appointment.appointment_date
        }

        // Add appointment type if not already included
        if (!patient.appointment_types.includes(appointment.appointment_type)) {
          patient.appointment_types.push(appointment.appointment_type)
        }
      })

      setPatients(Array.from(patientMap.values()))
    } catch (error) {
      console.error('Error fetching patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(patient => 
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm) ||
    patient.tc_number.includes(searchTerm)
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR')
  }

  const getAppointmentTypeText = (types: string[]) => {
    return types.map(type => type === 'new' ? 'Yeni' : 'Kontrol').join(', ')
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Hastalar</h1>
            <p className="text-gray-600 mt-1">Hasta bilgilerini ve randevu geçmişlerini görüntüleyin</p>
          </div>
          <div className="text-sm text-gray-500">
            Toplam: {filteredPatients.length} hasta
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Hasta Ara
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ad, telefon veya TC ile ara..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Hasta</p>
                <p className="text-2xl font-bold text-gray-800">{patients.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Yeni Hastalar</p>
                <p className="text-2xl font-bold text-green-600">
                  {patients.filter(p => p.appointment_types.includes('new')).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Kontrol Hastaları</p>
                <p className="text-2xl font-bold text-purple-600">
                  {patients.filter(p => p.appointment_types.includes('control')).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Patients List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {filteredPatients.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchTerm ? 'Arama kriterinize uygun hasta bulunamadı' : 'Henüz hasta kaydı bulunmuyor'}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm ? 'Arama kriterlerinizi değiştirmeyi deneyin' : 'İlk randevu alındığında hastalar burada görünecek'}
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
                      İletişim
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Randevu İstatistikleri
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Randevu Geçmişi
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Randevu Türleri
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.tc_number} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{patient.full_name}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            TC: {patient.tc_number}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{patient.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {patient.appointment_count} randevu
                          </div>
                          <div className="text-xs text-gray-500">
                            {patient.appointment_count === 1 ? 'İlk randevu' : 'Tekrar eden hasta'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              Son: {formatDate(patient.last_appointment)}
                            </span>
                          </div>
                          {patient.appointment_count > 1 && (
                            <div className="text-xs text-gray-500 mt-1">
                              İlk: {formatDate(patient.first_appointment)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {patient.appointment_types.map((type) => (
                            <span
                              key={type}
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                type === 'new'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {type === 'new' ? 'Yeni Hasta' : 'Kontrol'}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default PatientsPage