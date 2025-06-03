<template>
  <div class="card">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-lg font-medium text-gray-900">Transactions récentes</h2>
      <button
        @click="showAddModal = true"
        class="btn-primary"
      >
        Ajouter une transaction
      </button>
    </div>

    <div v-if="accountingStore.loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-2 text-gray-500">Chargement...</p>
    </div>

    <div v-else-if="accountingStore.transactions.length === 0" class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune transaction</h3>
      <p class="mt-1 text-sm text-gray-500">Commencez par ajouter votre première transaction.</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="transaction in accountingStore.transactions" :key="transaction.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ formatDate(transaction.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  transaction.type === 'income' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                ]"
              >
                {{ transaction.type === 'income' ? 'Revenus' : 'Dépenses' }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-900">
              {{ transaction.description }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ transaction.category }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <span 
                :class="transaction.type === 'income' ? 'text-green-600' : 'text-red-600'"
              >
                {{ transaction.type === 'income' ? '+' : '-' }}${{ formatCurrency(transaction.amount) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="deleteTransaction(transaction)"
                class="text-red-600 hover:text-red-900"
                title="Supprimer"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal d'ajout de transaction -->
    <TransactionModal
      v-if="showAddModal"
      @close="showAddModal = false"
      @save="handleAddTransaction"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAccountingStore } from '@/stores/accounting'
import type { Transaction } from '@/lib/firebase'
import TransactionModal from './TransactionModal.vue'
import { useNotificationStore } from '@/stores/notifications'

const accountingStore = useAccountingStore()
const showAddModal = ref(false)
const notificationStore = useNotificationStore()

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const deleteTransaction = async (transaction: any) => {
  try {
    const confirmed = await notificationStore.confirm(
      'Supprimer la transaction',
      'Êtes-vous sûr de vouloir supprimer cette transaction ?'
    )
    if (!confirmed) return

    await accountingStore.deleteTransaction(transaction.id)
    notificationStore.success('Transaction supprimée', 'Transaction supprimée avec succès')
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    notificationStore.error('Erreur de suppression', 'Erreur lors de la suppression de la transaction')
  }
}

const handleAddTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at'>) => {
  await accountingStore.addTransaction(transactionData)
  showAddModal.value = false
}
</script> 