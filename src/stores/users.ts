import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions, type User } from '@/lib/firebase'

export const useUserStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Récupérer tous les utilisateurs
  const fetchUsers = async (): Promise<User[]> => {
    loading.value = true
    error.value = null
    
    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, orderBy('created_at', 'desc'))
      const querySnapshot = await getDocs(q)
      
      const fetchedUsers: User[] = []
      querySnapshot.forEach((doc) => {
        fetchedUsers.push({
          id: doc.id,
          ...doc.data()
        } as User)
      })
      
      users.value = fetchedUsers
      return fetchedUsers
    } catch (err) {
      console.error('Erreur lors de la récupération des utilisateurs:', err)
      error.value = 'Impossible de charger les utilisateurs'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Mettre à jour un utilisateur
  const updateUser = async (userId: string, userData: Partial<User>) => {
    loading.value = true
    error.value = null
    
    try {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        ...userData,
        updated_at: new Date().toISOString()
      })
      
      // Mettre à jour localement
      const userIndex = users.value.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        users.value[userIndex] = {
          ...users.value[userIndex],
          ...userData
        }
      }
      
      console.log('✅ Utilisateur mis à jour avec succès')
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', err)
      error.value = 'Impossible de mettre à jour l\'utilisateur'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Supprimer complètement un utilisateur (compte Auth + toutes les données)
  const deleteUser = async (userId: string) => {
    loading.value = true
    error.value = null
    
    try {
      console.log(`🗑️ Début de la suppression complète de l'utilisateur ${userId}`)
      
      // Appeler la Cloud Function pour supprimer complètement l'utilisateur
      const deleteUserCompletely = httpsCallable(functions, 'deleteUserCompletely')
      
      const result = await deleteUserCompletely({ userId })
      
      console.log('✅ Résultat de la Cloud Function:', result.data)
      
      // Supprimer localement de la liste
      users.value = users.value.filter(u => u.id !== userId)
      
      console.log('✅ Utilisateur supprimé complètement avec succès')
      
      return result.data
      
    } catch (err: any) {
      console.error('❌ Erreur lors de la suppression complète de l\'utilisateur:', err)
      
      // Gestion des erreurs spécifiques de Cloud Functions
      if (err.code === 'functions/permission-denied') {
        error.value = 'Vous n\'avez pas les permissions pour supprimer cet utilisateur'
      } else if (err.code === 'functions/unauthenticated') {
        error.value = 'Vous devez être connecté pour effectuer cette action'
      } else if (err.code === 'functions/invalid-argument') {
        error.value = 'ID utilisateur invalide'
      } else if (err.code === 'functions/internal') {
        error.value = `Erreur serveur: ${err.message}`
      } else {
        error.value = 'Impossible de supprimer l\'utilisateur'
      }
      
      throw err
    } finally {
      loading.value = false
    }
  }

  // Vérifier si un utilisateur existe encore
  const checkUserExists = async (userId: string) => {
    try {
      const checkUserExistsFunction = httpsCallable(functions, 'checkUserExists')
      const result = await checkUserExistsFunction({ userId })
      
      return result.data
    } catch (err) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', err)
      throw err
    }
  }

  // Rechercher des utilisateurs par rôle
  const getUsersByRole = async (role: string): Promise<User[]> => {
    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('role', '==', role))
      const querySnapshot = await getDocs(q)
      
      const roleUsers: User[] = []
      querySnapshot.forEach((doc) => {
        roleUsers.push({
          id: doc.id,
          ...doc.data()
        } as User)
      })
      
      return roleUsers
    } catch (err) {
      console.error('Erreur lors de la recherche par rôle:', err)
      throw err
    }
  }

  // Vérifier si un utilisateur a une permission spécifique
  const hasPermission = (user: User | null, permission: string): boolean => {
    if (!user) return false
    return user.permissions.includes(permission)
  }

  // Vérifier si un utilisateur a un rôle spécifique ou supérieur
  const hasRole = (user: User | null, requiredRole: string): boolean => {
    if (!user) return false
    
    const roleHierarchy = {
      'viewer': 0,
      'employee': 1,
      'manager': 2,
      'admin': 3
    }
    
    const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0
    
    return userLevel >= requiredLevel
  }

  // Obtenir les statistiques des utilisateurs
  const getUserStats = () => {
    const stats = {
      total: users.value.length,
      admins: users.value.filter(u => u.role === 'admin').length,
      managers: users.value.filter(u => u.role === 'manager').length,
      employees: users.value.filter(u => u.role === 'employee').length,
      viewers: users.value.filter(u => u.role === 'viewer').length
    }
    
    return stats
  }

  return {
    // State
    users,
    loading,
    error,
    
    // Actions
    fetchUsers,
    updateUser,
    deleteUser,
    checkUserExists,
    getUsersByRole,
    hasPermission,
    hasRole,
    getUserStats
  }
}) 