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
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                Ordre
              </th>
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
            <tr 
              v-for="(config, index) in sortedBonusConfigs" 
              :key="config.id"
              :draggable="true"
              @dragstart="onDragStart($event, index)"
              @dragover="onDragOver($event)"
              @drop="onDrop($event, index)"
              :class="[
                'transition-all duration-200',
                draggedIndex === index ? 'opacity-50 scale-95' : '',
                'hover:bg-gray-50 cursor-move'
              ]"
            >
              <!-- Handle de drag & drop -->
              <td class="px-3 py-4 whitespace-nowrap text-center">
                <div class="flex items-center justify-center">
                  <svg class="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-grab" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                </div>
              </td>
              
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
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button
                    @click="editConfig(config)"
                    class="text-indigo-600 hover:text-indigo-900"
                    title="Modifier"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button
                    @click="toggleConfigStatus(config)"
                    :class="[
                      'hover:opacity-75',
                      config.is_active ? 'text-yellow-600' : 'text-green-600'
                    ]"
                    :title="config.is_active ? 'Désactiver' : 'Activer'"
                  >
                    <svg v-if="config.is_active" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </button>
                  <button
                    @click="deleteConfig(config)"
                    class="text-red-600 hover:text-red-900"
                    title="Supprimer"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
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
import { useNotificationStore } from '@/stores/notifications'
import type { BonusConfig, Employee } from '@/lib/firebase'

const accountingStore = useAccountingStore()
const notificationStore = useNotificationStore()

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

// === NOUVEAUX: Variables pour drag & drop ===
const draggedIndex = ref<number | null>(null)
const gradeOrder = ref<string[]>([])

// === NOUVEAUX: Computed properties ===
const sortedBonusConfigs = computed(() => {
  if (gradeOrder.value.length === 0) {
    // Ordre par défaut basé sur la hiérarchie des grades
    const defaultOrder = ['debutant', 'junior', 'senior', 'expert', 'manager', 'directeur']
    return accountingStore.bonusConfigs.sort((a, b) => {
      const aIndex = defaultOrder.indexOf(a.grade)
      const bIndex = defaultOrder.indexOf(b.grade)
      return aIndex - bIndex
    })
  }
  
  // Tri personnalisé basé sur gradeOrder
  return accountingStore.bonusConfigs.sort((a, b) => {
    const aIndex = gradeOrder.value.indexOf(a.grade)
    const bIndex = gradeOrder.value.indexOf(b.grade)
    
    // Si un grade n'est pas dans l'ordre personnalisé, le mettre à la fin
    if (aIndex === -1 && bIndex === -1) return 0
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    
    return aIndex - bIndex
  })
})

const bonusConfigs = computed(() => accountingStore.bonusConfigs || [])

const totalSalesBonuses = computed(() => {
  // Calculer les primes sur les ventes
  return accountingStore.serviceTransactions
    .filter(t => t.type === 'vente')
    .reduce((total, transaction) => {
      const employee = accountingStore.activeEmployees.find(emp => emp.id === transaction.employee_id)
      if (!employee) return total
      
      const config = accountingStore.bonusConfigs.find(c => c.grade === employee.grade && c.is_active)
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
      
      const config = accountingStore.bonusConfigs.find(c => c.grade === employee.grade && c.is_active)
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
    
    const action = config.is_active ? 'désactivée' : 'activée'
    notificationStore.success(
      'Statut modifié',
      `Configuration "${formatGradeName(config.grade)}" ${action} avec succès`
    )
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error)
    notificationStore.error(
      'Erreur de modification',
      'Impossible de modifier le statut de la configuration'
    )
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
      notificationStore.success(
        'Configuration modifiée',
        `Grade "${formatGradeName(formData.value.grade!)}" mis à jour avec succès`
      )
    } else {
      await accountingStore.addBonusConfig(formData.value as Omit<BonusConfig, 'id' | 'created_at' | 'updated_at'>)
      notificationStore.success(
        'Configuration ajoutée',
        `Grade "${formatGradeName(formData.value.grade!)}" créé avec succès`
      )
    }
    closeModals()
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error)
    notificationStore.error(
      'Erreur d\'enregistrement',
      'Impossible de sauvegarder la configuration'
    )
  }
}

const updateEmployeeGrade = async () => {
  if (!selectedEmployee.value) return
  
  try {
    await accountingStore.updateEmployee(selectedEmployee.value.id, {
      grade: newGrade.value as any
    })
    showGradeModal.value = false
    
    notificationStore.success(
      'Grade modifié',
      `${selectedEmployee.value.first_name} ${selectedEmployee.value.last_name} est maintenant ${formatGradeName(newGrade.value)}`
    )
  } catch (error) {
    console.error('Erreur lors de la mise à jour du grade:', error)
    notificationStore.error(
      'Erreur de mise à jour',
      'Impossible de modifier le grade de l\'employé'
    )
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

// === NOUVELLES FONCTIONS: Drag & Drop ===
const onDragStart = (event: DragEvent, index: number) => {
  draggedIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/html', String(index))
  }
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const onDrop = (event: DragEvent, dropIndex: number) => {
  event.preventDefault()
  
  if (draggedIndex.value === null || draggedIndex.value === dropIndex) {
    draggedIndex.value = null
    return
  }
  
  // Réorganiser l'ordre des grades
  const newOrder = [...sortedBonusConfigs.value.map(config => config.grade)]
  const draggedGrade = newOrder[draggedIndex.value]
  
  // Supprimer l'élément de sa position actuelle
  newOrder.splice(draggedIndex.value, 1)
  
  // L'insérer à la nouvelle position
  newOrder.splice(dropIndex, 0, draggedGrade)
  
  // Mettre à jour l'ordre
  gradeOrder.value = newOrder
  draggedIndex.value = null
  
  // Sauvegarder l'ordre dans localStorage
  localStorage.setItem('bonus_grades_order', JSON.stringify(newOrder))
  
  console.log('Nouvel ordre des grades:', newOrder)
}

// === NOUVELLE FONCTION: Suppression ===
const deleteConfig = async (config: BonusConfig) => {
  notificationStore.confirm(
    'Supprimer la configuration',
    `Êtes-vous sûr de vouloir supprimer la configuration pour le grade "${formatGradeName(config.grade)}" ? Cette action est irréversible !`,
    async () => {
      try {
        await accountingStore.deleteBonusConfig(config.id)
        
        // Supprimer le grade de l'ordre personnalisé s'il y est
        gradeOrder.value = gradeOrder.value.filter(grade => grade !== config.grade)
        localStorage.setItem('bonus_grades_order', JSON.stringify(gradeOrder.value))
        
        notificationStore.success(
          'Configuration supprimée',
          `Grade "${formatGradeName(config.grade)}" supprimé avec succès`
        )
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        notificationStore.error(
          'Erreur de suppression',
          'Impossible de supprimer la configuration'
        )
      }
    }
  )
}

// === NOUVELLE FONCTION: Restaurer l'ordre ===
const loadGradeOrder = () => {
  try {
    const saved = localStorage.getItem('bonus_grades_order')
    if (saved) {
      gradeOrder.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('Erreur lors du chargement de l\'ordre des grades:', error)
    gradeOrder.value = []
  }
}

onMounted(async () => {
  await accountingStore.initializeBonusSystem()
  loadGradeOrder()
})
</script> 