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
                  <div class="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <span class="text-white font-medium">
                      {{ authStore.user?.email?.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                </button>

                <!-- Menu déroulant -->
                <div
                  v-if="showUserMenu"
                  class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                >
                  <div class="py-1">
                    <div class="px-4 py-2 text-sm text-gray-700 border-b">
                      {{ authStore.user?.email }}
                      <div class="text-xs text-gray-500">{{ authStore.user?.role }}</div>
                    </div>
                    <button
                      @click="handleSignOut"
                      class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const showUserMenu = ref(false)

const handleSignOut = async () => {
  await authStore.signOut()
  showUserMenu.value = false
  router.push('/')
}

// Fermer le menu utilisateur en cliquant ailleurs
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.relative')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script> 