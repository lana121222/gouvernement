<template>
  <div class="card">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-lg font-medium text-gray-900">Employés actifs</h2>
      <button
        @click="showAddModal = true"
        class="btn-primary"
      >
        Ajouter un employé
      </button>
    </div>

    <div v-if="accountingStore.loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-2 text-gray-500">Chargement...</p>
    </div>

    <div v-else-if="accountingStore.activeEmployees.length === 0" class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun employé</h3>
      <p class="mt-1 text-sm text-gray-500">Commencez par ajouter votre premier employé.</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employé</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poste</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taux horaire</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heures</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prime</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total à payer</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="employee in accountingStore.activeEmployees" :key="employee.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="h-10 w-10 flex-shrink-0">
                  <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span class="text-sm font-medium text-primary-600">
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
              ${{ formatCurrency(employee.hourly_rate) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <input
                v-model.number="employee.hours_worked"
                @change="updateEmployeeHours(employee.id, employee.hours_worked)"
                type="number"
                min="0"
                step="0.5"
                class="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
              />
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <input
                v-model.number="employee.bonus_amount"
                @change="updateEmployeeBonus(employee.id, employee.bonus_amount)"
                type="number"
                min="0"
                step="0.01"
                class="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
              />
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              ${{ formatCurrency(employee.total_earnings) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex justify-end space-x-2">
                <button
                  v-if="employee.total_earnings > 0"
                  @click="showPayModal(employee)"
                  class="text-green-600 hover:text-green-900"
                  title="Payer"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </button>
                <button
                  @click="editEmployee(employee)"
                  class="text-blue-600 hover:text-blue-900"
                  title="Modifier"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button
                  @click="showTerminateModal(employee)"
                  class="text-orange-600 hover:text-orange-900"
                  title="Passer en ancien employé"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                </button>
                <button
                  @click="openDeleteModal(employee)"
                  class="text-red-600 hover:text-red-900"
                  title="Supprimer"
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

    <!-- Modal d'ajout d'employé -->
    <EmployeeModal
      v-if="showAddModal"
      @close="showAddModal = false"
      @save="handleAddEmployee"
    />

    <!-- Modal d'édition d'employé -->
    <EmployeeModal
      v-if="showEditModal"
      :employee="selectedEmployee"
      @close="showEditModal = false"
      @save="handleEditEmployee"
    />

    <!-- Modal de paiement -->
    <PaymentModal
      v-if="showPaymentModal"
      :employee="selectedEmployee"
      @close="showPaymentModal = false"
      @confirm="handlePayment"
    />

    <!-- Modal de licenciement -->
    <TerminationModal
      v-if="showTerminationModal"
      :employee="selectedEmployee"
      @close="showTerminationModal = false"
      @confirm="handleTermination"
    />

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
import EmployeeModal from './EmployeeModal.vue'
import PaymentModal from './PaymentModal.vue'
import TerminationModal from './TerminationModal.vue'
import DeleteModal from './DeleteModal.vue'

const accountingStore = useAccountingStore()

const showAddModal = ref(false)
const showEditModal = ref(false)
const showPaymentModal = ref(false)
const showTerminationModal = ref(false)
const showDeleteModal = ref(false)
const selectedEmployee = ref<Employee | null>(null)

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const updateEmployeeHours = async (id: string, hours: number) => {
  await accountingStore.updateEmployee(id, { hours_worked: hours })
}

const updateEmployeeBonus = async (id: string, bonus: number) => {
  await accountingStore.updateEmployee(id, { bonus_amount: bonus })
}

const showPayModal = (employee: Employee) => {
  selectedEmployee.value = employee
  showPaymentModal.value = true
}

const editEmployee = (employee: Employee) => {
  selectedEmployee.value = employee
  showEditModal.value = true
}

const showTerminateModal = (employee: Employee) => {
  selectedEmployee.value = employee
  showTerminationModal.value = true
}

const openDeleteModal = (employee: Employee) => {
  selectedEmployee.value = employee
  showDeleteModal.value = true
}

const handleAddEmployee = async (employeeData: any) => {
  await accountingStore.addEmployee(employeeData)
  showAddModal.value = false
}

const handleEditEmployee = async (employeeData: any) => {
  if (selectedEmployee.value) {
    await accountingStore.updateEmployee(selectedEmployee.value.id, employeeData)
    showEditModal.value = false
    selectedEmployee.value = null
  }
}

const handlePayment = async () => {
  if (selectedEmployee.value) {
    await accountingStore.payEmployee(selectedEmployee.value.id)
    showPaymentModal.value = false
    selectedEmployee.value = null
  }
}

const handleTermination = async (reason: string, isBlacklisted: boolean) => {
  if (selectedEmployee.value) {
    await accountingStore.moveToFormer(selectedEmployee.value.id, reason, isBlacklisted)
    showTerminationModal.value = false
    selectedEmployee.value = null
  }
}

const handleDelete = async () => {
  if (selectedEmployee.value) {
    await accountingStore.deleteEmployee(selectedEmployee.value.id)
    showDeleteModal.value = false
    selectedEmployee.value = null
  }
}
</script> 