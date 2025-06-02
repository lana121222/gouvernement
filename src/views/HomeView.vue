<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { useAccountingStore } from '@/stores/accounting'

const accountingStore = useAccountingStore()

const stats = ref({
  activeEmployees: 0,
  citizens: 1250,
  events: 8
})

onMounted(async () => {
  // Charger les statistiques des employés si l'utilisateur a accès
  try {
    await accountingStore.fetchEmployees()
    stats.value.activeEmployees = accountingStore.activeEmployees.length
  } catch (error) {
    // Ignorer l'erreur si l'utilisateur n'a pas accès
    stats.value.activeEmployees = 12
  }
})
</script>

<template>
  <AppLayout>
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-primary-600 to-primary-800">
      <div class="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
            Gouvernement RP
          </h1>
          <p class="mt-3 max-w-md mx-auto text-base text-primary-200 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Bienvenue sur le portail officiel du gouvernement du serveur roleplay. 
            Découvrez nos services, postulez pour rejoindre notre équipe et restez informé des dernières actualités.
          </p>
          <div class="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div class="rounded-md shadow">
              <router-link
                to="/recruitment"
                class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
              >
                Rejoindre l'équipe
              </router-link>
            </div>
            <div class="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <router-link
                to="/news"
                class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 md:py-4 md:text-lg md:px-10"
              >
                Actualités
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Services Section -->
    <div class="py-12 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:text-center">
          <h2 class="text-base text-primary-600 font-semibold tracking-wide uppercase">Services</h2>
          <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Nos départements
          </p>
          <p class="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Découvrez les différents services proposés par notre gouvernement roleplay.
          </p>
        </div>

        <div class="mt-10">
          <div class="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            <div class="relative">
              <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <p class="ml-16 text-lg leading-6 font-medium text-gray-900">Police</p>
              <p class="mt-2 ml-16 text-base text-gray-500">
                Maintien de l'ordre et sécurité publique sur le serveur.
              </p>
            </div>

            <div class="relative">
              <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                </svg>
              </div>
              <p class="ml-16 text-lg leading-6 font-medium text-gray-900">Justice</p>
              <p class="mt-2 ml-16 text-base text-gray-500">
                Système judiciaire et application des lois du serveur.
              </p>
            </div>

            <div class="relative">
              <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <p class="ml-16 text-lg leading-6 font-medium text-gray-900">Administration</p>
              <p class="mt-2 ml-16 text-base text-gray-500">
                Gestion administrative et services aux citoyens.
              </p>
            </div>

            <div class="relative">
              <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <p class="ml-16 text-lg leading-6 font-medium text-gray-900">Économie</p>
              <p class="mt-2 ml-16 text-base text-gray-500">
                Gestion économique et financière du serveur.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="bg-primary-800">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-3xl font-extrabold text-white sm:text-4xl">
            Statistiques du serveur
          </h2>
          <p class="mt-3 text-xl text-primary-200 sm:mt-4">
            Quelques chiffres sur notre communauté
          </p>
        </div>
        <dl class="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
          <div class="flex flex-col">
            <dt class="order-2 mt-2 text-lg leading-6 font-medium text-primary-200">
              Employés actifs
            </dt>
            <dd class="order-1 text-5xl font-extrabold text-white">
              {{ stats.activeEmployees }}
            </dd>
          </div>
          <div class="flex flex-col mt-10 sm:mt-0">
            <dt class="order-2 mt-2 text-lg leading-6 font-medium text-primary-200">
              Citoyens
            </dt>
            <dd class="order-1 text-5xl font-extrabold text-white">
              {{ stats.citizens }}
            </dd>
          </div>
          <div class="flex flex-col mt-10 sm:mt-0">
            <dt class="order-2 mt-2 text-lg leading-6 font-medium text-primary-200">
              Événements ce mois
            </dt>
            <dd class="order-1 text-5xl font-extrabold text-white">
              {{ stats.events }}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </AppLayout>
</template> 