<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3 text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </div>
        
        <h3 class="text-lg leading-6 font-medium text-gray-900 mt-4">
          Supprimer l'employé
        </h3>
        
        <div class="mt-4 text-left">
          <div class="bg-gray-50 p-3 rounded-md mb-4">
            <h4 class="font-medium text-gray-900">{{ employee?.first_name }} {{ employee?.last_name }}</h4>
            <p class="text-sm text-gray-600">{{ employee?.position }}</p>
            <p class="text-sm text-gray-600">{{ employee?.email }}</p>
          </div>
          
          <div class="p-4 bg-red-50 border border-red-200 rounded-md">
            <div class="flex">
              <svg class="h-5 w-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <div class="ml-3">
                <h4 class="text-sm font-medium text-red-800">Attention - Action irréversible</h4>
                <div class="mt-2 text-sm text-red-700">
                  <ul class="list-disc list-inside space-y-1">
                    <li>L'employé sera définitivement supprimé</li>
                    <li>Toutes ses transactions seront supprimées</li>
                    <li>Cette action ne peut pas être annulée</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div class="flex">
              <svg class="h-5 w-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div class="ml-3">
                <p class="text-sm text-blue-800">
                  <strong>Alternative recommandée:</strong> Utilisez plutôt "Passer en ancien employé" pour conserver l'historique.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Confirmation de sécurité -->
        <div class="mt-4 text-left">
          <label class="flex items-center">
            <input
              v-model="confirmationChecked"
              type="checkbox"
              class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">
              Je comprends que cette action est irréversible
            </span>
          </label>
        </div>

        <div class="items-center px-4 py-3 mt-4">
          <button
            @click="handleConfirm"
            :disabled="!confirmationChecked || loading"
            class="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Suppression...' : 'Supprimer définitivement' }}
          </button>
          <button
            @click="$emit('close')"
            :disabled="loading"
            class="mt-3 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Employee } from '@/lib/supabase'

interface Props {
  employee: Employee | null
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const confirmationChecked = ref(false)
const loading = ref(false)

const handleConfirm = async () => {
  if (!confirmationChecked.value) return
  
  loading.value = true
  try {
    emit('confirm')
  } finally {
    loading.value = false
  }
}
</script> 