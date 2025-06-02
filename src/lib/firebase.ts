// 🔥 FIREBASE - Configuration ultra-simple
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)

// Types identiques - pas de changement !
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