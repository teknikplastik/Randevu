import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Calendar, CalendarDays, Plus } from 'lucide-react'

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    { id: 'home', label: 'Ana Sayfa', icon: Home, path: '/' },
    { id: 'appointments', label: 'Randevular', icon: Calendar, path: '/appointments' },
    { id: 'add', label: 'Ekle', icon: Plus, path: '/add-appointment' },
    { id: 'calendar', label: 'Takvim', icon: CalendarDays, path: '/calendar' },
  ]

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = isActive(tab.path)
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-xl transition-all ${
                active 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              } ${tab.id === 'add' ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}`}
            >
              <Icon className={`w-6 h-6 ${tab.id === 'add' ? 'text-white' : ''}`} />
              <span className={`text-xs font-medium ${tab.id === 'add' ? 'text-white' : ''}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default BottomNavigation