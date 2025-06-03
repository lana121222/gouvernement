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
  grade: 'debutant' | 'junior' | 'senior' | 'expert' | 'manager' | 'directeur'
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

export interface UserProfile {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  // Informations personnelles RP
  first_name?: string
  last_name?: string
  phone_number?: string
  birth_date?: string
  postal_address?: string
  discord_username?: string
  // Documents (URLs des images/fichiers)
  driving_license_url?: string
  ppa_url?: string
  identity_card_url?: string
  // Autres documents
  other_documents?: { name: string; url: string }[]
}

export interface ServiceItem {
  id: string
  name: string
  price: number
  category: 'vente' | 'prestation'
  description?: string
  created_at: string
  updated_at: string
}

export interface ServiceTransaction {
  id: string
  created_at: string
  type: 'prise_service' | 'fin_service' | 'vente' | 'prestation'
  employee_id: string
  employee_name: string
  service_item_id?: string // Pour les ventes/prestations
  service_name: string
  amount: number
  custom_description?: string // Pour "autre"
  shift_duration?: number // En minutes pour fin de service
}

export interface BonusConfig {
  id: string
  grade: 'debutant' | 'junior' | 'senior' | 'expert' | 'manager' | 'directeur'
  vente_percentage: number // Pourcentage sur les ventes
  prestation_percentage: number // Pourcentage sur les prestations
  min_amount_threshold: number // Montant minimum pour déclencher la prime
  is_active: boolean
  created_at: string
  updated_at: string
} 