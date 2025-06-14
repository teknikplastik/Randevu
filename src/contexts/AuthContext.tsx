import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface User {
  id: string
  username: string
  role: 'admin' | 'doctor'
  doctor_id?: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('admin_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        // Sessiz hata yakalama
        localStorage.removeItem('admin_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Try to authenticate with the database
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, username, role, doctor_id, is_active')
        .eq('username', username)
        .eq('password_hash', password)
        .eq('is_active', true)
        .single()

      if (error) {
        // Sessiz hata yakalama
        return false
      }

      if (!data) {
        return false
      }

      const userData = {
        id: data.id,
        username: data.username,
        role: data.role,
        doctor_id: data.doctor_id
      }

      setUser(userData)
      localStorage.setItem('admin_user', JSON.stringify(userData))
      return true

    } catch (error) {
      // Sessiz hata yakalama
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('admin_user')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}