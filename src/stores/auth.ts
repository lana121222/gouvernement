import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth, db, type User } from '@/lib/firebase'
import { signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isManager = computed(() => user.value?.role === 'manager' || user.value?.role === 'admin')
  const canAccessAccounting = computed(() => 
    user.value?.permissions.includes('accounting') || user.value?.role === 'admin'
  )

  // Fonction pour créer automatiquement un profil admin
  async function createAdminProfile(firebaseUser: any) {
    const adminEmails = [
      'admin@gouvernement-rp.com',
      'manager@gouvernement-rp.com', 
      'comptable@gouvernement-rp.com'
    ]

    let role = 'viewer'
    let permissions: string[] = []

    // Déterminer le rôle basé sur l'email
    if (firebaseUser.email === 'admin@gouvernement-rp.com') {
      role = 'admin'
      permissions = ['accounting', 'users', 'employees', 'transactions']
    } else if (firebaseUser.email === 'manager@gouvernement-rp.com') {
      role = 'manager'
      permissions = ['accounting', 'employees']
    } else if (firebaseUser.email === 'comptable@gouvernement-rp.com') {
      role = 'employee'
      permissions = ['accounting']
    } else if (adminEmails.some(email => firebaseUser.email?.includes('admin'))) {
      // Si l'email contient "admin", le rendre admin automatiquement
      role = 'admin'
      permissions = ['accounting', 'users', 'employees', 'transactions']
    }

    const newUserProfile: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      role: role as 'admin' | 'manager' | 'employee' | 'viewer',
      permissions,
      created_at: new Date().toISOString()
    }

    // Créer le document dans Firestore
    await setDoc(doc(db, 'users', firebaseUser.uid), newUserProfile)
    console.log(`✅ Profil ${role} créé automatiquement pour ${firebaseUser.email}`)
    
    return newUserProfile
  }

  async function signIn(email: string, password: string) {
    loading.value = true
    error.value = null
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      if (userCredential.user) {
        // Récupérer les informations utilisateur depuis Firestore
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid))
        
        if (userDoc.exists()) {
          user.value = { id: userDoc.id, ...userDoc.data() } as User
        } else {
          // Créer automatiquement le profil si il n'existe pas
          console.log('🔥 Création automatique du profil utilisateur...')
          user.value = await createAdminProfile(userCredential.user)
        }
      }
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    loading.value = true
    try {
      await firebaseSignOut(auth)
      user.value = null
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function checkAuth() {
    loading.value = true
    
    return new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        try {
          if (firebaseUser) {
            // Récupérer les données utilisateur depuis Firestore
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
            
            if (userDoc.exists()) {
              user.value = { id: userDoc.id, ...userDoc.data() } as User
            } else {
              // Créer automatiquement le profil si il n'existe pas
              console.log('🔥 Création automatique du profil utilisateur...')
              user.value = await createAdminProfile(firebaseUser)
            }
          } else {
            user.value = null
          }
        } catch (err: any) {
          error.value = err.message
          user.value = null
        } finally {
          loading.value = false
          unsubscribe()
          resolve()
        }
      })
    })
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isManager,
    canAccessAccounting,
    signIn,
    signOut,
    checkAuth
  }
}) 