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
  where,
  getDoc
} from 'firebase/firestore'
import { db, type User } from '@/lib/firebase'

export const useUserStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Récupérer tous les utilisateurs actifs (non supprimés)
  const fetchUsers = async (): Promise<User[]> => {
    loading.value = true
    error.value = null
    
    try {
      const usersRef = collection(db, 'users')
      // Filtrer pour ne récupérer que les utilisateurs actifs
      const q = query(
        usersRef, 
        where('is_deleted', '!=', true),
        orderBy('created_at', 'desc')
      )
      
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

  // Désactiver un utilisateur (nouvelle approche sans Cloud Functions)
  const deleteUser = async (userId: string) => {
    loading.value = true
    error.value = null
    
    try {
      // Marquer l'utilisateur comme supprimé
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: 'current-admin-id', // TODO: Récupérer l'ID de l'admin connecté
        // Révoquer tous les tokens
        last_token_revocation: Date.now()
      })
      
      // Marquer le profil comme supprimé aussi
      try {
        const profileRef = doc(db, 'profiles', userId)
        const profileDoc = await getDoc(profileRef)
        if (profileDoc.exists()) {
          await updateDoc(profileRef, {
            is_deleted: true,
            deleted_at: new Date().toISOString()
          })
        }
      } catch (profileError) {
        console.log('Aucun profil à désactiver pour cet utilisateur')
      }
      
      // Supprimer localement de la liste
      users.value = users.value.filter(u => u.id !== userId)
      
      console.log('✅ Utilisateur désactivé avec succès')
    } catch (err: any) {
      console.error('Erreur lors de la désactivation de l\'utilisateur:', err)
      error.value = 'Impossible de désactiver l\'utilisateur'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Réactiver un utilisateur
  const reactivateUser = async (userId: string) => {
    loading.value = true
    error.value = null
    
    try {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        is_deleted: false,
        deleted_at: null,
        deleted_by: null,
        reactivated_at: new Date().toISOString(),
        reactivated_by: 'current-admin-id', // TODO: Récupérer l'ID de l'admin connecté
        last_token_revocation: Date.now()
      })
      
      // Réactiver le profil aussi
      try {
        const profileRef = doc(db, 'profiles', userId)
        const profileDoc = await getDoc(profileRef)
        if (profileDoc.exists()) {
          await updateDoc(profileRef, {
            is_deleted: false,
            deleted_at: null,
            reactivated_at: new Date().toISOString()
          })
        }
      } catch (profileError) {
        console.log('Aucun profil à réactiver pour cet utilisateur')
      }
      
      console.log('✅ Utilisateur réactivé avec succès')
      
      // Recharger la liste des utilisateurs
      await fetchUsers()
    } catch (err: any) {
      console.error('Erreur lors de la réactivation de l\'utilisateur:', err)
      error.value = 'Impossible de réactiver l\'utilisateur'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Récupérer les utilisateurs supprimés
  const fetchDeletedUsers = async (): Promise<User[]> => {
    try {
      const usersRef = collection(db, 'users')
      const q = query(
        usersRef, 
        where('is_deleted', '==', true),
        orderBy('deleted_at', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const deletedUsers: User[] = []
      
      querySnapshot.forEach((doc) => {
        deletedUsers.push({
          id: doc.id,
          ...doc.data()
        } as User)
      })
      
      return deletedUsers
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs supprimés:', error)
      throw error
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
    reactivateUser,
    fetchDeletedUsers,
    getUsersByRole,
    hasPermission,
    hasRole,
    getUserStats
  }
}) 