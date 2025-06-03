<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- En-tête -->
      <div class="px-4 py-6 sm:px-0">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Comptabilité</h1>
            <p class="mt-2 text-gray-600">Gestion financière du serveur roleplay</p>
          </div>
          <div class="flex space-x-3">
            <button
              @click="showResetModal = true"
              class="btn-secondary"
            >
              Réinitialiser
            </button>
            <router-link to="/employees" class="btn-primary">
              Gérer les employés
            </router-link>
          </div>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Revenus totaux</p>
              <p class="text-2xl font-semibold text-gray-900">${{ formatCurrency(accountingStore.totalIncome) }}</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Dépenses totales</p>
              <p class="text-2xl font-semibold text-gray-900">${{ formatCurrency(accountingStore.totalExpenses) }}</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Solde</p>
              <p class="text-2xl font-semibold" :class="accountingStore.balance >= 0 ? 'text-green-600' : 'text-red-600'">
                ${{ formatCurrency(accountingStore.balance) }}
              </p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Masse salariale</p>
              <p class="text-2xl font-semibold text-gray-900">${{ formatCurrency(accountingStore.totalPayroll) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation des sections -->
      <div class="mb-8">
        <nav class="flex space-x-8 overflow-x-auto">
          <button
            @click="activeTab = 'employees'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
              activeTab === 'employees'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Employés actifs ({{ accountingStore.activeEmployees.length }})
          </button>
          <button
            @click="activeTab = 'services'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
              activeTab === 'services'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Services
          </button>
          <button
            @click="activeTab = 'sales'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
              activeTab === 'sales'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Ventes & Prestations
          </button>
          <button
            @click="activeTab = 'pricing'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
              activeTab === 'pricing'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Gestion des prix
          </button>
          <button
            @click="activeTab = 'bonuses'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
              activeTab === 'bonuses'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            🎯 Primes & Grades
          </button>
          <button
            @click="activeTab = 'transactions'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
              activeTab === 'transactions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Transactions récentes
          </button>
          <button
            @click="activeTab = 'former'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
              activeTab === 'former'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Anciens employés ({{ accountingStore.formerEmployees.length }})
          </button>
        </nav>
      </div>

      <!-- Contenu des onglets -->
      <div v-if="activeTab === 'employees'">
        <EmployeesList />
      </div>

      <div v-if="activeTab === 'services'">
        <ServicesManagement />
      </div>

      <div v-if="activeTab === 'sales'">
        <SalesManagement />
      </div>

      <div v-if="activeTab === 'pricing'">
        <PricingManagement />
      </div>

      <div v-if="activeTab === 'bonuses'">
        <BonusManagement />
      </div>

      <div v-if="activeTab === 'transactions'">
        <TransactionsList />
      </div>

      <div v-if="activeTab === 'former'">
        <FormerEmployeesList />
      </div>
    </div>

    <!-- Modal de réinitialisation -->
    <div v-if="showResetModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-lg leading-6 font-medium text-gray-900 mt-4">Réinitialiser la comptabilité</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              Cette action va supprimer toutes les transactions et remettre à zéro les heures et primes des employés.
              Une sauvegarde sera créée automatiquement.
            </p>
          </div>
          <div class="items-center px-4 py-3">
            <button
              @click="handleReset"
              :disabled="accountingStore.loading"
              class="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
            >
              {{ accountingStore.loading ? 'Réinitialisation...' : 'Confirmer la réinitialisation' }}
            </button>
            <button
              @click="showResetModal = false"
              class="mt-3 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAccountingStore } from '@/stores/accounting'
import AppLayout from '@/components/AppLayout.vue'
import EmployeesList from '@/components/EmployeesList.vue'
import TransactionsList from '@/components/TransactionsList.vue'
import FormerEmployeesList from '@/components/FormerEmployeesList.vue'
import ServicesManagement from '@/components/ServicesManagement.vue'
import SalesManagement from '@/components/SalesManagement.vue'
import PricingManagement from '@/components/PricingManagement.vue'
import BonusManagement from '@/components/BonusManagement.vue'

const accountingStore = useAccountingStore()
const activeTab = ref('employees')
const showResetModal = ref(false)

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const handleReset = async () => {
  await accountingStore.resetAccounting()
  showResetModal.value = false
}

onMounted(async () => {
  await Promise.all([
    accountingStore.fetchEmployees(),
    accountingStore.fetchTransactions()
  ])
})
</script> 