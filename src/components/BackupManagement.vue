<template>
  <div class="card">
    <!-- En-tête -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-lg font-medium text-gray-900">💾 Gestion des sauvegardes</h2>
        <p class="text-sm text-gray-500">Sauvegardez et restaurez vos données comptables</p>
      </div>
      <div class="flex space-x-3">
        <button
          @click="openCreateBackupModal"
          class="btn-primary"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Créer une sauvegarde
        </button>
        <button
          @click="refreshBackups"
          class="btn-secondary"
          :disabled="accountingStore.loading"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Actualiser
        </button>
      </div>
    </div>

    <!-- Statistiques rapides -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-blue-50 p-4 rounded-lg">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-blue-900">Total sauvegardes</p>
            <p class="text-2xl font-semibold text-blue-600">{{ backups.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-green-50 p-4 rounded-lg">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-green-900">Sauvegarde récente</p>
            <p class="text-sm font-semibold text-green-600">
              {{ latestBackup ? formatDate(latestBackup.created_at) : 'Aucune' }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-purple-50 p-4 rounded-lg">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-purple-900">Espace utilisé</p>
            <p class="text-sm font-semibold text-purple-600">{{ formatFileSize(totalSize) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des sauvegardes -->
    <div v-if="accountingStore.loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-2 text-gray-500">Chargement des sauvegardes...</p>
    </div>

    <div v-else-if="backups.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune sauvegarde</h3>
      <p class="mt-1 text-sm text-gray-500">Les sauvegardes seront créées automatiquement lors de la réinitialisation.</p>
      <div class="mt-6">
        <button
          @click="openCreateBackupModal"
          class="btn-primary"
        >
          Créer la première sauvegarde
        </button>
      </div>
    </div>

    <div v-else class="space-y-4">
      <div 
        v-for="backup in backups" 
        :key="backup.id"
        class="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3">
              <div 
                :class="[
                  'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                  getBackupTypeColor(backup.type || 'auto')
                ]"
              >
                <svg v-if="backup.type === 'manual'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-900">
                  {{ backup.description || getBackupTypeLabel(backup.type || 'auto') }}
                </h3>
                <div class="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                  <span>{{ formatDate(backup.created_at) }}</span>
                  <span>•</span>
                  <span :class="getBackupTypeTextColor(backup.type || 'auto')">
                    {{ getBackupTypeLabel(backup.type || 'auto') }}
                  </span>
                  <span>•</span>
                  <span>{{ getBackupSummary(backup.backup_data) }}</span>
                </div>
              </div>
            </div>

            <!-- Détails de la sauvegarde -->
            <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div class="flex items-center text-gray-600">
                <svg class="w-4 h-4 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                {{ backup.backup_data?.employees?.length || 0 }} employés
              </div>
              <div class="flex items-center text-gray-600">
                <svg class="w-4 h-4 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                {{ backup.backup_data?.transactions?.length || 0 }} transactions
              </div>
              <div class="flex items-center text-gray-600">
                <svg class="w-4 h-4 mr-1.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                {{ backup.backup_data?.serviceTransactions?.length || 0 }} services
              </div>
              <div class="flex items-center text-gray-600">
                <svg class="w-4 h-4 mr-1.5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
                ${{ formatCurrency(backup.backup_data?.balance || 0) }}
              </div>
              <div class="flex items-center text-gray-600">
                <svg class="w-4 h-4 mr-1.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                ${{ formatCurrency(backup.backup_data?.totalPayroll || 0) }} masse salariale
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-start space-x-2 ml-4">
            <button
              @click="restoreBackup(backup)"
              class="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Restaurer cette sauvegarde"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </button>
            <button
              @click="exportBackup(backup)"
              class="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
              title="Exporter en PDF"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
              </svg>
            </button>
            <button
              @click="deleteBackup(backup)"
              class="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Supprimer cette sauvegarde"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de création de sauvegarde -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mx-auto">
            <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
            </svg>
          </div>
          <h3 class="text-lg leading-6 font-medium text-gray-900 mt-4 text-center">Créer une sauvegarde</h3>
          <div class="mt-4">
            <label for="backupDescription" class="block text-sm font-medium text-gray-700">Description (optionnel)</label>
            <input
              id="backupDescription"
              v-model="newBackupDescription"
              type="text"
              class="mt-1 input-field"
              placeholder="Ex: Sauvegarde avant changement majeur..."
            />
          </div>
          <div class="mt-6 flex space-x-3">
            <button
              @click="handleCreateBackup"
              :disabled="accountingStore.loading"
              class="flex-1 btn-primary disabled:opacity-50"
            >
              {{ accountingStore.loading ? 'Création...' : 'Créer la sauvegarde' }}
            </button>
            <button
              @click="closeCreateModal"
              class="flex-1 btn-secondary"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de prévisualisation du PDF -->
    <div v-if="showPdfPreview" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-2 mx-auto p-6 border w-11/12 max-w-7xl min-h-screen shadow-lg rounded-lg bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl leading-6 font-medium text-gray-900">📊 Aperçu du Rapport de Sauvegarde</h3>
            <button
              @click="closePdfPreview"
              class="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="border border-gray-200 rounded-lg p-6 bg-gray-50 max-h-screen overflow-y-auto">
            <div v-html="currentPreviewBackup ? generatePdfContent(currentPreviewBackup) : 'Chargement...'"></div>
          </div>
          <div class="mt-6 text-center">
            <button
              @click="closePdfPreview"
              class="btn-secondary px-8 py-3"
            >
              Fermer l'aperçu
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAccountingStore } from '@/stores/accounting'
import { useNotificationStore } from '@/stores/notifications'

const accountingStore = useAccountingStore()
const notificationStore = useNotificationStore()

// État local
const showCreateModal = ref(false)
const newBackupDescription = ref('')
const showPdfPreview = ref(false)
const currentPreviewBackup = ref<any>(null)

// Computed
const backups = computed(() => accountingStore.backups)

const latestBackup = computed(() => {
  return backups.value.length > 0 ? backups.value[0] : null
})

const totalSize = computed(() => {
  return backups.value.reduce((total, backup) => {
    const dataSize = JSON.stringify(backup.backup_data || {}).length
    return total + dataSize
  }, 0)
})

// Fonctions utilitaires
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

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getBackupTypeColor = (type: string) => {
  return type === 'manual' 
    ? 'bg-blue-100 text-blue-600' 
    : 'bg-green-100 text-green-600'
}

const getBackupTypeTextColor = (type: string) => {
  return type === 'manual' 
    ? 'text-blue-600' 
    : 'text-green-600'
}

const getBackupTypeLabel = (type: string) => {
  return type === 'manual' ? 'Manuelle' : 'Automatique'
}

const getBackupSummary = (backupData: any) => {
  if (!backupData) return 'Données non disponibles'
  
  const parts = []
  if (backupData.employees) parts.push(`${backupData.employees.length} employés`)
  if (backupData.transactions) parts.push(`${backupData.transactions.length} transactions`)
  
  return parts.length > 0 ? parts.join(', ') : 'Données vides'
}

// Actions
const refreshBackups = async () => {
  await accountingStore.fetchBackups()
}

const openCreateBackupModal = () => {
  newBackupDescription.value = ''
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
  newBackupDescription.value = ''
}

const handleCreateBackup = async () => {
  try {
    await accountingStore.createManualBackup(newBackupDescription.value)
    notificationStore.success(
      'Sauvegarde créée', 
      'Votre sauvegarde a été créée avec succès !'
    )
    closeCreateModal()
  } catch (error) {
    console.error('Erreur lors de la création de la sauvegarde:', error)
    notificationStore.error(
      'Erreur de sauvegarde', 
      'Impossible de créer la sauvegarde'
    )
  }
}

const restoreBackup = async (backup: any) => {
  const confirmed = await notificationStore.confirm(
    'Restaurer la sauvegarde',
    `Êtes-vous sûr de vouloir restaurer cette sauvegarde ? Toutes les données actuelles seront remplacées par celles de la sauvegarde du ${formatDate(backup.created_at)}.`
  )
  
  if (!confirmed) return

  try {
    await accountingStore.restoreBackup(backup.id)
    notificationStore.success(
      'Restauration réussie',
      'La sauvegarde a été restaurée avec succès !'
    )
  } catch (error) {
    console.error('Erreur lors de la restauration:', error)
    notificationStore.error(
      'Erreur de restauration',
      'Impossible de restaurer la sauvegarde'
    )
  }
}

const exportBackup = (backup: any) => {
  currentPreviewBackup.value = backup
  showPdfPreview.value = true
}

const closePdfPreview = () => {
  showPdfPreview.value = false
  currentPreviewBackup.value = null
}

// Fonction pour générer le contenu HTML de l'aperçu
const generatePdfContent = (backup: any) => {
  const currentDate = new Date().toLocaleDateString('fr-FR', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const masseSalariale = backup.backup_data?.totalPayroll || 0
  const employesActifs = backup.backup_data?.statistics?.activeEmployees || 0

  // TOUS les employés avec gains (pas seulement le top 5)
  const allEmployees = backup.backup_data?.employees ? 
    backup.backup_data.employees
      .filter((emp: any) => emp.is_active && !emp.is_former && emp.total_earnings > 0)
      .sort((a: any, b: any) => (b.total_earnings || 0) - (a.total_earnings || 0)) : []

  // TOUTES les transactions (pas seulement les 5 dernières)
  const allTransactions = backup.backup_data?.transactions ? 
    backup.backup_data.transactions
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : []

  // Statistiques par catégorie de transactions
  const incomeTransactions = allTransactions.filter((t: any) => t.type === 'income')
  const expenseTransactions = allTransactions.filter((t: any) => t.type === 'expense')

  return `
    <div style="width: 100%; background: white; font-family: Arial, sans-serif;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #e5e7eb; padding-bottom: 30px;">
        <h1 style="color: #1f2937; font-size: 36px; margin: 0; font-weight: bold;">📊 Rapport Complet de Sauvegarde</h1>
        <h2 style="color: #6b7280; font-size: 24px; margin: 12px 0 0 0; font-weight: normal;">Gouvernement RP - Données Comptables Complètes</h2>
        <p style="color: #9ca3af; font-size: 16px; margin: 8px 0 0 0;">Généré le ${currentDate}</p>
      </div>

      <!-- Informations générales -->
      <div style="margin-bottom: 35px;">
        <h3 style="color: #1f2937; font-size: 20px; margin-bottom: 16px; border-left: 6px solid #3b82f6; padding-left: 15px; font-weight: bold;">📋 Informations de la sauvegarde</h3>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <p style="margin: 8px 0; font-size: 16px;"><strong>Description :</strong> ${backup.description || 'Sauvegarde automatique'}</p>
          <p style="margin: 8px 0; font-size: 16px;"><strong>Type :</strong> ${backup.type === 'manual' ? 'Manuelle' : 'Automatique'}</p>
          <p style="margin: 8px 0; font-size: 16px;"><strong>Date de création :</strong> ${formatDate(backup.created_at)}</p>
          <p style="margin: 8px 0; font-size: 16px;"><strong>Version :</strong> ${backup.backup_data?.metadata?.version || '1.0'}</p>
          <p style="margin: 8px 0; font-size: 16px;"><strong>Taille des données :</strong> ${formatFileSize(JSON.stringify(backup.backup_data || {}).length)}</p>
        </div>
      </div>

      ${backup.backup_data ? `
      <!-- Statistiques financières COMPLÈTES -->
      <div style="margin-bottom: 35px;">
        <h3 style="color: #1f2937; font-size: 20px; margin-bottom: 16px; border-left: 6px solid #10b981; padding-left: 15px; font-weight: bold;">💰 Résumé Financier Complet</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 20px;">
          <div style="background: #ecfdf5; padding: 25px; border-radius: 10px; border: 2px solid #10b981; flex: 1; min-width: 200px;">
            <p style="margin: 0; color: #065f46; font-weight: bold; font-size: 14px;">Revenus Totaux</p>
            <p style="margin: 8px 0 0 0; font-size: 24px; color: #059669; font-weight: bold;">$${formatCurrency(backup.backup_data.totalIncome || 0)}</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #047857;">${incomeTransactions.length} transactions de revenus</p>
          </div>
          <div style="background: #fef2f2; padding: 25px; border-radius: 10px; border: 2px solid #ef4444; flex: 1; min-width: 200px;">
            <p style="margin: 0; color: #7f1d1d; font-weight: bold; font-size: 14px;">Dépenses Totales</p>
            <p style="margin: 8px 0 0 0; font-size: 24px; color: #dc2626; font-weight: bold;">$${formatCurrency(backup.backup_data.totalExpenses || 0)}</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #b91c1c;">${expenseTransactions.length} transactions de dépenses</p>
          </div>
          <div style="background: #eff6ff; padding: 25px; border-radius: 10px; border: 2px solid #3b82f6; flex: 1; min-width: 200px;">
            <p style="margin: 0; color: #1e3a8a; font-weight: bold; font-size: 14px;">Solde Net</p>
            <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: bold; color: ${(backup.backup_data.balance || 0) >= 0 ? '#059669' : '#dc2626'};">$${formatCurrency(backup.backup_data.balance || 0)}</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #1e40af;">Bénéfice ${(backup.backup_data.balance || 0) >= 0 ? 'positif' : 'négatif'}</p>
          </div>
          <div style="background: #f5f3ff; padding: 25px; border-radius: 10px; border: 2px solid #8b5cf6; flex: 1; min-width: 200px;">
            <p style="margin: 0; color: #581c87; font-weight: bold; font-size: 14px;">Masse Salariale</p>
            <p style="margin: 8px 0 0 0; font-size: 24px; color: #7c3aed; font-weight: bold;">$${formatCurrency(masseSalariale)}</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b21a8;">${employesActifs} employés actifs</p>
          </div>
        </div>
      </div>

      <!-- Statistiques des données -->
      <div style="margin-bottom: 35px;">
        <h3 style="color: #1f2937; font-size: 20px; margin-bottom: 16px; border-left: 6px solid #f59e0b; padding-left: 15px; font-weight: bold;">📊 Contenu Détaillé de la Sauvegarde</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 15px;">
          <div style="text-align: center; background: #fef3c7; padding: 20px; border-radius: 10px; border: 2px solid #f59e0b; flex: 1; min-width: 150px;">
            <p style="margin: 0; font-size: 28px; font-weight: bold; color: #92400e;">${backup.backup_data?.statistics?.totalEmployees || backup.backup_data?.employees?.length || 0}</p>
            <p style="margin: 8px 0 0 0; color: #78350f; font-size: 14px; font-weight: 600;">Total Employés</p>
          </div>
          <div style="text-align: center; background: #d1fae5; padding: 20px; border-radius: 10px; border: 2px solid #10b981; flex: 1; min-width: 150px;">
            <p style="margin: 0; font-size: 28px; font-weight: bold; color: #065f46;">${backup.backup_data?.statistics?.totalTransactions || backup.backup_data?.transactions?.length || 0}</p>
            <p style="margin: 8px 0 0 0; color: #047857; font-size: 14px; font-weight: 600;">Total Transactions</p>
          </div>
          <div style="text-align: center; background: #e0e7ff; padding: 20px; border-radius: 10px; border: 2px solid #6366f1; flex: 1; min-width: 150px;">
            <p style="margin: 0; font-size: 28px; font-weight: bold; color: #3730a3;">${backup.backup_data?.statistics?.totalServiceTransactions || backup.backup_data?.serviceTransactions?.length || 0}</p>
            <p style="margin: 8px 0 0 0; color: #4338ca; font-size: 14px; font-weight: 600;">Services</p>
          </div>
          <div style="text-align: center; background: #fce7f3; padding: 20px; border-radius: 10px; border: 2px solid #ec4899; flex: 1; min-width: 150px;">
            <p style="margin: 0; font-size: 28px; font-weight: bold; color: #be185d;">${employesActifs}</p>
            <p style="margin: 8px 0 0 0; color: #be185d; font-size: 14px; font-weight: 600;">Employés Actifs</p>
          </div>
          <div style="text-align: center; background: #f0f9ff; padding: 20px; border-radius: 10px; border: 2px solid #0ea5e9; flex: 1; min-width: 150px;">
            <p style="margin: 0; font-size: 28px; font-weight: bold; color: #0284c7;">$${formatCurrency(backup.backup_data?.statistics?.averageEmployeeEarnings || 0)}</p>
            <p style="margin: 8px 0 0 0; color: #0369a1; font-size: 14px; font-weight: 600;">Salaire Moyen</p>
          </div>
        </div>
      </div>
      ` : ''}

      ${allEmployees.length > 0 ? `
      <!-- TOUS les employés avec gains -->
      <div style="margin-bottom: 35px;">
        <h3 style="color: #1f2937; font-size: 20px; margin-bottom: 16px; border-left: 6px solid #8b5cf6; padding-left: 15px; font-weight: bold;">👥 Tous les Employés avec Gains (${allEmployees.length})</h3>
        <table style="width: 100%; border-collapse: collapse; background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
          <thead>
            <tr style="background: #374151; color: white;">
              <th style="padding: 15px; text-align: left; font-weight: bold; font-size: 16px;">Nom</th>
              <th style="padding: 15px; text-align: center; font-weight: bold; font-size: 16px;">Heures</th>
              <th style="padding: 15px; text-align: center; font-weight: bold; font-size: 16px;">Grade</th>
              <th style="padding: 15px; text-align: right; font-weight: bold; font-size: 16px;">Primes</th>
              <th style="padding: 15px; text-align: right; font-weight: bold; font-size: 16px;">Gains Totaux</th>
            </tr>
          </thead>
          <tbody>
            ${allEmployees.map((employee: any, index: number) => `
              <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                <td style="padding: 12px 15px; font-weight: 500; font-size: 14px;">${employee.first_name} ${employee.last_name}</td>
                <td style="padding: 12px 15px; text-align: center; font-size: 14px;">${employee.hours_worked || 0}h</td>
                <td style="padding: 12px 15px; text-align: center; text-transform: capitalize; font-size: 14px;">${employee.grade || 'débutant'}</td>
                <td style="padding: 12px 15px; text-align: right; font-size: 14px; color: #7c3aed;">$${formatCurrency(employee.bonus_amount || 0)}</td>
                <td style="padding: 12px 15px; text-align: right; font-weight: bold; color: #059669; font-size: 14px;">$${formatCurrency(employee.total_earnings || 0)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      ${allTransactions.length > 0 ? `
      <!-- TOUTES les transactions -->
      <div style="margin-bottom: 35px;">
        <h3 style="color: #1f2937; font-size: 20px; margin-bottom: 16px; border-left: 6px solid #ef4444; padding-left: 15px; font-weight: bold;">💳 Toutes les Transactions (${allTransactions.length})</h3>
        <table style="width: 100%; border-collapse: collapse; background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
          <thead>
            <tr style="background: #374151; color: white;">
              <th style="padding: 15px; text-align: left; font-weight: bold; font-size: 16px;">Date</th>
              <th style="padding: 15px; text-align: left; font-weight: bold; font-size: 16px;">Description</th>
              <th style="padding: 15px; text-align: center; font-weight: bold; font-size: 16px;">Type</th>
              <th style="padding: 15px; text-align: center; font-weight: bold; font-size: 16px;">Catégorie</th>
              <th style="padding: 15px; text-align: right; font-weight: bold; font-size: 16px;">Montant</th>
            </tr>
          </thead>
          <tbody>
            ${allTransactions.map((transaction: any, index: number) => `
              <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                <td style="padding: 12px 15px; font-size: 12px; color: #6b7280;">${formatDate(transaction.created_at)}</td>
                <td style="padding: 12px 15px; font-weight: 500; font-size: 14px;">${transaction.description || 'N/A'}</td>
                <td style="padding: 12px 15px; text-align: center; font-size: 12px;">
                  <span style="padding: 4px 12px; border-radius: 15px; font-size: 11px; background-color: ${transaction.type === 'income' ? '#dcfce7' : '#fee2e2'}; color: ${transaction.type === 'income' ? '#166534' : '#991b1b'}; font-weight: 600;">
                    ${transaction.type === 'income' ? 'Revenus' : 'Dépenses'}
                  </span>
                </td>
                <td style="padding: 12px 15px; text-align: center; font-size: 14px; color: #6b7280;">${transaction.category || 'N/A'}</td>
                <td style="padding: 12px 15px; text-align: right; font-weight: bold; font-size: 14px; color: ${transaction.type === 'income' ? '#059669' : '#dc2626'};">
                  ${transaction.type === 'income' ? '+' : '-'}$${formatCurrency(transaction.amount)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <!-- Footer -->
      <div style="margin-top: 40px; padding-top: 30px; border-top: 3px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 16px;">
        <p style="margin: 0; font-weight: bold;">🎮 Gouvernement RP - Système de Gestion Comptable</p>
        <p style="margin: 8px 0 0 0;">Rapport complet généré automatiquement • Confidentiel</p>
        <p style="margin: 4px 0 0 0; font-size: 12px;">Contient ${allTransactions.length} transactions et ${allEmployees.length} employés avec gains</p>
      </div>
    </div>
  `
}

const deleteBackup = async (backup: any) => {
  const confirmed = await notificationStore.confirm(
    'Supprimer la sauvegarde',
    `Êtes-vous sûr de vouloir supprimer définitivement cette sauvegarde du ${formatDate(backup.created_at)} ?`
  )
  
  if (!confirmed) return

  try {
    await accountingStore.deleteBackup(backup.id)
    notificationStore.success(
      'Sauvegarde supprimée',
      'La sauvegarde a été supprimée avec succès'
    )
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    notificationStore.error(
      'Erreur de suppression',
      'Impossible de supprimer la sauvegarde'
    )
  }
}

// Initialisation
onMounted(async () => {
  await refreshBackups()
})
</script> 