import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, User, Phone, UserPlus, ArrowLeft } from 'lucide-react'
import MobileHeader from '../components/MobileHeader'

interface Contact {
  id: string
  name: string
  phone: string
}

const ContactPickerScreen: React.FC = () => {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContacts()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm)
      )
      setFilteredContacts(filtered)
    } else {
      setFilteredContacts(contacts)
    }
  }, [searchTerm, contacts])

  const loadContacts = async () => {
    try {
      // Mock contact data - In production, you would integrate with device contacts
      // using a working contacts plugin or native implementation
      const mockContacts: Contact[] = [
        { id: '1', name: 'Ahmet Yılmaz', phone: '5321234567' },
        { id: '2', name: 'Ayşe Demir', phone: '5339876543' },
        { id: '3', name: 'Mehmet Kaya', phone: '5445556677' },
        { id: '4', name: 'Fatma Özkan', phone: '5551112233' },
        { id: '5', name: 'Ali Çelik', phone: '5667778899' },
        { id: '6', name: 'Zeynep Aydın', phone: '5773334455' },
        { id: '7', name: 'Mustafa Şahin', phone: '5889990011' },
        { id: '8', name: 'Elif Koç', phone: '5995551122' },
        { id: '9', name: 'Osman Kara', phone: '5321119988' },
        { id: '10', name: 'Merve Güneş', phone: '5337776655' },
        { id: '11', name: 'Emre Yıldız', phone: '5443332211' },
        { id: '12', name: 'Selin Ak', phone: '5559998877' },
      ]
      
      setContacts(mockContacts)
      setFilteredContacts(mockContacts)
    } catch (error) {
      console.error('Error loading contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContactSelect = (contact: Contact) => {
    navigate('/add-appointment', {
      state: {
        contact: {
          name: contact.name,
          phone: contact.phone
        }
      }
    })
  }

  const formatPhone = (phone: string) => {
    // Format: 532 123 45 67
    if (phone.length === 10) {
      return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 8)} ${phone.slice(8, 10)}`
    }
    return phone
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader 
          title="Rehber" 
          showBack 
          onBack={() => navigate(-1)}
        />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader 
        title="Rehber" 
        showBack 
        onBack={() => navigate(-1)}
      />
      
      <div className="p-4">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="İsim veya telefon ara..."
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>
        </div>

        {/* Manual Entry Option */}
        <button
          onClick={() => navigate('/add-appointment')}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-2xl flex items-center justify-center space-x-3 mb-6 shadow-sm"
        >
          <UserPlus className="w-5 h-5" />
          <span className="font-medium">Manuel Giriş</span>
        </button>

        {/* Contacts List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {filteredContacts.length === 0 ? (
            <div className="p-8 text-center">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Arama sonucu bulunamadı' : 'Rehber boş'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleContactSelect(contact)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{contact.name}</h3>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>+90 {formatPhone(contact.phone)}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-800 text-center">
            <strong>Not:</strong> Bu demo sürümde örnek rehber verileri gösterilmektedir. 
            Gerçek uygulamada cihaz rehberine erişim sağlanacaktır.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ContactPickerScreen