<script setup lang="ts">
import AppLayout from '@/components/AppLayout.vue'
</script>

<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
      <div class="text-center">
        <h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          Recrutement
        </h1>
        <p class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Rejoignez notre équipe gouvernementale et participez à la gestion du serveur roleplay.
        </p>
      </div>
      
      <div class="mt-10">
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Postes disponibles
            </h3>
            <div class="mt-2 max-w-xl text-sm text-gray-500">
              <p>Consultez les postes actuellement ouverts au recrutement.</p>
            </div>
            <div class="mt-5">
              <div class="rounded-md bg-blue-50 p-4">
                <div class="text-sm text-blue-700">
                  Les candidatures sont actuellement fermées. Revenez bientôt !
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template> 