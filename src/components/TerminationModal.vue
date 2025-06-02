<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100">
          <svg class="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
        </div>
        
        <h3 class="text-lg leading-6 font-medium text-gray-900 mt-4 text-center">
          Passer en ancien employé
        </h3>
        
        <div class="mt-4">
          <div class="bg-gray-50 p-3 rounded-md mb-4">
            <h4 class="font-medium text-gray-900">{{ employee?.first_name }} {{ employee?.last_name }}</h4>
            <p class="text-sm text-gray-600">{{ employee?.position }}</p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label for="reason" class="block text-sm font-medium text-gray-700">
                Raison du départ <span class="text-red-500">*</span>
              </label>
              <select
                id="reason"
                v-model="form.reason"
                required
                class="input-field mt-1"
              >
                <option value="">Sélectionner une raison</option>
                <option value="Démission">Démission</option>
                <option value="Licenciement">Licenciement</option>
                <option value="Fin de contrat">Fin de contrat</option>
                <option value="Mutation">Mutation</option>
                <option value="Retraite">Retraite</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div v-if="form.reason === 'Autre'">
              <label for="customReason" class="block text-sm font-medium text-gray-700">
                Préciser la raison
              </label>
              <input
                id="customReason"
                v-model="form.customReason"
                type="text"
                class="input-field mt-1"
                placeholder="Préciser..."
              />
            </div>

            <div>
              <label for="details" class="block text-sm font-medium text-gray-700">
                Détails supplémentaires
              </label>
              <textarea
                id="details"
                v-model="form.details"
                rows="3"
                class="input-field mt-1"
                placeholder="Informations complémentaires..."
              ></textarea>
            </div>

            <div class="flex items-center">
              <input
                id="blacklisted"
                v-model="form.isBlacklisted"
                type="checkbox"
                class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label for="blacklisted" class="ml-2 block text-sm text-gray-900">
                Ajouter à la liste noire
              </label>
            </div>

            <div v-if="form.isBlacklisted" class="p-3 bg-red-50 border border-red-200 rounded-md">
              <div class="flex">
                <svg class="h-5 w-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <div class="ml-3">
                  <p class="text-sm text-red-800">
                    <strong>Attention:</strong> Cette personne sera marquée comme blacklistée et ne pourra plus être réembauchée.
                  </p>
                </div>
              </div>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="$emit('close')"
                :disabled="loading"
                class="btn-secondary disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="px-4 py-2 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:opacity-50"
              >
                {{ loading ? 'Traitement...' : 'Confirmer' }}
              </button>
            </div>
          </form>
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
  confirm: [reason: string, isBlacklisted: boolean]
}>()

const loading = ref(false)

const form = ref({
  reason: '',
  customReason: '',
  details: '',
  isBlacklisted: false
})

const handleSubmit = async () => {
  loading.value = true
  try {
    const finalReason = form.value.reason === 'Autre' 
      ? form.value.customReason 
      : form.value.reason
    
    const fullReason = form.value.details 
      ? `${finalReason} - ${form.value.details}`
      : finalReason

    emit('confirm', fullReason, form.value.isBlacklisted)
  } finally {
    loading.value = false
  }
}
</script> 