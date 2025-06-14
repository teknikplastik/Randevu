import React, { useState, useEffect } from 'react'
import { Stethoscope, Plus, Edit, Trash2, Phone, MapPin, Clock, Save, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/admin/AdminLayout'

interface Doctor {
  id: string
  name: string
  specialty: string
  phone: string
  address: string
  working_hours: any
  appointment_duration: number
  is_active: boolean
  created_at: string
}

interface WorkingHours {
  [key: string]: Array<{ start: string; end: string }>
}

const DoctorsPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    phone: '',
    address: '',
    appointment_duration: 30,
    working_hours: {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [{ start: '09:00', end: '17:00' }],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '17:00' }],
      saturday: [],
      sunday: []
    } as WorkingHours
  })

  const dayNames = {
    monday: 'Pazartesi',
    tuesday: 'Salı',
    wednesday: 'Çarşamba',
    thursday: 'Perşembe',
    friday: 'Cuma',
    saturday: 'Cumartesi',
    sunday: 'Pazar'
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDoctors(data || [])
    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingDoctor) {
        // Update existing doctor
        const { error } = await supabase
          .from('doctors')
          .update({
            name: formData.name,
            specialty: formData.specialty,
            phone: formData.phone,
            address: formData.address,
            working_hours: formData.working_hours,
            appointment_duration: formData.appointment_duration
          })
          .eq('id', editingDoctor.id)

        if (error) throw error
      } else {
        // Create new doctor
        const { error } = await supabase
          .from('doctors')
          .insert([{
            name: formData.name,
            specialty: formData.specialty,
            phone: formData.phone,
            address: formData.address,
            working_hours: formData.working_hours,
            appointment_duration: formData.appointment_duration,
            is_active: true
          }])

        if (error) throw error
      }

      await fetchDoctors()
      resetForm()
    } catch (error) {
      console.error('Error saving doctor:', error)
      alert('Doktor kaydedilirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor)
    setFormData({
      name: doctor.name,
      specialty: doctor.specialty,
      phone: doctor.phone,
      address: doctor.address,
      appointment_duration: doctor.appointment_duration,
      working_hours: doctor.working_hours || {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      }
    })
    setShowAddForm(true)
  }

  const handleDelete = async (doctorId: string) => {
    if (!confirm('Bu doktoru silmek istediğinizden emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('doctors')
        .delete()
        .eq('id', doctorId)

      if (error) throw error
      await fetchDoctors()
    } catch (error) {
      console.error('Error deleting doctor:', error)
      alert('Doktor silinirken hata oluştu')
    }
  }

  const toggleDoctorStatus = async (doctorId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('doctors')
        .update({ is_active: !currentStatus })
        .eq('id', doctorId)

      if (error) throw error
      await fetchDoctors()
    } catch (error) {
      console.error('Error updating doctor status:', error)
      alert('Doktor durumu güncellenirken hata oluştu')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      specialty: '',
      phone: '',
      address: '',
      appointment_duration: 30,
      working_hours: {
        monday: [{ start: '09:00', end: '17:00' }],
        tuesday: [{ start: '09:00', end: '17:00' }],
        wednesday: [{ start: '09:00', end: '17:00' }],
        thursday: [{ start: '09:00', end: '17:00' }],
        friday: [{ start: '09:00', end: '17:00' }],
        saturday: [],
        sunday: []
      }
    })
    setEditingDoctor(null)
    setShowAddForm(false)
  }

  const updateWorkingHours = (day: string, index: number, field: 'start' | 'end', value: string) => {
    setFormData(prev => ({
      ...prev,
      working_hours: {
        ...prev.working_hours,
        [day]: prev.working_hours[day].map((period, i) => 
          i === index ? { ...period, [field]: value } : period
        )
      }
    }))
  }

  const addWorkingPeriod = (day: string) => {
    setFormData(prev => ({
      ...prev,
      working_hours: {
        ...prev.working_hours,
        [day]: [...prev.working_hours[day], { start: '09:00', end: '17:00' }]
      }
    }))
  }

  const removeWorkingPeriod = (day: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      working_hours: {
        ...prev.working_hours,
        [day]: prev.working_hours[day].filter((_, i) => i !== index)
      }
    }))
  }

  const formatWorkingHours = (workingHours: any) => {
    if (!workingHours) return 'Belirtilmemiş'
    
    const days = Object.entries(workingHours)
      .filter(([_, periods]: [string, any]) => periods && periods.length > 0)
      .map(([day, periods]: [string, any]) => {
        const dayName = dayNames[day as keyof typeof dayNames]
        const timeRanges = periods.map((p: any) => `${p.start}-${p.end}`).join(', ')
        return `${dayName}: ${timeRanges}`
      })
    
    return days.length > 0 ? days.join(' | ') : 'Çalışma saati yok'
  }

  if (loading && !showAddForm) {
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
            <h1 className="text-2xl font-bold text-gray-800">Doktorlar</h1>
            <p className="text-gray-600 mt-1">Doktor bilgilerini yönetin</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Doktor Ekle</span>
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingDoctor ? 'Doktor Düzenle' : 'Yeni Doktor Ekle'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doktor Adı
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dr. Adı Soyadı"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Uzmanlık
                  </label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Çocuk Doktoru"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0532 123 45 67"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Randevu Süresi (dakika)
                  </label>
                  <input
                    type="number"
                    value={formData.appointment_duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, appointment_duration: parseInt(e.target.value) }))}
                    required
                    min="15"
                    max="120"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adres
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tam adres bilgisi"
                />
              </div>

              {/* Working Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Çalışma Saatleri
                </label>
                <div className="space-y-4">
                  {Object.entries(dayNames).map(([dayKey, dayName]) => (
                    <div key={dayKey} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-700">{dayName}</h4>
                        <button
                          type="button"
                          onClick={() => addWorkingPeriod(dayKey)}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          + Saat Ekle
                        </button>
                      </div>
                      <div className="space-y-2">
                        {formData.working_hours[dayKey]?.map((period: any, index: number) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="time"
                              value={period.start}
                              onChange={(e) => updateWorkingHours(dayKey, index, 'start', e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded text-sm"
                            />
                            <span className="text-gray-500">-</span>
                            <input
                              type="time"
                              value={period.end}
                              onChange={(e) => updateWorkingHours(dayKey, index, 'end', e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded text-sm"
                            />
                            {formData.working_hours[dayKey].length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeWorkingPeriod(dayKey, index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        {formData.working_hours[dayKey]?.length === 0 && (
                          <p className="text-sm text-gray-500">Bu gün çalışma yok</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Kaydediliyor...' : 'Kaydet'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Doctors List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {doctors.length === 0 ? (
            <div className="p-12 text-center">
              <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Henüz doktor eklenmemiş</p>
              <p className="text-gray-400 text-sm mt-2">İlk doktoru eklemek için yukarıdaki butonu kullanın</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doktor Bilgileri
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İletişim
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Çalışma Saatleri
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
                  {doctors.map((doctor) => (
                    <tr key={doctor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <Stethoscope className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{doctor.name}</span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{doctor.specialty}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Randevu: {doctor.appointment_duration} dk
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{doctor.phone}</span>
                          </div>
                          <div className="flex items-start space-x-2 mt-1">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{doctor.address}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          <Clock className="w-4 h-4 inline mr-1" />
                          <div className="mt-1 text-xs">
                            {formatWorkingHours(doctor.working_hours)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleDoctorStatus(doctor.id, doctor.is_active)}
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            doctor.is_active
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          } transition-colors`}
                        >
                          {doctor.is_active ? 'Aktif' : 'Pasif'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(doctor)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(doctor.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

export default DoctorsPage