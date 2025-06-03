<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex justify-between items-center">
      <div>
        <h3 class="text-lg font-medium text-gray-900">Ventes & Prestations</h3>
        <p class="text-gray-600">Ajouter les ventes et prestations des employés</p>
      </div>
    </div>

    <!-- Formulaire d'ajout -->
    <div class="card">
      <h4 class="text-lg font-medium text-gray-900 mb-4">Ajouter une vente ou prestation</h4>
      
      <form @submit.prevent="submitSale" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Sélection employé -->
          <div>
            <label for="employee" class="block text-sm font-medium text-gray-700 mb-1">
              Employé
            </label>
            <select
              id="employee"
              v-model="selectedEmployeeId"
              required
              class="input-field"
            >
              <option value="">Sélectionner un employé</option>
              <option
                v-for="employee in accountingStore.activeEmployees"
                :key="employee.id"
                :value="employee.id"
              >
                {{ employee.first_name }} {{ employee.last_name }} - {{ employee.position }}
              </option>
            </select>
          </div>

          <!-- Type de transaction -->
          <div>
            <label for="type" class="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="type"
              v-model="selectedType"
              @change="resetForm"
              required
              class="input-field"
            >
              <option value="">Sélectionner le type</option>
              <option value="vente">💰 Vente</option>
              <option value="prestation">🛠️ Prestation</option>
            </select>
          </div>
        </div>

        <!-- Sélection service/prestation -->
        <div v-if="selectedType">
          <label for="service" class="block text-sm font-medium text-gray-700 mb-1">
            {{ selectedType === 'vente' ? 'Produit' : 'Service' }}
          </label>
          <select
            id="service"
            v-model="selectedServiceId"
            @change="handleServiceChange"
            required
            class="input-field"
          >
            <option value="">Sélectionner {{ selectedType === 'vente' ? 'un produit' : 'un service' }}</option>
            <option
              v-for="service in filteredServices"
              :key="service.id"
              :value="service.id"
            >
              {{ service.name }} - ${{ service.price }}
            </option>
            <option value="custom">✏️ Autre (personnalisé)</option>
          </select>
        </div>

        <!-- Champs personnalisés pour "autre" -->
        <div v-if="selectedServiceId === 'custom'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="customName" class="block text-sm font-medium text-gray-700 mb-1">
              Nom personnalisé
            </label>
            <input
              id="customName"
              v-model="customName"
              type="text"
              required
              placeholder="Ex: Réparation spéciale"
              class="input-field"
            />
          </div>
          <div>
            <label for="customPrice" class="block text-sm font-medium text-gray-700 mb-1">
              Prix personnalisé ($)
            </label>
            <input
              id="customPrice"
              v-model.number="customPrice"
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="0.00"
              class="input-field"
            />
          </div>
        </div>

        <!-- Description optionnelle -->
        <div v-if="selectedServiceId === 'custom'">
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
            Description (optionnelle)
          </label>
          <textarea
            id="description"
            v-model="customDescription"
            rows="2"
            placeholder="Détails supplémentaires..."
            class="input-field"
          ></textarea>
        </div>

        <!-- Récapitulatif -->
        <div v-if="selectedEmployeeId && selectedType && (selectedServiceId || selectedServiceId === 'custom')" 
             class="bg-gray-50 p-4 rounded-lg">
          <h5 class="text-sm font-medium text-gray-900 mb-2">Récapitulatif</h5>
          <div class="text-sm text-gray-600 space-y-1">
            <p><strong>Employé:</strong> {{ selectedEmployeeName }}</p>
            <p><strong>Type:</strong> {{ selectedType === 'vente' ? 'Vente' : 'Prestation' }}</p>
            <p><strong>{{ selectedType === 'vente' ? 'Produit' : 'Service' }}:</strong> {{ selectedServiceName }}</p>
            <p><strong>Montant:</strong> ${{ selectedAmount.toFixed(2) }}</p>
          </div>
        </div>

        <!-- Boutons -->
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="resetForm"
            class="btn-secondary"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="!canSubmit || accountingStore.loading"
            class="btn-primary disabled:opacity-50"
          >
            {{ accountingStore.loading ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Historique des ventes et prestations -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-lg font-medium text-gray-900">Historique récent</h4>
        <button
          @click="refreshHistory"
          :disabled="accountingStore.loading"
          class="btn-secondary text-sm disabled:opacity-50"
        >
          Actualiser
        </button>
      </div>
      
      <div v-if="accountingStore.loading" class="text-center py-4">
        <div class="text-gray-500">Chargement...</div>
      </div>
      
      <div v-else-if="recentSales.length === 0" class="text-center py-8 text-gray-500">
        Aucune vente ou prestation enregistrée
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employé
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service/Produit
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="sale in recentSales" :key="sale.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ sale.employee_name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    sale.type === 'vente' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  ]"
                >
                  {{ sale.type === 'vente' ? '💰 Vente' : '🛠️ Prestation' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ sale.service_name }}
                <div v-if="sale.custom_description" class="text-xs text-gray-500">
                  {{ sale.custom_description }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                ${{ sale.amount.toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDateTime(sale.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAccountingStore } from '@/stores/accounting'

const accountingStore = useAccountingStore()

// État du formulaire
const selectedEmployeeId = ref('')
const selectedType = ref<'vente' | 'prestation' | ''>('')
const selectedServiceId = ref('')
const customName = ref('')
const customPrice = ref(0)
const customDescription = ref('')

// Computed properties
const selectedEmployee = computed(() => 
  accountingStore.activeEmployees.find(emp => emp.id === selectedEmployeeId.value)
)

const selectedEmployeeName = computed(() => 
  selectedEmployee.value ? `${selectedEmployee.value.first_name} ${selectedEmployee.value.last_name}` : ''
)

const filteredServices = computed(() => 
  accountingStore.serviceItems.filter(service => service.category === selectedType.value)
)

const selectedService = computed(() => 
  filteredServices.value.find(service => service.id === selectedServiceId.value)
)

const selectedServiceName = computed(() => {
  if (selectedServiceId.value === 'custom') {
    return customName.value || 'Service personnalisé'
  }
  return selectedService.value?.name || ''
})

const selectedAmount = computed(() => {
  if (selectedServiceId.value === 'custom') {
    return customPrice.value || 0
  }
  return selectedService.value?.price || 0
})

const canSubmit = computed(() => 
  selectedEmployeeId.value && 
  selectedType.value && 
  (
    (selectedServiceId.value && selectedServiceId.value !== 'custom') ||
    (selectedServiceId.value === 'custom' && customName.value && customPrice.value > 0)
  )
)

const recentSales = computed(() => 
  accountingStore.serviceTransactions
    .filter(t => t.type === 'vente' || t.type === 'prestation')
    .slice(0, 20)
)

// Fonctions
const handleServiceChange = () => {
  if (selectedServiceId.value !== 'custom') {
    customName.value = ''
    customPrice.value = 0
    customDescription.value = ''
  }
}

const resetForm = () => {
  selectedServiceId.value = ''
  customName.value = ''
  customPrice.value = 0
  customDescription.value = ''
}

const submitSale = async () => {
  if (!canSubmit.value) return
  
  try {
    const serviceName = selectedServiceName.value
    const amount = selectedAmount.value
    const serviceItemId = selectedServiceId.value === 'custom' ? undefined : selectedServiceId.value
    const description = selectedServiceId.value === 'custom' ? customDescription.value : undefined
    
    await accountingStore.addServiceSale(
      selectedEmployeeId.value,
      selectedEmployeeName.value,
      serviceItemId,
      serviceName,
      amount,
      selectedType.value as 'vente' | 'prestation',
      description
    )
    
    // Reset du formulaire
    selectedEmployeeId.value = ''
    selectedType.value = ''
    resetForm()
    
    alert('Vente/Prestation enregistrée avec succès !')
    
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error)
    alert('Erreur lors de l\'enregistrement')
  }
}

const refreshHistory = async () => {
  try {
    await accountingStore.fetchServiceTransactions()
  } catch (error) {
    console.error('Erreur lors du rafraîchissement:', error)
  }
}

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  await accountingStore.initializeServiceStore()
})
</script> 