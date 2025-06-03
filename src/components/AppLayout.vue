<template>
  <div class="min-h-screen bg-gray-50 w-full">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200 w-full">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <!-- Logo -->
            <div class="flex-shrink-0 flex items-center">
              <router-link to="/" class="text-xl font-bold text-primary-600">
                Gouvernement RP
              </router-link>
            </div>
            
            <!-- Navigation publique -->
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link
                to="/"
                class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                active-class="border-primary-500 text-gray-900"
              >
                Accueil
              </router-link>
              <router-link
                to="/recruitment"
                class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                active-class="border-primary-500 text-gray-900"
              >
                Recrutement
              </router-link>
              <router-link
                to="/news"
                class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                active-class="border-primary-500 text-gray-900"
              >
                Actualités
              </router-link>
            </div>
          </div>

          <!-- Menu utilisateur -->
          <div class="flex items-center space-x-4">
            <template v-if="!authStore.isAuthenticated">
              <router-link
                to="/login"
                class="btn-primary"
              >
                Connexion
              </router-link>
            </template>
            
            <template v-else>
              <!-- Navigation privée -->
              <div class="hidden sm:flex sm:space-x-4">
                <router-link
                  to="/dashboard"
                  class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  active-class="text-primary-600 bg-primary-50"
                >
                  Dashboard
                </router-link>
                <router-link
                  v-if="authStore.canAccessAccounting"
                  to="/accounting"
                  class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  active-class="text-primary-600 bg-primary-50"
                >
                  Comptabilité
                </router-link>
              </div>

              <!-- Menu déroulant utilisateur -->
              <div class="relative">
                <button
                  @click="showUserMenu = !showUserMenu"
                  class="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <!-- Photo de profil ou avatar par défaut -->
                  <div class="h-8 w-8 rounded-full overflow-hidden border-2 border-gray-200">
                    <img 
                      v-if="userProfile?.profile_photo_url" 
                      :src="userProfile.profile_photo_url" 
                      :alt="`Photo de ${userProfile.first_name || 'profil'}`"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="h-full w-full bg-primary-600 flex items-center justify-center">
                      <span class="text-white font-medium text-xs">
                        {{ authStore.user?.email?.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                  </div>
                </button>

                <!-- Menu déroulant -->
                <div
                  v-if="showUserMenu"
                  class="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                >
                  <div class="py-1">
                    <!-- Informations utilisateur avec photo -->
                    <div class="px-4 py-3 border-b border-gray-100">
                      <div class="flex items-center space-x-3">
                        <!-- Photo de profil dans le menu -->
                        <div class="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                          <img 
                            v-if="userProfile?.profile_photo_url" 
                            :src="userProfile.profile_photo_url" 
                            :alt="`Photo de ${userProfile.first_name || 'profil'}`"
                            class="w-full h-full object-cover"
                          />
                          <div v-else class="h-full w-full bg-primary-600 flex items-center justify-center">
                            <span class="text-white font-medium text-sm">
                              {{ authStore.user?.email?.charAt(0).toUpperCase() }}
                            </span>
                          </div>
                        </div>
                        
                        <!-- Informations utilisateur -->
                        <div class="flex-1 min-w-0">
                          <p v-if="userProfile?.first_name || userProfile?.last_name" class="text-sm font-medium text-gray-900 truncate">
                            {{ userProfile.first_name }} {{ userProfile.last_name }}
                          </p>
                          <p class="text-sm text-gray-600 truncate">
                            {{ authStore.user?.email }}
                          </p>
                          <p class="text-xs text-gray-500 capitalize">
                            {{ authStore.user?.role }}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Actions du menu -->
                    <router-link
                      to="/profile"
                      @click="showUserMenu = false"
                      class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Mon profil
                    </router-link>
                    
                    <button
                      @click="handleSignOut"
                      class="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Déconnexion
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- Contenu principal -->
    <main class="w-full">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { db, type UserProfile } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

const authStore = useAuthStore()
const router = useRouter()
const showUserMenu = ref(false)
const userProfile = ref<UserProfile | null>(null)

// Charger le profil utilisateur
const loadUserProfile = async () => {
  if (!authStore.user?.id) {
    userProfile.value = null
    return
  }
  
  try {
    console.log('Chargement du profil utilisateur pour le header:', authStore.user.id)
    const profileDoc = await getDoc(doc(db, 'profiles', authStore.user.id))
    if (profileDoc.exists()) {
      userProfile.value = profileDoc.data() as UserProfile
      console.log('Profil utilisateur chargé dans le header:', userProfile.value.first_name, userProfile.value.last_name)
    } else {
      console.log('Aucun profil trouvé pour cet utilisateur')
      userProfile.value = null
    }
  } catch (error) {
    console.error('Erreur lors du chargement du profil utilisateur:', error)
    userProfile.value = null
  }
}

const handleSignOut = async () => {
  await authStore.signOut()
  showUserMenu.value = false
  userProfile.value = null
  router.push('/')
}

// Fermer le menu utilisateur en cliquant ailleurs
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.relative')) {
    showUserMenu.value = false
  }
}

// Surveiller les changements d'authentification
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated) {
    loadUserProfile()
  } else {
    userProfile.value = null
  }
}, { immediate: true })

// Recharger le profil quand l'utilisateur change
watch(() => authStore.user?.id, (newUserId) => {
  if (newUserId) {
    loadUserProfile()
  } else {
    userProfile.value = null
  }
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // Charger le profil si l'utilisateur est déjà connecté
  if (authStore.isAuthenticated) {
    loadUserProfile()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script> 