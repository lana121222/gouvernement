<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
          Ajouter une transaction
        </h3>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="type" class="block text-sm font-medium text-gray-700">Type</label>
            <select
              id="type"
              v-model="form.type"
              required
              class="input-field mt-1"
            >
              <option value="">Sélectionner un type</option>
              <option value="income">Revenus</option>
              <option value="expense">Dépenses</option>
            </select>
          </div>

          <div>
            <label for="amount" class="block text-sm font-medium text-gray-700">Montant ($)</label>
            <input
              id="amount"
              v-model.number="form.amount"
              type="number"
              min="0"
              step="0.01"
              required
              class="input-field mt-1"
              placeholder="0.00"
            />
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
            <input
              id="description"
              v-model="form.description"
              type="text"
              required
              class="input-field mt-1"
              placeholder="Description de la transaction"
            />
          </div>

          <div>
            <label for="category" class="block text-sm font-medium text-gray-700">Catégorie</label>
            <select
              id="category"
              v-model="form.category"
              required
              class="input-field mt-1"
            >
              <option value="">Sélectionner une catégorie</option>
              <template v-if="form.type === 'income'">
                <option value="Vente">Vente</option>
                <option value="Service">Service</option>
                <option value="Donation">Donation</option>
                <option value="Subvention">Subvention</option>
                <option value="Autre revenus">Autre revenus</option>
              </template>
              <template v-if="form.type === 'expense'">
                <option value="Salaire">Salaire</option>
                <option value="Équipement">Équipement</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Marketing">Marketing</option>
                <option value="Frais généraux">Frais généraux</option>
                <option value="Autre dépenses">Autre dépenses</option>
              </template>
            </select>
          </div>

          <div v-if="form.category === 'Autre revenus' || form.category === 'Autre dépenses'">
            <label for="customCategory" class="block text-sm font-medium text-gray-700">
              Préciser la catégorie
            </label>
            <input
              id="customCategory"
              v-model="form.customCategory"
              type="text"
              class="input-field mt-1"
              placeholder="Préciser..."
            />
          </div>

          <div class="bg-gray-50 p-3 rounded-md">
            <div class="text-sm text-gray-600">
              <strong>
                {{ form.type === 'income' ? 'Revenus' : 'Dépenses' }}: 
                ${{ formatCurrency(form.amount || 0) }}
              </strong>
            </div>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="btn-primary disabled:opacity-50"
            >
              {{ loading ? 'Enregistrement...' : 'Ajouter' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Transaction } from '@/lib/firebase'

const emit = defineEmits<{
  close: []
  save: [data: Omit<Transaction, 'id' | 'created_at'>]
}>()

const loading = ref(false)

const form = ref({
  type: '' as 'income' | 'expense' | '',
  amount: 0,
  description: '',
  category: '',
  customCategory: ''
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const finalCategory = (form.value.category === 'Autre revenus' || form.value.category === 'Autre dépenses') 
      ? form.value.customCategory 
      : form.value.category

    const data = {
      type: form.value.type as 'income' | 'expense',
      amount: form.value.amount,
      description: form.value.description,
      category: finalCategory
    }
    
    emit('save', data)
  } finally {
    loading.value = false
  }
}
</script> 