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

  // Vérifier si l'utilisateur est désactivé
  async function checkUserStatus(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User
        
        // Si l'utilisateur est marqué comme supprimé
        if (userData.is_deleted) {
          // Déconnecter immédiatement
          await firebaseSignOut(auth)
          throw new Error('Ce compte a été désactivé. Contactez un administrateur.')
        }
        
        return { id: userDoc.id, ...userData } as User
      }
      
      return null
    } catch (error) {
      console.error('Erreur lors de la vérification du statut utilisateur:', error)
      throw error
    }
  }

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
        // Vérifier le statut de l'utilisateur
        const userData = await checkUserStatus(userCredential.user.uid)
        
        if (userData) {
          user.value = userData
        } else {
          // Créer automatiquement le profil si il n'existe pas
          console.log('🔥 Création automatique du profil utilisateur...')
          user.value = await createAdminProfile(userCredential.user)
        }
      }
    } catch (err: any) {
      // Gérer spécifiquement le cas des comptes désactivés
      if (err.message.includes('désactivé')) {
        error.value = 'Votre compte a été désactivé. Contactez un administrateur.'
      } else {
        error.value = err.message
      }
      user.value = null
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
            // Vérifier le statut de l'utilisateur
            const userData = await checkUserStatus(firebaseUser.uid)
            
            if (userData) {
              user.value = userData
            } else {
              // Créer automatiquement le profil si il n'existe pas
              console.log('🔥 Création automatique du profil utilisateur...')
              user.value = await createAdminProfile(firebaseUser)
            }
          } else {
            user.value = null
          }
        } catch (err: any) {
          console.error('Erreur d\'authentification:', err)
          error.value = err.message
          user.value = null
          // Si c'est une erreur de compte désactivé, déconnecter proprement
          if (err.message.includes('désactivé')) {
            await firebaseSignOut(auth)
          }
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