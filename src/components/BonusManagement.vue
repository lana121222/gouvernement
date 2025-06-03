<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex justify-between items-center">
      <div>
        <h3 class="text-lg font-medium text-gray-900">🎯 Gestion des Primes & Grades</h3>
        <p class="text-gray-600">Configuration des pourcentages de primes selon les grades et performances</p>
      </div>
      <button
        @click="showAddModal = true"
        class="btn-primary"
      >
        + Ajouter un grade
      </button>
    </div>

    <!-- Configuration des primes par grade -->
    <div class="card">
      <h4 class="text-lg font-medium text-gray-900 mb-4">Configuration des primes par grade</h4>
      
      <div v-if="accountingStore.loading" class="text-center py-4">
        <div class="text-gray-500">Chargement...</div>
      </div>
      
      <div v-else-if="bonusConfigs.length === 0" class="text-center py-8 text-gray-500">
        <div class="text-6xl mb-4">🎯</div>
        <p>Aucune configuration de prime définie</p>
        <p class="text-sm mt-2">Commencez par ajouter des grades et leurs pourcentages</p>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grade
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                % Ventes
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                % Prestations
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seuil minimum
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="config in bonusConfigs" :key="config.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <span class="text-2xl mr-2">{{ getGradeIcon(config.grade) }}</span>
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      {{ formatGradeName(config.grade) }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ getGradeDescription(config.grade) }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {{ config.vente_percentage }}%
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ config.prestation_percentage }}%
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${{ config.min_amount_threshold.toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    config.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ config.is_active ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  @click="editConfig(config)"
                  class="text-indigo-600 hover:text-indigo-900"
                >
                  Modifier
                </button>
                <button
                  @click="toggleConfigStatus(config)"
                  :class="[
                    'hover:opacity-75',
                    config.is_active ? 'text-red-600' : 'text-green-600'
                  ]"
                >
                  {{ config.is_active ? 'Désactiver' : 'Activer' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Aperçu des employés et leurs grades -->
    <div class="card">
      <h4 class="text-lg font-medium text-gray-900 mb-4">Employés et leurs grades</h4>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="employee in accountingStore.activeEmployees" 
          :key="employee.id"
          class="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-2xl mr-3">{{ getGradeIcon(employee.grade || 'debutant') }}</span>
              <div>
                <h5 class="font-medium text-gray-900">
                  {{ employee.first_name }} {{ employee.last_name }}
                </h5>
                <p class="text-sm text-gray-500">{{ employee.position }}</p>
                <p class="text-xs text-gray-400">
                  Grade: {{ formatGradeName(employee.grade || 'debutant') }}
                </p>
              </div>
            </div>
            <button
              @click="openGradeEditModal(employee)"
              class="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
            >
              Modifier
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistiques des primes -->
    <div class="card">
      <h4 class="text-lg font-medium text-gray-900 mb-4">Statistiques des primes générées</h4>
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-green-50 p-4 rounded-lg">
          <div class="flex items-center">
            <div class="text-green-600 text-2xl mr-3">💰</div>
            <div>
              <p class="text-sm text-green-600 font-medium">Primes ventes</p>
              <p class="text-xl font-bold text-green-800">${{ totalSalesBonuses.toFixed(2) }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="flex items-center">
            <div class="text-blue-600 text-2xl mr-3">🛠️</div>
            <div>
              <p class="text-sm text-blue-600 font-medium">Primes prestations</p>
              <p class="text-xl font-bold text-blue-800">${{ totalServiceBonuses.toFixed(2) }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-purple-50 p-4 rounded-lg">
          <div class="flex items-center">
            <div class="text-purple-600 text-2xl mr-3">🎯</div>
            <div>
              <p class="text-sm text-purple-600 font-medium">Total primes</p>
              <p class="text-xl font-bold text-purple-800">${{ (totalSalesBonuses + totalServiceBonuses).toFixed(2) }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="flex items-center">
            <div class="text-gray-600 text-2xl mr-3">📊</div>
            <div>
              <p class="text-sm text-gray-600 font-medium">Transactions</p>
              <p class="text-xl font-bold text-gray-800">{{ totalTransactions }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'ajout/modification de configuration -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            {{ showEditModal ? 'Modifier la configuration' : 'Ajouter une configuration de grade' }}
          </h3>
          
          <form @submit.prevent="submitConfig" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Grade</label>
              <select v-model="formData.grade" required class="input-field" :disabled="showEditModal">
                <option value="debutant">🌱 Débutant</option>
                <option value="junior">📈 Junior</option>
                <option value="senior">⭐ Senior</option>
                <option value="expert">🎓 Expert</option>
                <option value="manager">👔 Manager</option>
                <option value="directeur">👑 Directeur</option>
              </select>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">% Ventes</label>
                <input 
                  v-model.number="formData.vente_percentage" 
                  type="number" 
                  min="0" 
                  max="100" 
                  step="0.1"
                  required 
                  class="input-field"
                  placeholder="5.0"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">% Prestations</label>
                <input 
                  v-model.number="formData.prestation_percentage" 
                  type="number" 
                  min="0" 
                  max="100" 
                  step="0.1"
                  required 
                  class="input-field"
                  placeholder="3.0"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Seuil minimum ($)</label>
              <input 
                v-model.number="formData.min_amount_threshold" 
                type="number" 
                min="0" 
                step="0.01"
                required 
                class="input-field"
                placeholder="100.00"
              />
            </div>
            
            <div class="flex items-center">
              <input 
                v-model="formData.is_active" 
                type="checkbox" 
                id="is_active"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label for="is_active" class="ml-2 block text-sm text-gray-900">
                Configuration active
              </label>
            </div>
            
            <div class="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                @click="closeModals"
                class="btn-secondary"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="accountingStore.loading"
                class="btn-primary disabled:opacity-50"
              >
                {{ accountingStore.loading ? 'Enregistrement...' : (showEditModal ? 'Modifier' : 'Ajouter') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de modification de grade d'employé -->
    <div v-if="showGradeModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            Modifier le grade de {{ selectedEmployee?.first_name }} {{ selectedEmployee?.last_name }}
          </h3>
          
          <form @submit.prevent="updateEmployeeGrade" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nouveau grade</label>
              <select v-model="newGrade" required class="input-field">
                <option value="debutant">🌱 Débutant</option>
                <option value="junior">📈 Junior</option>
                <option value="senior">⭐ Senior</option>
                <option value="expert">🎓 Expert</option>
                <option value="manager">👔 Manager</option>
                <option value="directeur">👑 Directeur</option>
              </select>
            </div>
            
            <div class="bg-gray-50 p-3 rounded-lg">
              <p class="text-sm text-gray-600">
                <strong>Grade actuel:</strong> {{ formatGradeName(selectedEmployee?.grade || 'debutant') }}
              </p>
              <p class="text-sm text-gray-600 mt-1">
                <strong>Position:</strong> {{ selectedEmployee?.position }}
              </p>
            </div>
            
            <div class="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                @click="showGradeModal = false"
                class="btn-secondary"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="accountingStore.loading"
                class="btn-primary disabled:opacity-50"
              >
                {{ accountingStore.loading ? 'Modification...' : 'Modifier le grade' }}
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
import type { BonusConfig, Employee } from '@/lib/firebase'

const accountingStore = useAccountingStore()

// État des modales
const showAddModal = ref(false)
const showEditModal = ref(false)
const showGradeModal = ref(false)

// Données du formulaire
const formData = ref<Partial<BonusConfig>>({
  grade: 'debutant',
  vente_percentage: 0,
  prestation_percentage: 0,
  min_amount_threshold: 0,
  is_active: true
})

const selectedEmployee = ref<Employee | null>(null)
const newGrade = ref('')
const editingConfigId = ref('')

// Computed properties
const bonusConfigs = computed(() => accountingStore.bonusConfigs || [])

const totalSalesBonuses = computed(() => {
  // Calculer les primes sur les ventes
  return accountingStore.serviceTransactions
    .filter(t => t.type === 'vente')
    .reduce((total, transaction) => {
      const employee = accountingStore.activeEmployees.find(emp => emp.id === transaction.employee_id)
      if (!employee) return total
      
      const config = bonusConfigs.value.find(c => c.grade === employee.grade && c.is_active)
      if (!config || transaction.amount < config.min_amount_threshold) return total
      
      return total + (transaction.amount * config.vente_percentage / 100)
    }, 0)
})

const totalServiceBonuses = computed(() => {
  // Calculer les primes sur les prestations
  return accountingStore.serviceTransactions
    .filter(t => t.type === 'prestation')
    .reduce((total, transaction) => {
      const employee = accountingStore.activeEmployees.find(emp => emp.id === transaction.employee_id)
      if (!employee) return total
      
      const config = bonusConfigs.value.find(c => c.grade === employee.grade && c.is_active)
      if (!config || transaction.amount < config.min_amount_threshold) return total
      
      return total + (transaction.amount * config.prestation_percentage / 100)
    }, 0)
})

const totalTransactions = computed(() => {
  return accountingStore.serviceTransactions.filter(t => t.type === 'vente' || t.type === 'prestation').length
})

// Fonctions utilitaires
const getGradeIcon = (grade: string) => {
  const icons = {
    debutant: '🌱',
    junior: '📈', 
    senior: '⭐',
    expert: '🎓',
    manager: '👔',
    directeur: '👑'
  }
  return icons[grade as keyof typeof icons] || '🌱'
}

const formatGradeName = (grade: string) => {
  const names = {
    debutant: 'Débutant',
    junior: 'Junior',
    senior: 'Senior', 
    expert: 'Expert',
    manager: 'Manager',
    directeur: 'Directeur'
  }
  return names[grade as keyof typeof names] || 'Débutant'
}

const getGradeDescription = (grade: string) => {
  const descriptions = {
    debutant: 'Niveau d\'entrée',
    junior: 'Expérience limitée',
    senior: 'Expérience confirmée',
    expert: 'Très expérimenté',
    manager: 'Responsable d\'équipe',
    directeur: 'Direction générale'
  }
  return descriptions[grade as keyof typeof descriptions] || 'Niveau d\'entrée'
}

// Fonctions d'actions
const editConfig = (config: BonusConfig) => {
  formData.value = { ...config }
  editingConfigId.value = config.id
  showEditModal.value = true
}

const toggleConfigStatus = async (config: BonusConfig) => {
  try {
    await accountingStore.updateBonusConfig(config.id, {
      is_active: !config.is_active
    })
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error)
    alert('Erreur lors du changement de statut')
  }
}

const openGradeEditModal = (employee: Employee) => {
  selectedEmployee.value = employee
  newGrade.value = employee.grade || 'debutant'
  showGradeModal.value = true
}

const submitConfig = async () => {
  try {
    if (showEditModal.value) {
      await accountingStore.updateBonusConfig(editingConfigId.value, formData.value)
    } else {
      await accountingStore.addBonusConfig(formData.value as Omit<BonusConfig, 'id' | 'created_at' | 'updated_at'>)
    }
    closeModals()
    alert('Configuration enregistrée avec succès !')
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error)
    alert('Erreur lors de l\'enregistrement')
  }
}

const updateEmployeeGrade = async () => {
  if (!selectedEmployee.value) return
  
  try {
    await accountingStore.updateEmployee(selectedEmployee.value.id, {
      grade: newGrade.value as any
    })
    showGradeModal.value = false
    alert('Grade mis à jour avec succès !')
  } catch (error) {
    console.error('Erreur lors de la mise à jour du grade:', error)
    alert('Erreur lors de la mise à jour du grade')
  }
}

const closeModals = () => {
  showAddModal.value = false
  showEditModal.value = false
  formData.value = {
    grade: 'debutant',
    vente_percentage: 0,
    prestation_percentage: 0,
    min_amount_threshold: 0,
    is_active: true
  }
  editingConfigId.value = ''
}

onMounted(async () => {
  await accountingStore.initializeBonusSystem()
})
</script> 