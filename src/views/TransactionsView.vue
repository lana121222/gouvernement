<script setup lang="ts">
import AppLayout from '@/components/AppLayout.vue'
</script>

<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
      <div class="text-center">
        <h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          Gestion des Transactions
        </h1>
        <p class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Gérez les transactions financières du gouvernement.
        </p>
      </div>
      
      <div class="mt-10">
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Historique des transactions
            </h3>
            <div class="mt-2 max-w-xl text-sm text-gray-500">
              <p>Consultez l'historique des transactions.</p>
            </div>
            <div class="mt-5">
              <div class="rounded-md bg-gray-50 p-4">
                <div class="text-sm text-gray-700">
                  Fonctionnalité en cours de développement.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template> 