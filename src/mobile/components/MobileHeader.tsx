import React from 'react'
import { ArrowLeft, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/MobileAuthContext'

interface MobileHeaderProps {
  title: string
  showBack?: boolean
  onBack?: () => void
  showLogout?: boolean
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  title, 
  showBack = false, 
  onBack, 
  showLogout = false 
}) => {
  const { logout } = useAuth()

  const handleLogout = () => {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      logout()
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center space-x-3">
        {showBack && (
          <button
            onClick={onBack}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
      </div>
      
      {showLogout && (
        <button
          onClick={handleLogout}
          className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"
        >
          <LogOut className="w-5 h-5 text-red-600" />
        </button>
      )}
    </div>
  )
}

export default MobileHeader