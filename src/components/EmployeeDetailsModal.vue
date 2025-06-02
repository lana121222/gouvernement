<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-medium text-gray-900">
            Détails de l'employé
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
          <!-- Informations personnelles -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="flex items-center mb-4">
              <div class="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                <span class="text-xl font-medium text-primary-600">
                  {{ employee?.first_name.charAt(0) }}{{ employee?.last_name.charAt(0) }}
                </span>
              </div>
              <div>
                <h4 class="text-xl font-semibold text-gray-900">
                  {{ employee?.first_name }} {{ employee?.last_name }}
                </h4>
                <p class="text-gray-600">{{ employee?.position }}</p>
                <p class="text-sm text-gray-500">{{ employee?.email }}</p>
              </div>
            </div>
          </div>

          <!-- Statut et dates -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <h5 class="font-medium text-gray-900">Statut</h5>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">État:</span>
                  <span v-if="employee?.is_active" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Actif
                  </span>
                  <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Inactif
                  </span>
                </div>
                <div v-if="employee?.is_former" class="flex justify-between">
                  <span class="text-sm text-gray-600">Ancien employé:</span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Oui
                  </span>
                </div>
                <div v-if="employee?.is_blacklisted" class="flex justify-between">
                  <span class="text-sm text-gray-600">Blacklisté:</span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Oui
                  </span>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <h5 class="font-medium text-gray-900">Dates importantes</h5>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Embauché le:</span>
                  <span class="text-sm text-gray-900">{{ formatDate(employee?.created_at) }}</span>
                </div>
                <div v-if="employee?.termination_date" class="flex justify-between">
                  <span class="text-sm text-gray-600">Parti le:</span>
                  <span class="text-sm text-gray-900">{{ formatDate(employee?.termination_date) }}</span>
                </div>
                <div v-if="employee?.updated_at" class="flex justify-between">
                  <span class="text-sm text-gray-600">Dernière MAJ:</span>
                  <span class="text-sm text-gray-900">{{ formatDate(employee?.updated_at) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Informations financières -->
          <div v-if="employee?.is_active" class="bg-blue-50 p-4 rounded-lg">
            <h5 class="font-medium text-gray-900 mb-3">Informations financières</h5>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">${{ formatCurrency(employee?.hourly_rate || 0) }}</div>
                <div class="text-xs text-gray-600">Taux horaire</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">{{ employee?.hours_worked || 0 }}h</div>
                <div class="text-xs text-gray-600">Heures travaillées</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">${{ formatCurrency(employee?.bonus_amount || 0) }}</div>
                <div class="text-xs text-gray-600">Prime</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">${{ formatCurrency(employee?.total_earnings || 0) }}</div>
                <div class="text-xs text-gray-600">Total à payer</div>
              </div>
            </div>
          </div>

          <!-- Raison du départ -->
          <div v-if="employee?.termination_reason" class="bg-orange-50 p-4 rounded-lg">
            <h5 class="font-medium text-gray-900 mb-2">Raison du départ</h5>
            <p class="text-sm text-gray-700">{{ employee.termination_reason }}</p>
          </div>

          <!-- Historique des transactions -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h5 class="font-medium text-gray-900 mb-3">Historique des paiements</h5>
            <div v-if="employeeTransactions.length === 0" class="text-center py-4">
              <p class="text-sm text-gray-500">Aucun paiement enregistré</p>
            </div>
            <div v-else class="space-y-2 max-h-40 overflow-y-auto">
              <div 
                v-for="transaction in employeeTransactions" 
                :key="transaction.id"
                class="flex justify-between items-center p-2 bg-white rounded border"
              >
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ transaction.description }}</div>
                  <div class="text-xs text-gray-500">{{ formatDate(transaction.created_at) }}</div>
                </div>
                <div class="text-sm font-medium text-green-600">
                  ${{ formatCurrency(transaction.amount) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4 border-t">
            <button
              @click="$emit('close')"
              class="btn-secondary"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Employee, Transaction } from '@/lib/firebase'
import { useAccountingStore } from '@/stores/accounting'

interface Props {
  employee: Employee | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const accountingStore = useAccountingStore()
const employeeTransactions = ref<Transaction[]>([])

// Récupérer les transactions de l'employé
const loadEmployeeTransactions = () => {
  if (props.employee) {
    employeeTransactions.value = accountingStore.transactions.filter(
      t => t.employee_id === props.employee?.id
    ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadEmployeeTransactions()
})
</script> 