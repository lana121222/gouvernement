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
        onclick="console.log('🔴 BOUTON CLIQUÉ! showAddModal devrait être true')"
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
                @click="console.log('[PRICING] Bouton Ajouter cliqué!')"
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
import { ref, computed, onMounted, watch } from 'vue'
import { useAccountingStore } from '@/stores/accounting'
import type { ServiceItem } from '@/lib/firebase'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'

console.log('🟢 COMPOSANT PricingManagement.vue CHARGÉ')

const accountingStore = useAccountingStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

console.log('🟢 Stores initialisés:', { accountingStore, authStore, notificationStore })

// État des modals
const showAddModal = ref(false)
const editingService = ref<ServiceItem | null>(null)

// DEBUG: Watcher pour voir les changements de showAddModal
watch(showAddModal, (newValue) => {
  console.log('🔵 showAddModal changé:', newValue)
  console.log('🔵 Modal devrait être:', newValue ? 'VISIBLE' : 'CACHÉE')
})

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
  try {
    const confirmed = await notificationStore.confirm(
      'Supprimer le service',
      `Êtes-vous sûr de vouloir supprimer "${service.name}" ?`
    )
    if (!confirmed) return

    await accountingStore.deleteServiceItem(service.id)
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    notificationStore.error('Erreur de suppression', 'Erreur lors de la suppression')
  }
}

const submitForm = async () => {
  console.log('[PRICING] ========== DEBUT SUBMIT FORM ==========')
  console.log('[PRICING] formData.value:', formData.value)
  console.log('[PRICING] accountingStore:', accountingStore)
  console.log('[PRICING] accountingStore.addServiceItem:', typeof accountingStore.addServiceItem)
  
  // NOUVEAU: Vérifier l'authentification
  console.log('[PRICING] ===== VERIFICATION AUTHENTIFICATION =====')
  console.log('[PRICING] authStore:', authStore)
  console.log('[PRICING] authStore.user:', authStore.user)
  console.log('[PRICING] authStore.isAuthenticated:', authStore.isAuthenticated)
  console.log('[PRICING] authStore.canAccessAccounting:', authStore.canAccessAccounting)
  
  // Vérifier Firebase Auth directement
  const { auth, db } = await import('@/lib/firebase')
  const { doc, getDoc } = await import('firebase/firestore')
  console.log('[PRICING] Firebase Auth currentUser:', auth.currentUser)
  console.log('[PRICING] Firebase Auth currentUser uid:', auth.currentUser?.uid)
  
  // NOUVEAU: Vérifier le document utilisateur dans Firestore
  if (auth.currentUser) {
    console.log('[PRICING] ===== VERIFICATION DOCUMENT UTILISATEUR =====')
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid)
      const userDoc = await getDoc(userDocRef)
      
      if (userDoc.exists()) {
        const userData = userDoc.data()
        console.log('[PRICING] ✅ Document utilisateur trouvé:', userData)
        console.log('[PRICING] Rôle utilisateur:', userData.role)
        console.log('[PRICING] Permissions utilisateur:', userData.permissions)
        
        if (!userData.role && !userData.permissions) {
          console.log('[PRICING] ❌ PROBLÈME: L\'utilisateur n\'a ni rôle ni permissions!')
          notificationStore.error(
            'Permissions insuffisantes',
            'ERREUR: Votre compte n\'a pas les permissions nécessaires. Contactez un administrateur.'
          )
          return
        }
      } else {
        console.log('[PRICING] ❌ PROBLÈME CRITIQUE: Document utilisateur inexistant dans Firestore!')
        console.log('[PRICING] UID recherché:', auth.currentUser.uid)
        notificationStore.error(
          'Compte introuvable',
          `ERREUR CRITIQUE: Votre compte (${auth.currentUser.email}) n'existe pas dans la base de données.\n\nVeuillez contacter l'administrateur pour résoudre ce problème.`
        )
        return
      }
    } catch (error) {
      console.error('[PRICING] Erreur lors de la vérification du document utilisateur:', error)
      notificationStore.error(
        'Erreur de vérification',
        'Erreur lors de la vérification des permissions'
      )
      return
    }
  }
  
  try {
    // Validation des données
    if (!formData.value.name.trim()) {
      notificationStore.warning('Nom requis', 'Le nom du service est requis')
      return
    }
    
    if (!formData.value.category) {
      notificationStore.warning('Catégorie requise', 'La catégorie est requise')
      return
    }
    
    if (formData.value.price <= 0) {
      notificationStore.warning('Prix invalide', 'Le prix doit être supérieur à 0')
      return
    }

    console.log('[PRICING] Validation OK, préparation des données...')

    // Préparer les données - CORRECTION: ne jamais envoyer undefined à Firebase
    const serviceData: any = {
      name: formData.value.name.trim(),
      category: formData.value.category as 'vente' | 'prestation',
      price: Number(formData.value.price)
    }
    
    // Ajouter description seulement si elle n'est pas vide
    if (formData.value.description && formData.value.description.trim()) {
      serviceData.description = formData.value.description.trim()
    }

    console.log('[PRICING] Données à sauvegarder:', serviceData)
    console.log('[PRICING] Services actuels avant ajout:', accountingStore.serviceItems.length)

    if (editingService.value) {
      // Modification
      console.log('[PRICING] Mode modification...')
      await accountingStore.updateServiceItem(editingService.value.id, serviceData)
      console.log('[PRICING] Service modifié')
    } else {
      // Ajout
      console.log('[PRICING] Mode ajout...')
      console.log('[PRICING] Appel addServiceItem...')
      await accountingStore.addServiceItem(serviceData)
      console.log('[PRICING] Service ajouté avec succès')
    }
    
    // Forcer un rechargement des services pour s'assurer qu'ils sont à jour
    console.log('[PRICING] Rechargement des services...')
    await accountingStore.fetchServiceItems()
    console.log('[PRICING] Services après rechargement:', accountingStore.serviceItems.length)
    console.log('[PRICING] Services par catégorie:', accountingStore.servicesByCategory)
    
    closeModal()
    console.log('[PRICING] ========== FIN SUBMIT FORM (SUCCES) ==========')
    
  } catch (error: any) {
    console.error('[PRICING] ========== ERREUR SUBMIT FORM ==========')
    console.error('[PRICING] Erreur lors de l\'enregistrement:', error)
    console.error('[PRICING] Type d\'erreur:', error.constructor.name)
    console.error('[PRICING] Message:', error.message)
    console.error('[PRICING] Stack:', error.stack)
    
    // NOUVEAU: Analyser les erreurs Firebase spécifiques
    if (error.code) {
      console.error('[PRICING] Code d\'erreur Firebase:', error.code)
      if (error.code === 'permission-denied') {
        console.error('[PRICING] ERREUR DE PERMISSION FIREBASE!')
        notificationStore.error(
          'Erreur de permissions',
          'Erreur de permissions: Vous n\'avez pas le droit d\'ajouter des services. Vérifiez votre authentification et vos permissions.'
        )
      } else if (error.code === 'unauthenticated') {
        console.error('[PRICING] ERREUR D\'AUTHENTIFICATION FIREBASE!')
        notificationStore.error(
          'Erreur d\'authentification',
          'Erreur d\'authentification: Vous devez être connecté pour effectuer cette action.'
        )
      } else {
        notificationStore.error(
          'Erreur d\'enregistrement',
          'Erreur lors de l\'enregistrement: ' + (error instanceof Error ? error.message : 'Erreur inconnue')
        )
      }
    }
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
  console.log('[PRICING] Composant monté, initialisation...')
  console.log('[PRICING] Services avant init:', accountingStore.serviceItems.length)
  
  await accountingStore.initializeServiceStore()
  
  console.log('[PRICING] Services après init:', accountingStore.serviceItems.length)
  console.log('[PRICING] Liste des services:', accountingStore.serviceItems)
  console.log('[PRICING] Services par catégorie:', accountingStore.servicesByCategory)
})
</script> 