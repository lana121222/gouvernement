<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3 text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
          </svg>
        </div>
        
        <h3 class="text-lg leading-6 font-medium text-gray-900 mt-4">
          Confirmer le paiement
        </h3>
        
        <div class="mt-4 text-left">
          <div class="bg-gray-50 p-4 rounded-md">
            <h4 class="font-medium text-gray-900">{{ employee?.first_name }} {{ employee?.last_name }}</h4>
            <p class="text-sm text-gray-600">{{ employee?.position }}</p>
            
            <div class="mt-3 space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Heures travaillées:</span>
                <span>{{ employee?.hours_worked }}h</span>
              </div>
              <div class="flex justify-between">
                <span>Taux horaire:</span>
                <span>${{ formatCurrency(employee?.hourly_rate || 0) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Salaire de base:</span>
                <span>${{ formatCurrency((employee?.hours_worked || 0) * (employee?.hourly_rate || 0)) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Prime:</span>
                <span>${{ formatCurrency(employee?.bonus_amount || 0) }}</span>
              </div>
              <hr class="my-2">
              <div class="flex justify-between font-medium text-lg">
                <span>Total à payer:</span>
                <span class="text-green-600">${{ formatCurrency(employee?.total_earnings || 0) }}</span>
              </div>
            </div>
          </div>
          
          <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div class="flex">
              <svg class="h-5 w-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <div class="ml-3">
                <p class="text-sm text-yellow-800">
                  <strong>Attention:</strong> Cette action va créer une transaction de paiement et remettre à zéro les heures et primes de l'employé.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sécurité anti-clic accidentel -->
        <div class="mt-4">
          <label class="flex items-center">
            <input
              v-model="confirmationChecked"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">
              Je confirme vouloir effectuer ce paiement
            </span>
          </label>
        </div>

        <div class="items-center px-4 py-3 mt-4">
          <button
            @click="handleConfirm"
            :disabled="!confirmationChecked || loading"
            class="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Traitement...' : 'Confirmer le paiement' }}
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
import type { Employee } from '@/lib/firebase'

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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

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