<template>
  <div class="card">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-lg font-medium text-gray-900">Gestion des utilisateurs</h2>
      <button
        @click="refreshUsers"
        class="btn-secondary"
        :disabled="loading"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        Actualiser
      </button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-2 text-gray-500">Chargement des utilisateurs...</p>
    </div>

    <div v-else-if="users.length === 0" class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun utilisateur</h3>
      <p class="mt-1 text-sm text-gray-500">Les utilisateurs apparaîtront ici après leur première connexion.</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle actuel</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Créé le</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="h-10 w-10 flex-shrink-0">
                  <!-- Photo de profil si disponible -->
                  <div v-if="user.profile_photo_url" class="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200">
                    <img 
                      :src="user.profile_photo_url" 
                      :alt="`Photo de ${user.display_name || user.email}`"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div v-else class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span class="text-sm font-medium text-primary-600">
                      {{ (user.display_name || user.email).charAt(0).toUpperCase() }}
                    </span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ user.display_name || user.email }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ user.email }}
                  </div>
                  <div class="text-xs text-gray-400">
                    ID: {{ user.id.substring(0, 8) }}...
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  getRoleColor(user.role)
                ]"
              >
                {{ getRoleLabel(user.role) }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-900">
              <div class="flex flex-wrap gap-1">
                <span 
                  v-for="permission in user.permissions" 
                  :key="permission"
                  class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {{ permission }}
                </span>
                <span v-if="user.permissions.length === 0" class="text-gray-400 italic">Aucune</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <div>
                {{ formatDate(user.created_at) }}
              </div>
              <div v-if="user.registration_source" class="text-xs text-gray-500">
                {{ user.registration_source === 'self_registration' ? 'Auto-inscription' : 'Manuel' }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="editUser(user)"
                class="text-blue-600 hover:text-blue-900 mr-3"
                title="Modifier le rôle"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              <button
                v-if="user.id !== authStore.user?.id"
                @click="deleteUser(user)"
                class="text-red-600 hover:text-red-900"
                title="Supprimer l'utilisateur"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal d'édition utilisateur -->
    <UserEditModal
      v-if="showEditModal"
      :user="selectedUser"
      @close="showEditModal = false"
      @save="handleUpdateUser"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/users'
import { useNotificationStore } from '@/stores/notifications'
import { db, type User, type UserProfile } from '@/lib/firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import UserEditModal from './UserEditModal.vue'

const authStore = useAuthStore()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

// Interface étendue pour afficher les utilisateurs avec profils
interface ExtendedUser extends User {
  display_name?: string
  profile_photo_url?: string
  registration_source?: string
  phone_number?: string
  discord_username?: string
  is_verified?: boolean
}

const users = ref<ExtendedUser[]>([])
const loading = ref(false)
const showEditModal = ref(false)
const selectedUser = ref<User | null>(null)

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin': return 'bg-red-100 text-red-800'
    case 'manager': return 'bg-yellow-100 text-yellow-800'
    case 'employee': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'admin': return 'Administrateur'
    case 'manager': return 'Manager'
    case 'employee': return 'Employé'
    default: return 'Viewer'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Fonction pour récupérer tous les utilisateurs (users + profiles)
const fetchAllUsers = async () => {
  loading.value = true
  try {
    console.log('🔍 Récupération de tous les utilisateurs...')
    
    // Récupérer les utilisateurs de la collection "users"
    const usersQuery = query(collection(db, 'users'), orderBy('created_at', 'desc'))
    const usersSnapshot = await getDocs(usersQuery)
    
    // Récupérer les profils de la collection "profiles"
    const profilesQuery = query(collection(db, 'profiles'), orderBy('created_at', 'desc'))
    const profilesSnapshot = await getDocs(profilesQuery)
    
    // Convertir en maps pour faciliter la fusion
    const usersMap = new Map<string, User>()
    const profilesMap = new Map<string, UserProfile>()
    
    usersSnapshot.forEach((doc) => {
      usersMap.set(doc.id, { id: doc.id, ...doc.data() } as User)
    })
    
    profilesSnapshot.forEach((doc) => {
      profilesMap.set(doc.id, { id: doc.id, ...doc.data() } as UserProfile)
    })
    
    console.log(`📊 Trouvé ${usersMap.size} utilisateurs et ${profilesMap.size} profils`)
    
    // Fusionner les données et créer la liste finale
    const combinedUsers: ExtendedUser[] = []
    const processedIds = new Set<string>()
    
    // Traiter d'abord les utilisateurs avec leurs profils
    usersMap.forEach((user, userId) => {
      const profile = profilesMap.get(userId)
      
      const extendedUser: ExtendedUser = {
        ...user,
        display_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : undefined,
        profile_photo_url: profile?.profile_photo_url,
        registration_source: profile?.registration_source,
        phone_number: profile?.phone_number,
        discord_username: profile?.discord_username,
        is_verified: profile?.is_verified
      }
      
      combinedUsers.push(extendedUser)
      processedIds.add(userId)
    })
    
    // Traiter les profils sans utilisateur (comptes créés par inscription)
    profilesMap.forEach((profile, profileId) => {
      if (!processedIds.has(profileId)) {
        // Créer un utilisateur temporaire à partir du profil
        const userFromProfile: ExtendedUser = {
          id: profileId,
          email: profile.email || 'Email non défini',
          role: 'employee', // Rôle par défaut
          permissions: [], // Aucune permission par défaut
          created_at: profile.created_at,
          display_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
          profile_photo_url: profile.profile_photo_url,
          registration_source: profile.registration_source,
          phone_number: profile.phone_number,
          discord_username: profile.discord_username,
          is_verified: profile.is_verified
        }
        
        combinedUsers.push(userFromProfile)
        processedIds.add(profileId)
      }
    })
    
    // Trier par date de création (plus récent en premier)
    combinedUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    users.value = combinedUsers
    
    console.log(`✅ ${combinedUsers.length} utilisateurs chargés au total`)
    console.log('📋 Répartition:', combinedUsers.map(u => `${u.display_name || u.email} (${u.role})`))
    
  } catch (error) {
    console.error('❌ Erreur lors du chargement des utilisateurs:', error)
    notificationStore.error(
      'Erreur de chargement',
      'Impossible de charger les utilisateurs. Vérifiez vos permissions.'
    )
  } finally {
    loading.value = false
  }
}

const refreshUsers = async () => {
  await fetchAllUsers()
}

const editUser = (user: ExtendedUser) => {
  selectedUser.value = user as User
  showEditModal.value = true
}

const handleUpdateUser = async (userData: Partial<User>) => {
  if (selectedUser.value) {
    await userStore.updateUser(selectedUser.value.id, userData)
    await refreshUsers()
    showEditModal.value = false
    selectedUser.value = null
  }
}

const deleteUser = async (user: ExtendedUser) => {
  try {
    const confirmed = await notificationStore.confirm(
      'Supprimer l\'utilisateur',
      `Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.display_name || user.email} ?`
    )
    if (!confirmed) return

    await userStore.deleteUser(user.id)
    await refreshUsers()
    notificationStore.success('Utilisateur supprimé', 'Utilisateur supprimé avec succès')
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    notificationStore.error('Erreur de suppression', 'Erreur lors de la suppression de l\'utilisateur')
  }
}

onMounted(() => {
  fetchAllUsers()
})
</script> 