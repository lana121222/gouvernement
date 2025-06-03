<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex justify-between items-center">
      <div>
        <h3 class="text-lg font-medium text-gray-900">Gestion des prix</h3>
        <p class="text-gray-600">Ajouter, modifier et supprimer les prestations et prix</p>
      </div>
      <button
        @click="showAddModal = true"
        class="btn-primary"
      >
        Ajouter un service
      </button>
    </div>

    <!-- Statistiques rapides -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span class="text-green-600 text-lg">💰</span>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Ventes</p>
            <p class="text-2xl font-semibold text-gray-900">{{ salesCount }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-blue-600 text-lg">🛠️</span>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Prestations</p>
            <p class="text-2xl font-semibold text-gray-900">{{ prestationsCount }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span class="text-purple-600 text-lg">🏷️</span>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Total services</p>
            <p class="text-2xl font-semibold text-gray-900">{{ accountingStore.serviceItems.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Services par catégorie -->
    <div class="space-y-6">
      <div v-for="(services, category) in accountingStore.servicesByCategory" :key="category" class="card">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-lg font-medium text-gray-900 capitalize">
            {{ category === 'vente' ? '💰 Ventes' : '🛠️ Prestations' }}
            <span class="text-sm text-gray-500 font-normal">({{ services.length }})</span>
          </h4>
        </div>
        
        <div v-if="services.length === 0" class="text-center py-8 text-gray-500">
          Aucun {{ category === 'vente' ? 'produit' : 'service' }} configuré
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="service in services" :key="service.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ service.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                  ${{ service.price.toFixed(2) }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ service.description || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    @click="editService(service)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    Modifier
                  </button>
                  <button
                    @click="deleteService(service)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal d'ajout/modification -->
    <div v-if="showAddModal || editingService" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            {{ editingService ? 'Modifier le service' : 'Ajouter un service' }}
          </h3>
          
          <form 
            @submit.prevent="submitForm" 
            class="space-y-4"
            data-dashlane-rid="false"
            data-form-type="other"
            autocomplete="off"
            novalidate
          >
            <div>
              <label for="serviceName" class="block text-sm font-medium text-gray-700 mb-1">
                Nom du service/produit
              </label>
              <input
                id="serviceName"
                v-model="formData.name"
                type="text"
                required
                maxlength="100"
                placeholder="Ex: Réparation moteur"
                class="input-field"
                autocomplete="off"
                data-dashlane-rid="false"
                data-form-type="other"
              />
            </div>
            
            <div>
              <label for="serviceCategory" class="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                id="serviceCategory"
                v-model="formData.category"
                required
                class="input-field"
                autocomplete="off"
                data-dashlane-rid="false"
                data-form-type="other"
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="vente">💰 Vente</option>
                <option value="prestation">🛠️ Prestation</option>
              </select>
            </div>
            
            <div>
              <label for="servicePrice" class="block text-sm font-medium text-gray-700 mb-1">
                Prix ($)
              </label>
              <input
                id="servicePrice"
                v-model.number="formData.price"
                type="number"
                min="0.01"
                max="99999.99"
                step="0.01"
                required
                placeholder="0.00"
                class="input-field"
                autocomplete="off"
                data-dashlane-rid="false"
                data-form-type="other"
              />
            </div>
            
            <div>
              <label for="serviceDescription" class="block text-sm font-medium text-gray-700 mb-1">
                Description (optionnelle)
              </label>
              <textarea
                id="serviceDescription"
                v-model="formData.description"
                rows="3"
                maxlength="500"
                placeholder="Description du service..."
                class="input-field"
                autocomplete="off"
                data-dashlane-rid="false"
                data-form-type="other"
              ></textarea>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="btn-secondary"
                :disabled="accountingStore.loading"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="accountingStore.loading || !formData.name.trim() || !formData.category || formData.price <= 0"
                class="btn-primary disabled:opacity-50"
              >
                {{ accountingStore.loading ? 'Enregistrement...' : (editingService ? 'Modifier' : 'Ajouter') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAccountingStore } from '@/stores/accounting'
import type { ServiceItem } from '@/lib/firebase'

const accountingStore = useAccountingStore()

// État des modals
const showAddModal = ref(false)
const editingService = ref<ServiceItem | null>(null)

// Données du formulaire
const formData = ref({
  name: '',
  category: '' as '' | 'vente' | 'prestation',
  price: 0,
  description: ''
})

// Computed
const salesCount = computed(() => 
  accountingStore.serviceItems.filter(item => item.category === 'vente').length
)

const prestationsCount = computed(() => 
  accountingStore.serviceItems.filter(item => item.category === 'prestation').length
)

// Fonctions
const editService = (service: ServiceItem) => {
  editingService.value = service
  formData.value = {
    name: service.name,
    category: service.category,
    price: service.price,
    description: service.description || ''
  }
}

const deleteService = async (service: ServiceItem) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer "${service.name}" ?`)) {
    try {
      await accountingStore.deleteServiceItem(service.id)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression')
    }
  }
}

const submitForm = async () => {
  try {
    // Validation des données
    if (!formData.value.name.trim()) {
      alert('Le nom du service est requis')
      return
    }
    
    if (!formData.value.category) {
      alert('La catégorie est requise')
      return
    }
    
    if (formData.value.price <= 0) {
      alert('Le prix doit être supérieur à 0')
      return
    }

    // Préparer les données
    const serviceData = {
      name: formData.value.name.trim(),
      category: formData.value.category as 'vente' | 'prestation',
      price: Number(formData.value.price),
      description: formData.value.description.trim() || undefined
    }

    if (editingService.value) {
      // Modification
      await accountingStore.updateServiceItem(editingService.value.id, serviceData)
    } else {
      // Ajout
      await accountingStore.addServiceItem(serviceData)
    }
    
    closeModal()
    
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error)
    alert('Erreur lors de l\'enregistrement: ' + (error instanceof Error ? error.message : 'Erreur inconnue'))
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingService.value = null
  // Reset avec des valeurs par défaut sûres
  formData.value = {
    name: '',
    category: '',
    price: 0,
    description: ''
  }
}

onMounted(async () => {
  await accountingStore.initializeServiceStore()
})
</script> 