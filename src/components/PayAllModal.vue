<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-medium text-gray-900">
            Paiement en masse
          </h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="space-y-6">
          <!-- Résumé du paiement -->
          <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div class="flex items-center mb-3">
              <svg class="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h4 class="text-lg font-medium text-blue-900">Résumé du paiement</h4>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-blue-700">Nombre d'employés:</span>
                <span class="font-medium text-blue-900 ml-2">{{ employees.length }}</span>
              </div>
              <div>
                <span class="text-blue-700">Montant total:</span>
                <span class="font-medium text-blue-900 ml-2">${{ formatCurrency(totalAmount) }}</span>
              </div>
            </div>
          </div>

          <!-- Liste des employés à payer -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Employés à payer</h4>
            <div class="max-h-60 overflow-y-auto space-y-2">
              <div 
                v-for="employee in employees" 
                :key="employee.id"
                class="flex items-center justify-between p-3 bg-white rounded border"
              >
                <div class="flex items-center">
                  <div class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                    <span class="text-xs font-medium text-primary-600">
                      {{ employee.first_name.charAt(0) }}{{ employee.last_name.charAt(0) }}
                    </span>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      {{ employee.first_name }} {{ employee.last_name }}
                    </div>
                    <div class="text-xs text-gray-500">{{ employee.position }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-medium text-green-600">
                    ${{ formatCurrency(employee.total_earnings) }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ employee.hours_worked }}h + ${{ formatCurrency(employee.bonus_amount) }} prime
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Détails des transactions -->
          <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div class="flex items-center mb-3">
              <svg class="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <h4 class="text-sm font-medium text-yellow-900">Ce qui va se passer</h4>
            </div>
            <ul class="text-sm text-yellow-800 space-y-1">
              <li>• {{ employees.length }} transaction{{ employees.length > 1 ? 's' : '' }} de paiement {{ employees.length > 1 ? 'seront créées' : 'sera créée' }}</li>
              <li>• Les heures et primes seront remises à zéro</li>
              <li>• Le montant total de ${{ formatCurrency(totalAmount) }} sera déduit du budget</li>
              <li>• Cette action ne peut pas être annulée</li>
            </ul>
          </div>

          <!-- Confirmation -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <label class="flex items-center">
              <input
                v-model="confirmationChecked"
                type="checkbox"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="ml-2 text-sm text-gray-700">
                Je confirme vouloir payer tous ces employés et comprends que cette action est irréversible
              </span>
            </label>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4 border-t">
            <button
              @click="$emit('close')"
              :disabled="loading"
              class="btn-secondary disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              @click="handleConfirm"
              :disabled="!confirmationChecked || loading"
              class="px-4 py-2 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Paiement en cours...' : `Payer ${employees.length} employé${employees.length > 1 ? 's' : ''}` }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Employee } from '@/lib/firebase'

interface Props {
  employees: Employee[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const confirmationChecked = ref(false)
const loading = ref(false)

const totalAmount = computed(() => 
  props.employees.reduce((sum, emp) => sum + emp.total_earnings, 0)
)

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