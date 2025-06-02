<script setup lang="ts">
import AppLayout from '@/components/AppLayout.vue'
</script>

<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
      <div class="text-center">
        <h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          Actualités
        </h1>
        <p class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Restez informé des dernières nouvelles du gouvernement.
        </p>
      </div>
      
      <div class="mt-10">
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Dernières actualités
            </h3>
            <div class="mt-2 max-w-xl text-sm text-gray-500">
              <p>Consultez les dernières annonces et mises à jour.</p>
            </div>
            <div class="mt-5">
              <div class="rounded-md bg-gray-50 p-4">
                <div class="text-sm text-gray-700">
                  Aucune actualité pour le moment. Revenez bientôt !
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template> 