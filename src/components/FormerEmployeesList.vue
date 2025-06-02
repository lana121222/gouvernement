<template>
  <div class="card">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-lg font-medium text-gray-900">Anciens employés</h2>
    </div>

    <div v-if="accountingStore.loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-2 text-gray-500">Chargement...</p>
    </div>

    <div v-else-if="accountingStore.formerEmployees.length === 0" class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun ancien employé</h3>
      <p class="mt-1 text-sm text-gray-500">Les employés licenciés ou démissionnaires apparaîtront ici.</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employé</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ancien poste</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de départ</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Raison</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="employee in accountingStore.formerEmployees" :key="employee.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="h-10 w-10 flex-shrink-0">
                  <div class="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-600">
                      {{ employee.first_name.charAt(0) }}{{ employee.last_name.charAt(0) }}
                    </span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ employee.first_name }} {{ employee.last_name }}
                  </div>
                  <div class="text-sm text-gray-500">{{ employee.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ employee.position }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ employee.termination_date ? formatDate(employee.termination_date) : '-' }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-900">
              {{ employee.termination_reason || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                v-if="employee.is_blacklisted"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
              >
                Blacklisté
              </span>
              <span 
                v-else
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                Normal
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex justify-end space-x-2">
                <button
                  v-if="!employee.is_blacklisted"
                  @click="reactivateEmployee(employee)"
                  class="text-green-600 hover:text-green-900"
                  title="Réactiver"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                </button>
                <button
                  @click="showDeleteModal(employee)"
                  class="text-red-600 hover:text-red-900"
                  title="Supprimer définitivement"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de suppression -->
    <DeleteModal
      v-if="showDeleteModal"
      :employee="selectedEmployee"
      @close="showDeleteModal = false"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAccountingStore } from '@/stores/accounting'
import type { Employee } from '@/lib/supabase'
import DeleteModal from './DeleteModal.vue'

const accountingStore = useAccountingStore()
const showDeleteModal = ref(false)
const selectedEmployee = ref<Employee | null>(null)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const reactivateEmployee = async (employee: Employee) => {
  if (confirm(`Êtes-vous sûr de vouloir réactiver ${employee.first_name} ${employee.last_name} ?`)) {
    await accountingStore.updateEmployee(employee.id, {
      is_active: true,
      is_former: false,
      termination_date: undefined,
      termination_reason: undefined
    })
  }
}

const showDeleteModal = (employee: Employee) => {
  selectedEmployee.value = employee
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (selectedEmployee.value) {
    await accountingStore.deleteEmployee(selectedEmployee.value.id)
    showDeleteModal.value = false
    selectedEmployee.value = null
  }
}
</script> 