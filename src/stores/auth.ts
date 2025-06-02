import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth, db, type User } from '@/lib/firebase'
import { signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

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
          // Créer un profil par défaut si il n'existe pas
          user.value = {
            id: userCredential.user.uid,
            email: userCredential.user.email || '',
            role: 'viewer',
            permissions: [],
            created_at: new Date().toISOString()
          }
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
              // Créer un profil par défaut
              user.value = {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                role: 'viewer',
                permissions: [],
                created_at: new Date().toISOString()
              }
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