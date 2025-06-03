<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- En-tête -->
      <div class="px-4 py-6 sm:px-0">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Gestion des Employés</h1>
            <p class="mt-2 text-gray-600">Gérez tous les employés du gouvernement</p>
          </div>
          <div class="flex space-x-3">
            <button
              @click="showAddModal = true"
              class="btn-primary"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Ajouter un employé
            </button>
          </div>
        </div>
      </div>

      <!-- Statistiques rapides -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Employés actifs</p>
              <p class="text-2xl font-semibold text-gray-900">{{ accountingStore.activeEmployees.length }}</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Anciens employés</p>
              <p class="text-2xl font-semibold text-gray-900">{{ accountingStore.formerEmployees.length }}</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Masse salariale</p>
              <p class="text-2xl font-semibold text-gray-900">${{ formatCurrency(accountingStore.totalPayroll) }}</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Blacklistés</p>
              <p class="text-2xl font-semibold text-gray-900">{{ blacklistedCount }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtres et recherche -->
      <div class="card mb-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <label for="search" class="sr-only">Rechercher</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                id="search"
                v-model="searchQuery"
                type="text"
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Rechercher par nom, email ou poste..."
              />
            </div>
          </div>
          <div class="flex gap-2">
            <select
              v-model="statusFilter"
              class="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs seulement</option>
              <option value="former">Anciens seulement</option>
              <option value="blacklisted">Blacklistés</option>
            </select>
            <select
              v-model="sortBy"
              class="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
            >
              <option value="name">Trier par nom</option>
              <option value="position">Trier par poste</option>
              <option value="earnings">Trier par gains</option>
              <option value="date">Trier par date</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Actions rapides -->
      <EmployeeQuickActions 
        :employees="accountingStore.employees"
        @pay-all="handlePayAll"
        @reset-hours="handleResetHours"
        @export-data="handleExportData"
        @show-stats="showStatsModal = true"
        class="mb-6"
      />

      <!-- Navigation des onglets -->
      <div class="mb-8">
        <nav class="flex space-x-8">
          <button
            @click="activeTab = 'active'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'active'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Employés actifs ({{ accountingStore.activeEmployees.length }})
          </button>
          <button
            @click="activeTab = 'former'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
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
      <div v-if="activeTab === 'active'">
        <ActiveEmployeesTable 
          :employees="filteredActiveEmployees"
          :loading="accountingStore.loading"
          @edit="editEmployee"
          @pay="showPayModal"
          @terminate="showTerminateModal"
          @delete="openDeleteModal"
          @update-bonus="updateEmployeeBonus"
        />
      </div>

      <div v-if="activeTab === 'former'">
        <FormerEmployeesTable 
          :employees="filteredFormerEmployees"
          :loading="accountingStore.loading"
          @reactivate="reactivateEmployee"
          @delete="openDeleteModal"
        />
      </div>

      <!-- Modals -->
      <EmployeeModal
        v-if="showAddModal"
        @close="showAddModal = false"
        @save="handleAddEmployee"
      />

      <EmployeeModal
        v-if="showEditModal"
        :employee="selectedEmployee"
        @close="showEditModal = false"
        @save="handleEditEmployee"
      />

      <PaymentModal
        v-if="showPaymentModal"
        :employee="selectedEmployee"
        @close="showPaymentModal = false"
        @confirm="handlePayment"
      />

      <TerminationModal
        v-if="showTerminationModal"
        :employee="selectedEmployee"
        @close="showTerminationModal = false"
        @confirm="handleTermination"
      />

      <DeleteModal
        v-if="showDeleteModal"
        :employee="selectedEmployee"
        @close="showDeleteModal = false"
        @confirm="handleDelete"
      />

      <!-- Modal de statistiques -->
      <StatsModal
        v-if="showStatsModal"
        :employees="accountingStore.employees"
        @close="showStatsModal = false"
      />

      <!-- Modal de paiement en masse -->
      <PayAllModal
        v-if="showPayAllModal"
        :employees="employeesToPay"
        @close="showPayAllModal = false"
        @confirm="handlePayAllConfirm"
      />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAccountingStore } from '@/stores/accounting'
import type { Employee } from '@/lib/firebase'
import AppLayout from '@/components/AppLayout.vue'
import EmployeeModal from '@/components/EmployeeModal.vue'
import PaymentModal from '@/components/PaymentModal.vue'
import TerminationModal from '@/components/TerminationModal.vue'
import DeleteModal from '@/components/DeleteModal.vue'
import ActiveEmployeesTable from '@/components/ActiveEmployeesTable.vue'
import FormerEmployeesTable from '@/components/FormerEmployeesTable.vue'
import EmployeeQuickActions from '@/components/EmployeeQuickActions.vue'
import StatsModal from '@/components/StatsModal.vue'
import PayAllModal from '@/components/PayAllModal.vue'

const accountingStore = useAccountingStore()

// État des modals
const showAddModal = ref(false)
const showEditModal = ref(false)
const showPaymentModal = ref(false)
const showTerminationModal = ref(false)
const showDeleteModal = ref(false)
const showStatsModal = ref(false)
const showPayAllModal = ref(false)
const selectedEmployee = ref<Employee | null>(null)

// État des filtres
const searchQuery = ref('')
const statusFilter = ref('all')
const sortBy = ref('name')
const activeTab = ref('active')

// Statistiques calculées
const blacklistedCount = computed(() => 
  accountingStore.formerEmployees.filter(emp => emp.is_blacklisted).length
)

// Employés à payer
const employeesToPay = computed(() => 
  accountingStore.activeEmployees.filter(emp => emp.total_earnings > 0)
)

// Filtrage et tri des employés
const filteredActiveEmployees = computed(() => {
  let employees = [...accountingStore.activeEmployees]
  
  // Filtrage par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    employees = employees.filter(emp => 
      emp.first_name.toLowerCase().includes(query) ||
      emp.last_name.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      emp.position.toLowerCase().includes(query)
    )
  }
  
  // Tri
  employees.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
      case 'position':
        return a.position.localeCompare(b.position)
      case 'earnings':
        return b.total_earnings - a.total_earnings
      case 'date':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      default:
        return 0
    }
  })
  
  return employees
})

const filteredFormerEmployees = computed(() => {
  let employees = [...accountingStore.formerEmployees]
  
  // Filtrage par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    employees = employees.filter(emp => 
      emp.first_name.toLowerCase().includes(query) ||
      emp.last_name.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      emp.position.toLowerCase().includes(query)
    )
  }
  
  // Filtrage par statut
  if (statusFilter.value === 'blacklisted') {
    employees = employees.filter(emp => emp.is_blacklisted)
  }
  
  // Tri
  employees.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
      case 'position':
        return a.position.localeCompare(b.position)
      case 'date':
        return new Date(b.termination_date || b.created_at).getTime() - new Date(a.termination_date || a.created_at).getTime()
      default:
        return 0
    }
  })
  
  return employees
})

// Utilitaires
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// Gestionnaires d'événements
const editEmployee = (employee: Employee) => {
  selectedEmployee.value = employee
  showEditModal.value = true
}

const showPayModal = (employee: Employee) => {
  selectedEmployee.value = employee
  showPaymentModal.value = true
}

const showTerminateModal = (employee: Employee) => {
  selectedEmployee.value = employee
  showTerminationModal.value = true
}

const openDeleteModal = (employee: Employee) => {
  selectedEmployee.value = employee
  showDeleteModal.value = true
}

const updateEmployeeBonus = async (id: string, bonus: number) => {
  await accountingStore.updateEmployee(id, { bonus_amount: bonus })
}

const reactivateEmployee = async (employee: Employee) => {
  try {
    const confirmed = confirm(`Êtes-vous sûr de vouloir réactiver ${employee.first_name} ${employee.last_name} ?`)
    if (!confirmed) return

    // Afficher un indicateur de chargement
    console.log(`Réactivation de ${employee.first_name} ${employee.last_name}...`)
    
    await accountingStore.updateEmployee(employee.id, {
      is_active: true,
      is_former: false,
      termination_date: undefined,
      termination_reason: undefined
    })

    // Notification de succès
    alert(`${employee.first_name} ${employee.last_name} a été réactivé(e) avec succès !`)
    
    // Optionnel : changer d'onglet pour voir l'employé réactivé
    activeTab.value = 'active'
    
  } catch (error) {
    console.error('Erreur lors de la réactivation:', error)
    alert(`Erreur lors de la réactivation de ${employee.first_name} ${employee.last_name}. Veuillez réessayer.`)
  }
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

const handlePayAll = async () => {
  if (employeesToPay.value.length === 0) {
    alert('Aucun employé à payer')
    return
  }
  showPayAllModal.value = true
}

const handlePayAllConfirm = async () => {
  try {
    for (const employee of employeesToPay.value) {
      await accountingStore.payEmployee(employee.id)
    }
    showPayAllModal.value = false
    alert(`${employeesToPay.value.length} employé(s) payé(s) avec succès !`)
  } catch (error) {
    console.error('Erreur lors du paiement en masse:', error)
    alert('Erreur lors du paiement en masse')
  }
}

const handleResetHours = async () => {
  if (!confirm('Êtes-vous sûr de vouloir remettre à zéro les heures de tous les employés actifs ?')) {
    return
  }
  
  try {
    for (const employee of accountingStore.activeEmployees) {
      await accountingStore.updateEmployee(employee.id, {
        hours_worked: 0,
        bonus_amount: 0
      })
    }
    alert('Heures remises à zéro pour tous les employés actifs !')
  } catch (error) {
    console.error('Erreur lors de la remise à zéro:', error)
    alert('Erreur lors de la remise à zéro des heures')
  }
}

const handleExportData = () => {
  try {
    // Préparer les données pour l'export
    const csvData = accountingStore.employees.map(emp => ({
      'Prénom': emp.first_name,
      'Nom': emp.last_name,
      'Email': emp.email,
      'Poste': emp.position,
      'Taux horaire': emp.hourly_rate,
      'Heures travaillées': emp.hours_worked,
      'Prime': emp.bonus_amount,
      'Total à payer': emp.total_earnings,
      'Statut': emp.is_active ? 'Actif' : 'Inactif',
      'Ancien employé': emp.is_former ? 'Oui' : 'Non',
      'Blacklisté': emp.is_blacklisted ? 'Oui' : 'Non',
      'Date d\'embauche': new Date(emp.created_at).toLocaleDateString('fr-FR'),
      'Date de départ': emp.termination_date ? new Date(emp.termination_date).toLocaleDateString('fr-FR') : '',
      'Raison du départ': emp.termination_reason || ''
    }))

    // Convertir en CSV
    const headers = Object.keys(csvData[0] || {})
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(','))
    ].join('\n')

    // Télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `employes_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    alert('Données exportées avec succès !')
  } catch (error) {
    console.error('Erreur lors de l\'export:', error)
    alert('Erreur lors de l\'export des données')
  }
}

// Initialisation
onMounted(async () => {
  // Charger les employés et initialiser le système de services
  await Promise.all([
    accountingStore.fetchEmployees(),
    accountingStore.initializeServiceStore()
  ])
})
</script> 