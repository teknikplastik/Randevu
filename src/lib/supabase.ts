import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Supabase client'ı sessiz modda oluştur
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  global: {
    headers: {
      'x-client-info': 'appointment-system'
    }
  },
  db: {
    schema: 'public'
  }
})

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
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
          created_by: 'web' | 'admin' | 'doctor'
        }
        Insert: {
          id?: string
          full_name: string
          phone: string
          tc_number: string
          appointment_type: 'new' | 'control'
          doctor_id: string
          appointment_date: string
          appointment_time: string
          status?: 'pending' | 'confirmed' | 'cancelled'
          created_at?: string
          created_by?: 'web' | 'admin' | 'doctor'
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string
          tc_number?: string
          appointment_type?: 'new' | 'control'
          doctor_id?: string
          appointment_date?: string
          appointment_time?: string
          status?: 'pending' | 'confirmed' | 'cancelled'
          created_at?: string
          created_by?: 'web' | 'admin' | 'doctor'
        }
      }
      doctors: {
        Row: {
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
        Insert: {
          id?: string
          name: string
          specialty: string
          phone: string
          address: string
          working_hours: any
          appointment_duration?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          specialty?: string
          phone?: string
          address?: string
          working_hours?: any
          appointment_duration?: number
          is_active?: boolean
          created_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          username: string
          password_hash: string
          role: 'admin' | 'doctor'
          doctor_id: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          username: string
          password_hash: string
          role?: 'admin' | 'doctor'
          doctor_id?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          password_hash?: string
          role?: 'admin' | 'doctor'
          doctor_id?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          site_title: string
          site_description: string
          recaptcha_key: string | null
          whatsapp_number: string | null
          mobile_app_link: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          site_title: string
          site_description: string
          recaptcha_key?: string | null
          whatsapp_number?: string | null
          mobile_app_link?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          site_title?: string
          site_description?: string
          recaptcha_key?: string | null
          whatsapp_number?: string | null
          mobile_app_link?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
    }
  }
}