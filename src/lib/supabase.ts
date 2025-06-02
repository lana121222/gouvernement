import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour la base de données
export interface Employee {
  id: string
  created_at: string
  updated_at: string
  first_name: string
  last_name: string
  email: string
  position: string
  hourly_rate: number
  hours_worked: number
  bonus_amount: number
  total_earnings: number
  is_active: boolean
  is_former: boolean
  termination_date?: string
  termination_reason?: string
  is_blacklisted: boolean
}

export interface Transaction {
  id: string
  created_at: string
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string
  employee_id?: string
}

export interface User {
  id: string
  email: string
  role: 'admin' | 'manager' | 'employee' | 'viewer'
  permissions: string[]
  created_at: string
} 